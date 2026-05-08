"use client";
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login:", formData);
    // Handle login logic here
  };

  return (
    <div className="flex h-screen">
      {/* Left Side - Blue Section */}
      <div
        className="w-[50%] bg-[#003EC7]/80 text-white bg-cover bg-center overflow-y-auto px-32 py-48"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(0, 62, 199, 0.6), rgba(0, 62, 199, 0.6)), url(/bg-login.png)",
        }}
      >
        <div className="flex flex-col h-full p-12 justify-between">
          {/* Header Section */}
          <div className="space-y-12">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span className="text-[20px] font-bold">EventHub</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
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
          <div className="grid grid-cols-2 gap-8 mb-12">
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
      <div className="px-32 py-16 w-[50%] overflow-y-auto flex flex-col justify-center">
        <div className="max-w-md">
          <p className="text-[28px] font-bold mb-2">Selamat Datang Kembali</p>
          <p className="text-[14px] text-gray-600 mb-8">
            Silakan masukkan detail akun Anda untuk masuk ke dashboard EventHub.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="nama@perusahaan.com"
                className="w-full px-4 py-3 border border-[#E5E7EB] rounded-[8px] focus:outline-none focus:border-[#003EC7] text-sm"
                required
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
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-[#003EC7] text-white font-semibold py-3 rounded-[8px] hover:bg-blue-800 transition"
            >
              Masuk
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

            {/* Register Link */}
            <div className="text-center pt-2">
              <p className="text-sm text-gray-700">
                Belum punya akun?{" "}
                <a
                  href="/register"
                  className="text-[#003EC7] font-semibold hover:underline"
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
