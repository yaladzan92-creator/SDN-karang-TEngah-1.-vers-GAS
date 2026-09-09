let c = null;
const $=id=>document.getElementById(id), getClient=()=>{ c=(window.SDN||window.SDN11)?.client; return c; }, getBucket=()=>(window.SDN||window.SDN11)?.bucket||"school-media";
const esc=s=>String(s??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]));
let cache={rombel:[],eskul:[],activity:[],program:[],news:[],announcement:[],achievement:[],gallery:[],document:[],schedule:[],staging:[],sources:[],media_candidates:[]},profile={};

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
function fillProfile(){const m={schoolName:"name",schoolNpsn:"npsn",schoolStatus:"status",schoolLevel:"level",schoolAccreditation:"accreditation",schoolPrincipal:"principal",schoolStudents:"students",schoolStaff:"staff",schoolAddress:"address",schoolCity:"city",schoolPhone:"phone",schoolEmail:"email",schoolInstagram:"instagram_url",schoolFacebook:"facebook_url",schoolYoutube:"youtube_url",schoolTiktok:"tiktok_url",schoolWhatsapp:"whatsapp_url",schoolMaps:"maps_url",schoolProfileTitle:"profile_title",schoolDescription:"description",schoolVision:"vision",schoolHeroSubtitle:"hero_subtitle",schoolSpmbTitle:"spmb_title",schoolSpmbUrl:"spmb_url",schoolSpmbDescription:"spmb_description"};for(const [id,k] of Object.entries(m))$(id).value=profile[k]??"";$("schoolMission").value=Array.isArray(profile.mission)?profile.mission.join("\n"):"";if($("schoolLogoPreview"))$("schoolLogoPreview").src=profile.logo_url||"../assets/brand-kt1.svg";if($("schoolHeroPreview"))$("schoolHeroPreview").src=profile.hero_image_url||"../assets/school-hero-placeholder.svg"}
async function loadAll(){
  const s=window.SDN||window.SDN11;
  if(!s?.configured)return;
  const c=getClient();
  if(!c)return;
  try{
    const [pr,r,e,a,pg,n,an,ac,g,d,sc,st,src,mc]=await Promise.all([
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
      c.from("media_candidates").select("*").order("created_at",{ascending:false}).catch?.(()=>({data:[]}))||c.from("media_candidates").select("*").order("created_at",{ascending:false})
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
    fillProfile();
    renderAll();
  }catch(err){
    console.error("Gagal memuat data:",err);
  }
}
$("saveProfileBtn").onclick=async()=>{const c=getClient();const payload={id:1,name:$("schoolName").value,npsn:$("schoolNpsn").value,status:$("schoolStatus").value,level:$("schoolLevel").value,accreditation:$("schoolAccreditation").value,principal:$("schoolPrincipal").value,students:+$("schoolStudents").value||null,staff:+$("schoolStaff").value||null,address:$("schoolAddress").value,city:$("schoolCity").value,phone:$("schoolPhone").value,email:$("schoolEmail").value,instagram_url:$("schoolInstagram")?.value||null,facebook_url:$("schoolFacebook")?.value||null,youtube_url:$("schoolYoutube")?.value||null,tiktok_url:$("schoolTiktok")?.value||null,whatsapp_url:$("schoolWhatsapp")?.value||null,maps_url:$("schoolMaps").value,profile_title:$("schoolProfileTitle").value,description:$("schoolDescription").value,vision:$("schoolVision").value,mission:$("schoolMission").value.split("\n").map(x=>x.trim()).filter(Boolean),hero_subtitle:$("schoolHeroSubtitle").value,spmb_title:$("schoolSpmbTitle").value,spmb_url:$("schoolSpmbUrl").value,spmb_description:$("schoolSpmbDescription").value,logo_url:profile.logo_url||null,hero_image_url:profile.hero_image_url||null,updated_at:new Date().toISOString()};const {error}=await c.from("school_profile").upsert(payload);$("profileMsg").textContent=error?error.message:"Profil berhasil disimpan.";if(!error){profile=payload;renderAll()}}
function renderAll(){
 $("kpiStudents").textContent=profile.students??"—";$("kpiRombel").textContent=cache.rombel.length;$("kpiEskul").textContent=cache.eskul.length;$("kpiStaging").textContent=cache.staging.filter(x=>x.status==="pending").length;
 for(const k of Object.keys(defs))renderTable(k);renderStaging();renderSources();renderMediaCandidates();
}

function renderTable(type){const d=defs[type],box=$(type+"Editor");const fields=d.fields.filter(f=>f[2]!=="file").slice(0,5);if(!cache[type].length){box.innerHTML='<p class="empty">Belum ada data. Klik “+ Tambah”.</p>';return}box.innerHTML=`<div class="table-wrap"><table class="editor-table"><thead><tr>${fields.map(f=>`<th>${esc(f[1])}</th>`).join("")}<th>Aksi</th></tr></thead><tbody>${cache[type].map(x=>`<tr>${fields.map(f=>`<td>${esc(displayValue(f,x[f[0]]))}</td>`).join("")}<td><div class="editor-actions"><button class="secondary" onclick="openEditor('${type}','${x.id}')">Edit</button><button class="danger" onclick="deleteItem('${type}','${x.id}')">Hapus</button></div></td></tr>`).join("")}</tbody></table></div>`}
function displayValue(f,v){if(f[2]==="checkbox")return v?"Ya":"Tidak";if(f[2]==="eskul"){const x=cache.eskul.find(e=>e.id===v);return x?.name||"-"}return v??"-"}
document.querySelectorAll("[data-add]").forEach(b=>b.onclick=()=>openEditor(b.dataset.add,null))
window.openEditor=(type,id)=>{const d=defs[type],item=id?cache[type].find(x=>String(x.id)===String(id)):{};$("modalTitle").textContent=(id?"Edit ":"Tambah ")+d.title;$("modalForm").innerHTML=d.fields.map(f=>fieldHTML(f,item[f[0]],type)).join("")+`<div class="form-actions"><button type="button" class="secondary" onclick="closeModal()">Batal</button><button class="primary">Simpan</button></div>`;$("modal").classList.remove("hidden");$("modalForm").onsubmit=e=>saveEditor(e,type,id)}
function fieldHTML(f,v,type){const [name,label,kind]=f;if(kind==="checkbox")return `<label class="full"><input type="checkbox" name="${name}" ${v!==false?"checked":""}> ${esc(label)}</label>`;if(kind==="textarea")return `<label class="full">${esc(label)}<textarea name="${name}">${esc(v||"")}</textarea></label>`;if(kind==="file")return `<label class="full">${esc(label)}<input type="file" name="${name}"><span class="file-note">File akan disimpan ke Supabase Storage.</span></label>`;if(kind==="eskul")return `<label>${esc(label)}<select name="${name}" required><option value="">Pilih Eskul</option>${cache.eskul.map(x=>`<option value="${x.id}" ${x.id===v?"selected":""}>${esc(x.name)}</option>`).join("")}</select></label>`;return `<label>${esc(label)}<input type="${kind}" name="${name}" value="${esc(kind==="date"&&v?String(v).slice(0,10):(v??""))}"></label>`}
async function saveEditor(e,type,id){e.preventDefault();const d=defs[type],fd=new FormData(e.target),payload={};for(const f of d.fields){const [name,,kind]=f;if(kind==="file")continue;if(kind==="checkbox")payload[name]=fd.get(name)==="on";else if(kind==="number")payload[name]=fd.get(name)?+fd.get(name):null;else if(kind==="date"&&fd.get(name)&&(["news","announcement"].includes(type)))payload[name]=fd.get(name)+"T00:00:00+07:00";else payload[name]=fd.get(name)||null}
 try{
  const imageFile=fd.get("image_file");if(imageFile&&imageFile.size){payload.image_url=await upload(imageFile,type)}
  const docFile=fd.get("file_upload");if(docFile&&docFile.size){payload.file_url=await upload(docFile,"documents")}
  const req=id?c.from(d.table).update(payload).eq("id",id):c.from(d.table).insert(payload);const {error}=await req;if(error)throw error;closeModal();await loadAll()
 }catch(err){alert(err.message)}
}
window.deleteItem=async(type,id)=>{if(!confirm("Hapus data ini?"))return;const {error}=await c.from(defs[type].table).delete().eq("id",id);if(error)alert(error.message);else await loadAll()}
window.closeModal=()=>$("modal").classList.add("hidden");$("modalClose").onclick=closeModal;$("modal").addEventListener("click",e=>{if(e.target===$("modal"))closeModal()})

const SYNC_PROFILE_FIELDS=new Set(["name","npsn","status","level","accreditation","principal","students","staff","address","city","phone","email","maps_url"]);
$("uploadLogoBtn").onclick=async()=>{const file=$("schoolLogoFile").files?.[0];if(!file){$("profileMsg").textContent="Pilih file logo terlebih dahulu.";return}try{$("profileMsg").textContent="Mengupload logo…";const url=await upload(file,"branding");const {error}=await c.from("school_profile").update({logo_url:url,updated_at:new Date().toISOString()}).eq("id",1);if(error)throw error;profile.logo_url=url;$("schoolLogoPreview").src=url;$("profileMsg").textContent="Logo berhasil diupload dan dipakai di website."}catch(err){$("profileMsg").textContent="Gagal upload logo: "+err.message}};

$("uploadHeroBtn").onclick=async()=>{const file=$("schoolHeroFile").files?.[0];if(!file){$("profileMsg").textContent="Pilih file foto hero terlebih dahulu.";return}try{$("profileMsg").textContent="Mengupload foto hero…";const url=await upload(file,"branding/hero");const {error}=await c.from("school_profile").update({hero_image_url:url,updated_at:new Date().toISOString()}).eq("id",1);if(error)throw error;profile.hero_image_url=url;$("schoolHeroPreview").src=url;$("profileMsg").textContent="Foto hero berhasil diupload dan dipakai di beranda."}catch(err){$("profileMsg").textContent="Gagal upload foto hero: "+err.message}};
$("addSourceBtn").onclick=async()=>{const name=$("sourceName").value.trim(),source_url=$("sourceUrl").value.trim(),source_type=$("sourceType").value;const allowed_fields=$("sourceFields").value.split(",").map(x=>x.trim()).filter(x=>SYNC_PROFILE_FIELDS.has(x));if(!name||!source_url){alert("Nama dan URL sumber wajib diisi.");return}const {error}=await c.from("sync_sources").insert({name,source_url,source_type,allowed_fields,enabled:true});if(error)alert(error.message);else{$("sourceName").value="";$("sourceUrl").value="";$("sourceFields").value="";await loadAll()}};
function renderSources(){const el=$("sourceList");if(!el)return;el.innerHTML=cache.sources.length?cache.sources.map(x=>`<div class="source-item"><b>${esc(x.name)}</b><small>${esc(x.source_type)} · ${x.enabled?"aktif":"nonaktif"}</small><div>${esc(x.source_url)}</div><div class="editor-actions"><button class="secondary" onclick="toggleSource('${x.id}',${!x.enabled})">${x.enabled?"Nonaktifkan":"Aktifkan"}</button><button class="danger" onclick="deleteSource('${x.id}')">Hapus</button></div></div>`).join(""):"<p class='empty'>Belum ada sumber. Daftarkan sumber resmi/tepercaya terlebih dahulu.</p>"}
window.toggleSource=async(id,enabled)=>{const {error}=await c.from("sync_sources").update({enabled,updated_at:new Date().toISOString()}).eq("id",id);if(error)alert(error.message);else await loadAll()};
window.deleteSource=async id=>{if(!confirm("Hapus sumber ini?"))return;const {error}=await c.from("sync_sources").delete().eq("id",id);if(error)alert(error.message);else await loadAll()};
$("smartSyncBtn").onclick=async()=>{$("syncResult").innerHTML="<p>Memeriksa sumber terdaftar…</p>";try{const {data,error}=await c.functions.invoke("school-sync",{body:{mode:"run"}});if(error)throw error;$("syncResult").innerHTML=`<p>Smart Sync selesai. ${esc(data?.candidates??0)} kandidat perubahan ditemukan dari ${esc(data?.checked??0)} sumber.</p>`;await loadAll()}catch(err){$("syncResult").innerHTML="<p class='warn'>Smart Sync gagal: "+esc(err.message)+". Pastikan Edge Function school-sync sudah dideploy dan V4 patch SQL sudah dijalankan.</p>"}};
function renderStaging(){const list=$("stagingList");if(!list)return;const items=cache.staging.slice(0,30);list.innerHTML=items.length?items.map(x=>`<div class="candidate-item"><b>${esc(x.field_name||"Kandidat")}</b><small>${esc(x.source_name||x.source_url||"")} · ${new Date(x.fetched_at||x.created_at).toLocaleString("id-ID")}</small>${x.field_name?`<div class="candidate-values"><div><small>Data sekarang</small><br><b>${esc(valueText(x.current_value))}</b></div><div><small>Data sumber</small><br><b>${esc(valueText(x.candidate_value))}</b></div></div><span class="confidence">Confidence ${esc(x.confidence??"-")}%</span>`:`<pre>${esc(JSON.stringify(x.payload,null,2)).slice(0,500)}</pre>`}<div class="editor-actions">${x.status==="pending"?`<button class="secondary" onclick="applyCandidate('${x.id}')">Gunakan Data</button><button class="danger" onclick="rejectCandidate('${x.id}')">Tolak</button>`:`<span class="status-pill">${esc(x.status)}</span>`}</div></div>`).join(""):"<p class='empty'>Belum ada kandidat perubahan.</p>"}
function valueText(v){if(v===null||v===undefined)return "-";if(typeof v==="string")return v;try{return JSON.stringify(v)}catch{return String(v)}}
window.applyCandidate=async id=>{const x=cache.staging.find(i=>i.id===id);if(!x||!SYNC_PROFILE_FIELDS.has(x.field_name)){alert("Field ini tidak diizinkan untuk diterapkan otomatis.");return}const value=x.candidate_value;const {error}=await c.from("school_profile").update({[x.field_name]:value,updated_at:new Date().toISOString()}).eq("id",1);if(error){alert(error.message);return}await c.from("sync_staging").update({status:"accepted",reviewed_at:new Date().toISOString()}).eq("id",id);await loadAll()};
window.rejectCandidate=async id=>{const {error}=await c.from("sync_staging").update({status:"rejected",reviewed_at:new Date().toISOString()}).eq("id",id);if(error)alert(error.message);else await loadAll()};

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
          <div class="editor-actions" style="margin-top:12px;">
            ${isPending ? `
              <button class="primary" onclick="approveCandidate('${x.id}')">Approve &amp; Simpan ke Storage</button>
              <button class="danger" onclick="rejectCandidateMedia('${x.id}')">Tolak</button>
            ` : isApproved ? `
              <span style="font-size:12px;color:#1e7e4a;font-weight:700;">✓ Disimpan di Storage:</span>
              <a href="${esc(x.storage_url||x.image_url)}" target="_blank" style="font-size:11px;color:#0d6efd;word-break:break-all;">${esc((x.storage_url||x.image_url).slice(0,40))}...</a>
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
  const msgEl = $("candidateActionMsg");
  if(msgEl) msgEl.textContent = "Mengunduh media server-side dan menyimpan ke Supabase Storage...";

  try {
    const session = (await c?.auth?.getSession?.())?.data?.session;
    const token = session?.access_token || "";

    const resp = await fetch("/api/media/approve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : ""
      },
      body: JSON.stringify({
        id: item.id,
        image_url: item.image_url,
        media_type: item.media_type,
        title: item.title,
        description: item.description
      })
    });

    const res = await resp.json();
    if(!resp.ok || !res.success) throw new Error(res.error || "Gagal memproses kandidat");

    const storageUrl = res.storage_url;
    item.storage_url = storageUrl;
    item.status = "approved";
    item.reviewed_at = new Date().toISOString();

    if(c) {
      if(item.media_type === "hero") {
        await c.from("school_profile").update({ hero_image_url: storageUrl, updated_at: new Date().toISOString() }).eq("id", 1);
        profile.hero_image_url = storageUrl;
        if($("schoolHeroPreview")) $("schoolHeroPreview").src = storageUrl;
      } else if(item.media_type === "profile" || item.media_type === "branding") {
        await c.from("school_profile").update({ logo_url: storageUrl, updated_at: new Date().toISOString() }).eq("id", 1);
        profile.logo_url = storageUrl;
        if($("schoolLogoPreview")) $("schoolLogoPreview").src = storageUrl;
      } else if(item.media_type === "gallery") {
        await c.from("gallery").insert({ title: item.title || "Dokumentasi Sekolah", image_url: storageUrl, published: true });
      } else if(item.media_type === "news") {
        await c.from("news").insert({ title: item.title || "Warta Sekolah", excerpt: item.description || "", content: item.description || "", image_url: storageUrl, published: true, published_at: new Date().toISOString() });
      }

      try {
        await c.from("media_candidates").update({ status: "approved", reviewed_at: item.reviewed_at }).eq("id", item.id);
      } catch(dbErr) {
        console.warn("Update media_candidates db note:", dbErr);
      }
    }

    if(msgEl) {
      msgEl.innerHTML = `<span style="color:#10b981;font-weight:bold;">✓ Media disetujui &amp; disimpan ke Supabase Storage: <code>${esc(storageUrl)}</code></span>`;
    }
    renderMediaCandidates();
    fillProfile();
  } catch(err) {
    if(msgEl) msgEl.textContent = "Gagal approve media: " + err.message;
  }
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
          <option value="profile">Logo / Profil</option>
          <option value="news">Warta / Berita</option>
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
