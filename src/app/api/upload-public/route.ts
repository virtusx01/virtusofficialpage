import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xkslvfdguwvrhxetbmyw.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhrc2x2ZmRndXd2cmh4ZXRibXl3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjUwODQ0NCwiZXhwIjoyMTAyMDg0NDQ0fQ.qbrIXts6YYgMQ7hQ90-TOCORsY9d7-gOZQQd6fm1tW8';

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Nama file tetap di Supabase agar selalu di-overwrite (upsert)
const TARGET_FILENAMES: Record<string, string> = {
  logo: 'site-logo.png',
  favicon: 'site-favicon.png',
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const target = formData.get('target') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file yang diunggah' }, { status: 400 });
    }

    if (!target || !TARGET_FILENAMES[target]) {
      return NextResponse.json({ error: 'Target tidak valid. Gunakan: logo atau favicon' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = TARGET_FILENAMES[target];
    const contentType = file.type || 'image/png';

    // Upload ke Supabase dengan filename tetap + upsert: true (overwrite)
    const { error } = await supabase.storage
      .from('assets')
      .upload(filename, buffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw error;
    }

    // Ambil public URL dengan cache-busting timestamp
    const { data: publicUrlData } = supabase.storage
      .from('assets')
      .getPublicUrl(filename);

    const urlWithCacheBust = `${publicUrlData.publicUrl}?v=${Date.now()}`;

    return NextResponse.json({ url: urlWithCacheBust });
  } catch (error: any) {
    console.error('Error in upload-public:', error);
    return NextResponse.json({ error: error?.message || 'Gagal mengunggah file' }, { status: 500 });
  }
}
