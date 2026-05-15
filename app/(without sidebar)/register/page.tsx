"use client";
import React, { useState } from "react";
import { BadgeCheck } from "lucide-react";
import Image from "next/image";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { apiCall } from "@/lib/api-client";
import { useRouter } from "next/navigation";

export default function Register() {
  const [userRole, setUserRole] = useState<"organizer" | "sponsor" | null>(
    null,
  );
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    whatsapp: "",
    city: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    // EO fields
    organizationName: "",
    organizationType: "",
    campus: "",
    description: "",
    // Company fields
    companyName: "",
    industry: "",
    website: "",
    targetAudience: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Password tidak cocok");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Create Firebase account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password,
      );

      // 2. Prepare profile based on role
      const profile =
        userRole === "organizer"
          ? {
              organizationName: formData.organizationName,
              organizationType: formData.organizationType,
              campus: formData.campus,
              phoneNumber: formData.whatsapp,
              city: formData.city,
              description: formData.description,
            }
          : {
              companyName: formData.companyName,
              industry: formData.industry,
              website: formData.website,
              phoneNumber: formData.whatsapp,
              city: formData.city,
              description: formData.description,
              targetAudience: formData.targetAudience,
            };

      // 3. Register in backend
      await apiCall("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          role: userRole === "organizer" ? "EO" : "COMPANY",
          name: formData.fullName,
          profile,
        }),
        requireAuth: true,
      });

      // 4. Redirect to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Registration error:", err);
      console.error("Error response:", err.response);

      // Try to get more detailed error info
      const errorMessage = err.message || "Registrasi gagal";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
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
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[8px] text-sm">
              {error}
            </div>
          )}

          {/* Role Selection */}
          <div>
            <p className="text-[12px] font-semibold text-[#737688] mb-3">
              PILIH PERAN ANDA
            </p>
            <div className="flex flex-row items-center gap-4">
              <button
                type="button"
                onClick={() => setUserRole("organizer")}
                disabled={isLoading}
                className={`flex-1 rounded-[8px] border-2 flex flex-col items-center justify-center py-4 px-10 gap-1.5 transition disabled:opacity-50 disabled:cursor-not-allowed ${
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
                disabled={isLoading}
                className={`flex-1 rounded-[8px] border-2 flex flex-col items-center justify-center py-4 px-10 gap-1.5 transition disabled:opacity-50 disabled:cursor-not-allowed ${
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
                required
                disabled={isLoading}
              />
            </div>

            {/* Role-Specific Fields */}
            {userRole === "organizer" && (
              <>
                {/* Organization Name */}
                <div>
                  <label className="text-[12px] font-semibold text-gray-700 block mb-2">
                    Nama Organisasi
                  </label>
                  <input
                    type="text"
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleInputChange}
                    placeholder="BEM Fakultas Teknik"
                    className="w-full px-4 py-3 border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:border-[#003EC7] text-sm"
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Organization Type */}
                <div>
                  <label className="text-[12px] font-semibold text-gray-700 block mb-2">
                    Jenis Organisasi
                  </label>
                  <select
                    name="organizationType"
                    value={formData.organizationType}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        organizationType: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:border-[#003EC7] text-sm bg-white"
                    required
                    disabled={isLoading}
                  >
                    <option value="">Pilih jenis organisasi</option>
                    <option value="BEM">BEM</option>
                    <option value="HIMA">HIMA</option>
                    <option value="UKM">UKM</option>
                    <option value="COMMUNITY">Komunitas</option>
                    <option value="OTHER">Lainnya</option>
                  </select>
                </div>

                {/* Campus */}
                <div>
                  <label className="text-[12px] font-semibold text-gray-700 block mb-2">
                    Kampus/Universitas
                  </label>
                  <input
                    type="text"
                    name="campus"
                    value={formData.campus}
                    onChange={handleInputChange}
                    placeholder="Universitas Gadjah Mada"
                    className="w-full px-4 py-3 border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:border-[#003EC7] text-sm"
                    required
                    disabled={isLoading}
                  />
                </div>
              </>
            )}

            {userRole === "sponsor" && (
              <>
                {/* Company Name */}
                <div>
                  <label className="text-[12px] font-semibold text-gray-700 block mb-2">
                    Nama Perusahaan
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="PT Teknologi Maju"
                    className="w-full px-4 py-3 border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:border-[#003EC7] text-sm"
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Industry */}
                <div>
                  <label className="text-[12px] font-semibold text-gray-700 block mb-2">
                    Industri
                  </label>
                  <input
                    type="text"
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                    placeholder="Technology"
                    className="w-full px-4 py-3 border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:border-[#003EC7] text-sm"
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Website */}
                <div>
                  <label className="text-[12px] font-semibold text-gray-700 block mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://company.com"
                    className="w-full px-4 py-3 border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:border-[#003EC7] text-sm"
                    disabled={isLoading}
                  />
                </div>

                {/* Target Audience */}
                <div>
                  <label className="text-[12px] font-semibold text-gray-700 block mb-2">
                    Target Audiens
                  </label>
                  <input
                    type="text"
                    name="targetAudience"
                    value={formData.targetAudience}
                    onChange={handleInputChange}
                    placeholder="Mahasiswa dan profesional muda"
                    className="w-full px-4 py-3 border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:border-[#003EC7] text-sm"
                    required
                    disabled={isLoading}
                  />
                </div>
              </>
            )}

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
                required
                disabled={isLoading}
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
                required
                disabled={isLoading}
              />
            </div>

            {/* City */}
            <div>
              <label className="text-[12px] font-semibold text-gray-700 block mb-2">
                Kota
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Jakarta"
                className="w-full px-4 py-3 border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:border-[#003EC7] text-sm"
                required
                disabled={isLoading}
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-[12px] font-semibold text-gray-700 block mb-2">
                Deskripsi
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Ceritakan tentang organisasi/perusahaan Anda"
                className="w-full px-4 py-3 border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:border-[#003EC7] text-sm h-24 resize-none"
                disabled={isLoading}
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
                  required
                  disabled={isLoading}
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
                  required
                  disabled={isLoading}
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
                disabled={isLoading}
                required
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
            disabled={!userRole || !formData.agreeToTerms || isLoading}
            className="w-full bg-[#003EC7] text-white font-semibold py-3 rounded-[8px] hover:bg-blue-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
          >
            {isLoading ? "Sedang membuat akun..." : "Buat Akun"}
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
            disabled={isLoading}
            className="w-full border border-gray-300 py-3 rounded-[8px] flex items-center justify-center gap-3 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                href={isLoading ? "#" : "/login"}
                className="text-[#003EC7] font-semibold hover:underline"
                onClick={(e) => isLoading && e.preventDefault()}
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
