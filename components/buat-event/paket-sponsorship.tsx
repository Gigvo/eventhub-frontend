import React, { useState } from "react";
import { X, Plus, Lock, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";

export default function PaketSponsorship() {
  const [totalBudget, setTotalBudget] = useState("250.000.000");
  const [packages, setPackages] = useState([
    {
      id: 1,
      name: "Paket Gold",
      price: "100.000.000",
      benefits: ["Booth 3x3 Utama", "Logo di Backdrop"],
    },
    {
      id: 2,
      name: "Paket Silver",
      price: "50.000.000",
      benefits: ["Logo Medium", "Booth 2x2"],
    },
  ]);

  const [contactInfo, setContactInfo] = useState({
    nama: "Contoh: Budi Santoso",
    whatsapp: "0812XXXXXXXX",
  });

  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  const availableBenefits = [
    "Booth 3x3 Utama",
    "Logo di Backdrop",
    "Add Mention MC",
  ];

  const removeBenefit = (packageId, benefit) => {
    const updatedPackages = packages.map((p) =>
      p.id === packageId
        ? { ...p, benefits: p.benefits.filter((b) => b !== benefit) }
        : p,
    );
    setPackages(updatedPackages);
  };

  const addBenefit = (packageId, benefit) => {
    const pkg = packages.find((p) => p.id === packageId);
    if (pkg && !pkg.benefits.includes(benefit)) {
      const updatedPackages = packages.map((p) =>
        p.id === packageId ? { ...p, benefits: [...p.benefits, benefit] } : p,
      );
      setPackages(updatedPackages);
      setOpenDropdown(null);
    }
  };

  const router = useRouter();

  return (
    <div className="flex gap-6 max-w-7xl mx-auto">
      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Paket Sponsorship
          </h1>
          <p className="text-gray-500">
            Lengkapi detail sponsorship untuk mendapatkan mitra terbaik.
          </p>
        </div>

        {/* Target Pendanaan */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Target Pendanaan
          </h2>
          <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">
            Total Budget Sponsor
          </label>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <span className="px-4 py-3 bg-gray-50 text-gray-700 font-medium text-sm">
                  IDR
                </span>
                <input
                  type="text"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(e.target.value)}
                  className="flex-1 px-4 py-3 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex">
              <span className="px-3 py-2 bg-[#E5E7EB] text-[#891E00] text-xs font-semibold rounded-[12px] border border-[#BF300333] flex items-center gap-1">
                <Image
                  src="/icons/growth.svg"
                  alt="growth"
                  width={14}
                  height={16}
                />
                HIGH TIER
              </span>
            </div>
          </div>
        </div>

        {/* Paket Sponsorship */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Paket Sponsorship
            </h2>
            <button className="text-blue-600 font-medium text-sm hover:text-blue-700 flex items-center gap-2">
              <Plus size={16} />
              Tambah Paket
            </button>
          </div>

          {/* Packages */}
          {packages.map((pkg) => {
            const isSilver = pkg.id === 2;

            // Render Paket Silver with simplified view
            if (isSilver) {
              return (
                <div
                  key={pkg.id}
                  className="mb-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <Image
                      src={"/icons/award-grey.svg"}
                      alt="award-blue"
                      width={24}
                      height={28}
                    />
                    <h3 className="text-sm font-semibold text-gray-900">
                      {pkg.name}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {/* Harga Paket */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">
                        Harga Paket
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <span className="px-4 py-3 bg-gray-50 text-gray-700 font-medium text-sm">
                          IDR
                        </span>
                        <input
                          type="text"
                          value={pkg.price}
                          onChange={(e) => {
                            const updatedPackages = packages.map((p) =>
                              p.id === pkg.id
                                ? { ...p, price: e.target.value }
                                : p,
                            );
                            setPackages(updatedPackages);
                          }}
                          className="flex-1 px-4 py-3 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Benefits - Read Only */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">
                        Benefit
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {pkg.benefits.map((benefit) => (
                          <span
                            key={benefit}
                            className="inline-flex items-center px-3 py-1 bg-gray-200 text-gray-600 text-sm rounded-full"
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // Render other packages with editable benefits
            return (
              <div
                key={pkg.id}
                className="mb-6 bg-white rounded-lg border border-gray-200 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-4 bg-[#003EC70D] px-6 py-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Image
                      src={"/icons/award-blue.svg"}
                      alt="award-blue"
                      width={24}
                      height={28}
                    />
                  </div>
                  {/* <h3 className="text-sm font-semibold text-gray-900">
                    {pkg.name}
                  </h3> */}
                  <div className="flex items-center gap-2  font-medium text-[18px] text-semibold">
                    <Plus size={16} />
                    Add Mention MC
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 p-6">
                  {/* Harga Paket */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">
                      Harga Paket
                    </label>
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <span className="px-4 py-3 bg-gray-50 text-gray-700 font-medium text-sm">
                        IDR
                      </span>
                      <input
                        type="text"
                        value={pkg.price}
                        onChange={(e) => {
                          const updatedPackages = packages.map((p) =>
                            p.id === pkg.id
                              ? { ...p, price: e.target.value }
                              : p,
                          );
                          setPackages(updatedPackages);
                        }}
                        className="flex-1 px-4 py-3 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Benefits - Editable with dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">
                      Benefit
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {pkg.benefits.map((benefit) => (
                        <div
                          key={benefit}
                          className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {benefit}
                          <button
                            onClick={() => removeBenefit(pkg.id, benefit)}
                            className="hover:text-blue-900 transition"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add Benefit Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenDropdown(
                            openDropdown === pkg.id ? null : pkg.id,
                          )
                        }
                        className="text-blue-600 font-medium text-sm hover:text-blue-700 transition"
                      >
                        + Tambah benefit...
                      </button>
                      {openDropdown === pkg.id && (
                        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-max">
                          {availableBenefits
                            .filter((b) => !pkg.benefits.includes(b))
                            .map((benefit) => (
                              <button
                                key={benefit}
                                onClick={() => addBenefit(pkg.id, benefit)}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm first:rounded-t-lg last:rounded-b-lg"
                              >
                                {benefit}
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Kontak Person EO */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Kontak Person EO
          </h2>

          <div className="grid grid-cols-2 gap-6">
            {/* Nama Lengkap */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={contactInfo.nama}
                onChange={(e) =>
                  setContactInfo({ ...contactInfo, nama: e.target.value })
                }
                placeholder="Contoh: Budi Santoso"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>

            {/* WhatsApp Number */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">
                WhatsApp Number
              </label>
              <input
                type="text"
                value={contactInfo.whatsapp}
                onChange={(e) =>
                  setContactInfo({ ...contactInfo, whatsapp: e.target.value })
                }
                placeholder="0812XXXXXXXX"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
          <div className="w-full bg-[#2563EB] text-white  px-6 py-8 rounded-lg flex items-center justify-center gap-4 mb-6 transition mt-4">
            <div className="px-2 py-3 bg-white/20 rounded-[4px]">
              <Lock size={28} />
            </div>
            <div>
              <p className="font-semibold text-[18px]">Gated Contact Info</p>
              <p className="text-sm">
                Informasi kontak Anda akan disembunyikan dan hanya dapat dilihat
                oleh sponsor yang memberikan penawaran atau disetujui melalui
                sistem kami.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - AI Proposal Preview */}
      <div className="w-80">
        <div className="sticky top-6">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Preview Image */}
            <div
              className="relative h-40 bg-cover bg-center"
              style={{ backgroundImage: "url('/jakarta-tech.png')" }}
            >
              <div className="absolute inset-0"></div>
              <div className="absolute bottom-3 left-3 bg-[#0052FF] text-white text-xs font-bold px-2 py-1 rounded ">
                PROPOSAL DRAFT
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                Jakarta Tech Future 2024
              </h3>

              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <span>📅 12 Des 2024</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <span>💰 IDR 250jt Budget</span>
              </div>

              {/* Tier Badges */}
              <div className="flex gap-2 mb-6">
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                  GOLD
                </span>
                <span className="px-3 py-1 bg-gray-200 text-gray-800 text-xs font-semibold rounded-full">
                  SILVER
                </span>
                <span className="px-3 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full">
                  BRONZE
                </span>
              </div>

              {/* Review Card */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <div className="flex flex-col items-center gap-2 mb-2 ">
                  <Image
                    src="/icons/graph-grey.svg"
                    alt="Proposal Builder"
                    width={24}
                    height={28}
                  />
                  <span className="font-semibold text-gray-900 text-sm text-center">
                    Proposal Builder & Smart Review
                  </span>
                </div>
                <p className="text-xs text-gray-600 text-center">
                  Skor review akan muncul untuk proposal terbaik
                </p>
              </div>

              {/* Action Button */}
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition mb-4">
                Simpan & Lanjutkan
              </button>
            </div>
          </div>
          <Button
            onClick={() => router.push("/buat-event/detail-event-audiens")}
            className="px-6 py-2  rounded-lg hover:bg-gray-50 mt-4 cursor-pointer"
            variant={"ghost"}
          >
            <ArrowLeft size={18} className="inline mr-2" />
            Kembali
          </Button>
        </div>
      </div>
    </div>
  );
}
