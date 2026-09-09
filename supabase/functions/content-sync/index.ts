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

function cleanText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function isStrictlyRelatedToSchool(text: string): boolean {
  const lower = text.toLowerCase();
  // Must match explicit SDN Karang Tengah 1, SD Negeri Karang Tengah 1, or NPSN 20607151
  const matchesExactSchool =
    lower.includes("sdn karang tengah 1") ||
    lower.includes("sd negeri karang tengah 1") ||
    lower.includes("20607151") ||
    (lower.includes("karang tengah 1") && (lower.includes("sd") || lower.includes("sekolah dasar") || lower.includes("siswa") || lower.includes("guru")));

  // Reject generic matches like just "Kecamatan Karang Tengah" or other unrelated schools
  const isOtherSchool =
    lower.includes("sdn karang tengah 2") ||
    lower.includes("sdn karang tengah 3") ||
    lower.includes("sdn karang tengah 4") ||
    lower.includes("sdn karang tengah 5") ||
    lower.includes("smpn karang tengah") ||
    lower.includes("sman karang tengah");

  return matchesExactSchool && !isOtherSchool;
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
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(url, anon, {
      global: { headers: { Authorization: auth } }
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return jsonResponse({ error: "Sesi Admin tidak valid atau telah kedaluwarsa." }, 401);
    }

    const db = createClient(url, service);

    // Trusted search channels & official portals
    const trustedSources = [
      {
        name: "Kemendikdasmen SekolahKita",
        url: "https://sekolah.data.kemdikbud.go.id/index.php/chome/profil/f1350b91-2bf5-e011-97b7-af100d040a45",
        type: "official_profile"
      },
      {
        name: "Portal Berita Kota Tangerang",
        url: "https://tangerangkota.go.id/berita",
        type: "news_portal"
      }
    ];

    let checked = 0;
    let newCandidates = 0;

    // Check existing candidates to prevent duplicates
    const { data: existingList } = await db
      .from("content_candidates")
      .select("original_title, source_url")
      .limit(200);

    const existingKeys = new Set((existingList || []).map((x: any) => `${x.source_url}_${x.original_title}`));

    for (const src of trustedSources) {
      checked++;
      try {
        const resp = await fetch(src.url, {
          headers: { "User-Agent": "SDN-Karang-Tengah-1-NewsBot/1.0" },
          redirect: "follow"
        });

        if (!resp.ok) continue;
        const html = await resp.text();
        const text = cleanText(html);

        if (isStrictlyRelatedToSchool(text)) {
          const sampleTitle = `Kegiatan & Informasi Resmi SDN Karang Tengah 1 (${src.name})`;
          const sampleExcerpt = text.slice(0, 200) + "...";
          const key = `${src.url}_${sampleTitle}`;

          if (!existingKeys.has(key)) {
            const { error: insErr } = await db.from("content_candidates").insert({
              source_name: src.name,
              source_url: src.url,
              original_title: sampleTitle,
              original_content: text.slice(0, 1500),
              original_excerpt: sampleExcerpt,
              confidence: 90.00,
              status: "pending",
              detected_at: new Date().toISOString()
            });

            if (!insErr) {
              newCandidates++;
              existingKeys.add(key);
            }
          }
        }
      } catch (err: any) {
        console.warn(`Error scanning source ${src.url}:`, err.message);
      }
    }

    await db.from("sync_runs").insert({
      source_url: "internet_content_candidates_sync",
      status: "success",
      note: `Pemeriksaan konten internet selesai. ${newCandidates} kandidat berita baru ditemukan dari ${checked} sumber.`
    });

    return jsonResponse({
      ok: true,
      checked,
      candidates: newCandidates
    });

  } catch (err: any) {
    console.error("Content Sync Error:", err);
    return jsonResponse({ error: err.message || "Gagal melakukan sinkronisasi konten internet." }, 500);
  }
});
