import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xkslvfdguwvrhxetbmyw.supabase.co';
const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhrc2x2ZmRndXd2cmh4ZXRibXl3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjUwODQ0NCwiZXhwIjoyMTAyMDg0NDQ0fQ.qbrIXts6YYgMQ7hQ90-TOCORsY9d7-gOZQQd6fm1tW8';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || defaultKey;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
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
