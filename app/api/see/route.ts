import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { getVisionProvider } from "@/lib/vision";
import { decide } from "@/lib/vision/decide";
import { takeQuota } from "@/lib/vision/limit";
import { cachedSampleResult, getSample } from "@/lib/vision/samples";
import { VisionUnavailableError, type VisionImage, type VisionResult } from "@/lib/vision/types";

// Images are processed in memory and discarded. Nothing about the image or the model
// input/output is logged or stored.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 1_500_000; // a 768px JPEG is ~100–300 KB
const TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const DEVICE_COOKIE = "alaa_device";

export type SeeError = "invalid-request" | "invalid-image" | "too-large" | "daily-limit" | "model-unavailable";

function fail(error: SeeError, status: number) {
  return NextResponse.json({ error }, { status });
}

/** Checks magic bytes so a renamed file can't pass as an image. */
function sniff(buf: Buffer): VisionImage["mediaType"] | null {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buf.length > 12 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return "image/webp";
  return null;
}

export async function POST(req: NextRequest) {
  const deviceId = req.cookies.get(DEVICE_COOKIE)?.value ?? randomUUID();
  const respond = (body: object, status = 200) => {
    const res = NextResponse.json(body, { status });
    res.cookies.set(DEVICE_COOKIE, deviceId, { httpOnly: true, sameSite: "lax", secure: true, maxAge: 60 * 60 * 24 * 365 });
    return res;
  };

  let image: VisionImage | null = null;
  let sampleId: string | undefined;

  const contentType = req.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("application/json")) {
      const body = (await req.json()) as { sampleId?: unknown };
      if (typeof body.sampleId !== "string") return fail("invalid-request", 400);
      const sample = getSample(body.sampleId);
      if (!sample) return fail("invalid-request", 400);
      sampleId = sample.id;
    } else if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("image");
      if (!(file instanceof File)) return fail("invalid-request", 400);
      if (file.size > MAX_BYTES) return fail("too-large", 413);
      if (!TYPES.has(file.type)) return fail("invalid-image", 415);
      const data = Buffer.from(await file.arrayBuffer());
      const mediaType = sniff(data);
      if (!mediaType) return fail("invalid-image", 415);
      image = { data, mediaType };
    } else {
      return fail("invalid-request", 400);
    }
  } catch {
    return fail("invalid-request", 400);
  }

  let result: VisionResult | undefined;
  if (sampleId) {
    // Sample photos: use the recorded result if present (instant, free, consistent).
    result = cachedSampleResult(sampleId);
    if (!result) {
      const sample = getSample(sampleId)!;
      const data = await readFile(join(process.cwd(), "public", sample.file));
      image = { data, mediaType: sniff(data) ?? "image/jpeg" };
    }
  }

  if (!result) {
    if (!takeQuota(deviceId)) return respond({ error: "daily-limit" satisfies SeeError }, 429);
    try {
      result = await getVisionProvider().recognize(image!, { sampleId });
    } catch (error) {
      // Report the error class only; never the request or the image.
      console.error("vision provider failed:", error instanceof VisionUnavailableError ? error.message : (error as Error)?.name);
      return respond({ error: "model-unavailable" satisfies SeeError }, 503);
    }
  }

  return respond({ decision: decide(result), provider: sampleId && cachedSampleResult(sampleId) ? "cache" : getVisionProvider().name });
}
