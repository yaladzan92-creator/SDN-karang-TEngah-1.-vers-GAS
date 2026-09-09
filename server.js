import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;
const host = '0.0.0.0';

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
