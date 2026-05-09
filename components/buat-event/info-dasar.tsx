"use client";
import React, { useState, useRef } from "react";
import { Upload, Info, MapPin, Video } from "lucide-react";
import Image from "next/image";

export default function InfoDasar() {
  const [formData, setFormData] = useState({
    namaEvent: "",
    tanggalMulai: "",
    waktuMulai: "",
    tanggalSelesai: "",
    waktuSelesai: "",
    formatEvent: "",
    kota: "",
    kategoriEvent: "",
    alamatEvent: "",
  });

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>("");
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (files: FileList) => {
    const file = files[0];
    if (
      file &&
      (file.type.startsWith("image/") || file.type === "application/pdf")
    ) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setBannerPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files) {
      handleFileChange(e.dataTransfer.files);
    }
  };

  return (
    <div className="max-w-272 mx-auto bg-gray-50 p-8">
      <h1 className="text-[32px] font-bold mb-8">Buat Event Baru</h1>

      <div className="grid grid-cols-3 gap-8">
        {/* Left Section - Form */}
        <div className="col-span-2 space-y-6 p-8 rounded-[8px] border border-[#E5E7EB] bg-white shadow-sm">
          {/* Nama Event */}
          <div>
            <label className="text-[12px] font-semibold text-gray-700 block mb-2 uppercase">
              Nama Event
            </label>
            <input
              type="text"
              name="namaEvent"
              value={formData.namaEvent}
              onChange={handleInputChange}
              placeholder="Contoh: Nesco 2026"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 text-sm"
            />
          </div>

          {/* Tanggal & Waktu */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] font-semibold text-gray-700 block mb-2 uppercase">
                Tanggal & Waktu Mulai
              </label>
              <input
                type="datetime-local"
                name="tanggalMulai"
                value={formData.tanggalMulai}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 text-sm"
              />
            </div>
            <div>
              <label className="text-[12px] font-semibold text-gray-700 block mb-2 uppercase">
                Tanggal & Waktu Selesai
              </label>
              <input
                type="datetime-local"
                name="tanggalSelesai"
                value={formData.tanggalSelesai}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 text-sm"
              />
            </div>
          </div>

          {/* Format Event */}
          <div>
            <label className="text-[12px] font-semibold text-gray-700 block mb-3 uppercase">
              Format Event
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  value: "offline",
                  label: "Offline",
                  description: "Tatap Muka Langsung",
                  icon: MapPin,
                  iconType: "lucide",
                },
                {
                  value: "online",
                  label: "Online",
                  description: "Video Conference",
                  icon: Video,
                  iconType: "lucide",
                },
                {
                  value: "hybrid",
                  label: "Hybrid",
                  description: "Kombinasi Keduanya",
                  icon: "/icons/hybrid.svg",
                  iconType: "svg",
                },
              ].map((format) => {
                const IconComponent = format.icon;
                return (
                  <button
                    key={format.value}
                    onClick={() =>
                      setFormData({ ...formData, formatEvent: format.value })
                    }
                    className={`p-4 border-2 rounded-lg text-center transition ${
                      formData.formatEvent === format.value
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div className="flex justify-center mb-2">
                      {format.iconType === "svg" ? (
                        <Image
                          src={format.icon as string}
                          alt={format.label}
                          width={24}
                          height={24}
                        />
                      ) : (
                        <IconComponent size={24} className="text-[#9CA3AF]" />
                      )}
                    </div>
                    <p className="font-semibold text-sm">{format.label}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {format.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kota & Kategori */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] font-semibold text-gray-700 block mb-2 uppercase">
                Kota
              </label>
              <select
                name="kota"
                value={formData.kota}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 text-sm bg-white"
              >
                <option value="">Pilih Kota</option>
                <option value="jakarta">Jakarta</option>
                <option value="bandung">Bandung</option>
                <option value="surabaya">Surabaya</option>
              </select>
            </div>
            <div>
              <label className="text-[12px] font-semibold text-gray-700 block mb-2 uppercase">
                Kategori Event
              </label>
              <select
                name="kategoriEvent"
                value={formData.kategoriEvent}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 text-sm bg-white"
              >
                <option value="">Pilih Kategori</option>
                <option value="tech">Tech</option>
                <option value="bisnis">Bisnis</option>
                <option value="kreatif">Kreatif</option>
              </select>
            </div>
          </div>

          {/* Alamat Event */}
          <div>
            <label className="text-[12px] font-semibold text-gray-700 block mb-2 uppercase">
              Alamat Event
            </label>
            <textarea
              name="alamatEvent"
              value={formData.alamatEvent}
              onChange={handleInputChange}
              placeholder="Masukkan nama tempat atau alamat lengkap"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 text-sm"
            />
          </div>
        </div>

        {/* Right Section - Banner Upload & Tips */}
        <div className="space-y-6 ">
          {/* Banner Upload */}
          <div className="p-8 rounded-[8px] border border-[#E5E7EB] bg-white shadow-sm">
            <div>
              <label className="text-[12px] font-semibold text-gray-700 block mb-2 uppercase">
                Banner Event
              </label>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
                  isDragActive
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                } ${bannerPreview ? "" : "min-h-60"}`}
              >
                {bannerPreview ? (
                  <div className="relative">
                    <Image
                      src={bannerPreview}
                      alt="Banner preview"
                      className="max-h-48 mx-auto rounded-lg"
                    />
                    <button
                      onClick={() => {
                        setBannerFile(null);
                        setBannerPreview("");
                      }}
                      className="mt-2 text-sm text-red-600 hover:text-red-800"
                    >
                      Hapus
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="mx-auto mb-2 text-blue-600" size={40} />
                    <p className="font-semibold text-gray-900 mb-1">
                      Klik untuk unggah banner
                    </p>
                    <p className="text-xs text-gray-600 mb-2">
                      Rekomendasi ukuran: 1200 × 630 px
                    </p>
                    <p className="text-xs text-gray-600">Maks. 5MB</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) =>
                    e.target.files && handleFileChange(e.target.files)
                  }
                  accept="image/*,.pdf"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 w-full"
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <div className="flex gap-2 items-start">
                <div className="flex-shrink-0">
                  <Info className="w-[16px] h-[16px] text-[#2563EB]" />
                </div>
                <p className="text-xs text-blue-800 font-semibold">
                  Banner yang menarik dapat meningkatkan komunikasi dan
                  menciptakan sponsor hingga 40%.
                </p>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="p-8 rounded-[8px] border border-[#E5E7EB] bg-white shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Image
                src={"/icons/lightbulb.svg"}
                alt="lightbulb"
                width={24}
                height={28}
              />

              <p className="text-[18px] font-semibold">Tips EO Berhasil</p>
            </div>

            <ul className="space-y-2 text-xs text-[#4B5563]">
              <li>
                • Pastikan Nama Event jelas dan mudah diingat oleh calon
                sponsor.
              </li>
              <li>
                • Pilih kategori yang paling relevan agar algoritma AI kami
                bekerja optimal.
              </li>
              <li>
                • Tentukan venue yang memiliki aksesibilitas baik untuk profil
                audiens Anda.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
