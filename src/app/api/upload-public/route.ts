import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Allowed targets and their public destination filenames
const ALLOWED_TARGETS: Record<string, string[]> = {
  logo: ['site-logo.png'],
  favicon: ['favicon.ico', 'icon.png'],
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const target = formData.get('target') as string | null; // 'logo' | 'favicon'

    if (!file) {
      return NextResponse.json({ error: 'Tidak ada file yang diunggah' }, { status: 400 });
    }

    if (!target || !ALLOWED_TARGETS[target]) {
      return NextResponse.json({ error: 'Target tidak valid. Gunakan: logo atau favicon' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const publicDir = path.join(process.cwd(), 'public');
    const savedPaths: string[] = [];

    // Save all target filenames
    for (const filename of ALLOWED_TARGETS[target]) {
      const destPath = path.join(publicDir, filename);
      fs.writeFileSync(destPath, buffer);
      savedPaths.push(`/${filename}`);
    }

    // Return the primary public URL (first filename)
    return NextResponse.json({
      url: savedPaths[0],
      paths: savedPaths,
    });
  } catch (error: any) {
    console.error('Error saving file to public folder:', error);
    return NextResponse.json({ error: error?.message || 'Gagal menyimpan file' }, { status: 500 });
  }
}
