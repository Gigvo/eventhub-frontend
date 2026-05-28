"use client";
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { apiCall } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      await apiCall("/auth/login", {
        method: "POST",
        body: JSON.stringify({}),
        requireAuth: true,
      });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login gagal");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      await apiCall("/auth/login", {
        method: "POST",
        body: JSON.stringify({}),
        requireAuth: true,
      });
      router.push("/dashboard");
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message || "Login dengan Google gagal");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen lg:h-screen relative w-full flex-col lg:flex-row bg-white">
      <Button
        onClick={() => (window.location.href = "/")}
        variant={"outline"}
        className="absolute top-4 left-4 z-20 bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 shadow-sm"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
      </Button>

      {/* Left Side - Blue Section */}
      <div
        className="hidden lg:block lg:w-1/2 bg-[#003EC7]/80 text-white bg-cover bg-center lg:h-screen lg:overflow-y-auto px-16 xl:px-32 py-24 xl:py-25 relative"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(0, 62, 199, 0.6), rgba(0, 62, 199, 0.6)), url(/bg-login.png)",
        }}
      >
        <div className="flex flex-col h-full justify-between">
          {/* Header Section */}
          <div className="space-y-10">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span className="text-[20px] font-bold">EventHub</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-3">
              <h1 className="text-[32px] font-bold leading-tight">
                Connecting Organizers with Global Sponsors.
              </h1>
              <p className="text-[16px] text-gray-200">
                Elevate your events with high-quality sponsorship matches and
                data-driven proposal management. Trusted by Indonesia&apos;s
                leading event creators.
              </p>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 gap-8 mb-12 mt-8">
            <div className="bg-white/10 backdrop-blur rounded-lg p-6 border-1 border-white/20">
              <p className="text-[24px] font-light mb-2">500+</p>
              <p className="text-xs text-gray-200 uppercase font-semibold">
                Active Sponsors
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-6 border-1 border-white/20">
              <p className="text-[24px] font-light mb-2">Rp 2.4T</p>
              <p className="text-xs text-gray-200 uppercase font-semibold">
                Funds Disbursed
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="px-6 sm:px-16 md:px-32 py-24 w-full lg:w-1/2 min-h-screen lg:h-screen lg:overflow-y-auto flex flex-col justify-center bg-white">
        <div className="max-w-md">
          <p className="text-[28px] font-bold mb-2">Selamat Datang Kembali</p>
          <p className="text-[14px] text-gray-600 mb-8">
            Silakan masukkan detail akun Anda untuk masuk ke dashboard EventHub.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[8px] text-sm">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="text-[12px] font-semibold text-gray-700 block mb-2">
                ALAMAT EMAIL
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="nama@gmail.com"
                className="w-full px-4 py-3 border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:border-[#003EC7] text-sm"
                required
                disabled={isLoading}
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[12px] font-semibold text-gray-700 block">
                  PASSWORD
                </label>
                <a
                  href="#"
                  className="text-[12px] text-[#003EC7] font-semibold hover:underline"
                >
                  Lupa password?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:border-[#003EC7] text-sm pr-10"
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

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#003EC7] text-white font-semibold py-3 rounded-[8px] hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Sedang masuk..." : "Masuk"}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-gray-500 text-sm">ATAU</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            {/* Google Login */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full border border-gray-300 py-3 rounded-[8px] flex items-center justify-center gap-3 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Image
                src="/icons/google.svg"
                alt="Google"
                width={20}
                height={20}
              />
              <span className="text-sm font-medium">Masuk dengan Google</span>
            </button>

            {/* Register Link */}
            <div className="text-center pt-2">
              <p className="text-sm text-gray-700">
                Belum punya akun?{" "}
                <a
                  href={isLoading ? "#" : "/register"}
                  className="text-[#003EC7] font-semibold hover:underline"
                  onClick={(e) => isLoading && e.preventDefault()}
                >
                  Daftar sekarang
                </a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
