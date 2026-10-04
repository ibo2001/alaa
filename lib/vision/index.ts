import { AnthropicVisionProvider } from "./anthropic";
import { StubVisionProvider } from "./stub";
import type { VisionProvider } from "./types";

let provider: VisionProvider | null = null;

/** Picks the provider from env VISION_PROVIDER, so it can be switched without code changes. */
export function getVisionProvider(): VisionProvider {
  if (provider) return provider;
  switch (process.env.VISION_PROVIDER ?? "anthropic") {
    case "stub":
      provider = new StubVisionProvider();
      break;
    case "anthropic":
      provider = new AnthropicVisionProvider();
      break;
    default:
      throw new Error(`Unknown VISION_PROVIDER "${process.env.VISION_PROVIDER}"`);
  }
  return provider;
}

export type { VisionProvider, VisionResult, Candidate } from "./types";
