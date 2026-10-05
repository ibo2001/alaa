import { describe, expect, it } from "vitest";
import { mapName } from "../../eval/alt";

// The alternative approach's manual mapping table (free object names → concept ids).
describe("eval: free-label mapping", () => {
  it("maps common names and plurals to concepts", () => {
    expect(mapName("glass of water")).toBe("drinking_water");
    expect(mapName("Water")).toBe("water");
  });
  it("leaves objects outside the list unmapped (keyboard is in the list, as a no-verse concept)", () => {
    expect(mapName("keyboard")).toBe("keyboard");
    expect(mapName("violin")).toBeNull();
    expect(mapName("traffic cone")).toBeNull();
  });
});
