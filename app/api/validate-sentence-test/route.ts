import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sentence, word, wordEnglish } = body;

    console.log('[validate-sentence-test] Received request');

    const apiKey = process.env.OPENAI_API_KEY;
    console.log('[validate-sentence-test] API Key exists:', !!apiKey);

    if (!apiKey) {
      return NextResponse.json({ error: "No API key" }, { status: 500 });
    }

    // Simple test - just check if we can reach OpenAI
    console.log('[validate-sentence-test] Testing OpenAI connection...');
    const testResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: "Say hi",
          },
        ],
        max_tokens: 10,
      }),
    });

    console.log('[validate-sentence-test] OpenAI Response Status:', testResponse.status);
    
    const responseData = await testResponse.json();
    console.log('[validate-sentence-test] OpenAI Response:', JSON.stringify(responseData, null, 2));

    if (!testResponse.ok) {
      return NextResponse.json(
        { error: "OpenAI error", details: responseData },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "OpenAI connection working",
      response: responseData 
    });
  } catch (error) {
    console.error('[validate-sentence-test] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
