import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" }
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) {
      return jsonResponse({ error: "Akses ditolak: Authorization token diperlukan." }, 401);
    }

    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(url, anon, {
      global: { headers: { Authorization: auth } }
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return jsonResponse({ error: "Sesi Admin tidak valid atau telah kedaluwarsa." }, 401);
    }

    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) {
      return jsonResponse({ error: "GEMINI_API_KEY belum dikonfigurasi di Supabase Secrets." }, 500);
    }

    const body = await req.json().catch(() => ({}));
    const { title, content, excerpt } = body;

    const textToAnalyze = [
      title ? `Judul Asli: ${title}` : null,
      content ? `Isi / Teks Asli:\n${content}` : (excerpt ? `Ringkasan / Teks Asli:\n${excerpt}` : null)
    ].filter(Boolean).join("\n\n");

    if (!textToAnalyze.trim()) {
      return jsonResponse({ error: "Tidak ada teks yang diberikan untuk dioptimalkan." }, 400);
    }

    const systemInstruction = `You are an editorial assistant for the official website of SDN Karang Tengah 1, Kota Tangerang.

Your task is to optimize text written by school administrators or obtained from approved source material.

Improve:
grammar,
spelling,
punctuation,
clarity,
paragraph structure,
headline quality,
readability,
and professional school-news tone.

Preserve all factual meaning.

NEVER invent names, dates, numbers, positions, locations, quotations, achievements, activities, school programs, or other factual information.

If a fact is not present in the source material, do not add it.

Return an improved headline and article body.

Do not publish or modify database records.`;

    const prompt = `Optimalkan draft teks berita/informasi sekolah berikut dan kembalikan format JSON dengan properti "headline" dan "body":\n\n${textToAnalyze}`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                headline: { type: "STRING", description: "Optimized news title / headline" },
                body: { type: "STRING", description: "Optimized article content / body" }
              },
              required: ["headline", "body"]
            }
          }
        })
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini API Error:", errText);
      throw new Error(`Gemini API HTTP ${geminiRes.status}: ${errText}`);
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    let parsed: any = {};
    try {
      parsed = JSON.parse(rawText.replace(/```json|```/g, "").trim());
    } catch {
      parsed = { headline: title || "", body: rawText || content || excerpt || "" };
    }

    return jsonResponse({
      success: true,
      headline: parsed.headline || title || "",
      body: parsed.body || content || excerpt || ""
    });

  } catch (err: any) {
    console.error("AI Editor Error:", err);
    return jsonResponse({ error: err.message || "Gagal mengoptimalkan teks menggunakan AI." }, 500);
  }
});
