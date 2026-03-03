import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, targetLanguage = "bn" } = body;

    if (!text) {
      return NextResponse.json(
        { error: "Translation text is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("[translate API] OPENAI_API_KEY not configured");
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    console.log("[translate API] Translating to", targetLanguage);

    const systemPrompt = `You are a translator. Translate the given text to ${targetLanguage === "bn" ? "Bengali" : "the target language"}.
Respond with only the translated text, nothing else.`;

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text }
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error("[translate API] OpenAI error:", errorData);
      return NextResponse.json(
        { error: "Translation failed", details: errorData },
        { status: openaiResponse.status }
      );
    }

    const openaiData = await openaiResponse.json();
    const translatedText = openaiData.choices?.[0]?.message?.content?.trim();

    if (!translatedText) {
      console.error("[translate API] No translation in response");
      return NextResponse.json(
        { error: "Empty translation response" },
        { status: 500 }
      );
    }

    console.log("[translate API] Translation successful");
    return NextResponse.json({ translation: translatedText });
  } catch (error) {
    console.error("[translate API] Unhandled error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Internal server error", details: errorMessage },
      { status: 500 }
    );
  }
}
