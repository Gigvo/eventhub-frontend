"use client";
import { useRouter } from "next/navigation";
import DetailEventAudiens from "@/components/buat-event/detail-event-audiens";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function DetailEventAudiensPage() {
  const router = useRouter();

  return (
    <>
      <DetailEventAudiens />

      {/* Navigation Buttons */}
      <div className="flex justify-between max-w-272 mx-auto mt-8">
        <button
          onClick={() => router.push("/buat-event/info-dasar")}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <ArrowLeft size={18} className="inline mr-2" />
          Kembali
        </button>
        <button
          onClick={() => router.push("/buat-event/paket-sponsorship")}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Lanjut ke Sponsorship
          <ArrowRight size={18} className="inline ml-2" />
        </button>
      </div>
    </>
  );
}
