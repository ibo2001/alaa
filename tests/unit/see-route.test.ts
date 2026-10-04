import { readFileSync } from "node:fs";
import { NextRequest } from "next/server";
import { beforeAll, describe, expect, it } from "vitest";

beforeAll(() => {
  process.env.VISION_PROVIDER = "stub";
  process.env.DAILY_LIMIT = "3";
});

const url = "http://localhost/api/see";
const post = async (init: { body: BodyInit; headers?: Record<string, string>; cookie?: string }) => {
  const { POST } = await import("@/app/api/see/route");
  const headers = new Headers(init.headers);
  if (init.cookie) headers.set("cookie", init.cookie);
  return POST(new NextRequest(url, { method: "POST", body: init.body, headers }));
};
const json = (body: object, cookie?: string) =>
  post({ body: JSON.stringify(body), headers: { "content-type": "application/json" }, cookie });
const upload = (bytes: Uint8Array<ArrayBuffer>, type: string, cookie?: string) => {
  const form = new FormData();
  form.append("image", new File([bytes], "photo", { type }));
  return post({ body: form, cookie });
};

describe("/api/see", () => {
  it("sample photo → card via the stub provider", async () => {
    const res = await json({ sampleId: "water-glass" }, "alaa_device=a");
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ decision: { kind: "card", blessingId: "drinking-water" } });
  });

  it("sample with no blessing → abstain", async () => {
    const res = await json({ sampleId: "keyboard" }, "alaa_device=b");
    expect((await res.json()).decision).toEqual({ kind: "abstain", reason: "no-blessing", concept: "keyboard" });
  });

  it("unknown sample → 400", async () => {
    expect((await json({ sampleId: "../../etc/passwd" })).status).toBe(400);
  });

  it("rejects non-images even with an image content type", async () => {
    const res = await upload(new TextEncoder().encode("not an image"), "image/jpeg", "alaa_device=c");
    expect(res.status).toBe(415);
    expect(await res.json()).toEqual({ error: "invalid-image" });
  });

  it("rejects oversized uploads", async () => {
    const res = await upload(new Uint8Array(1_600_000), "image/jpeg", "alaa_device=c");
    expect(res.status).toBe(413);
  });

  it("enforces the per-device daily limit", async () => {
    const jpeg = new Uint8Array(readFileSync("public/samples/sky.jpg"));
    const statuses: number[] = [];
    for (let i = 0; i < 4; i++) statuses.push((await upload(jpeg, "image/jpeg", "alaa_device=d")).status);
    expect(statuses).toEqual([200, 200, 200, 429]);
  });
});
