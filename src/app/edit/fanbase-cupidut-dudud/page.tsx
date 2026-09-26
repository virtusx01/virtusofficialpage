"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Cat,
  Plus,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Upload,
  Loader2,
  Save,
  ArrowLeft,
  Eye,
  CheckCircle,
  X,
  Sparkles,
  Folder,
} from "lucide-react";

interface CatPhoto {
  id: string;
  catType: "CUPIDUT" | "DUDUD";
  title: string;
  description: string;
  imageUrl: string;
  orderIndex: number;
}

export default function EditFanbaseCupidutDududPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [photos, setPhotos] = useState<CatPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<CatPhoto | null>(null);

  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [bucketFiles, setBucketFiles] = useState<Array<{ name: string; url: string; size: number; createdAt: string; type: "image" | "video" }>>([]);
  const [loadingBucketFiles, setLoadingBucketFiles] = useState(false);

  const [formData, setFormData] = useState({
    catType: "CUPIDUT" as "CUPIDUT" | "DUDUD",
    title: "",
    description: "",
    imageUrl: "",
    orderIndex: 0,
  });

  const fetchBucketFiles = async () => {
    setLoadingBucketFiles(true);
    try {
      const res = await fetch("/api/upload?type=image");
      if (res.ok) {
        const data = await res.json();
        setBucketFiles(data.files || []);
      }
    } catch (e) {
      console.error("Failed to load bucket files:", e);
    } finally {
      setLoadingBucketFiles(false);
    }
  };

  const openBucketPicker = () => {
    setShowMediaPicker(true);
    fetchBucketFiles();
  };

  // Guard for admin session
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin");
    }
  }, [status, router]);

  const fetchPhotos = async () => {
    try {
      const res = await fetch("/api/fanbase-cat");
      if (res.ok) {
        const data = await res.json();
        setPhotos(data.photos || []);
      }
    } catch (err) {
      console.error("Failed to load cat photos:", err);
      setError("Gagal memuat daftar foto.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchPhotos();
    }
  }, [status]);

  const handleOpenAdd = () => {
    setEditingPhoto(null);
    setFormData({
      catType: "CUPIDUT",
      title: "",
      description: "",
      imageUrl: "",
      orderIndex: photos.length + 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (photo: CatPhoto) => {
    setEditingPhoto(photo);
    setFormData({
      catType: photo.catType,
      title: photo.title,
      description: photo.description || "",
      imageUrl: photo.imageUrl,
      orderIndex: photo.orderIndex || 0,
    });
    setIsModalOpen(true);
  };

  const deleteUploadedFile = async (url?: string) => {
    if (!url || !url.includes('/storage/v1/object/public/assets/')) return;
    try {
      await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
    } catch (e) {
      console.error('Failed to delete file from Supabase:', e);
    }
  };

  const handleUploadImage = async (file: File) => {
    setUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      if (formData.imageUrl) {
        uploadData.append("oldUrl", formData.imageUrl);
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setFormData((prev) => ({ ...prev, imageUrl: data.url }));
      } else {
        alert(`Gagal mengunggah foto: ${data.error || "Server Error"}`);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Terjadi kesalahan saat mengunggah gambar.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.imageUrl) {
      alert("Judul dan Foto wajib diisi!");
      return;
    }

    setActionLoading(true);
    setError("");

    try {
      const url = editingPhoto ? `/api/fanbase-cat/${editingPhoto.id}` : "/api/fanbase-cat";
      const method = editingPhoto ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setSuccess(editingPhoto ? "Foto berhasil diperbarui!" : "Foto baru berhasil ditambahkan!");
        setTimeout(() => setSuccess(""), 3000);
        fetchPhotos();
      } else {
        const errData = await res.json();
        alert(errData.error || "Gagal menyimpan foto.");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Terjadi kesalahan koneksi.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string, imageUrl?: string) => {
    if (!confirm(`Hapus foto "${title}" dari album?`)) return;

    try {
      if (imageUrl) {
        deleteUploadedFile(imageUrl);
      }
      const res = await fetch(`/api/fanbase-cat/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSuccess("Foto berhasil dihapus.");
        setTimeout(() => setSuccess(""), 3000);
        fetchPhotos();
      } else {
        alert("Gagal menghapus foto.");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100">
        <Loader2 className="h-10 w-10 text-violet-500 animate-spin" />
        <p className="text-xs text-slate-400 mt-2">Memuat CRUD Fanbase Cupidut & Dudud...</p>
      </div>
    );
  }

  const cupidutPhotos = photos.filter((p) => p.catType === "CUPIDUT");
  const dududPhotos = photos.filter((p) => p.catType === "DUDUD");

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header Control Panel */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 transition-colors shrink-0"
              title="Kembali ke Dashboard Admin"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Cat className="w-5 h-5 text-fuchsia-400" />
                <span>CRUD Album Fanbase Cupidut & Dudud</span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Kelola foto, hapus, tambah, atau ubah album Cupidut (abu-abu) & Dudud (oren belang).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/fanbase-cupidut-dudud"
              target="_blank"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold transition-colors"
            >
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>Lihat Halaman Publik</span>
            </Link>

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white font-bold text-sm shadow-lg shadow-fuchsia-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>Tambah Foto Baru</span>
            </button>
          </div>
        </div>

        {success && (
          <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-sm flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        {/* Section 1: Cupidut (Abu-abu) Photos */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-400" />
              <span>Album Cupidut (Abu-abu) — {cupidutPhotos.length} Foto</span>
            </h2>
          </div>

          {cupidutPhotos.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center italic">Belum ada foto Cupidut di album.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {cupidutPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between"
                >
                  <div className="aspect-square relative bg-black">
                    <img src={photo.imageUrl} alt={photo.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3 space-y-1">
                    <h3 className="font-bold text-sm text-slate-200 truncate">{photo.title}</h3>
                    {photo.description && (
                      <p className="text-xs text-slate-400 line-clamp-2">{photo.description}</p>
                    )}
                  </div>
                  <div className="p-3 border-t border-slate-900 flex items-center justify-end gap-2 bg-slate-950/80">
                    <button
                      onClick={() => handleOpenEdit(photo)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(photo.id, photo.title, photo.imageUrl)}
                      className="p-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/60 border border-red-900/40 text-red-400 text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Dudud (Oren Belang) Photos */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h2 className="text-base font-bold text-amber-300 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span>Album Dudud (Oren Belang) — {dududPhotos.length} Foto</span>
            </h2>
          </div>

          {dududPhotos.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center italic">Belum ada foto Dudud di album.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {dududPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col justify-between"
                >
                  <div className="aspect-square relative bg-black">
                    <img src={photo.imageUrl} alt={photo.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3 space-y-1">
                    <h3 className="font-bold text-sm text-amber-200 truncate">{photo.title}</h3>
                    {photo.description && (
                      <p className="text-xs text-slate-400 line-clamp-2">{photo.description}</p>
                    )}
                  </div>
                  <div className="p-3 border-t border-slate-900 flex items-center justify-end gap-2 bg-slate-950/80">
                    <button
                      onClick={() => handleOpenEdit(photo)}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(photo.id, photo.title, photo.imageUrl)}
                      className="p-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/60 border border-red-900/40 text-red-400 text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Bucket Media Picker Modal */}
      {showMediaPicker && (
        <div className="fixed inset-0 z-[60] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <Folder className="w-5 h-5 text-violet-400" />
                <h3 className="font-bold text-base text-white">Pilih Foto Dari Bucket Supabase</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowMediaPicker(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              {loadingBucketFiles ? (
                <div className="h-64 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                  <span className="text-xs">Memuat file dari bucket...</span>
                </div>
              ) : bucketFiles.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center gap-2 text-center p-6 border border-dashed border-slate-800 rounded-xl">
                  <ImageIcon className="w-10 h-10 text-slate-600" />
                  <p className="text-xs font-semibold text-slate-300">Belum ada file gambar di bucket</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {bucketFiles.map((file) => (
                    <div
                      key={file.name}
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, imageUrl: file.url }));
                        setShowMediaPicker(false);
                      }}
                      className="group relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 hover:border-violet-500 transition-all cursor-pointer shadow-md flex flex-col text-left select-none"
                    >
                      <div className="relative aspect-video w-full bg-slate-900 overflow-hidden flex items-center justify-center">
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-violet-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="px-2.5 py-1 rounded-full bg-violet-600 text-white font-bold text-[10px] shadow-lg">
                            Pilih Foto
                          </span>
                        </div>
                      </div>
                      <div className="p-2 flex flex-col gap-0.5 bg-slate-950">
                        <span className="text-[11px] font-semibold text-slate-200 truncate" title={file.name}>
                          {file.name}
                        </span>
                        <span className="text-[9px] text-slate-500">{(file.size / (1024 * 1024)).toFixed(1)} MB</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setShowMediaPicker(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <Cat className="w-5 h-5 text-fuchsia-400" />
                <span>{editingPhoto ? "Edit Foto Kucing" : "Tambah Foto Kucing Baru"}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Pilih Kucing</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, catType: "CUPIDUT" })}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      formData.catType === "CUPIDUT"
                        ? "bg-slate-800 border-slate-600 text-white ring-2 ring-slate-500"
                        : "bg-slate-950 border-slate-850 text-slate-400"
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                    <span>Cupidut (Abu-abu)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, catType: "DUDUD" })}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      formData.catType === "DUDUD"
                        ? "bg-amber-950 border-amber-600 text-amber-300 ring-2 ring-amber-500"
                        : "bg-slate-950 border-slate-850 text-slate-400"
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span>Dudud (Oren Belang)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Judul Foto</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Cupidut lagi tidur nyenyak"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm outline-none text-slate-100 focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Deskripsi / Story (Opsional)</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tuliskan cerita singkat foto ini..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm outline-none text-slate-100 focus:border-violet-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">URL Gambar / Upload Foto</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm outline-none text-slate-100 focus:border-violet-500"
                  />
                  <button
                    type="button"
                    onClick={openBucketPicker}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-violet-300 border border-violet-500/30 rounded-xl text-xs font-semibold cursor-pointer shrink-0 transition-colors shadow-sm"
                    title="Pilih foto dari Bucket Supabase"
                  >
                    <Folder className="w-4 h-4 text-violet-400" />
                    <span>Pilih Dari Bucket</span>
                  </button>
                  <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold cursor-pointer shrink-0 transition-colors">
                    {uploading ? (
                      <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 text-violet-400" />
                    )}
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleUploadImage(e.target.files[0]);
                      }}
                    />
                  </label>
                </div>
              </div>

              {formData.imageUrl && (
                <div className="aspect-video max-h-40 rounded-xl overflow-hidden bg-black border border-slate-800">
                  <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-contain" />
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-lg shadow-violet-600/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Simpan Foto</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
