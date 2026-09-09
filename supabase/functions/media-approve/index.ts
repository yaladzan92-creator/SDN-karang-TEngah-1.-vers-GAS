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
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(url, anon, {
      global: { headers: { Authorization: auth } }
    });

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return jsonResponse({ error: "Sesi Admin tidak valid atau telah kedaluwarsa." }, 401);
    }

    const body = await req.json().catch(() => ({}));
    const { id, image_url, media_type } = body;

    if (!image_url) {
      return jsonResponse({ error: "URL gambar wajib disediakan." }, 400);
    }

    // Download image securely server-side
    const imgResp = await fetch(image_url, {
      headers: { "User-Agent": "SDN-Karang-Tengah-1-StorageTransfer/1.0" }
    });

    if (!imgResp.ok) {
      throw new Error(`Gagal mengunduh gambar sumber (HTTP ${imgResp.status})`);
    }

    const contentType = imgResp.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await imgResp.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    let ext = "jpg";
    if (contentType.includes("png")) ext = "png";
    else if (contentType.includes("webp")) ext = "webp";
    else if (contentType.includes("svg")) ext = "svg";

    const folder = (media_type || "gallery").toLowerCase();
    const fileName = `${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;

    const db = createClient(url, service);

    const { error: uploadErr } = await db.storage
      .from("school-media")
      .upload(fileName, uint8Array, {
        contentType,
        cacheControl: "31536000",
        upsert: true
      });

    if (uploadErr) {
      throw new Error(`Supabase Storage Upload Error: ${uploadErr.message}`);
    }

    const { data: pubData } = db.storage.from("school-media").getPublicUrl(fileName);
    const storageUrl = pubData.publicUrl;

    // If candidate id exists in media_candidates table, update record
    if (id) {
      await db.from("media_candidates").update({
        storage_url: storageUrl,
        status: "approved",
        reviewed_at: new Date().toISOString()
      }).eq("id", id);
    }

    return jsonResponse({
      success: true,
      storage_url: storageUrl
    });

  } catch (err: any) {
    console.error("Media Approve Error:", err);
    return jsonResponse({ error: err.message || "Gagal menyetujui dan menyimpan media ke Storage." }, 500);
  }
});
