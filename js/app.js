(function () {
  const verifiedProfile = {
    name: "SD NEGERI KARANG TENGAH 1",
    short_name: "SDN Karang Tengah 1",
    npsn: "20607151",
    status: "Negeri",
    level: "Sekolah Dasar",
    accreditation: "A",
    students: 345,
    staff: 20,
    address: "Jalan Raden Saleh No. 118, Kelurahan Karang Tengah, Kecamatan Karang Tengah, Kota Tangerang, Banten 15157",
    city: "Kota Tangerang",
    email: "sdnkarteng1@gmail.com",
    old_web: "http://sdnkarteng1.blogspot.com",
    maps_url: "https://www.google.com/maps/search/?api=1&query=SDN+Karang+Tengah+1+Kota+Tangerang",
    logo_url: "assets/brand-kt1.svg",
    hero_image_url: "assets/school-hero-placeholder.svg",
    hero_subtitle: "Sekolah Dasar Negeri di Kecamatan Karang Tengah, Kota Tangerang.",
    hero_description: "Ruang belajar yang aman, aktif, dan mendukung tumbuh kembang peserta didik.",
    profile_title: "Pendidikan Berkualitas Berlandaskan Karakter",
    description: "SD Negeri Karang Tengah 1 adalah institusi pendidikan dasar negeri di bawah naungan Dinas Pendidikan Kota Tangerang, berkomitmen menyelenggarakan kegiatan belajar mengajar yang mendidik, ramah anak, dan berkualitas.",
    spmb_title: "Penerimaan Peserta Didik Baru (SPMB)",
    spmb_description: "Informasi jalur pendaftaran, persyaratan berkas, daya tampung rombel, zonasi, dan jadwal resmi Penerimaan Peserta Didik Baru SDN Karang Tengah 1 mengacu pada portal resmi SPMB Kota Tangerang.",
    spmb_url: "https://spmb.tangerangkota.go.id/"
  };


  const fallbackRombel = [
    { name: "1 A", grade: "Kelas 1", academic_year: "2025/2026", semester: "Genap", student_count: 23 },
    { name: "1 B", grade: "Kelas 1", academic_year: "2025/2026", semester: "Genap", student_count: 21 },
    { name: "2 A", grade: "Kelas 2", academic_year: "2025/2026", semester: "Genap", student_count: 25 },
    { name: "2 B", grade: "Kelas 2", academic_year: "2025/2026", semester: "Genap", student_count: 25 },
    { name: "3 A", grade: "Kelas 3", academic_year: "2025/2026", semester: "Genap", student_count: 29 },
    { name: "3 B", grade: "Kelas 3", academic_year: "2025/2026", semester: "Genap", student_count: 28 },
    { name: "4 A", grade: "Kelas 4", academic_year: "2025/2026", semester: "Genap", student_count: 35 },
    { name: "4 B", grade: "Kelas 4", academic_year: "2025/2026", semester: "Genap", student_count: 35 },
    { name: "5 A", grade: "Kelas 5", academic_year: "2025/2026", semester: "Genap", student_count: 34 },
    { name: "5 B", grade: "Kelas 5", academic_year: "2025/2026", semester: "Genap", student_count: 32 },
    { name: "6 A", grade: "Kelas 6", academic_year: "2025/2026", semester: "Genap", student_count: 30 },
    { name: "6 B", grade: "Kelas 6", academic_year: "2025/2026", semester: "Genap", student_count: 29 }
  ];

  const candidateAchievements = [
    {
      title: "Pentas PAI & FLS2N Tingkat Kecamatan",
      category: "Kandidat Data — Menunggu Verifikasi Admin",
      year: "2024",
      description: "Keikutsertaan kontingen siswa dalam ajang kreativitas seni dan pendidikan agama Islam tingkat Kecamatan Karang Tengah.",
      isCandidate: true
    }
  ];

  function getClient() {
    const s = window.SDN || window.SDN11;
    return (s && s.configured && s.client) ? s.client : null;
  }

  function setElementText(id, text) {
    const el = document.getElementById(id);
    if (el && text !== undefined && text !== null) {
      el.textContent = text;
    }
  }

  function renderProfile(p) {
    const data = Object.assign({}, verifiedProfile, p || {});

    setElementText("brandName", data.name);
    setElementText("brandSubtitle", `Kecamatan Karang Tengah · ${data.city || "Kota Tangerang"}`);
    setElementText("heroSchool", data.name);
    setElementText("heroSubtitle", data.hero_subtitle || verifiedProfile.hero_subtitle);
    setElementText("heroDescription", data.hero_description || verifiedProfile.hero_description);

    setElementText("statNpsn", data.npsn);
    setElementText("statStatus", data.status);
    setElementText("statStudents", data.students);
    setElementText("statStaff", data.staff);
    setElementText("statAccreditation", data.accreditation);
    setElementText("statRombel", "12");

    setElementText("profileTitle", data.profile_title || verifiedProfile.profile_title);
    setElementText("profileDescription", data.description || verifiedProfile.description);

    setElementText("infoSchoolName", data.name);
    setElementText("infoNpsn", data.npsn);
    setElementText("infoStatus", data.status);
    setElementText("infoAccreditation", data.accreditation);
    setElementText("infoAddress", data.address);
    setElementText("infoEmail", data.email);
    setElementText("infoOldWeb", "sdnkarteng1.blogspot.com");

    setElementText("contactAddress", data.address);
    const emailEl = document.getElementById("contactEmail");
    if (emailEl) {
      emailEl.href = `mailto:${data.email}`;
      emailEl.textContent = data.email;
    }

    const oldWebEl = document.getElementById("contactOldWeb");
    if (oldWebEl) {
      oldWebEl.href = data.old_web || verifiedProfile.old_web;
      oldWebEl.textContent = data.old_web || verifiedProfile.old_web;
    }

    const mapLinkEl = document.getElementById("mapLink");
    if (mapLinkEl) {
      mapLinkEl.href = data.maps_url || verifiedProfile.maps_url;
    }

    setElementText("spmbTitle", data.spmb_title || verifiedProfile.spmb_title);
    setElementText("spmbDescription", data.spmb_description || verifiedProfile.spmb_description);
    const spmbLinkEl = document.getElementById("spmbLink");
    if (spmbLinkEl && data.spmb_url) {
      spmbLinkEl.href = data.spmb_url;
    }

    setElementText("footerSchool", data.name);
    setElementText("footerCity", `Kecamatan Karang Tengah · ${data.city || "Kota Tangerang"} · Banten 15157`);

    // Brand and logo fallback
    const logoSrc = data.logo_url || "assets/brand-kt1.svg";
    const brandLogo = document.getElementById("brandLogo");
    if (brandLogo) {
      brandLogo.src = logoSrc;
      brandLogo.onerror = () => { brandLogo.src = "assets/brand-kt1.svg"; };
    }
    const footerLogo = document.getElementById("footerLogo");
    if (footerLogo) {
      footerLogo.src = logoSrc;
      footerLogo.onerror = () => { footerLogo.src = "assets/brand-kt1.svg"; };
    }

    // Hero image fallback
    const heroImg = document.getElementById("heroImg");
    if (heroImg) {
      if (data.hero_image_url) {
        heroImg.src = data.hero_image_url;
      }
      heroImg.onerror = () => { heroImg.src = "assets/school-hero-placeholder.svg"; };
    }

    // Profile photo fallback
    const profilePhoto = document.getElementById("profilePhoto");
    if (profilePhoto) {
      profilePhoto.onerror = () => { profilePhoto.src = "assets/school-profile-placeholder.svg"; };
    }

    // Vision & Mission rendering - only display section if data exists
    const identitasSection = document.getElementById("identitas");
    const hasVision = Boolean(data.vision && data.vision.trim() !== "");
    let missions = [];
    if (Array.isArray(data.mission)) {
      missions = data.mission;
    } else if (typeof data.mission === "string" && data.mission.startsWith("[")) {
      try { missions = JSON.parse(data.mission); } catch (e) { missions = []; }
    } else if (typeof data.mission === "string" && data.mission.trim() !== "") {
      missions = data.mission.split("\n").map(x => x.trim()).filter(Boolean);
    }
    const hasMission = missions.length > 0;

    if (identitasSection) {
      if (hasVision || hasMission) {
        identitasSection.style.display = "";
        const visionBox = document.getElementById("visionBox");
        const missionBox = document.getElementById("missionBox");
        if (visionBox) visionBox.style.display = hasVision ? "" : "none";
        if (missionBox) missionBox.style.display = hasMission ? "" : "none";
        if (visionText && hasVision) {
          visionText.innerHTML = `<p style="margin:0; font-size:16px; line-height:1.7; color:var(--text-main);">${escapeHtml(data.vision)}</p>`;
        }
        if (missionText && hasMission) {
          missionText.innerHTML = `<ol style="margin:0; padding-left:20px; line-height:1.7; color:var(--text-main);">${missions.map(m => `<li style="margin-bottom:8px;">${escapeHtml(typeof m === 'string' ? m : m.title || '')}</li>`).join("")}</ol>`;
        }
      } else {
        identitasSection.style.display = "none";
      }
    }
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function renderNews(items) {
    const list = document.getElementById("newsList");
    if (!list) return;
    if (!items || items.length === 0) {
      list.innerHTML = `
        <div class="empty-notice" style="grid-column: 1 / -1;">
          <div class="notice-icon">📰</div>
          <h3>Belum Ada Warta Kegiatan</h3>
          <p>Belum ada warta kegiatan yang dipublikasikan oleh pihak sekolah saat ini.</p>
        </div>`;
      return;
    }
    list.innerHTML = items.map(n => `
      <article class="content-card">
        <img src="${escapeHtml(n.image_url || 'assets/school-hero-placeholder.svg')}" alt="${escapeHtml(n.title)}" loading="lazy" onerror="this.onerror=null;this.src='assets/school-hero-placeholder.svg'">
        <div class="body">
          <small>${escapeHtml(n.category || 'Berita Sekolah')}</small>
          <h3>${escapeHtml(n.title)}</h3>
          <p>${escapeHtml(n.excerpt || (n.content ? n.content.substring(0, 120) + '...' : ''))}</p>
        </div>
      </article>
    `).join("");
  }

  function renderAnnouncements(items) {
    const list = document.getElementById("announcementList");
    if (!list) return;
    if (!items || items.length === 0) {
      list.innerHTML = `
        <div class="empty-notice dark-notice">
          <div class="notice-icon">📢</div>
          <h3>Belum Ada Pengumuman Aktif</h3>
          <p>Belum ada pengumuman aktif saat ini. Informasi resmi akan diumumkan melalui bagian ini.</p>
        </div>`;
      return;
    }
    list.innerHTML = items.map(a => `
      <article class="announcement">
        <strong>${escapeHtml(a.date_label || (a.published_at ? new Date(a.published_at).toLocaleDateString('id-ID') : 'Pemberitahuan'))}</strong>
        <div>
          <b>${escapeHtml(a.title)}</b>
          <p>${escapeHtml(a.body || a.content || '')}</p>
        </div>
      </article>
    `).join("");
  }

  function renderAchievements(items) {
    const list = document.getElementById("achievementList");
    if (!list) return;

    if (!items || items.length === 0) {
      list.innerHTML = `
        <div class="empty-notice" style="grid-column: 1 / -1;">
          <div class="notice-icon">🏆</div>
          <h3>Data Prestasi Sedang Dihimpun dan Diverifikasi</h3>
          <p>Daftar pencapaian dan kejuaraan siswa SDN Karang Tengah 1 sedang dihimpun oleh pihak sekolah dan akan dipublikasikan setelah diverifikasi.</p>
        </div>`;
      return;
    }

    list.innerHTML = items.map(a => `
      <article class="achievement-card">
        <span class="achieve-badge">${escapeHtml(a.category || 'Prestasi')}</span>
        <strong>${escapeHtml(a.title)}</strong>
        <p>${escapeHtml(a.description || '')}</p>
        <small>Tahun: ${escapeHtml(String(a.year || ''))}${a.level ? ' · Tingkat ' + escapeHtml(a.level) : ''}</small>
      </article>
    `).join("");
  }

  function renderGallery(items) {
    const list = document.getElementById("galleryList");
    if (!list) return;
    if (!items || items.length === 0) {
      list.innerHTML = `
        <div class="empty-notice" style="grid-column: 1 / -1;">
          <div class="notice-icon">🖼️</div>
          <h3>Galeri Kegiatan Sekolah Sedang Diperbarui</h3>
          <p>Dokumentasi kegiatan belajar mengajar dan fasilitas SDN Karang Tengah 1 sedang disiapkan oleh pihak sekolah.</p>
        </div>`;
      return;
    }
    list.innerHTML = items.map(g => `
      <figure>
        <img src="${escapeHtml(g.image_url)}" alt="${escapeHtml(g.title || g.caption || 'Dokumentasi Sekolah')}" loading="lazy" onerror="this.onerror=null;this.src='assets/school-hero-placeholder.svg'">
        <figcaption>${escapeHtml(g.title || g.caption || 'Dokumentasi SDN Karang Tengah 1')}</figcaption>
      </figure>
    `).join("");
  }

  function renderEskul(items) {
    const list = document.getElementById("eskulList");
    if (!list) return;
    if (!items || items.length === 0) {
      list.innerHTML = `
        <div class="empty-notice" style="grid-column: 1 / -1;">
          <div class="notice-icon">🎯</div>
          <h3>Informasi Ekstrakurikuler Sedang Diperbarui</h3>
          <p>Informasi ekstrakurikuler sedang diperbarui oleh pihak sekolah.</p>
        </div>`;
      return;
    }
    list.innerHTML = items.map(e => `
      <article class="content-card">
        ${e.image_url ? `<img src="${escapeHtml(e.image_url)}" alt="${escapeHtml(e.name)}" loading="lazy" onerror="this.onerror=null;this.src='assets/school-hero-placeholder.svg'">` : ''}
        <div class="body">
          <small>${escapeHtml(e.day ? e.day + (e.start_time ? ' · ' + e.start_time : '') : 'Pengembangan Diri')}</small>
          <h3>${escapeHtml(e.name)}</h3>
          <p>${escapeHtml(e.description || '')}</p>
        </div>
      </article>
    `).join("");
  }

  function renderActivities(items) {
    const list = document.getElementById("eskulActivityList");
    if (!list) return;
    if (!items || items.length === 0) {
      list.innerHTML = `
        <div class="empty-notice" style="grid-column: 1 / -1;">
          <div class="notice-icon">⚽</div>
          <h3>Belum Ada Laporan Kegiatan Eskul</h3>
          <p>Dokumentasi aktivitas mingguan ekstrakurikuler akan diperbarui oleh dewan guru dan pelatih eskul.</p>
        </div>`;
      return;
    }
    list.innerHTML = items.map(a => `
      <article class="content-card">
        ${a.image_url ? `<img src="${escapeHtml(a.image_url)}" alt="${escapeHtml(a.title)}" onerror="this.onerror=null;this.src='assets/school-hero-placeholder.svg'">` : ''}
        <div class="body">
          <small>${escapeHtml(a.activity_date || 'Aktivitas Eskul')}</small>
          <h3>${escapeHtml(a.title)}</h3>
          <p>${escapeHtml(a.description || '')}</p>
        </div>
      </article>
    `).join("");
  }

  function renderRombel(items) {
    const wrap = document.getElementById("rombelList");
    if (!wrap) return;
    const rombels = (items && items.length > 0) ? items : fallbackRombel;

    let totalStudents = 0;
    rombels.forEach(r => { totalStudents += Number(r.student_count || 0); });
    setElementText("rombelTotalStudents", totalStudents || 345);

    wrap.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>Rombongan Belajar</th>
            <th>Tingkat Kelas</th>
            <th>Tahun Ajaran</th>
            <th>Semester</th>
            <th>Jumlah Peserta Didik</th>
          </tr>
        </thead>
        <tbody>
          ${rombels.map(r => `
            <tr>
              <td><strong>${escapeHtml(r.name)}</strong></td>
              <td>${escapeHtml(r.grade || '-')}</td>
              <td>${escapeHtml(r.academic_year || '2025/2026')}</td>
              <td>${escapeHtml(r.semester || 'Genap')}</td>
              <td><strong>${escapeHtml(String(r.student_count || 0))} Siswa</strong></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  }

  function renderSchedules(items) {
    const list = document.getElementById("scheduleList");
    if (!list) return;
    if (!items || items.length === 0) {
      list.innerHTML = `
        <div class="empty-notice">
          <h3>Jadwal Belajar</h3>
          <p>Jam pembelajaran hari Senin s/d Jumat pukul 07.00 - 12.30 WIB. Jadwal detail semester aktif dapat diperoleh di kantor tata usaha.</p>
        </div>`;
      return;
    }
    list.innerHTML = items.map(s => `
      <article class="feature" style="padding: 20px;">
        <h3>${escapeHtml(s.title)}</h3>
        <p>${escapeHtml(s.description || '')}</p>
      </article>
    `).join("");
  }

  function renderDocuments(items) {
    const list = document.getElementById("documentList");
    if (!list) return;
    if (!items || items.length === 0) {
      list.innerHTML = `
        <div class="empty-notice">
          <h3>Dokumen Kurikulum &amp; Kalender</h3>
          <p>Berkas kurikulum dan kalender pendidikan SDN Karang Tengah 1 sedang disiapkan untuk dapat diunduh publik.</p>
        </div>`;
      return;
    }
    list.innerHTML = items.map(d => `
      <article class="feature" style="padding: 20px;">
        <h3>${escapeHtml(d.title)}</h3>
        <p>${escapeHtml(d.description || '')}</p>
        ${d.file_url ? `<p style="margin-top:10px;"><a class="btn secondary" href="${escapeHtml(d.file_url)}" target="_blank" rel="noopener">Unduh Berkas ↗</a></p>` : ''}
      </article>
    `).join("");
  }

  function renderSocialMedia(items) {
    const container = document.getElementById("socialLinks");
    if (!container) return;
    if (!items || items.length === 0) {
      container.innerHTML = `
        <p style="font-size: 13px; color: var(--text-muted); margin: 6px 0 0;">
          Akun media sosial resmi SDN Karang Tengah 1 akan ditampilkan di sini setelah diverifikasi dan ditautkan oleh Admin Sekolah.
        </p>`;
      return;
    }
    container.innerHTML = items.map(s => `
      <a class="social-link" href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer">
        <span>${escapeHtml((s.platform || 'Link').substring(0, 2).toUpperCase())}</span>
        ${escapeHtml(s.label || s.platform)}
      </a>
    `).join("");
  }

  async function loadData() {
    renderProfile(verifiedProfile);
    renderRombel(fallbackRombel);
    renderAchievements(candidateAchievements);
    renderNews([]);
    renderAnnouncements([]);
    renderGallery([]);
    renderEskul([]);
    renderActivities([]);
    renderSchedules([]);
    renderDocuments([]);
    renderSocialMedia([]);

    const client = getClient();
    if (!client) {
      return;
    }

    try {
      const [
        pRes,
        newsRes,
        annRes,
        achRes,
        galRes,
        eskulRes,
        actRes,
        rombelRes,
        schRes,
        docRes,
        socRes
      ] = await Promise.all([
        client.from("school_profile").select("*").eq("id", 1).maybeSingle(),
        client.from("news").select("*").eq("published", true).order("published_at", { ascending: false }).limit(6),
        client.from("announcements").select("*").eq("published", true).order("published_at", { ascending: false }).limit(4),
        client.from("achievements").select("*").eq("published", true).order("year", { ascending: false }).limit(6),
        client.from("gallery").select("*").eq("published", true).order("created_at", { ascending: false }).limit(8),
        client.from("extracurriculars").select("*").eq("active", true).order("name", { ascending: true }),
        client.from("extracurricular_activities").select("*").order("activity_date", { ascending: false }).limit(6),
        client.from("class_groups").select("*").eq("published", true).order("grade", { ascending: true }),
        client.from("school_schedules").select("*").order("sort_order", { ascending: true }).limit(4),
        client.from("documents").select("*").eq("published", true).order("created_at", { ascending: true }).limit(4),
        client.from("social_media_links").select("*").eq("enabled", true).order("sort_order", { ascending: true }).catch?.(() => ({ data: [] })) || client.from("social_media_links").select("*").eq("enabled", true).order("sort_order", { ascending: true })
      ]);


      if (pRes.data) renderProfile(pRes.data);
      if (newsRes.data) renderNews(newsRes.data);
      if (annRes.data) renderAnnouncements(annRes.data);
      if (achRes.data && achRes.data.length > 0) renderAchievements(achRes.data);
      if (galRes.data) renderGallery(galRes.data);
      if (eskulRes.data) renderEskul(eskulRes.data);
      if (actRes.data) renderActivities(actRes.data);
      if (rombelRes.data && rombelRes.data.length > 0) renderRombel(rombelRes.data);
      if (schRes.data) renderSchedules(schRes.data);
      if (docRes.data) renderDocuments(docRes.data);
      if (socRes.data) renderSocialMedia(socRes.data);
    } catch (err) {
      console.warn("Info Supabase: menggunakan data referensi SDN Karang Tengah 1.", err);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    // Current year in footer
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Mobile nav toggle
    const menuBtn = document.getElementById("menuBtn");
    const navMenu = document.getElementById("navMenu");
    if (menuBtn && navMenu) {
      menuBtn.addEventListener("click", () => {
        navMenu.classList.toggle("open");
      });
      navMenu.querySelectorAll("a").forEach(a => {
        a.addEventListener("click", () => {
          navMenu.classList.remove("open");
        });
      });
    }

    loadData();
  });
})();
