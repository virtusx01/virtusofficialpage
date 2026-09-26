import { Metadata } from "next";
import prisma from "@/lib/prisma";
import FanbaseClientView, { FanbaseCatPhoto } from "./FanbaseClientView";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Galeri Fanbase Cupidut & Dudud | Virtus Official",
  description: "Galeri foto dan album eksklusif dua kucing kesayangan Virtus: Cupidut (abu-abu) dan Dudud (oren belang).",
};

export default async function FanbasePage() {
  let initialPhotos: FanbaseCatPhoto[] = [];

  try {
    const rawPhotos = await (prisma as any).fanbaseCat.findMany({
      orderBy: [
        { orderIndex: "asc" },
        { createdAt: "desc" },
      ],
      select: {
        id: true,
        catType: true,
        title: true,
        description: true,
        imageUrl: true,
        orderIndex: true,
      },
    });

    initialPhotos = (rawPhotos || []).map((p: any) => ({
      id: p.id,
      catType: p.catType as "CUPIDUT" | "DUDUD",
      title: p.title,
      description: p.description || "",
      imageUrl: p.imageUrl,
      orderIndex: p.orderIndex || 0,
    }));
  } catch (err) {
    console.error("Failed to fetch cat photos on server:", err);
  }

  return <FanbaseClientView initialPhotos={initialPhotos} />;
}
