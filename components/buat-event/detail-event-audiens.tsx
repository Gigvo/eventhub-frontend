"use client";
import React, { useState } from "react";
import { X } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export default function DetailEventAudiens() {
  const [formData, setFormData] = useState({
    deskripsiEvent: "",
    estimasiPeserta: 2500,
    targetIndustri: "Pilih Industri Utama",
  });

  const [demografiTags, setDemografiTags] = useState([
    "Gen Z (18-24)",
    "Mahasiswa",
    "Tech Enthusiasts",
  ]);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [channelData, setChannelData] = useState({
    instagram: "@username",
    tiktok: "@username",
    website: "www.event.com",
  });

  const availableDemografi = [
    "Gen Z (18-24)",
    "Mahasiswa",
    "Tech Enthusiasts",
    "Millennials",
    "Professional Muda",
    "Wirausaha",
    "Executives",
    "Entrepreneurs",
  ];

  const removeDemografi = (tag) => {
    setDemografiTags(demografiTags.filter((t) => t !== tag));
  };

  const addDemografi = (tag) => {
    if (!demografiTags.includes(tag)) {
      setDemografiTags([...demografiTags, tag]);
      setIsDropdownOpen(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white py-6 rounded-[8px] shadow-md">
      {/* Header */}
      <div className="mb-8 bg-[#F9FAFB] p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Detail Event & Analisis Audiens
        </h1>
        <p className="text-gray-600">
          Bantu sponsor memahami siapa yang akan hadir di event Anda untuk
          meningkatkan keterkaitan sponsor.
        </p>
      </div>

      {/* Deskripsi Event */}
      <div className="mb-8 px-8">
        <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase">
          Deskripsi Event Lengkap
        </label>
        <textarea
          placeholder="Ceritakan tujuan event, agenda utama, dan apa yang membuat event ini unik..."
          value={formData.deskripsiEvent}
          onChange={(e) =>
            setFormData({ ...formData, deskripsiEvent: e.target.value })
          }
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 resize-none"
        />
        <div className="text-right text-sm text-gray-500 mt-1">
          {formData.deskripsiEvent.length} / 1000
        </div>
      </div>

      {/* Estimasi & Target Sponsor */}
      <div className="flex flex-row items-center gap-6 mb-8 px-8">
        {/* Estimasi Peserta */}
        <div className="flex-1 bg-[#F9FAFB80] p-6 rounded-[8px]">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase">
              Estimasi Peserta
            </label>
            <div className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              {formData.estimasiPeserta.toLocaleString()}
            </div>
          </div>

          <div className="flex flex-col justify-center items-center gap-4">
            <Slider
              min={50}
              max={10000}
              step={50}
              value={[formData.estimasiPeserta]}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  estimasiPeserta: value[0],
                })
              }
              className="flex-1 bg-gray-400"
            />
            <div className="flex items-center justify-between w-full">
              <span className="text-sm text-gray-600 min-w-fit">50</span>
              <span className="text-sm text-gray-600 min-w-fit">5000</span>
              <span className="text-sm text-gray-600 min-w-fit">10.000+</span>
            </div>
          </div>
        </div>

        {/* Target Industri Sponsor */}
        <div className="flex-1 bg-[#F9FAFB80] p-6 rounded-[8px]">
          <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase">
            Target Industri Sponsor
          </label>
          <select
            value={formData.targetIndustri}
            onChange={(e) =>
              setFormData({ ...formData, targetIndustri: e.target.value })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
          >
            <option>Pilih Industri Utama</option>
            <option>Tech & Software</option>
            <option>Finance & Banking</option>
            <option>E-commerce</option>
            <option>Healthcare</option>
            <option>Education</option>
          </select>
        </div>
      </div>

      {/* Target Demografi */}
      <div className="mb-8 px-8">
        <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase">
          Target Demografi
        </label>
        <div className="flex flex-wrap gap-2 mb-4">
          {demografiTags.map((tag) => (
            <div
              key={tag}
              className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
            >
              {tag}
              <button
                onClick={() => removeDemografi(tag)}
                className="hover:text-blue-900 transition"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          {/* Dropdown untuk menambah demografi */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="text-blue-600 font-medium text-sm hover:text-blue-700 transition"
            >
              + Tambah demografi...
            </button>
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-max">
                {availableDemografi
                  .filter((d) => !demografiTags.includes(d))
                  .map((d) => (
                    <button
                      key={d}
                      onClick={() => addDemografi(d)}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm first:rounded-t-lg last:rounded-b-lg"
                    >
                      {d}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">Saran:</span>{" "}
          <a href="#" className="text-blue-600 hover:underline">
            Millennials
          </a>
          ,{" "}
          <a href="#" className="text-blue-600 hover:underline">
            Professional Muda
          </a>
          ,{" "}
          <a href="#" className="text-blue-600 hover:underline">
            Wirausaha
          </a>
        </div>
      </div>

      {/* Kanal Promosi & Media Sosial */}
      <div className="px-8">
        <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase">
          Kanal Promosi & Media Sosial
        </label>
        <div className="grid grid-cols-3 gap-4">
          {/* Instagram */}
          <div className="flex items-center border border-gray-300 rounded-lg">
            <span className="px-4 py-3 bg-gray-100 font-semibold text-gray-700 text-sm">
              IG
            </span>
            <input
              type="text"
              placeholder="@username"
              value={channelData.instagram}
              onChange={(e) =>
                setChannelData({ ...channelData, instagram: e.target.value })
              }
              className="flex-1 px-4 py-3 focus:outline-none"
            />
          </div>

          {/* TikTok */}
          <div className="flex items-center border border-gray-300 rounded-lg">
            <span className="px-4 py-3 bg-gray-100 font-semibold text-gray-700 text-sm">
              TT
            </span>
            <input
              type="text"
              placeholder="@username"
              value={channelData.tiktok}
              onChange={(e) =>
                setChannelData({ ...channelData, tiktok: e.target.value })
              }
              className="flex-1 px-4 py-3 focus:outline-none"
            />
          </div>

          {/* Website */}
          <div className="flex items-center border border-gray-300 rounded-lg">
            <span className="px-4 py-3 bg-gray-100 font-semibold text-gray-700 text-sm">
              🌐
            </span>
            <input
              type="url"
              placeholder="www.event.com"
              value={channelData.website}
              onChange={(e) =>
                setChannelData({ ...channelData, website: e.target.value })
              }
              className="flex-1 px-4 py-3 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
