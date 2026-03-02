import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sentence, word, wordEnglish } = body;

    console.log('[validate-sentence API] Received request:', { sentence: sentence.substring(0, 50), word, wordEnglish });

    if (!sentence || !word) {
      console.error('[validate-sentence API] Missing required fields');
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('[validate-sentence API] OPENAI_API_KEY not configured');
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    // Call OpenAI API for grammar checking
    console.log('[validate-sentence API] Calling OpenAI API for German grammar checking...');
    
    const systemPrompt = `You are a German grammar checker and language teacher. 
Your task is to analyze sentences and provide structured feedback.
Always respond with valid JSON only, no additional text.`;

    const userPrompt = `Check this German sentence for grammar errors and determine if it uses the specified word correctly.

Sentence: "${sentence}"
Word to use: "${word}" (English meaning: "${wordEnglish}")

Analyze and return a JSON response with exactly this structure (no markdown, no code blocks, just raw JSON):
{
  "isValid": boolean,
  "baseOnWord": boolean,
  "correctedSentence": "string",
  "grammarErrors": [
    {
      "original": "string (the incorrect part)",
      "corrected": "string (the correct part)",
      "errorType": "string (Grammar/Spelling/Punctuation)",
      "explanation": "string (brief explanation in English)"
    }
  ],
  "feedback": "string (encouraging feedback about the sentence and word usage)"
}

Rules:
- isValid: true if no grammar errors found, false otherwise
- baseOnWord: true if the sentence clearly uses the word "${word}", false otherwise
- correctedSentence: the sentence with all grammar corrections applied
- grammarErrors: array of all grammar issues found (empty if no errors)
- feedback: constructive feedback based on correctness and word usage`;

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
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    console.log('[validate-sentence API] OpenAI Response Status:', openaiResponse.status);

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error("[validate-sentence API] OpenAI error:", errorData);
      return NextResponse.json(
        { error: "Failed to check grammar with OpenAI", details: errorData },
        { status: openaiResponse.status }
      );
    }

    const openaiData = await openaiResponse.json();
    console.log('[validate-sentence API] OpenAI response received');

    const content = openaiData.choices?.[0]?.message?.content;
    if (!content) {
      console.error('[validate-sentence API] No content in OpenAI response');
      return NextResponse.json(
        { error: "Invalid response from OpenAI" },
        { status: 500 }
      );
    }

    console.log('[validate-sentence API] OpenAI response content:', content);

    // Parse JSON from OpenAI response
    let result;
    try {
      result = JSON.parse(content);
    } catch (parseErr) {
      console.error('[validate-sentence API] Failed to parse OpenAI JSON response:', parseErr);
      console.error('[validate-sentence API] Raw content:', content);
      
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        try {
          result = JSON.parse(jsonMatch[1]);
        } catch (retryErr) {
          console.error('[validate-sentence API] Failed to parse extracted JSON:', retryErr);
          return NextResponse.json(
            { error: "Failed to parse grammar check response", details: String(parseErr) },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: "Failed to parse grammar check response", details: String(parseErr) },
          { status: 500 }
        );
      }
    }

    // Validate result structure
    if (!result || typeof result.isValid !== 'boolean' || typeof result.baseOnWord !== 'boolean') {
      console.error('[validate-sentence API] Invalid result structure:', result);
      return NextResponse.json(
        { error: "Invalid result structure from OpenAI" },
        { status: 500 }
      );
    }

    // Ensure arrays are valid
    result.grammarErrors = Array.isArray(result.grammarErrors) ? result.grammarErrors : [];
    result.feedback = String(result.feedback || "");
    result.correctedSentence = String(result.correctedSentence || sentence);

    console.log('[validate-sentence API] Returning validation result');
    return NextResponse.json(result);
  } catch (error) {
    console.error("[validate-sentence API] Unhandled error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : "";
    console.error("[validate-sentence API] Error stack:", errorStack);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: errorMessage,
        type: error instanceof Error ? error.constructor.name : typeof error
      },
      { status: 500 }
    );
  }
}
