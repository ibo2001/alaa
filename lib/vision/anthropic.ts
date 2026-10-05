import Anthropic from "@anthropic-ai/sdk";
import { systemPrompt } from "./prompt";
import { parseVisionResult, TOOL_NAME, toolInputSchema } from "./schema";
import { VisionUnavailableError, type VisionImage, type VisionProvider, type VisionResult } from "./types";

export const DEFAULT_VISION_MODEL = "claude-opus-5-5";

// These models reject a forced tool_choice ("any"/"tool") with a 400; for them we use
// tool_choice "auto" + a strict tool + a prompt instruction, and check that the call was made.
export const NO_FORCED_TOOL = /^claude-(opus-5-5|sonnet-5-5|fable-5-1|mythos-5-1)/;
// These models do not accept output_config.effort.
const NO_EFFORT = /^claude-(haiku-4-5|sonnet-4-5)/;
// These models still accept sampling parameters; temperature 0 makes repeated runs more consistent.
const SAMPLING_ALLOWED = /^claude-(haiku-4-5|sonnet-4-5|opus-4-5|opus-4-6|sonnet-4-6)/;

export class AnthropicVisionProvider implements VisionProvider {
  readonly name = "anthropic";
  private client: Anthropic;
  private system = systemPrompt();
  private tool: Anthropic.Tool = {
    name: TOOL_NAME,
    description: "Report which concepts from the fixed list are visible in the photo.",
    strict: true,
    input_schema: toolInputSchema(),
  };

  constructor(
    readonly model: string = process.env.VISION_MODEL || DEFAULT_VISION_MODEL,
    client?: Anthropic,
  ) {
    this.client = client ?? new Anthropic({ timeout: 20_000, maxRetries: 1 });
  }

  async recognize(image: VisionImage): Promise<VisionResult> {
    // One retry if the model answers without calling the tool (possible with tool_choice "auto").
    for (let attempt = 0; attempt < 2; attempt++) {
      const result = await this.callOnce(image);
      if (result) return result;
    }
    throw new VisionUnavailableError("Model did not return a tool call");
  }

  private async callOnce(image: VisionImage): Promise<VisionResult | null> {
    const forced = !NO_FORCED_TOOL.test(this.model);
    let response: Anthropic.Message;
    try {
      response = await this.client.messages.create({
        model: this.model,
        max_tokens: 2048,
        // Cache marker on the fixed prefix (tools + system). With claude-haiku-4-5 the prefix (~3k tokens) is below the
        // 4,096-token caching minimum, so it is a no-op today (measured; docs/RESULTS.md); it takes effect if the list grows.
        system: [{ type: "text", text: this.system, cache_control: { type: "ephemeral" } }],
        tools: [this.tool],
        tool_choice: forced ? { type: "tool", name: TOOL_NAME } : { type: "auto", disable_parallel_tool_use: true },
        ...(NO_EFFORT.test(this.model) ? {} : { output_config: { effort: "low" as const } }),
        ...(SAMPLING_ALLOWED.test(this.model) ? { temperature: 0 } : {}),
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: image.mediaType, data: image.data.toString("base64") } },
              { type: "text", text: `Call ${TOOL_NAME} with what you see.` },
            ],
          },
        ],
      });
    } catch (error) {
      if (error instanceof Anthropic.APIError || error instanceof Anthropic.APIConnectionError) {
        throw new VisionUnavailableError(`Anthropic API error ${"status" in error ? error.status : ""}`, { cause: error });
      }
      throw error;
    }

    // A safety refusal means we must not show anything for this image.
    const u = response.usage;
    const usage = {
      input: u.input_tokens,
      output: u.output_tokens,
      cacheWrite: u.cache_creation_input_tokens ?? 0,
      cacheRead: u.cache_read_input_tokens ?? 0,
    };
    if (response.stop_reason === "refusal") return { candidates: [], is_person: false, unsafe: true, usage };

    const call = response.content.find(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use" && b.name === TOOL_NAME,
    );
    if (!call) return null;
    return { ...parseVisionResult(call.input), usage };
  }
}
