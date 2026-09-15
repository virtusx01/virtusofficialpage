import { NextResponse } from "next/server";

export interface Supporter {
  rank: number;
  name: string;
  amount: number;
  formattedAmount: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawParam = searchParams.get("url") || searchParams.get("id") || "8913094574";

  // Extract numeric ID if rawParam is a full URL or contains numbers
  const idMatch = rawParam.match(/(\d+)/g);
  const tribeId = idMatch ? idMatch[idMatch.length - 1] : "8913094574";

  try {
    const res = await fetch(
      `https://sociabuzz.com/pro/tribe/tribe_profile/get_detail_leaderboard_int_v4/${tribeId}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch from Sociabuzz: ${res.statusText}`);
    }

    const data = await res.json();
    const htmlSnippet: string = data?.datas || "";

    // Parse HTML table rows using Regex
    const supporters: Supporter[] = [];
    const trRegex = /<tr>([\s\S]*?)<\/tr>/g;
    let match;
    let rank = 1;

    while ((match = trRegex.exec(htmlSnippet)) !== null) {
      const rowContent = match[1];
      const nameMatch = /<strong class="text-limit\s*">([\s\S]*?)<\/strong>/.exec(rowContent);
      const amountMatch = /<strong class="text-limit-r\s*">([\s\S]*?)<\/strong>/.exec(rowContent);

      if (nameMatch && amountMatch) {
        const name = nameMatch[1].trim();
        const rawAmountStr = amountMatch[1].trim();
        const amount = parseInt(rawAmountStr.replace(/[^0-9]/g, ""), 10) || 0;

        supporters.push({
          rank,
          name,
          amount,
          formattedAmount: rawAmountStr,
        });
        rank++;
      }
    }

    return NextResponse.json({
      success: true,
      tribeId,
      count: supporters.length,
      updatedAt: new Date().toISOString(),
      supporters,
    });
  } catch (error: any) {
    console.error("Sociabuzz fetch error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to fetch leaderboard data",
      },
      { status: 500 }
    );
  }
}
