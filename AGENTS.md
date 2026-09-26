<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:anti-slop-writing-rules -->
# Aturan Anti-Slop Writing (Bahasa Indonesia & English)

Kapan pun membuat, menulis, mengedit teks, dokumentasi, copy UI, deskripsi, pesan percakapan, atau artikel:
Patuhi aturan dari `anti-slop-writing` (.agents/skills/anti-slop-writing/indonesian/SKILL.md dan .agents/rules/anti-slop-writing.md).

## Prinsip Utama & Larangan Keras:
1. **Em dash (`—`) dan en dash (`–`) DILARANG TOTAL (Target: 0).** Ganti dengan titik, koma, titik dua, atau tanda kurung.
2. **Dilarang pembuka klise:** "Di era modern ini,", "Seiring perkembangan zaman,", "Dalam dunia yang serba cepat,". Mulai langsung dengan fakta/substansi.
3. **Dilarang puffery & kata klise AI:** sangat krusial, komprehensif, lanskap, paradigma, holistik, sinergi, ekosistem (figuratif), menyoroti, menggarisbawahi, menyelami ("delve"), berkontribusi pada.
4. **Dilarang struktur formulaik:** "tidak hanya X tetapi juga Y", "tantangan dan peluang", "pada akhirnya,", "dapat disimpulkan bahwa".
5. **Cadence & Burstiness manusiawi:** Variasikan panjang kalimat secara dinamis (campur kalimat 3-6 kata dengan kalimat panjang). Hindari kalimat seragam 18-24 kata secara berulang.
6. **Tone Register Konsisten:** Gunakan register yang tepat (formal / semi-formal / informal). Default untuk interaksi dan teks web santai: semi-formal/informal tanpa terkesan kaku buatan AI.
<!-- END:anti-slop-writing-rules -->

<!-- BEGIN:avoid-ai-design-and-antislop -->
# Aturan Desain & Koding Anti-Slop (UI & Code Architecture)

Gunakan panduan dari `.agents/skills/avoid-ai-design/SKILL.md` dan `.agents/skills/antislop/SKILL.md`:
1. **Hindari Template Desain AI Generik (First & Second Order Tells):**
   - Hindari gradien ungu-ke-biru default tanpa alasan visual yang jelas.
   - Hindari clip-text gradient di setiap headline judul.
   - Hindari layout kaku 3 kartu fitur generik yang selalu berjejer di bawah hero.
   - Hindari badge pil "NEXT-GEN / AI / BETA" di atas headline jika tidak dibutuhkan.
   - Hindari efek shadow-lg dan rounded-2xl yang dipasang berlebihan ke semua kontainer.
2. **Kualitas Koding & Komentar Bersih:**
   - Dilarang membuat banner komentar ASCII box-drawing atau emoji di dalam file kode.
   - Jangan menambahkan komentar redundan yang hanya mengulang baris kode di bawahnya.
   - Pertahankan kode yang ringkas, modular, dan langsung fokus pada logika bisnis.
3. **Scanner Audit:**
   - Jalankan `node .agents/skills/avoid-ai-design/scripts/detect.mjs src/` untuk mengecek tanda-tanda desain AI yang tidak sengaja terpasang.
<!-- END:avoid-ai-design-and-antislop -->


