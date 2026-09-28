import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function syncData() {
  console.log('🔄 [sync-data] Fetching latest posts and milestones from Supabase...');
  try {
    const clientPath = path.resolve(__dirname, '../src/supabaseClient.js');
    const content = fs.readFileSync(clientPath, 'utf8');
    const urlMatch = content.match(/supabaseUrl\s*=\s*'([^']+)'/);
    const keyMatch = content.match(/supabaseAnonKey\s*=\s*'([^']+)'/);

    if (!urlMatch || !keyMatch) {
      throw new Error('Could not parse Supabase URL or Anon Key from src/supabaseClient.js');
    }

    const supabase = createClient(urlMatch[1], keyMatch[1]);

    const { data: posts, error: pErr } = await supabase
      .from('posts')
      .select('*')
      .order('order_index', { ascending: true });

    if (pErr) throw pErr;

    const { data: milestones, error: mErr } = await supabase
      .from('milestones')
      .select('*')
      .order('date_start', { ascending: true });

    if (mErr) throw mErr;

    const dataDir = path.resolve(__dirname, '../src/data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const payload = {
      synced_at: new Date().toISOString(),
      posts: posts || [],
      milestones: milestones || []
    };

    const targetFile = path.join(dataDir, 'fallbackData.json');
    fs.writeFileSync(targetFile, JSON.stringify(payload, null, 2), 'utf8');
    console.log(`✅ [sync-data] Successfully updated fallbackData.json (${posts.length} posts, ${milestones.length} milestones)`);
  } catch (err) {
    console.warn('⚠️ [sync-data] Failed to sync from Supabase, keeping existing fallbackData.json:', err.message);
  }
}

syncData();
