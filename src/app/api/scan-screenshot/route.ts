import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
    }

    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = (imageFile.type || "image/png") as "image/png" | "image/jpeg" | "image/webp";

    // Use gemini-3.6-flash which is active, ultra-fast and reliable on current Google AI Studio API keys
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

    const prompt = `You are a high-precision OCR and game profile reader (specifically Valorant Mobile and Asian mobile games).

Extract strictly TWO fields from this profile screenshot:

1. "nickname": The player's IGN / Username.
   - It is located in the LEFT HEADER area, directly to the right of the player avatar / rank badge / gender symbol.
   - It is written in distinct WHITE text.
   - Read the exact characters letter by letter. Preserve all multilingual characters (Latin, Chinese, Japanese, Korean, Arabic, Thai, Cyrillic, etc.) and ALL symbols/emojis (such as <3, ♡, ★, _, -, !, @, #).
   - DO NOT include right-side UI buttons or labels (e.g. 菁英权益, 总览, 战绩, etc.) or clan tags.

2. "gameId": The 8 to 20 digit numeric Game ID (IGN Number) located on the upper right area, usually preceded by "编号 :", "ID:", "No:", or next to a copy button.

Return strictly a valid JSON object without markdown fences or extra explanations:
{"nickname": "...", "gameId": "..."}`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      }
    ]);

    const responseText = result.response.text().trim();
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) {
      console.error("Gemini response was not valid JSON:", responseText);
      return NextResponse.json({ error: "Could not parse Gemini response", raw: responseText }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const nickname = (parsed.nickname || "").trim();
    const gameId = (parsed.gameId || "").replace(/\D/g, "").trim();

    return NextResponse.json({ nickname, gameId });

  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("Scan Screenshot Error:", errMsg);
    return NextResponse.json({ error: "Failed to process screenshot", detail: errMsg }, { status: 500 });
  }
}
