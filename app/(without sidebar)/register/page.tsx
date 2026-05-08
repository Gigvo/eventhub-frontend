"use client";
import React, { useState } from "react";
import { BadgeCheck } from "lucide-react";
import Image from "next/image";

export default function Register() {
  const [userRole, setUserRole] = useState<"organizer" | "sponsor" | null>(
    null,
  );
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    whatsapp: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Register:", { userRole, ...formData });
    // Handle registration logic here
  };
  return (
    <div className="flex h-full">
      <div
        className="w-[50%] bg-[#003EC7] text-white bg-cover bg-center overflow-y-auto"
        style={{ backgroundImage: "url(/bg-register.png)" }}
      >
        <div className="flex flex-col h-full p-12 justify-between">
          {/* Header Section */}
          <div className="space-y-8">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Image
                src="/icons/net.svg"
                alt="EventHub Logo"
                width={32}
                height={32}
              />
              <span className="text-2xl font-bold">EventHub</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-[24px] font-semibold leading-tight">
                Jembatan Kolaborasi Organizer & Sponsor Indonesia.
              </h1>
            </div>

            {/* Features */}
            <div className="space-y-6 mt-8 max-w-md">
              {/* Feature 1 */}
              <div className="flex gap-4">
                <BadgeCheck className="w-10 h-7" />
                <div>
                  <h3 className="font-semibold text-[18px]">
                    Matching AI Presisi
                  </h3>
                  <p className="text-sm text-gray-200 mt-1">
                    Temukan partner sponsor yang paling relevan dengan profil
                    audiens event Anda melalui algoritma cerdas.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex gap-4">
                <Image
                  src="/icons/graph.svg"
                  alt="Feature 2"
                  width={24}
                  height={28}
                />
                <div>
                  <h3 className="font-semibold text-[18px]">
                    Dashboard Terpusat
                  </h3>
                  <p className="text-sm text-gray-200 mt-1">
                    Kelola puluhan proposal dan status kerja sama dalam satu
                    tampilan bersih ala productivity tools modern.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex gap-4">
                <Image
                  src="/icons/shield.svg"
                  alt="Feature 3"
                  width={24}
                  height={28}
                />
                <div>
                  <h3 className="font-semibold text-[18px]">
                    Keamanan Transaksi
                  </h3>
                  <p className="text-sm text-gray-200 mt-1">
                    Sistem kontrak digital dan verifikasi profil untuk menjamin
                    transparansi di setiap kesepakatan.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-xs text-[#DDE1FF99] ">
            © 2026 EventHub. Built for high-utility event sponsorship.
          </div>
        </div>
      </div>
      <div className="px-32 py-16 w-[50%] overflow-y-auto">
        <p className="text-[32px] font-bold mb-2">Buat Akun EventHub</p>
        <p className="text-[14px] text-gray-600 mb-8">
          Bergabunglah dengan platform event pertama di Indonesia
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection */}
          <div>
            <p className="text-[12px] font-semibold text-[#737688] mb-3">
              PILIH PERAN ANDA
            </p>
            <div className="flex flex-row items-center gap-4">
              <button
                type="button"
                onClick={() => setUserRole("organizer")}
                className={`flex-1 rounded-[8px] border-2 flex flex-col items-center justify-center py-4 px-10 gap-1.5 transition ${
                  userRole === "organizer"
                    ? "border-[#003EC7] bg-blue-50"
                    : "border-[#E5E7EB] hover:border-gray-300"
                }`}
              >
                <Image
                  src="/icons/calendar.svg"
                  alt="Organizer"
                  width={24}
                  height={28}
                />
                <p className="text-xs text-center font-semibold">
                  Saya Event Organizer
                </p>
              </button>
              <button
                type="button"
                onClick={() => setUserRole("sponsor")}
                className={`flex-1 rounded-[8px] border-2 flex flex-col items-center justify-center py-4 px-10 gap-1.5 transition ${
                  userRole === "sponsor"
                    ? "border-[#003EC7] bg-blue-50"
                    : "border-[#E5E7EB] hover:border-gray-300"
                }`}
              >
                <Image
                  src="/icons/building.svg"
                  alt="Perusahaan"
                  width={24}
                  height={28}
                />
                <p className="text-xs text-center font-semibold">
                  Saya Perusahaan/Sponsor
                </p>
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="text-[12px] font-semibold text-gray-700 block mb-2">
                Nama Lengkap
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Budi Santoso"
                className="w-full px-4 py-3 border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:border-[#003EC7] text-sm"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-[12px] font-semibold text-gray-700 block mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="budi@email.com"
                className="w-full px-4 py-3 border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:border-[#003EC7] text-sm"
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label className="text-[12px] font-semibold text-gray-700 block mb-2">
                Nomor WhatsApp
              </label>
              <input
                type="tel"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleInputChange}
                placeholder="+62 8123456789"
                className="w-full px-4 py-3 border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:border-[#003EC7] text-sm"
              />
            </div>

            {/* Password Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] font-semibold text-gray-700 block mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:border-[#003EC7] text-sm"
                />
              </div>
              <div>
                <label className="text-[12px] font-semibold text-gray-700 block mb-2">
                  Konfirmasi Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:border-[#003EC7] text-sm"
                />
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                className="mt-1 w-4 h-4 accent-[#003EC7] cursor-pointer rounded"
              />
              <label className="text-[12px] text-gray-700 cursor-pointer">
                Saya setuju dengan{" "}
                <a
                  href="#"
                  className="text-[#003EC7] font-semibold hover:underline"
                >
                  Syarat & Ketentuan
                </a>{" "}
                serta{" "}
                <a
                  href="#"
                  className="text-[#003EC7] font-semibold hover:underline"
                >
                  Kebijakan Privasi
                </a>{" "}
                yang berlaku.
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!userRole || !formData.agreeToTerms}
            className="w-full bg-[#003EC7] text-white font-semibold py-3 rounded-[8px] hover:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            Buat Akun
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-500 text-sm">ATAU</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Google Sign Up */}
          <button
            type="button"
            className="w-full border border-gray-300 py-3 rounded-[8px] flex items-center justify-center gap-3 hover:bg-gray-50 transition"
          >
            <Image
              src="/icons/google.svg"
              alt="Google"
              width={20}
              height={20}
            />
            <span className="text-sm font-medium">Daftar dengan Google</span>
          </button>

          {/* Sign In Link */}
          <div className="text-center pt-2">
            <p className="text-sm text-gray-700">
              Sudah punya akun?{" "}
              <a
                href="#"
                className="text-[#003EC7] font-semibold hover:underline"
              >
                Masuk di sini
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
