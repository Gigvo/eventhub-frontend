"use client";
import React, { useState } from "react";
import { BadgeCheck, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
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
      // Create Firebase account only
      await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password,
      );

      // Store name so onboarding can include it in POST /auth/register
      sessionStorage.setItem("pendingFullName", formData.fullName);

      // Redirect to onboarding for role selection and profile completion
      router.push("/onboarding");
    } catch (err: any) {
      console.error("Registration error:", err);

      // Handle Firebase-specific errors
      if (err.code === "auth/email-already-in-use") {
        setError("Email sudah terdaftar");
      } else if (err.code === "auth/weak-password") {
        setError("Password terlalu lemah");
      } else {
        setError(err.message || "Registrasi gagal");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      // Store display name so onboarding can use it
      sessionStorage.setItem("pendingFullName", result.user.displayName ?? "");
      router.push("/onboarding");
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message || "Daftar dengan Google gagal");
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex h-full">
      <div
        className="w-[50%] bg-[#003EC7] text-white bg-cover bg-center overflow-y-auto h-full min-h-screen"
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

            {/* Password Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[12px] font-semibold text-gray-700 block mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:border-[#003EC7] text-sm"
                    required
                    disabled={isLoading}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[12px] font-semibold text-gray-700 block mb-2">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:border-[#003EC7] text-sm"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
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
            disabled={!formData.agreeToTerms || isLoading}
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
            onClick={handleGoogleRegister}
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
