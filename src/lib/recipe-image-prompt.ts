import { anthropic } from "@/lib/anthropic";

const SYSTEM_PROMPT = `You write short prompts for an AI image generator that produces the hero \
photo for recipes in NutriPlus, a cheerful, energetic, fitness-oriented nutrition app. \
The photos must look like real, appetizing food photography (not illustrations): bright, \
naturally lit, vivid and saturated colors, shot from a flattering angle (often overhead or \
45 degrees), on simple modern tableware, with a clean but lively background. Output only the \
prompt itself, in English, 2-4 sentences, no preamble or quotation marks.`;

export async function craftImagePrompt(name: string, description: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-opus-5",
    max_tokens: 300,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Recipe name: ${name}\nDescription: ${description}\n\nWrite the image generation prompt for this dish.`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock) throw new Error("No se pudo generar el prompt de la imagen");

  return textBlock.text.trim();
}
