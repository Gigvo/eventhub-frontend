import React from "react";
import Tiptap from "@/components/proposal-builder/tiptap";
import MenuBar from "@/components/proposal-builder/menu-bar";
import { AlertCircle, Target, Sparkles } from "lucide-react";

export default function ProposalBuilder() {
  return (
    <div className="flex gap-6 p-6">
      <div className="w-full">
        <h1 className="text-2xl font-bold mb-4">Proposal Builder</h1>
        <Tiptap />
      </div>
      <div className="space-y-6 max-w-sm">
        {/* AI Smart Review Header */}
        <div>
          <h2 className="text-sm font-semibold text-gray-600 mb-4 flex items-center gap-2">
            <span className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">
              ✓
            </span>
            AI Smart Review
          </h2>

          {/* Readiness Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white mb-4">
            <p className="text-xs font-semibold tracking-wider opacity-90">
              PROPOSAL READINESS
            </p>
            <p className="text-4xl font-bold mt-2">82/100</p>
            <p className="text-sm mt-2">Sangat Baik</p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="border rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-2">Kelengkapan (85%)</p>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-blue-500 h-1.5 rounded-full"
                  style={{ width: "85%" }}
                ></div>
              </div>
            </div>
            <div className="border rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-2">Benefit (63%)</p>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-blue-500 h-1.5 rounded-full"
                  style={{ width: "63%" }}
                ></div>
              </div>
            </div>
            <div className="border rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-2">Relevansi (74%)</p>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-blue-500 h-1.5 rounded-full"
                  style={{ width: "74%" }}
                ></div>
              </div>
            </div>
            <div className="border rounded-lg p-3">
              <p className="text-xs text-gray-600 mb-2">Budget (65%)</p>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-blue-500 h-1.5 rounded-full"
                  style={{ width: "65%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Issues Section */}
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-3">
            MASALAH (1)
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">
                Deskripsi terlalu singkat
              </p>
              <p className="text-xs text-red-600 mt-1">
                Bagian &quot;Tentang Event&quot; memberikan data historis lebih
                detail untuk meningkatkan sponsor korporat.
              </p>
            </div>
          </div>
        </div>

        {/* AI Suggestions */}
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-3">SARAN AI</p>
          <div className="space-y-3">
            <div className="border rounded-lg p-4 flex gap-3">
              <Target className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Tambahkan ROI Sponsor
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Visualisasikan penempatan logo pada media digital untuk
                  meningkatkan nilai benefit.
                </p>
              </div>
            </div>
            <div className="border rounded-lg p-4 flex gap-3">
              <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Gunakan Tone Lebih Formal
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  Ubah sapaan di bagian penutup agar selaras dengan profil PT
                  Maju Digital.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Publish Button */}
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
          <Sparkles className="w-5 h-5" />
          Publish Event
        </button>
      </div>
    </div>
  );
}
