(() => {
  const cfg = window.SDN_CONFIG || window.SDN11_CONFIG || {};
  const hasConfig = typeof cfg.SUPABASE_URL === "string" && cfg.SUPABASE_URL.startsWith("https://") && typeof cfg.SUPABASE_ANON_KEY === "string" && cfg.SUPABASE_ANON_KEY.length > 20;
  const hasLibrary = window.supabase && typeof window.supabase.createClient === "function";
  if (!hasLibrary) console.error("Supabase JS gagal dimuat. Periksa CDN/script order.");
  const clientObj = {
    configured: Boolean(hasConfig && hasLibrary),
    client: hasConfig && hasLibrary ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null,
    bucket: cfg.STORAGE_BUCKET || "school-media"
  };
  window.SDN = window.SDN11 = clientObj;
})();
