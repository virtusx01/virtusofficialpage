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
    const mimeType = imageFile.type as "image/png" | "image/jpeg" | "image/webp";

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Kamu adalah sistem ekstraksi data profil game Valorant Mobile / game mobile Asia.

Tugas kamu: Ekstrak PERSIS DUA data berikut dari screenshot profil ini:

1. NICKNAME: Nama pemain yang terletak di HEADER KIRI screenshot, tepat di sebelah kanan avatar/foto profil. 
   - Nickname bisa berupa huruf Latin, huruf Asia (Cina, Jepang, Korea, dll), angka, simbol seperti <3, _, -, !, @, #, *, emojis, dan kombinasinya.
   - JANGAN ambil: menu navigasi (总览, 战绩, 数据, 战力, dll), teks hak premium (菁英权益, VIP, dll), nama klan/guild (biasanya di bawah nickname dalam kurung [ ] atau format berbeda), teks level/rank (Lv, Level, Radiant, Immortal, Diamond, dll), angka murni seperti "128".
   - Nickname biasanya ada di KIRI atas profil, berukuran besar, dan berwarna putih tebal.
   - Jika ada simbol atau karakter khusus dalam nickname (seperti <3, ♡, ★, dll), WAJIB ikut disertakan.

2. GAME ID: Rangkaian angka panjang (biasanya 10-15 digit) yang merupakan ID unik akun. Biasanya ada di kanan atas header, sering didahului teks "编号 :" atau simbol ID.

Jawab HANYA dalam format JSON berikut, tidak ada teks lain:
{"nickname": "...", "gameId": "..."}

Jika salah satu tidak ditemukan, isi dengan string kosong "".`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType || "image/png"
        }
      }
    ]);

    const responseText = result.response.text().trim();
    
    // Extract JSON from response (sometimes Gemini wraps in ```json ... ```)
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
    console.error("Scan Screenshot Error:", err);
    return NextResponse.json({ error: "Failed to process screenshot" }, { status: 500 });
  }
}
