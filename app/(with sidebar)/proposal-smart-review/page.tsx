"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Upload,
  Download,
  MoreVertical,
  AlertCircle,
  FileText,
  CloudUpload,
  Sparkles,
} from "lucide-react";
import Image from "next/image";

export default function ProposalSmartReview() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [aiOptions, setAiOptions] = useState({
    proposalScore: true,
    identifyIssues: false,
    matchEventData: true,
  });
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Breadcrumb & Title */}
      <div className="mb-8">
        <div className="text-sm text-gray-600 mb-2">
          Proposal Smart Review • Jakarta Tech Fest 2026
        </div>
        <h1 className="text-3xl font-bold text-gray-900">
          Jakarta Tech Fest 2026
        </h1>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="smart-review" className="mb-8">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="terbaru">Proposal Terbaru</TabsTrigger>
          <TabsTrigger value="smart-review">Proposal Smart Review</TabsTrigger>
          <TabsTrigger value="hasil">Hasil Review</TabsTrigger>
        </TabsList>

        <TabsContent
          value="smart-review"
          className="grid grid-cols-3 gap-6 mt-6"
        >
          {/* Left Column - Proposals */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Proposal</h2>
              <Button
                className="gap-2 px-4 py-2 bg-[#003EC7]"
                onClick={() => setIsUploadDialogOpen(true)}
              >
                <Upload className="w-4 h-4" />
                Upload Proposal
              </Button>
            </div>

            {/* Info Banner */}
            <div className="bg-[#E5E7EB] border border-[#D0E1FB] rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-900">
                Semua proposal di halaman ini otomatis dikurasi dengan Jakarta
                Tech Fest 2026
              </p>
            </div>

            {/* Proposal Card 1 */}
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border border-gray-200 bg-[#DDE1FF4D]">
              <div className="flex gap-4 items-center">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 border-4  rounded-full flex items-center justify-center text-[#003EC7] text-xl font-bold border-[#003EC7]">
                    82
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-xs font-semibold">
                      AI POWERED
                    </Badge>
                    <h3 className="font-semibold text-gray-900 text-sm">
                      Template Proposal Utama
                    </h3>
                  </div>

                  <p className="text-xs text-blue-600 mb-2 font-medium">
                    Terakhir diperbaharui: 2 Jam yang lalu oleh Admin
                  </p>
                  <div className="flex gap-3 text-xs text-[#4B5563]">
                    <span className="bg-white rounded-[4px] px-2 py-1">
                      Tier: Platinum
                    </span>
                    <span className="bg-white rounded-[4px] px-2 py-1">
                      12 Halaman
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0 text-[14px] px-4 py-2"
                >
                  Buka & Edit
                </Button>
              </div>
            </Card>

            {/* Proposal Card 2 */}
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex gap-3 flex-1">
                  <div className="flex-shrink-0  p-4 bg-[#F3F4F6] rounded-[8px] flex items-center justify-center text-[#9CA3AF]">
                    <FileText className="w-9 h-9" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="outline"
                        className="text-xs font-semibold bg-gray-50"
                      >
                        MANUAL UPLOAD
                      </Badge>
                      <h3 className="font-semibold text-gray-900  text-sm">
                        Proposal Sponsorship - Vendor Lokal
                      </h3>
                    </div>

                    <div className="text-xs text-[#003EC7] space-y-0.5">
                      <p className="text-[14px]">
                        <span>Format:</span> PDF • 4.2 MB • Diupload 30 April
                        2026
                      </p>
                      <p className="bg-[#F9FAFB] rounded-[4px] px-2 py-1 text-[#4B5563] w-fit">
                        Status: Draft
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Upload Section */}
            <div
              onClick={() => setIsUploadDialogOpen(true)}
              className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center text-center hover:border-gray-400 cursor-pointer transition-colors"
            >
              <Upload className="w-8 h-8 text-gray-400 mb-3" />
              <p className="text-gray-600 text-sm">Upload Proposal Lain</p>
            </div>
          </div>

          {/* Right Column - AI Analysis */}
          <div className="col-span-1">
            <Card className="p-6 bg-white sticky top-6">
              {/* Header */}
              <div className="mb-6 pb-4 border-b">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    🤖 AI ANALYSIS
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Review untuk: Template Proposal
                </h3>
              </div>

              {/* AI Analysis Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-[#F9FAFB] rounded-[4px] p-3">
                  <p className="text-xs font-semibold text-blue-600 mb-1">
                    STRUKTUR
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    90 <span className="text-xs text-gray-500">/ 100</span>
                  </p>
                </div>
                <div className="bg-[#F9FAFB] rounded-[4px] p-3">
                  <p className="text-xs font-semibold text-blue-600 mb-1">
                    VISUAL
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    74 <span className="text-xs text-gray-500">/ 100</span>
                  </p>
                </div>
                <div className="bg-[#F9FAFB] rounded-[4px] p-3">
                  <p className="text-xs font-semibold text-blue-600 mb-1">
                    NARASI
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    86 <span className="text-xs text-gray-500">/ 100</span>
                  </p>
                </div>
                <div className="bg-[#F9FAFB] rounded-[4px] p-3">
                  <p className="text-xs font-semibold text-blue-600 mb-1">
                    RELEVANSI
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    78 <span className="text-xs text-gray-500">/ 100</span>
                  </p>
                </div>
              </div>

              {/* Issues */}
              <div className="mb-6">
                <h4 className="text-xs font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Image
                    src="/icons/alert-triangle.svg"
                    alt="alert"
                    width={14}
                    height={16}
                  />
                  MASALAH UTAMA (2)
                </h4>
                <div className="space-y-3">
                  <div className="flex gap-3 p-3 bg-[#D3E4FE4D] rounded-[8px]">
                    <div className="flex-shrink-0 mt-0.5">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-red-700 mb-1">
                        Analisis ROI Kurang Detail
                      </p>
                      <p className="text-xs text-gray-600">
                        Sponsor korporat biasanya membuhukan matrix konversi
                        yang lebih spesifik di halaman 4.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-3 bg-[#D3E4FE4D] rounded-[8px]">
                    <div className="flex-shrink-0 mt-0.5">
                      <AlertCircle className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1">
                        Kualitas Gambar Footer
                      </p>
                      <p className="text-xs text-gray-600">
                        Logo partner pada halaman penutup memiliki resolusi
                        rendah ( 300dpi).
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2">
                Lihat Analisis Lengkap →
              </Button>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Proposal</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-900">
                Akan dikaitkan dengan: Jakarta Tech Fest 2026
              </p>
            </div>

            {/* File Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:border-gray-400 cursor-pointer transition-colors">
              <div className="bg-blue-50 rounded-full p-4 mb-3">
                <CloudUpload className="w-8 h-8 text-blue-500" />
              </div>
              <p className="font-medium text-gray-900 mb-1">
                Tarik & lepas file di sini
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Mendukung PDF, DOCX hingga 15MB
              </p>
              <Button variant="outline" size="sm" className="text-sm">
                Pilih File dari Komputer
              </Button>
            </div>

            {/* AI Options */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-[#0052FF]" />
                OPSI REVIEW AI
              </h3>

              {/* Option 1 */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Nilai skor proposal
                  </p>
                  <p className="text-xs text-gray-500">
                    Analisis potensi keberlanjutan sponsor
                  </p>
                </div>
                <button
                  onClick={() =>
                    setAiOptions((prev) => ({
                      ...prev,
                      proposalScore: !prev.proposalScore,
                    }))
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    aiOptions.proposalScore ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      aiOptions.proposalScore
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Option 2 */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Identifikasi masalah
                  </p>
                  <p className="text-xs text-gray-500">
                    Temukan kekurangan data atau inkonsistensi
                  </p>
                </div>
                <button
                  onClick={() =>
                    setAiOptions((prev) => ({
                      ...prev,
                      identifyIssues: !prev.identifyIssues,
                    }))
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    aiOptions.identifyIssues ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      aiOptions.identifyIssues
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Option 3 */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Cocockan data event
                  </p>
                  <p className="text-xs text-gray-500">
                    Verifikasi kesesuaian dengan target sponsor
                  </p>
                </div>
                <button
                  onClick={() =>
                    setAiOptions((prev) => ({
                      ...prev,
                      matchEventData: !prev.matchEventData,
                    }))
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    aiOptions.matchEventData ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      aiOptions.matchEventData
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <DialogClose asChild>
              <Button variant="outline" className=" px-6 py-2">
                Batal
              </Button>
            </DialogClose>
            <Button className=" bg-blue-600 hover:bg-blue-700 text-white px-6 py-2">
              Upload & Analisis →
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
