import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;
const host = '0.0.0.0';

app.use(express.json({ limit: '10mb' }));

// Helper to get GoogleGenAI client
function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY belum dikonfigurasi di environment server (Settings > Secrets).');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build'
      }
    }
  });
}

// Ensure upload folders exist
const uploadsDir = path.join(__dirname, 'uploads');
const folders = ['branding', 'hero', 'profile', 'gallery', 'news', 'extracurricular', 'achievement'];
for (const f of folders) {
  fs.mkdirSync(path.join(uploadsDir, f), { recursive: true });
}

// Serve uploads statically
app.use('/uploads', express.static(uploadsDir));

// Dynamic config endpoint for Supabase credentials from environment
app.get(['/js/config.js', '/admin/js/config.js'], (req, res) => {
  const supabaseUrl = process.env.SUPABASE_URL || 'PASTE_SUPABASE_PROJECT_URL';
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'PASTE_SUPABASE_PUBLISHABLE_KEY';
  const storageBucket = process.env.STORAGE_BUCKET || 'school-media';
  
  res.type('application/javascript');
  res.send(`window.SDN_CONFIG = window.SDN11_CONFIG = {
  SUPABASE_URL: ${JSON.stringify(supabaseUrl)},
  SUPABASE_ANON_KEY: ${JSON.stringify(supabaseAnonKey)},
  STORAGE_BUCKET: ${JSON.stringify(storageBucket)}
};
`);
});

// Media Proxy: securely fetch remote candidate images to prevent CORS and hotlink issues in Admin preview
app.get('/api/media-proxy', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl || typeof targetUrl !== 'string' || !/^https?:\/\//i.test(targetUrl)) {
    return res.status(400).send('Invalid or missing URL');
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      }
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(response.status).send(`Upstream returned ${response.status}`);
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    
    const arrayBuffer = await response.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    return res.status(502).send('Failed to fetch remote image: ' + (err.message || 'Error'));
  }
});

// Media Approval: Download candidate image server-side, save to Supabase Storage (or local storage), return permanent URL
app.post('/api/media/approve', async (req, res) => {
  try {
    const { id, image_url, media_type, title, description } = req.body || {};
    if (!image_url) {
      return res.status(400).json({ error: 'URL gambar kandidat wajib disertakan.' });
    }

    const folderMap = {
      hero: 'hero',
      profile: 'profile',
      gallery: 'gallery',
      news: 'news',
      extracurricular: 'extracurricular',
      achievement: 'achievement',
      branding: 'branding'
    };
    const targetFolder = folderMap[media_type] || 'gallery';

    // 1. Download file buffer server-side
    let buffer;
    let mimeType = 'image/jpeg';
    let ext = 'jpg';

    if (image_url.startsWith('http://') || image_url.startsWith('https://')) {
      const resp = await fetch(image_url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) SDNKarangTengah1-Bot/2.0'
        }
      });
      if (!resp.ok) {
        throw new Error(`Gagal mengunduh gambar dari sumber eksternal (${resp.status} ${resp.statusText})`);
      }
      mimeType = resp.headers.get('content-type') || 'image/jpeg';
      buffer = Buffer.from(await resp.arrayBuffer());
    } else if (image_url.startsWith('/uploads/') || image_url.startsWith('assets/')) {
      const localPath = path.join(__dirname, image_url.replace(/^\//, ''));
      if (fs.existsSync(localPath)) {
        buffer = fs.readFileSync(localPath);
      } else {
        throw new Error('File lokal tidak ditemukan.');
      }
    } else {
      throw new Error('Skema URL tidak didukung.');
    }

    if (mimeType.includes('png')) ext = 'png';
    else if (mimeType.includes('webp')) ext = 'webp';
    else if (mimeType.includes('svg')) ext = 'svg';

    const safeFileName = `kt1-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
    const storagePath = `${targetFolder}/${safeFileName}`;

    // 2. Always save locally into /uploads for robust zero-dependency offline fallback
    const localDest = path.join(uploadsDir, targetFolder, safeFileName);
    fs.writeFileSync(localDest, buffer);
    let publicUrl = `/uploads/${targetFolder}/${safeFileName}`;

    // 3. If Supabase is configured, upload to Supabase Storage bucket `school-media`
    const supabaseUrl = process.env.SUPABASE_URL;
    const authHeader = req.headers['authorization'];
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || (authHeader ? authHeader.replace(/^Bearer /i, '') : null);
    const bucket = process.env.STORAGE_BUCKET || 'school-media';

    if (supabaseUrl && supabaseUrl !== 'PASTE_SUPABASE_PROJECT_URL' && supabaseKey) {
      try {
        const uploadEndpoint = `${supabaseUrl.replace(/\/+$/, '')}/storage/v1/object/${bucket}/${storagePath}`;
        const upResp = await fetch(uploadEndpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': mimeType,
            'x-upsert': 'true'
          },
          body: buffer
        });

        if (upResp.ok) {
          publicUrl = `${supabaseUrl.replace(/\/+$/, '')}/storage/v1/object/public/${bucket}/${storagePath}`;
        } else {
          console.warn('Supabase storage upload returned status', upResp.status);
        }
      } catch (uploadErr) {
        console.warn('Gagal upload ke Supabase Storage, menggunakan URL lokal:', uploadErr.message);
      }
    }

    return res.json({
      success: true,
      storage_url: publicUrl,
      folder: targetFolder,
      file_name: safeFileName,
      media_type,
      id
    });
  } catch (err) {
    console.error('Error approving media candidate:', err);
    return res.status(500).json({ error: err.message || 'Gagal menyetujui media kandidat.' });
  }
});

// AI Optimization endpoint for news & captions (Admin only, server-side Gemini API)
app.post('/api/ai/optimize', async (req, res) => {
  try {
    const { title, content, excerpt } = req.body || {};
    const ai = getGenAI();

    const textToAnalyze = [
      title ? `Judul Asli: ${title}` : null,
      content ? `Isi / Teks Asli:\n${content}` : (excerpt ? `Ringkasan / Teks Asli:\n${excerpt}` : null)
    ].filter(Boolean).join('\n\n');

    if (!textToAnalyze.trim()) {
      return res.status(400).json({ error: 'Tidak ada teks yang diberikan untuk dioptimalkan.' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Optimalkan draft teks berita sekolah berikut:\n\n${textToAnalyze}`,
      config: {
        systemInstruction: `You are an editorial assistant for the official website of SDN Karang Tengah 1, Kota Tangerang.

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

Do not publish or modify database records.`,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: {
              type: Type.STRING,
              description: 'Optimized news title / headline'
            },
            body: {
              type: Type.STRING,
              description: 'Optimized article content / body'
            }
          },
          required: ['headline', 'body']
        }
      }
    });

    const textResult = response.text || '';
    let parsed = {};
    try {
      parsed = JSON.parse(textResult.replace(/```json|```/g, '').trim());
    } catch (parseErr) {
      parsed = { headline: title || '', body: textResult };
    }

    return res.json({
      success: true,
      headline: parsed.headline || title || '',
      body: parsed.body || content || excerpt || ''
    });

  } catch (err) {
    console.error('Error optimizing text with Gemini:', err);
    return res.status(500).json({
      error: err.message || 'Gagal mengoptimalkan teks menggunakan AI.'
    });
  }
});

// Serve static assets from the current directory
app.use(express.static(__dirname, {
  extensions: ['html']
}));

// Route for admin section
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// Root fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}`);
});
