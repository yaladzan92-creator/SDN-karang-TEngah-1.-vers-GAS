let c = null;
const $=id=>document.getElementById(id), getClient=()=>{ c=(window.SDN||window.SDN11)?.client; return c; }, getBucket=()=>(window.SDN||window.SDN11)?.bucket||"school-media";
const esc=s=>String(s??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]));
let cache={rombel:[],eskul:[],activity:[],program:[],news:[],announcement:[],achievement:[],gallery:[],document:[],schedule:[],staging:[],sources:[],media_candidates:[],content_candidates:[]},profile={};

const defs={
rombel:{table:"class_groups",title:"Rombel",fields:[["name","Nama Rombel","text"],["grade","Tingkat","number"],["academic_year","Tahun Ajaran","text"],["semester","Semester","text"],["student_count","Jumlah Siswa","number"],["male_count","Laki-laki","number"],["female_count","Perempuan","number"],["homeroom_teacher","Wali Kelas","text"],["room","Ruang","text"],["source_note","Sumber Data","text"],["published","Tampilkan","checkbox"]]},
eskul:{table:"extracurriculars",title:"Ekstrakurikuler",fields:[["name","Nama Eskul","text"],["day","Hari","text"],["start_time","Jam Mulai","time"],["end_time","Jam Selesai","time"],["location","Lokasi","text"],["coach","Pembina","text"],["trainer","Pelatih","text"],["participant_grades","Kelas Peserta","text"],["capacity","Kuota","number"],["description","Deskripsi","textarea"],["image_url","URL Foto","text"],["image_file","Upload Foto","file"],["active","Aktif","checkbox"]]},
activity:{table:"extracurricular_activities",title:"Kegiatan Eskul",fields:[["extracurricular_id","Eskul","eskul"],["title","Judul","text"],["activity_date","Tanggal","date"],["description","Deskripsi","textarea"],["image_url","URL Foto","text"],["image_file","Upload Foto","file"],["published","Publish","checkbox"]]},
program:{table:"programs",title:"Program Sekolah",fields:[["title","Nama Program","text"],["description","Deskripsi","textarea"],["sort_order","Urutan","number"],["published","Tampilkan","checkbox"]]},
news:{table:"news",title:"Berita",fields:[["title","Judul","text"],["published_at","Tanggal","date"],["excerpt","Ringkasan","textarea"],["content","Isi","textarea"],["image_url","URL Foto","text"],["image_file","Upload Foto","file"],["published","Publish","checkbox"]]},
announcement:{table:"announcements",title:"Pengumuman",fields:[["title","Judul","text"],["published_at","Tanggal","date"],["body","Isi","textarea"],["published","Publish","checkbox"]]},
achievement:{table:"achievements",title:"Prestasi",fields:[["title","Judul","text"],["category","Kategori","text"],["level","Tingkat","text"],["year","Tahun","number"],["description","Deskripsi","textarea"],["published","Publish","checkbox"]]},
gallery:{table:"gallery",title:"Galeri",fields:[["title","Judul Foto","text"],["image_url","URL Foto","text"],["image_file","Upload Foto","file"],["published","Publish","checkbox"]]},
document:{table:"documents",title:"Dokumen",fields:[["title","Nama Dokumen","text"],["category","Kategori","text"],["description","Deskripsi","textarea"],["file_url","URL Dokumen","text"],["file_upload","Upload File","file"],["published","Publish","checkbox"]]},
schedule:{table:"school_schedules",title:"Jadwal",fields:[["day","Hari","text"],["title","Kegiatan/Judul","text"],["time_text","Waktu","text"],["class_name","Kelas","text"],["description","Keterangan","textarea"],["sort_order","Urutan","number"],["published","Publish","checkbox"]]}
};
async function authCheck(){const s=window.SDN||window.SDN11;if(!s?.configured){$("loginMsg").textContent="Isi konfigurasi Supabase di admin/js/config.js terlebih dahulu.";return}const c=getClient();const {data:{session}}=await c.auth.getSession();session?showApp():showLogin()}
function showApp(){$("loginView").classList.add("hidden");$("appView").classList.remove("hidden");loadAll()}function showLogin(){$("loginView").classList.remove("hidden");$("appView").classList.add("hidden")}
$("loginForm").onsubmit=async e=>{e.preventDefault();$("loginMsg").textContent="Memeriksa…";const c=getClient();const {error}=await c.auth.signInWithPassword({email:$("email").value,password:$("password").value});if(error){$("loginMsg").textContent=error.message;return}$("loginMsg").textContent="";showApp()}
$("logoutBtn").onclick=async()=>{const c=getClient();if(c)await c.auth.signOut();showLogin()}

// Backend caller: Supabase Edge Functions (Production / GitHub Pages) with server API fallback (Local dev)
async function callBackendFunction(functionName, apiRoute, payload) {
  const c = getClient();
  const session = (await c?.auth?.getSession?.())?.data?.session;
  const token = session?.access_token || "";

  // 1. Try Supabase Edge Function first if configured
  if (c && typeof c.functions?.invoke === "function") {
    try {
      const { data, error } = await c.functions.invoke(functionName, {
        body: payload
      });
      if (!error && data && data.success !== false) {
        return data;
      }
      if (error) {
        console.warn(`Supabase Edge Function ${functionName} note:`, error);
      }
    } catch (fnErr) {
      console.warn(`Fallback to local API for ${functionName}:`, fnErr.message);
    }
  }

  // 2. Fallback to Express server API route
  const resp = await fetch(apiRoute, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": token ? `Bearer ${token}` : ""
    },
    body: JSON.stringify(payload)
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(data.error || `Server Error (HTTP ${resp.status})`);
  }
  return data;
}

async function upload(file,folder){
  if(!file?.size)throw new Error("File tidak valid.");
  const safeName=file.name.replace(/[^a-zA-Z0-9._-]/g,"-");
  const path=`${folder}/${Date.now()}-${crypto.randomUUID?.()||Math.random().toString(36).slice(2)}-${safeName}`;
  const c=getClient(), bucket=getBucket();
  const {error}=await c.storage.from(bucket).upload(path,file,{cacheControl:"3600",upsert:false,contentType:file.type||undefined});
  if(error)throw error;
  const {data}=c.storage.from(bucket).getPublicUrl(path);
  if(!data?.publicUrl)throw new Error("Public URL gambar gagal dibuat.");
  return data.publicUrl;
}
function fillProfile(){
  const m={schoolName:"name",schoolNpsn:"npsn",schoolStatus:"status",schoolLevel:"level",schoolAccreditation:"accreditation",schoolPrincipal:"principal",schoolStudents:"students",schoolStaff:"staff",schoolAddress:"address",schoolCity:"city",schoolPhone:"phone",schoolEmail:"email",schoolInstagram:"instagram_url",schoolFacebook:"facebook_url",schoolYoutube:"youtube_url",schoolTiktok:"tiktok_url",schoolWhatsapp:"whatsapp_url",schoolMaps:"maps_url",schoolProfileTitle:"profile_title",schoolDescription:"description",schoolVision:"vision",schoolHeroSubtitle:"hero_subtitle",schoolSpmbTitle:"spmb_title",schoolSpmbUrl:"spmb_url",schoolSpmbDescription:"spmb_description"};
  for(const [id,k] of Object.entries(m)) if($(id)) $(id).value=profile[k]??"";
  if($("schoolMission")) $("schoolMission").value=Array.isArray(profile.mission)?profile.mission.join("\n"):"";
  if($("schoolLogoPreview")) $("schoolLogoPreview").src=profile.logo_url||"../assets/brand-kt1.svg";
  if($("schoolProfilePreview")) $("schoolProfilePreview").src=profile.profile_image_url||"../assets/school-profile-placeholder.svg";
  if($("schoolHeroPreview")) $("schoolHeroPreview").src=profile.hero_image_url||"../assets/school-hero-placeholder.svg";
}

async function loadAll(){
  const s=window.SDN||window.SDN11;
  if(!s?.configured)return;
  const c=getClient();
  if(!c)return;
  try{
    const [pr,r,e,a,pg,n,an,ac,g,d,sc,st,src,mc,cc]=await Promise.all([
      c.from("school_profile").select("*").eq("id",1).maybeSingle(),
      c.from("class_groups").select("*").order("grade",{ascending:true}),
      c.from("extracurriculars").select("*").order("name",{ascending:true}),
      c.from("extracurricular_activities").select("*, extracurriculars(name)").order("activity_date",{ascending:false}),
      c.from("programs").select("*").order("sort_order",{ascending:true}),
      c.from("news").select("*").order("published_at",{ascending:false}),
      c.from("announcements").select("*").order("published_at",{ascending:false}),
      c.from("achievements").select("*").order("year",{ascending:false}),
      c.from("gallery").select("*").order("created_at",{ascending:false}),
      c.from("documents").select("*").order("created_at",{ascending:false}),
      c.from("school_schedules").select("*").order("sort_order",{ascending:true}),
      c.from("sync_staging").select("*").order("created_at",{ascending:false}),
      c.from("sync_sources").select("*").order("name",{ascending:true}),
      c.from("media_candidates").select("*").order("created_at",{ascending:false}).catch?.(()=>({data:[]}))||c.from("media_candidates").select("*").order("created_at",{ascending:false}),
      c.from("content_candidates").select("*").order("created_at",{ascending:false}).catch?.(()=>({data:[]}))||c.from("content_candidates").select("*").order("created_at",{ascending:false})
    ]);
    if(pr?.data)profile=pr.data;
    cache.rombel=r?.data||[];
    cache.eskul=e?.data||[];
    cache.activity=a?.data||[];
    cache.program=pg?.data||[];
    cache.news=n?.data||[];
    cache.announcement=an?.data||[];
    cache.achievement=ac?.data||[];
    cache.gallery=g?.data||[];
    cache.document=d?.data||[];
    cache.schedule=sc?.data||[];
    cache.staging=st?.data||[];
    cache.sources=src?.data||[];
    cache.media_candidates=(mc?.data&&mc.data.length)?mc.data:[
      {
        id: "kemendikdasmen-hero-1",
        source_name: "Kemendikdasmen SekolahKita",
        source_url: "https://sekolah.data.kemdikbud.go.id/index.php/chome/profil/f1350b91-2bf5-e011-97b7-af100d040a45",
        image_url: "https://file.data.kemendikdasmen.go.id/sekolahkita/20/2060/20607151-13.jpg",
        title: "Gedung & Lapangan SDN Karang Tengah 1",
        description: "Dokumentasi gedung dan pekarangan sekolah dari pangkalan data resmi Kemendikdasmen.",
        media_type: "hero",
        confidence: 95.0,
        status: "pending",
        created_at: new Date().toISOString()
      }
    ];
    cache.content_candidates=(cc?.data&&cc.data.length)?cc.data:[
      {
        id: "kemendikdasmen-news-cand-1",
        source_name: "Kemendikdasmen SekolahKita",
        source_url: "https://sekolah.data.kemdikbud.go.id/index.php/chome/profil/f1350b91-2bf5-e011-97b7-af100d040a45",
        original_title: "SDN Karang Tengah 1 Mengoptimalkan Pembelajaran Dasar dan Fasilitas Sekolah",
        original_excerpt: "Informasi resmi dari pangkalan data pendidikan mengenai perkembangan fasilitas dan kegiatan SDN Karang Tengah 1.",
        original_content: "SDN Karang Tengah 1 yang berlokasi di Kecamatan Karang Tengah, Kota Tangerang terus mengupayakan lingkungan belajar yang kondusif dan ramah anak. Dengan status akreditasi A, sekolah memfokuskan program pada penguatan literasi numerasi dan karakter budi pekerti peserta didik.",
        original_image_url: "https://file.data.kemendikdasmen.go.id/sekolahkita/20/2060/20607151-13.jpg",
        confidence: 92.0,
        status: "pending",
        created_at: new Date().toISOString()
      }
    ];
    fillProfile();
    renderAll();
  }catch(err){
    console.error("Gagal memuat data:",err);
  }
}

$("saveProfileBtn").onclick=async()=>{
  const c=getClient();
  const payload={
    id:1,
    name:$("schoolName").value,
    npsn:$("schoolNpsn").value,
    status:$("schoolStatus").value,
    level:$("schoolLevel").value,
    accreditation:$("schoolAccreditation").value,
    principal:$("schoolPrincipal").value,
    students:+$("schoolStudents").value||null,
    staff:+$("schoolStaff").value||null,
    address:$("schoolAddress").value,
    city:$("schoolCity").value,
    phone:$("schoolPhone").value,
    email:$("schoolEmail").value,
    instagram_url:$("schoolInstagram")?.value||null,
    facebook_url:$("schoolFacebook")?.value||null,
    youtube_url:$("schoolYoutube")?.value||null,
    tiktok_url:$("schoolTiktok")?.value||null,
    whatsapp_url:$("schoolWhatsapp")?.value||null,
    maps_url:$("schoolMaps").value,
    profile_title:$("schoolProfileTitle").value,
    description:$("schoolDescription").value,
    vision:$("schoolVision").value,
    mission:$("schoolMission").value.split("\n").map(x=>x.trim()).filter(Boolean),
    hero_subtitle:$("schoolHeroSubtitle").value,
    spmb_title:$("schoolSpmbTitle").value,
    spmb_url:$("schoolSpmbUrl").value,
    spmb_description:$("schoolSpmbDescription").value,
    logo_url:profile.logo_url||null,
    profile_image_url:profile.profile_image_url||null,
    hero_image_url:profile.hero_image_url||null,
    updated_at:new Date().toISOString()
  };
  const {error}=await c.from("school_profile").upsert(payload);
  $("profileMsg").textContent=error?error.message:"Profil berhasil disimpan.";
  if(!error){profile=payload;renderAll()}
};

function renderAll(){
  $("kpiStudents").textContent=profile.students??"—";
  $("kpiRombel").textContent=cache.rombel.length;
  $("kpiEskul").textContent=cache.eskul.length;
  if($("kpiNewsCandidates")) $("kpiNewsCandidates").textContent=cache.content_candidates.filter(x=>x.status==="pending").length;
  for(const k of Object.keys(defs))renderTable(k);
  renderStaging();
  renderSources();
  renderContentCandidates();
  renderMediaCandidates();
}

function renderTable(type){const d=defs[type],box=$(type+"Editor");const fields=d.fields.filter(f=>f[2]!=="file").slice(0,5);if(!cache[type].length){box.innerHTML='<p class="empty">Belum ada data. Klik “+ Tambah”.</p>';return}box.innerHTML=`<div class="table-wrap"><table class="editor-table"><thead><tr>${fields.map(f=>`<th>${esc(f[1])}</th>`).join("")}<th>Aksi</th></tr></thead><tbody>${cache[type].map(x=>`<tr>${fields.map(f=>`<td>${esc(displayValue(f,x[f[0]]))}</td>`).join("")}<td><div class="editor-actions"><button class="secondary" onclick="openEditor('${type}','${x.id}')">Edit</button><button class="danger" onclick="deleteItem('${type}','${x.id}')">Hapus</button></div></td></tr>`).join("")}</tbody></table></div>`}
function displayValue(f,v){if(f[2]==="checkbox")return v?"Ya":"Tidak";if(f[2]==="eskul"){const x=cache.eskul.find(e=>e.id===v);return x?.name||"-"}return v??"-"}
document.querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>openEditor(b.dataset.add,null))

window.openEditor=(type,id)=>{
  const d=defs[type],item=id?cache[type].find(x=>String(x.id)===String(id)):{};
  $("modalTitle").textContent=(id?"Edit ":"Tambah ")+d.title;
  
  let html = d.fields.map(f=>fieldHTML(f,item[f[0]],type)).join("");
  
  if(["news","announcement","activity"].includes(type)){
    html += `
      <div class="ai-btn-container">
        <button type="button" id="aiOptimizeBtn" class="ai-btn" onclick="runAiOptimization()">✨ Optimalkan dengan AI</button>
        <div id="aiPreviewArea"></div>
      </div>
    `;
  }
  
  html += `<div class="form-actions"><button type="button" class="secondary" onclick="closeModal()">Batal</button><button class="primary">Simpan</button></div>`;
  
  $("modalForm").innerHTML = html;
  $("modal").classList.remove("hidden");
  $("modalForm").onsubmit=e=>saveEditor(e,type,id);
};

window.openNewsEditorWithCandidate = (title, description, imageUrl) => {
  openEditor("news", null);
  setTimeout(() => {
    const form = $("modalForm");
    if (!form) return;
    const titleInput = form.querySelector('input[name="title"]');
    const contentInput = form.querySelector('textarea[name="content"]');
    const excerptInput = form.querySelector('textarea[name="excerpt"]');
    const imageUrlInput = form.querySelector('input[name="image_url"]');

    if (titleInput && title) titleInput.value = title;
    if (contentInput && description) contentInput.value = description;
    if (excerptInput && description) excerptInput.value = description.slice(0, 150);
    if (imageUrlInput && imageUrl) imageUrlInput.value = imageUrl;
  }, 50);
};

window.runAiOptimization = async () => {
  const btn = $("aiOptimizeBtn");
  const area = $("aiPreviewArea");
  if (!area) return;

  const form = $("modalForm");
  if (!form) return;

  const titleInput = form.querySelector('input[name="title"]');
  const contentInput = form.querySelector('textarea[name="content"]') || form.querySelector('textarea[name="body"]') || form.querySelector('textarea[name="description"]');
  const excerptInput = form.querySelector('textarea[name="excerpt"]');

  const rawTitle = titleInput ? titleInput.value.trim() : "";
  const rawContent = contentInput ? contentInput.value.trim() : (excerptInput ? excerptInput.value.trim() : "");

  if (!rawTitle && !rawContent) {
    area.innerHTML = `
      <div style="padding:10px;background:#fff8e6;border:1px solid #fef08a;border-radius:8px;margin-top:10px;font-size:12px;color:#854d0e;">
        ⚠️ Silakan isi judul atau draf materi tulisan terlebih dahulu sebelum mengoptimalkan dengan AI.
      </div>
    `;
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `✨ AI Sedang Menganalisis &amp; Mengoptimalkan...`;
  }

  area.innerHTML = `
    <div style="padding:12px;background:#f5f3ff;border:1px solid #ddd6fe;border-radius:10px;margin-top:12px;font-size:13px;color:#6d28d9;display:flex;align-items:center;gap:8px;">
      <span>✨</span> AI sedang menganalisis ejaan, tata bahasa, dan membentuk format berita sekolah...
    </div>
  `;

  try {
    const data = await callBackendFunction("ai-editor", "/api/ai/optimize", {
      title: rawTitle,
      content: rawContent,
      excerpt: excerptInput ? excerptInput.value.trim() : ""
    });

    const optHeadline = data.headline || rawTitle;
    const optBody = data.body || rawContent;

    area.innerHTML = `
      <div class="ai-preview-card">
        <div class="ai-preview-header">
          <strong>✨ Hasil Optimasi AI (Preview)</strong>
          <small>Fakta Asli Dipertahankan • Gaya Berita Sekolah</small>
        </div>
        <div class="ai-preview-body">
          <div class="preview-group">
            <label>Judul Hasil AI:</label>
            <div class="preview-box-text" id="aiResTitle">${esc(optHeadline)}</div>
          </div>
          <div class="preview-group">
            <label>Isi Berita Hasil AI:</label>
            <div class="preview-box-text" id="aiResBody">${esc(optBody)}</div>
          </div>
        </div>
        <div class="ai-preview-actions">
          <button type="button" class="secondary" id="aiCancelBtn">Batal</button>
          <button type="button" class="primary" id="aiApplyBtn" style="background:#7c3aed;">Gunakan Hasil</button>
        </div>
      </div>
    `;

    document.getElementById("aiApplyBtn").onclick = () => {
      if (titleInput) titleInput.value = optHeadline;
      if (contentInput) contentInput.value = optBody;
      if (excerptInput && !excerptInput.value.trim()) {
        excerptInput.value = optBody.slice(0, 150) + (optBody.length > 150 ? "..." : "");
      }
      area.innerHTML = `
        <div style="padding:10px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;margin-top:10px;font-size:12px;color:#166534;font-weight:700;">
          ✓ Hasil optimasi AI berhasil diterapkan ke editor. Anda dapat mengedit manual sebelum menekan Simpan.
        </div>
      `;
    };

    document.getElementById("aiCancelBtn").onclick = () => {
      area.innerHTML = "";
    };

  } catch (err) {
    area.innerHTML = `
      <div style="padding:10px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;margin-top:10px;font-size:12px;color:#991b1b;">
        <b>Gagal Optimasi AI:</b> ${esc(err.message)}
      </div>
    `;
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `✨ Optimalkan dengan AI`;
    }
  }
};

function fieldHTML(f,v,type){const [name,label,kind]=f;if(kind==="checkbox")return `<label class="full"><input type="checkbox" name="${name}" ${v!==false?"checked":""}> ${esc(label)}</label>`;if(kind==="textarea")return `<label class="full">${esc(label)}<textarea name="${name}">${esc(v||"")}</textarea></label>`;if(kind==="file")return `<label class="full">${esc(label)}<input type="file" name="${name}"><span class="file-note">File akan disimpan ke Supabase Storage.</span></label>`;if(kind==="eskul")return `<label>${esc(label)}<select name="${name}" required><option value="">Pilih Eskul</option>${cache.eskul.map(x=>`<option value="${x.id}" ${x.id===v?"selected":""}>${esc(x.name)}</option>`).join("")}</select></label>`;return `<label>${esc(label)}<input type="${kind}" name="${name}" value="${esc(kind==="date"&&v?String(v).slice(0,10):(v??""))}"></label>`}

async function saveEditor(e,type,id){
  e.preventDefault();
  const d=defs[type],fd=new FormData(e.target),payload={};
  for(const f of d.fields){
    const [name,,kind]=f;
    if(kind==="file")continue;
    if(kind==="checkbox")payload[name]=fd.get(name)==="on";
    else if(kind==="number")payload[name]=fd.get(name)?+fd.get(name):null;
    else if(kind==="date"&&fd.get(name)&&(["news","announcement"].includes(type)))payload[name]=fd.get(name)+"T00:00:00+07:00";
    else payload[name]=fd.get(name)||null;
  }
  try{
    const imageFile=fd.get("image_file");if(imageFile&&imageFile.size){payload.image_url=await upload(imageFile,type)}
    const docFile=fd.get("file_upload");if(docFile&&docFile.size){payload.file_url=await upload(docFile,"documents")}
    const req=id?c.from(d.table).update(payload).eq("id",id):c.from(d.table).insert(payload);
    const {error}=await req;
    if(error)throw error;
    closeModal();
    await loadAll();
  }catch(err){alert(err.message)}
}

window.deleteItem=async(type,id)=>{if(!confirm("Hapus data ini?"))return;const {error}=await c.from(defs[type].table).delete().eq("id",id);if(error)alert(error.message);else await loadAll()}
window.closeModal=()=>$("modal").classList.add("hidden");$("modalClose").onclick=closeModal;$("modal").addEventListener("click",e=>{if(e.target===$("modal"))closeModal()})

const SYNC_PROFILE_FIELDS=new Set(["name","npsn","status","level","accreditation","principal","students","staff","address","city","phone","email","maps_url"]);

// 1. Separate Logo Uploader (changes logo_url only)
$("uploadLogoBtn").onclick=async()=>{
  const file=$("schoolLogoFile").files?.[0];
  if(!file){$("profileMsg").textContent="Pilih file logo terlebih dahulu.";return}
  try{
    $("profileMsg").textContent="Mengupload logo…";
    const url=await upload(file,"branding");
    const {error}=await c.from("school_profile").update({logo_url:url,updated_at:new Date().toISOString()}).eq("id",1);
    if(error)throw error;
    profile.logo_url=url;
    if($("schoolLogoPreview")) $("schoolLogoPreview").src=url;
    $("profileMsg").textContent="Logo resmi berhasil diupload dan dipakai pada website.";
  }catch(err){
    $("profileMsg").textContent="Gagal upload logo: "+err.message;
  }
};

// 2. Separate Profile Photo Uploader (changes profile_image_url only)
if($("uploadProfileBtn")){
  $("uploadProfileBtn").onclick=async()=>{
    const file=$("schoolProfileFile").files?.[0];
    if(!file){$("profileMsg").textContent="Pilih file foto profil terlebih dahulu.";return}
    try{
      $("profileMsg").textContent="Mengupload foto profil…";
      const url=await upload(file,"profile");
      const {error}=await c.from("school_profile").update({profile_image_url:url,updated_at:new Date().toISOString()}).eq("id",1);
      if(error)throw error;
      profile.profile_image_url=url;
      if($("schoolProfilePreview")) $("schoolProfilePreview").src=url;
      $("profileMsg").textContent="Foto profil berhasil diupload dan dipakai pada seksi Profil.";
    }catch(err){
      $("profileMsg").textContent="Gagal upload foto profil: "+err.message;
    }
  };
}

// 3. Separate Hero Photo Uploader (changes hero_image_url only)
$("uploadHeroBtn").onclick=async()=>{
  const file=$("schoolHeroFile").files?.[0];
  if(!file){$("profileMsg").textContent="Pilih file foto hero terlebih dahulu.";return}
  try{
    $("profileMsg").textContent="Mengupload foto hero…";
    const url=await upload(file,"branding/hero");
    const {error}=await c.from("school_profile").update({hero_image_url:url,updated_at:new Date().toISOString()}).eq("id",1);
    if(error)throw error;
    profile.hero_image_url=url;
    if($("schoolHeroPreview")) $("schoolHeroPreview").src=url;
    $("profileMsg").textContent="Foto hero berhasil diupload dan dipakai di beranda.";
  }catch(err){
    $("profileMsg").textContent="Gagal upload foto hero: "+err.message;
  }
};

// ==========================================
// SOURCE B: INTERNET CONTENT CANDIDATES INBOX
// ==========================================
function renderContentCandidates() {
  const list = $("contentCandidateList");
  if (!list) return;
  const items = cache.content_candidates || [];
  if (!items.length) {
    list.innerHTML = '<p class="empty">Belum ada kandidat berita internet. Klik “🔄 Sinkronisasi Berita Internet” untuk memeriksa sumber terdaftar.</p>';
    return;
  }
  list.innerHTML = items.map(x => {
    const isPending = (x.status === "pending" || !x.status);
    const isApproved = x.status === "approved";
    const hasImg = Boolean(x.original_image_url);
    const displayImg = hasImg ? `/api/media-proxy?url=${encodeURIComponent(x.original_image_url)}` : "../assets/school-hero-placeholder.svg";
    return `
      <div class="media-candidate-card" id="cc-card-${x.id}">
        <img class="thumb" src="${esc(displayImg)}" alt="${esc(x.original_title||'Kandidat Berita')}" loading="lazy" onerror="this.onerror=null;this.src='../assets/school-hero-placeholder.svg'"/>
        <div class="meta">
          <div class="tags">
            <span class="media-badge">Sumber B: Internet</span>
            <span class="media-badge confidence">${x.confidence||85}% confidence</span>
            <span class="media-badge status-${esc(x.status||'pending')}">${esc(x.status||'pending')}</span>
          </div>
          <h4>${esc(x.original_title||"Kandidat Berita Sekolah")}</h4>
          <p>${esc(x.original_excerpt || x.original_content?.slice(0, 180) || "")}</p>
          <small class="hint">Sumber: <b>${esc(x.source_name||"Internet")}</b> · <a href="${esc(x.source_url||'#')}" target="_blank" rel="noopener">Buka Sumber ↗</a></small>
          <div class="editor-actions" style="margin-top:12px;flex-wrap:wrap;gap:6px;">
            ${x.source_url ? `<a href="${esc(x.source_url)}" target="_blank" rel="noopener" class="secondary" style="text-decoration:none;display:inline-flex;align-items:center;padding:6px 12px;border-radius:6px;font-size:12px;font-weight:700;">🌐 Buka Sumber</a>` : ''}
            ${isPending ? `
              <button type="button" class="primary" onclick="approveAndComposeNews('${x.id}')">📝 Setujui &amp; Jadikan Berita</button>
              <button type="button" class="secondary" onclick="optimizeCandidateWithAi('${x.id}')">✨ Optimalkan dengan AI</button>
              <button type="button" class="danger" onclick="rejectContentCandidate('${x.id}')">Tolak</button>
            ` : isApproved ? `
              <span style="font-size:12px;color:#1e7e4a;font-weight:700;">✓ Telah Disetujui &amp; Diterbitkan sebagai Berita</span>
              <button type="button" class="secondary" onclick="approveAndComposeNews('${x.id}')">Edit Berita</button>
            ` : `
              <span style="font-size:12px;color:#b91c1c;font-weight:700;">✗ Ditolak</span>
            `}
          </div>
        </div>
      </div>
    `;
  }).join("");
}

window.approveAndComposeNews = (id) => {
  const item = cache.content_candidates.find(x => String(x.id) === String(id));
  if (!item) return;

  openEditor("news", null);
  $("modalTitle").textContent = "Review & Terbitkan Berita (Dari Internet)";

  setTimeout(() => {
    const form = $("modalForm");
    if (!form) return;
    const titleInput = form.querySelector('input[name="title"]');
    const contentInput = form.querySelector('textarea[name="content"]');
    const excerptInput = form.querySelector('textarea[name="excerpt"]');
    const imageUrlInput = form.querySelector('input[name="image_url"]');
    const dateInput = form.querySelector('input[name="published_at"]');

    if (titleInput) titleInput.value = item.original_title || "";
    if (contentInput) contentInput.value = item.original_content || item.original_excerpt || "";
    if (excerptInput) excerptInput.value = item.original_excerpt || (item.original_content ? item.original_content.slice(0, 150) : "");
    if (imageUrlInput && item.original_image_url) imageUrlInput.value = item.original_image_url;
    if (dateInput) dateInput.value = new Date().toISOString().slice(0, 10);

    form.onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const payload = {
        title: fd.get("title"),
        published_at: fd.get("published_at") ? fd.get("published_at") + "T00:00:00+07:00" : new Date().toISOString(),
        excerpt: fd.get("excerpt"),
        content: fd.get("content"),
        image_url: fd.get("image_url") || item.original_image_url || null,
        published: fd.get("published") === "on"
      };

      try {
        const imageFile = fd.get("image_file");
        if (imageFile && imageFile.size) {
          payload.image_url = await upload(imageFile, "news");
        }
        const { error: insErr } = await c.from("news").insert(payload);
        if (insErr) throw insErr;

        // Mark candidate approved
        item.status = "approved";
        item.reviewed_at = new Date().toISOString();
        try {
          await c.from("content_candidates").update({ status: "approved", reviewed_at: item.reviewed_at }).eq("id", item.id);
        } catch (dbErr) {
          console.warn("Update candidate status note:", dbErr);
        }

        closeModal();
        const msgEl = $("contentCandidateMsg");
        if (msgEl) {
          msgEl.innerHTML = `<span style="color:#10b981;font-weight:bold;">✓ Berita berhasil diterbitkan ke website publik dan status kandidat ditandai disetujui.</span>`;
        }
        await loadAll();
      } catch (err) {
        alert("Gagal menerbitkan berita: " + err.message);
      }
    };
  }, 50);
};

window.optimizeCandidateWithAi = (id) => {
  const item = cache.content_candidates.find(x => String(x.id) === String(id));
  if (!item) return;

  window.approveAndComposeNews(id);
  setTimeout(() => {
    runAiOptimization();
  }, 100);
};

window.rejectContentCandidate = async (id) => {
  const item = cache.content_candidates.find(x => String(x.id) === String(id));
  if (!item) return;
  if (!confirm("Tolak kandidat berita ini?")) return;

  item.status = "rejected";
  item.reviewed_at = new Date().toISOString();

  if (c) {
    try {
      await c.from("content_candidates").update({ status: "rejected", reviewed_at: item.reviewed_at }).eq("id", item.id);
    } catch (dbErr) {
      console.warn("Reject note:", dbErr);
    }
  }

  const msgEl = $("contentCandidateMsg");
  if (msgEl) msgEl.textContent = "Kandidat berita ditolak dan tidak akan ditampilkan ke publik.";
  renderContentCandidates();
};

if ($("syncContentCandidatesBtn")) {
  $("syncContentCandidatesBtn").onclick = async () => {
    const btn = $("syncContentCandidatesBtn");
    const msgEl = $("contentCandidateMsg");
    btn.disabled = true;
    btn.textContent = "🔄 Memeriksa sumber berita internet...";
    if (msgEl) msgEl.textContent = "Menghubungi sumber internet resmi terdaftar...";

    try {
      const data = await callBackendFunction("content-sync", "/api/content-sync", { mode: "run" });
      if (msgEl) {
        msgEl.innerHTML = `<span style="color:#10b981;font-weight:bold;">✓ Sinkronisasi selesai: ${esc(data?.candidates ?? 0)} kandidat berita ditemukan dari ${esc(data?.checked ?? 0)} sumber.</span>`;
      }
      await loadAll();
    } catch (err) {
      if (msgEl) {
        msgEl.innerHTML = `<span style="color:#ef4444;font-weight:bold;">Gagal sinkronisasi: ${esc(err.message)}</span>`;
      }
    } finally {
      btn.disabled = false;
      btn.textContent = "🔄 Sinkronisasi Berita Internet";
    }
  };
}

// ==========================================
// SOURCE PROFILE STAGING & SOURCES
// ==========================================
$("addSourceBtn").onclick=async()=>{const name=$("sourceName").value.trim(),source_url=$("sourceUrl").value.trim(),source_type=$("sourceType").value;const allowed_fields=$("sourceFields").value.split(",").map(x=>x.trim()).filter(x=>SYNC_PROFILE_FIELDS.has(x));if(!name||!source_url){alert("Nama dan URL sumber wajib diisi.");return}const {error}=await c.from("sync_sources").insert({name,source_url,source_type,allowed_fields,enabled:true});if(error)alert(error.message);else{$("sourceName").value="";$("sourceUrl").value="";$("sourceFields").value="";await loadAll()}};
function renderSources(){const el=$("sourceList");if(!el)return;el.innerHTML=cache.sources.length?cache.sources.map(x=>`<div class="source-item"><b>${esc(x.name)}</b><small>${esc(x.source_type)} · ${x.enabled?"aktif":"nonaktif"}</small><div>${esc(x.source_url)}</div><div class="editor-actions"><button class="secondary" onclick="toggleSource('${x.id}',${!x.enabled})">${x.enabled?"Nonaktifkan":"Aktifkan"}</button><button class="danger" onclick="deleteSource('${x.id}')">Hapus</button></div></div>`).join(""):"<p class='empty'>Belum ada sumber. Daftarkan sumber resmi/tepercaya terlebih dahulu.</p>"}
window.toggleSource=async(id,enabled)=>{const {error}=await c.from("sync_sources").update({enabled,updated_at:new Date().toISOString()}).eq("id",id);if(error)alert(error.message);else await loadAll()};
window.deleteSource=async id=>{if(!confirm("Hapus sumber ini?"))return;const {error}=await c.from("sync_sources").delete().eq("id",id);if(error)alert(error.message);else await loadAll()};
$("smartSyncBtn").onclick=async()=>{$("syncResult").innerHTML="<p>Memeriksa sumber terdaftar…</p>";try{const {data,error}=await c.functions.invoke("school-sync",{body:{mode:"run"}});if(error)throw error;$("syncResult").innerHTML=`<p>Smart Sync selesai. ${esc(data?.candidates??0)} kandidat perubahan ditemukan dari ${esc(data?.checked??0)} sumber.</p>`;await loadAll()}catch(err){$("syncResult").innerHTML="<p class='warn'>Smart Sync gagal: "+esc(err.message)+". Pastikan Edge Function school-sync sudah dideploy dan V4 patch SQL sudah dijalankan.</p>"}};
function renderStaging(){const list=$("stagingList");if(!list)return;const items=cache.staging.slice(0,30);list.innerHTML=items.length?items.map(x=>`<div class="candidate-item"><b>${esc(x.field_name||"Kandidat")}</b><small>${esc(x.source_name||x.source_url||"")} · ${new Date(x.fetched_at||x.created_at).toLocaleString("id-ID")}</small>${x.field_name?`<div class="candidate-values"><div><small>Data sekarang</small><br><b>${esc(valueText(x.current_value))}</b></div><div><small>Data sumber</small><br><b>${esc(valueText(x.candidate_value))}</b></div></div><span class="confidence">Confidence ${esc(x.confidence??"-")}%</span>`:`<pre>${esc(JSON.stringify(x.payload,null,2)).slice(0,500)}</pre>`}<div class="editor-actions">${x.status==="pending"?`<button class="secondary" onclick="applyCandidate('${x.id}')">Gunakan Data</button><button class="danger" onclick="rejectCandidate('${x.id}')">Tolak</button>`:`<span class="status-pill">${esc(x.status)}</span>`}</div></div>`).join(""):"<p class='empty'>Belum ada kandidat perubahan.</p>"}
function valueText(v){if(v===null||v===undefined)return "-";if(typeof v==="string")return v;try{return JSON.stringify(v)}catch{return String(v)}}
window.applyCandidate=async id=>{const x=cache.staging.find(i=>i.id===id);if(!x||!SYNC_PROFILE_FIELDS.has(x.field_name)){alert("Field ini tidak diizinkan untuk diterapkan otomatis.");return}const value=x.candidate_value;const {error}=await c.from("school_profile").update({[x.field_name]:value,updated_at:new Date().toISOString()}).eq("id",1);if(error){alert(error.message);return}await c.from("sync_staging").update({status:"accepted",reviewed_at:new Date().toISOString()}).eq("id",id);await loadAll()};
window.rejectCandidate=async id=>{const {error}=await c.from("sync_staging").update({status:"rejected",reviewed_at:new Date().toISOString()}).eq("id",id);if(error)alert(error.message);else await loadAll()};

// ==========================================
// MEDIA CANDIDATES INBOX
// ==========================================
function renderMediaCandidates(){
  const list = $("mediaCandidateList");
  if(!list) return;
  const items = cache.media_candidates || [];
  if(!items.length){
    list.innerHTML = '<p class="empty">Belum ada media kandidat. Klik “+ Daftarkan Kandidat Media” untuk menambahkan sumber baru.</p>';
    return;
  }
  list.innerHTML = items.map(x => {
    const isPending = (x.status === "pending" || !x.status);
    const isApproved = x.status === "approved";
    const proxyUrl = `/api/media-proxy?url=${encodeURIComponent(x.image_url)}`;
    const displayImg = isApproved && x.storage_url ? x.storage_url : proxyUrl;
    return `
      <div class="media-candidate-card" id="mc-card-${x.id}">
        <img class="thumb" src="${esc(displayImg)}" alt="${esc(x.title||'Kandidat Media')}" loading="lazy" onerror="this.onerror=null;this.src='${esc(x.image_url)}'"/>
        <div class="meta">
          <div class="tags">
            <span class="media-badge">${esc(x.media_type||"gallery")}</span>
            <span class="media-badge confidence">${x.confidence||85}% confidence</span>
            <span class="media-badge status-${esc(x.status||'pending')}">${esc(x.status||'pending')}</span>
          </div>
          <h4>${esc(x.title||"Dokumentasi Sekolah")}</h4>
          <p>${esc(x.description||"Kandidat foto sekolah dari pangkalan data resmi.")}</p>
          <small class="hint">Sumber: <a href="${esc(x.source_url||'#')}" target="_blank" rel="noopener">${esc(x.source_name||"Internet")}</a></small>
          <div class="editor-actions" style="margin-top:12px;flex-wrap:wrap;gap:6px;">
            ${isPending ? `
              <button class="primary" onclick="approveCandidate('${x.id}')">Approve &amp; Simpan ke Storage</button>
              <button type="button" class="secondary" onclick="openNewsEditorWithCandidate('${esc(x.title||'Berita Sekolah')}', '${esc(x.description||'')}', '${esc(x.storage_url||x.image_url)}')">✏️ Jadikan Draf Berita</button>
              <button class="danger" onclick="rejectCandidateMedia('${x.id}')">Tolak</button>
            ` : isApproved ? `
              <span style="font-size:12px;color:#1e7e4a;font-weight:700;">✓ Disimpan di Storage:</span>
              <a href="${esc(x.storage_url||x.image_url)}" target="_blank" style="font-size:11px;color:#0d6efd;word-break:break-all;">${esc((x.storage_url||x.image_url).slice(0,40))}...</a>
              <button type="button" class="secondary" style="margin-top:4px;" onclick="openNewsEditorWithCandidate('${esc(x.title||'Berita Sekolah')}', '${esc(x.description||'')}', '${esc(x.storage_url||x.image_url)}')">✏️ Jadikan Draf Berita</button>
            ` : `
              <span style="font-size:12px;color:#b91c1c;font-weight:700;">✗ Ditolak</span>
            `}
          </div>
        </div>
      </div>
    `;
  }).join("");
}

window.approveCandidate = async (id) => {
  const item = cache.media_candidates.find(x => String(x.id) === String(id));
  if(!item) return;

  $("modalTitle").textContent = "Pilih Target Penggunaan Media";
  $("modalForm").innerHTML = `
    <div style="margin-bottom:12px;">
      <p style="font-size:13px;color:#475569;margin:0 0 8px;">Kandidat: <b>${esc(item.title || "Foto Dokumentasi")}</b></p>
      <img src="${esc(item.storage_url || `/api/media-proxy?url=${encodeURIComponent(item.image_url)}`)}" style="max-height:120px;border-radius:6px;object-fit:cover;width:100%;" alt="Preview"/>
    </div>
    <label>Target Penggunaan
      <select id="approveTargetType" onchange="toggleApproveTargetFields()">
        <option value="hero" ${item.media_type === "hero" ? "selected" : ""}>Foto Hero / Banner Beranda</option>
        <option value="profile" ${item.media_type === "profile" ? "selected" : ""}>Foto Profil Sekolah</option>
        <option value="gallery" ${item.media_type === "gallery" ? "selected" : ""}>Galeri Foto Sekolah</option>
        <option value="news" ${item.media_type === "news" ? "selected" : ""}>Lampirkan ke Berita Terdaftar</option>
        <option value="extracurricular" ${item.media_type === "extracurricular" ? "selected" : ""}>Lampirkan ke Ekstrakurikuler</option>
        <option value="achievement" ${item.media_type === "achievement" ? "selected" : ""}>Lampirkan ke Prestasi</option>
      </select>
    </label>
    
    <div id="targetNewsGroup" style="display:none;" class="full">
      <label>Pilih Berita Terdaftar (Wajib Dipilih)
        <select id="approveTargetNewsId">
          <option value="">-- Pilih Berita --</option>
          ${cache.news.map(n => `<option value="${n.id}">${esc(n.title)}</option>`).join("")}
        </select>
      </label>
      <small class="hint">Media tidak akan membuat artikel berita baru secara otomatis tanpa persetujuan editor.</small>
    </div>

    <div id="targetEskulGroup" style="display:none;" class="full">
      <label>Pilih Ekstrakurikuler Target
        <select id="approveTargetEskulId">
          <option value="">-- Pilih Ekstrakurikuler --</option>
          ${cache.eskul.map(e => `<option value="${e.id}">${esc(e.name)}</option>`).join("")}
        </select>
      </label>
    </div>

    <div id="targetAchGroup" style="display:none;" class="full">
      <label>Pilih Prestasi Target
        <select id="approveTargetAchId">
          <option value="">-- Pilih Prestasi Terverifikasi --</option>
          ${cache.achievement.map(a => `<option value="${a.id}">${esc(a.title)} (${a.year || ''})</option>`).join("")}
        </select>
      </label>
    </div>

    <div class="form-actions" style="margin-top:16px;">
      <button type="button" class="secondary" onclick="closeModal()">Batal</button>
      <button class="primary" type="submit" id="submitApproveBtn">Approve &amp; Simpan ke Storage</button>
    </div>
  `;

  window.toggleApproveTargetFields = () => {
    const t = $("approveTargetType")?.value;
    if($("targetNewsGroup")) $("targetNewsGroup").style.display = (t === "news") ? "block" : "none";
    if($("targetEskulGroup")) $("targetEskulGroup").style.display = (t === "extracurricular") ? "block" : "none";
    if($("targetAchGroup")) $("targetAchGroup").style.display = (t === "achievement") ? "block" : "none";
  };
  toggleApproveTargetFields();

  $("modal").classList.remove("hidden");

  $("modalForm").onsubmit = async (e) => {
    e.preventDefault();
    const btn = $("submitApproveBtn");
    const targetType = $("approveTargetType").value;

    if (targetType === "news") {
      const selectedNewsId = $("approveTargetNewsId")?.value;
      if (!selectedNewsId) {
        alert("Silakan pilih berita yang ingin dilampirkan foto ini. Foto tidak akan otomatis membuat artikel berita tanpa review admin.");
        return;
      }
    }

    if(btn) { btn.disabled = true; btn.textContent = "Mengunduh & Menyimpan ke Storage..."; }

    try {
      const res = await callBackendFunction("media-approve", "/api/media/approve", {
        id: item.id,
        image_url: item.image_url,
        media_type: targetType,
        title: item.title,
        description: item.description
      });

      const storageUrl = res.storage_url;
      item.storage_url = storageUrl;
      item.status = "approved";
      item.reviewed_at = new Date().toISOString();

      if(c) {
        if(targetType === "hero") {
          await c.from("school_profile").update({ hero_image_url: storageUrl, updated_at: new Date().toISOString() }).eq("id", 1);
          profile.hero_image_url = storageUrl;
          if($("schoolHeroPreview")) $("schoolHeroPreview").src = storageUrl;
        } else if(targetType === "profile") {
          // Updates profile_image_url ONLY (does NOT touch logo_url)
          await c.from("school_profile").update({ profile_image_url: storageUrl, updated_at: new Date().toISOString() }).eq("id", 1);
          profile.profile_image_url = storageUrl;
          if($("schoolProfilePreview")) $("schoolProfilePreview").src = storageUrl;
        } else if(targetType === "gallery") {
          await c.from("gallery").insert({ title: item.title || "Dokumentasi Sekolah", image_url: storageUrl, published: true });
        } else if(targetType === "news") {
          const newsId = $("approveTargetNewsId")?.value;
          if(newsId) {
            await c.from("news").update({ image_url: storageUrl }).eq("id", newsId);
          }
        } else if(targetType === "extracurricular") {
          const eskulId = $("approveTargetEskulId")?.value;
          if(eskulId) {
            await c.from("extracurriculars").update({ image_url: storageUrl }).eq("id", eskulId);
          }
        } else if(targetType === "achievement") {
          const achId = $("approveTargetAchId")?.value;
          if(achId) {
            const achObj = cache.achievement.find(a => String(a.id) === String(achId));
            const newDesc = ((achObj?.description || "") + "\n\n[Foto Dokumentasi: " + storageUrl + "]").trim();
            await c.from("achievements").update({ description: newDesc }).eq("id", achId);
          }
        }

        try {
          await c.from("media_candidates").update({ status: "approved", storage_url: storageUrl, reviewed_at: item.reviewed_at }).eq("id", item.id);
        } catch(dbErr) {
          console.warn("Update media_candidates db note:", dbErr);
        }
      }

      closeModal();
      const msgEl = $("candidateActionMsg");
      if(msgEl) {
        msgEl.innerHTML = `<span style="color:#10b981;font-weight:bold;">✓ Media disetujui &amp; disimpan ke Supabase Storage: <code>${esc(storageUrl)}</code></span>`;
      }
      renderMediaCandidates();
      fillProfile();
    } catch(err) {
      alert("Gagal approve media: " + err.message);
      if(btn) { btn.disabled = false; btn.textContent = "Approve & Simpan ke Storage"; }
    }
  };
};

window.rejectCandidateMedia = async (id) => {
  const item = cache.media_candidates.find(x => String(x.id) === String(id));
  if(!item) return;
  if(!confirm("Tolak kandidat media ini?")) return;

  item.status = "rejected";
  item.reviewed_at = new Date().toISOString();

  if(c) {
    try {
      await c.from("media_candidates").update({ status: "rejected", reviewed_at: item.reviewed_at }).eq("id", item.id);
    } catch(dbErr) {
      console.warn("Reject note:", dbErr);
    }
  }

  const msgEl = $("candidateActionMsg");
  if(msgEl) msgEl.textContent = "Kandidat media ditolak dan tidak akan ditampilkan ke publik.";
  renderMediaCandidates();
};

if($("openAddCandidateModalBtn")){
  $("openAddCandidateModalBtn").onclick = () => {
    $("modalTitle").textContent = "Daftarkan Kandidat Media";
    $("modalForm").innerHTML = `
      <label>Nama Sumber<input id="newCandSource" placeholder="Misal: Kemendikdasmen, Arsip Sekolah" required></label>
      <label>Kategori Media
        <select id="newCandType">
          <option value="hero">Foto Hero / Beranda</option>
          <option value="gallery" selected>Galeri Dokumentasi</option>
          <option value="profile">Foto Profil Sekolah</option>
          <option value="news">Lampiran Berita</option>
          <option value="extracurricular">Ekstrakurikuler</option>
          <option value="achievement">Prestasi</option>
        </select>
      </label>
      <label class="full">URL Gambar Asli<input id="newCandImageUrl" type="url" placeholder="https://..." required></label>
      <label class="full">URL Halaman Sumber<input id="newCandSourceUrl" type="url" placeholder="https://..."></label>
      <label class="full">Judul Foto<input id="newCandTitle" placeholder="Deskripsi singkat gambar"></label>
      <label class="full">Keterangan Tambahan<textarea id="newCandDesc" placeholder="Keterangan konteks foto"></textarea></label>
      <div class="form-actions">
        <button type="button" class="secondary" onclick="closeModal()">Batal</button>
        <button class="primary" type="submit">Daftarkan untuk Direview</button>
      </div>
    `;
    $("modal").classList.remove("hidden");
    $("modalForm").onsubmit = async (e) => {
      e.preventDefault();
      const cand = {
        id: "cand-" + Date.now(),
        source_name: $("newCandSource").value.trim(),
        source_url: $("newCandSourceUrl").value.trim(),
        image_url: $("newCandImageUrl").value.trim(),
        title: $("newCandTitle").value.trim() || "Kandidat Foto",
        description: $("newCandDesc").value.trim(),
        media_type: $("newCandType").value,
        confidence: 85,
        status: "pending",
        created_at: new Date().toISOString()
      };

      if(c) {
        try {
          await c.from("media_candidates").insert([cand]);
        } catch(err) {
          console.warn("DB insert error:", err);
        }
      }

      cache.media_candidates.unshift(cand);
      closeModal();
      renderMediaCandidates();
    };
  };
}

authCheck();