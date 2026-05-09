"use client";
import { useRouter } from "next/navigation";
import InfoDasar from "@/components/buat-event/info-dasar";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function InfoDasarPage() {
  const router = useRouter();

  return (
    <>
      <InfoDasar />

      {/* Navigation Buttons */}
      <div className="flex justify-between max-w-272 mx-auto mt-8">
        <button
          onClick={() => router.push("/dashboard")}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <ArrowLeft size={18} className="inline mr-2" />
          Kembali ke Dashboard
        </button>
        <button
          onClick={() => router.push("/buat-event/detail-event-audiens")}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Lanjut
          <ArrowRight size={18} className="inline ml-2" />
        </button>
      </div>
    </>
  );
}
