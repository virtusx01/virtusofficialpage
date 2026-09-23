import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xkslvfdguwvrhxetbmyw.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhrc2x2ZmRndXd2cmh4ZXRibXl3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjUwODQ0NCwiZXhwIjoyMTAyMDg0NDQ0fQ.qbrIXts6YYgMQ7hQ90-TOCORsY9d7-gOZQQd6fm1tW8';

// Initialize Supabase Client with Admin Service Role Key (bypasses RLS for uploads)
const supabase = createClient(supabaseUrl, serviceRoleKey);

function extractFilenameFromUrl(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  try {
    const urlObj = new URL(url);
    // Standard Supabase public storage URL: .../storage/v1/object/public/assets/filename
    const pathnameParts = urlObj.pathname.split('/');
    if (urlObj.pathname.includes('/storage/v1/object/public/assets/')) {
      const filename = pathnameParts[pathnameParts.length - 1];
      return filename ? decodeURIComponent(filename) : null;
    }
  } catch (e) {
    if (url.startsWith('upload-')) return url;
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const oldUrl = formData.get('oldUrl') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Auto-delete old file if oldUrl is provided and points to Supabase assets bucket
    if (oldUrl) {
      const oldFilename = extractFilenameFromUrl(oldUrl);
      if (oldFilename) {
        supabase.storage
          .from('assets')
          .remove([oldFilename])
          .then(({ error }) => {
            if (error) console.error('Failed to auto-delete old file from Supabase:', error);
            else console.log(`Auto-deleted old file from Supabase: ${oldFilename}`);
          })
          .catch((err) => console.error('Error auto-deleting old file:', err));
      }
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name) || '.jpg';
    const filename = `upload-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    const contentType = file.type || 'image/jpeg';

    // Upload file directly to Supabase Storage bucket 'assets'
    const { data, error } = await supabase.storage
      .from('assets')
      .upload(filename, buffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      throw error;
    }

    // Generate public URL
    const { data: publicUrlData } = supabase.storage
      .from('assets')
      .getPublicUrl(filename);

    return NextResponse.json({ url: publicUrlData.publicUrl });
  } catch (error: any) {
    console.error('Error uploading file to Supabase:', error);
    return NextResponse.json({ error: error?.message || 'Failed to upload image' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { url } = await request.json();
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL file tidak valid' }, { status: 400 });
    }

    const filename = extractFilenameFromUrl(url);
    if (!filename) {
      return NextResponse.json({ error: 'Filename tidak ditemukan dari URL' }, { status: 400 });
    }

    const { error } = await supabase.storage
      .from('assets')
      .remove([filename]);

    if (error) {
      console.error('Supabase storage delete error:', error);
      throw error;
    }

    return NextResponse.json({ success: true, message: `File ${filename} berhasil dihapus dari bucket Supabase` });
  } catch (error: any) {
    console.error('Error deleting file from Supabase:', error);
    return NextResponse.json({ error: error?.message || 'Gagal menghapus file' }, { status: 500 });
  }
}
