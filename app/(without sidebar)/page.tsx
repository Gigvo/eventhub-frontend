import Image from "next/image";
import NavbarLanding from "@/components/landing/navbar-landing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, FileUp, Handshake } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Marquee from "@/components/landing/marquee/marquee";

const BRANDS = ["SAMSUNG", "TOKOPEDIA", "TELKOMSEL", "TRAVELOKA", "GRAB"];

export default function Home() {
  return (
    <>
      <NavbarLanding />
      <section className="flex items-center justify-center gap-16 max-w-7xl mx-auto">
        <div className="flex-1">
          <Badge className="font-inter text-[#4A72FF] bg-[#EEF2FF] hover:bg-[#EEF2FF] border-none px-4 py-2 rounded-full mb-8 flex items-center w-fit gap-2 font-bold tracking-wide text-xs">
            <Sparkles className="w-4 h-4" />
            DI PERCAYA 500+ EO DI INDONESIA
          </Badge>

          <h1 className="text-[64px] leading-[1.05] font-[900] tracking-tight text-[#111827] mb-6 font-inter">
            Temukan <br />
            Sponsorship yang <br />
            <span className="text-[#4A72FF]">Tepat Sasaran,</span>
          </h1>

          <p className="text-[17px] leading-relaxed text-[#6B7280] max-w-110 mr-11 mb-12">
            Hubungkan eventmu dengan ratusan perusahaan sponsor yang tepat
            otomatis, cerdas, tanpa cold pitching.
          </p>

          <div className="flex items-center gap-4 mb-16">
            <Button
              className="bg-[#2563EB] hover:bg-[#3b5bdb] text-white px-8 py-4 text-[16px] rounded-[12px] font-semibold h-auto"
              style={{
                boxShadow:
                  "0px 4px 6px -4px #2563EB33, 0px 10px 15px -3px #2563EB33",
              }}
            >
              Daftar sebagai EO
            </Button>
            <Button
              variant="outline"
              className="px-8 py-4 text-[16px] rounded-[12px] font-semibold border-[#E5E7EB] text-[#111827] hover:bg-gray-50 h-auto bg-white"
            >
              Daftar sebagai Perusahaan
            </Button>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-gray-200/60 w-fit pr-8">
            <div className="flex -space-x-3">
              <div className="w-11 h-11 rounded-full border-[3px] border-white bg-gray-200 overflow-hidden relative"></div>
              <div className="w-11 h-11 rounded-full border-[3px] border-white bg-gray-300 overflow-hidden relative"></div>
              <div className="w-11 h-11 rounded-full border-[3px] border-white bg-gray-400 overflow-hidden relative"></div>
            </div>
            <p className="text-[14px] text-[#6B7280] font-medium">
              Dipercaya oleh 500+ Event Organizer & Brand
            </p>
          </div>
        </div>
        <div className="relative w-full h-[900px] flex-1">
          <Image
            src={"/hero-image.webp"}
            alt="hero-image"
            fill
            className="object-contain"
          ></Image>
        </div>
      </section>
      {/* Marquee */}
      <Marquee>
        {BRANDS.map((brand) => (
          <div key={brand} className="text-[20px] p-4 font-bold text-gray-300">
            {brand}
          </div>
        ))}
      </Marquee>
      <section className="flex flex-col items-center max-w-7xl mx-auto">
        <div className="text-center">
          <p className="font-extrabold text-[30px]">
            Dari Upload Event ke Deal Sponsor, Semua di Satu Tempat
          </p>
          <p className="text-[#6B7280] text-[15px]">
            Tidak ada lagi email yang tidak dibalas. Tidak ada lagi proposal
            yang salah sasaran.
          </p>
        </div>
        <Tabs
          defaultValue="eo"
          className="mt-4 flex flex-col items-center gap-16"
        >
          <TabsList className="p-1">
            <TabsTrigger
              value="eo"
              className="px-6 py-2 font-inter font-semibold text-[14px]"
            >
              UNTUK EO
            </TabsTrigger>
            <TabsTrigger
              value="perusahaan"
              className="px-6 py-2 font-inter font-semibold text-[14px]"
            >
              UNTUK PERUSAHAAN
            </TabsTrigger>
          </TabsList>
          <TabsContent value="eo">
            <div className="flex flex-row items-center gap-8 py-8">
              <div className="flex-1 p-6 rounded-lg bg-gray-50">
                <div className="flex items-start justify-between mb-4">
                  <FileUp className="w-8 h-8 text-[#4A72FF]" />
                  <span className="text-[40px] font-[900] text-gray-200">
                    01
                  </span>
                </div>
                <h3 className="text-[18px] font-bold text-[#111827] mb-2">
                  Buat Event dalam 5 Menit
                </h3>
                <p className="text-[14px] text-[#6B7280]">
                  Isi nama event, target audiens, kebutuhan budget, dan paket
                  sponsor. Tidak perlu desain atau template.
                </p>
              </div>

              <div className="flex-1 p-6 rounded-[20px] bg-white border-2 border-[#4A72FF]">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#4A72FF] flex items-center justify-center">
                    <Image
                      src={"/icons/net.svg"}
                      alt="net"
                      width={6}
                      height={6}
                      className="w-6 h-6 text-white"
                    />
                  </div>
                  <span className="text-[40px] font-[900] text-gray-200">
                    02
                  </span>
                </div>
                <h3 className="text-[18px] font-bold text-[#111827] mb-2">
                  Smart Matching
                </h3>
                <p className="text-[14px] text-[#4A72FF] font-semibold mb-1">
                  Langgkai ini otomatis dilakukan AI
                </p>
                <p className="text-[14px] text-[#6B7280]">
                  Algoritma kami mencocokkan eventmu dengan perusahaan yang
                  memiliki target audiens serupa. Akurasi hingga 94%.
                </p>
              </div>

              <div className="flex-1 p-6 rounded-lg bg-gray-50">
                <div className="flex items-start justify-between mb-4">
                  <Handshake className="w-8 h-8 text-[#4A72FF]" />
                  <span className="text-[40px] font-[900] text-gray-200">
                    03
                  </span>
                </div>{" "}
                <h3 className="text-[18px] font-bold text-[#111827] mb-2">
                  Terima & Negosiasi
                </h3>
                <p className="text-[14px] text-[#6B7280]">
                  Hubungi decision-maker perusahaan langsung dari platform.
                  Tanpa antara, tanpa menunggu.
                </p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="perusahaan">
            <div className="flex flex-row items-center gap-8 py-8">
              <div className="flex-1 p-6 rounded-lg bg-gray-50">
                <div className="flex items-start justify-between mb-4">
                  <FileUp className="w-8 h-8 text-[#4A72FF]" />
                  <span className="text-[40px] font-[900] text-gray-200">
                    01
                  </span>
                </div>
                <h3 className="text-[18px] font-bold text-[#111827] mb-2">
                  Buat Event dalam 5 Menit
                </h3>
                <p className="text-[14px] text-[#6B7280]">
                  Isi nama event, target audiens, kebutuhan budget, dan paket
                  sponsor. Tidak perlu desain atau template.
                </p>
              </div>

              <div className="flex-1 p-6 rounded-[20px] bg-white border-2 border-[#4A72FF]">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#4A72FF] flex items-center justify-center">
                    <Image
                      src={"/icons/net.svg"}
                      alt="net"
                      width={6}
                      height={6}
                      className="w-6 h-6 text-white"
                    />
                  </div>
                  <span className="text-[40px] font-[900] text-gray-200">
                    02
                  </span>
                </div>
                <h3 className="text-[18px] font-bold text-[#111827] mb-2">
                  Smart Matching
                </h3>
                <p className="text-[14px] text-[#4A72FF] font-semibold mb-1">
                  Langgkai ini otomatis dilakukan AI
                </p>
                <p className="text-[14px] text-[#6B7280]">
                  Algoritma kami mencocokkan eventmu dengan perusahaan yang
                  memiliki target audiens serupa. Akurasi hingga 94%.
                </p>
              </div>

              <div className="flex-1 p-6 rounded-lg bg-gray-50">
                <div className="flex items-start justify-between mb-4">
                  <Handshake className="w-8 h-8 text-[#4A72FF]" />
                  <span className="text-[40px] font-[900] text-gray-200">
                    03
                  </span>
                </div>
                <h3 className="text-[18px] font-bold text-[#111827] mb-2">
                  Terima & Negosiasi
                </h3>
                <p className="text-[14px] text-[#6B7280]">
                  Hubungi decision-maker perusahaan langsung dari platform.
                  Tanpa antara, tanpa menunggu.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>
      <section className="py-20 w-full">
        <div className="max-w-7xl mx-auto flex gap-16 items-start">
          {/* Left Side */}
          <div className="flex-2">
            <div className="flex items-start gap-4 mb-8 border-1 border-[#E5E7EB] rounded-[24px] p-8">
              <div className="max-w-112">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <FileUp className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-[24px] font-bold text-[#111827] mb-2">
                    Proposal Smart Review
                  </h3>
                  <p className="text-[15px] text-[#6B7280] leading-relaxed">
                    Menganalislis lebih dari 50 titik data untuk menaksirkan
                    proposal Anda sampai ke meja yang tepat dengan tingkat
                    konversi tinggi.
                  </p>
                </div>
              </div>
            </div>

            {/* Relative Container for Overlay */}
            <div className="relative">
              {/* Circular Progress - Overlays the grid */}
              <div className="absolute left-85 top-[-70] z-10">
                <svg width="128" height="128" className="transform">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="12"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="#4A72FF"
                    strokeWidth="12"
                    strokeDasharray={`${(89 / 100) * 2 * Math.PI * 56} ${2 * Math.PI * 56}`}
                    strokeLinecap="round"
                  />
                  <text
                    x="64"
                    y="68"
                    textAnchor="middle"
                    className="text-[20px] font-[900] fill-[#4A72FF]"
                  >
                    89%
                  </text>
                  <text
                    x="64"
                    y="90"
                    textAnchor="middle"
                    className="text-[12px] font-[900] fill-[#9CA3AF]"
                  >
                    Akurasi
                  </text>
                </svg>
              </div>

              {/* Feature Grid */}
              <div className="grid grid-cols-2 gap-8 ">
                <div className="border-[#E5E7EB] rounded-[24px] border-1 p-8">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-[#4A72FF]" />
                    <span className="text-[11px] font-bold text-[#4A72FF] tracking-widest">
                      INSTANT
                    </span>
                  </div>
                  <h4 className="text-[17px] font-bold text-[#111827] mb-2">
                    Proposal Otomatis
                  </h4>
                  <p className="text-[14px] text-[#6B7280] leading-relaxed">
                    AI menyusun proposal profesional yang dipersonalisasi untuk
                    setiap perusahaan target — siap kirim dalam hitungan detik.
                  </p>
                </div>
                <div className="border-[#E5E7EB] rounded-[24px] border-1 p-8">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-[#4A72FF]" />
                    <span className="text-[11px] font-bold text-[#4A72FF] tracking-widest">
                      TRANSPARENT
                    </span>
                  </div>
                  <h4 className="text-[17px] font-bold text-[#111827] mb-2">
                    Token System
                  </h4>
                  <p className="text-[14px] text-[#6B7280] leading-relaxed">
                    Kendali penuh atas budget pitching Anda dengan sistem token
                    transparan.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Card 1 */}
            <div className="bg-gradient-to-br from-[#4A72FF] to-[#5B82FF] rounded-[32px] p-8 text-white min-h-[200px] flex flex-col justify-between">
              <div>
                <Badge className="bg-white/25 text-white border-0 mb-4 font-bold text-[11px] px-3 py-1">
                  ANALYTICS
                </Badge>
                <h3 className="text-[26px] font-bold mb-3">
                  Dashboard Real-Time
                </h3>
                <p className="text-[15px] text-white/90 leading-relaxed">
                  Pantau status proposal, laporan perusahaan, dan pipeline
                  sponsorship dalam satu tampilan.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-gradient-to-br from-[#4A72FF] to-[#5B82FF] rounded-[32px] p-8 text-white min-h-[220px] flex flex-col justify-between">
              <h3 className="text-[28px] font-bold">Siap untuk Mulai?</h3>
              <Button className="bg-white text-[#4A72FF] hover:bg-gray-50 px-6 py-3 font-bold rounded-[10px] w-fit">
                Coba Sekarang
              </Button>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 w-full bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[36px] font-bold text-[#111827] mb-3">
              Cerita Sukses dari Komunitas
            </h2>
            <p className="text-[16px] text-[#6B7280]">
              Membantu Event Organizer mendapatkan pendanaan lebih cepat.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-8">
            {/* Testimonial Card 1 */}
            <div className="bg-white rounded-[16px] p-8 border border-[#E5E7EB]">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 text-[#FCD34D]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-[14px] text-[#4B5563] mb-6 leading-relaxed">
                &quot;Biasanya butuh 2 minggu untuk dapat sponsor. Di EventHub,
                dalam 3 hari sudah ada 4 perusahaan yang tertarik. 2 deal
                closing.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0" />
                <div>
                  <p className="text-[14px] font-bold text-[#111827]">
                    Andi Pratama
                  </p>
                  <p className="text-[12px] text-[#6B7280]">
                    Founder, CreativeWest
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial Card 2 */}
            <div className="bg-white rounded-[16px] p-8 border border-[#E5E7EB]">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 text-[#FCD34D]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-[14px] text-[#4B5563] mb-6 leading-relaxed">
                &quot;AI Match Score-nya surprisingly akurat. Kami langssung
                tahu event yang worth untuk ditarget tanpa harus review
                satu-satu.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-[14px] font-bold text-[#111827]">
                    Sari Wijaya
                  </p>
                  <p className="text-[12px] text-[#6B7280]">
                    Brand Manager, TechCorp
                  </p>
                </div>
              </div>
            </div>

            {/* Testimonial Card 3 */}
            <div className="bg-white rounded-[16px] p-8 border border-[#E5E7EB]">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-4 h-4 text-[#FCD34D]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-[14px] text-[#4B5563] mb-6 leading-relaxed">
                &quot;Kami tidak lagi bayar jasa konsultan sponsorship. EventHub
                replace itu semua dengan hiya 10x lebih murah.&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0" />
                <div>
                  <p className="text-[14px] font-bold text-[#111827]">
                    Budi Santoso
                  </p>
                  <p className="text-[12px] text-[#6B7280]">
                    Project Manager, Sparta ID
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-32 w-full bg-[#2563EB]">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <h2 className="text-[48px] font-[900] text-white mb-4">
            Mulai Gratis Hari Ini
          </h2>
          <p className="text-[18px] text-white/90 mb-12 max-w-2xl">
            Bergabunglah dengan 500+ EO yang sudah mendapatkan sponsor lebih
            cepat bersama EventHub.
          </p>

          <div className="flex items-center gap-4 mb-12">
            <Button className="bg-white text-[#4A72FF] hover:bg-gray-50 px-8 py-3 text-[16px] font-bold rounded-[12px] h-auto">
              Daftar Sekarang
            </Button>
            <Button
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 px-8 py-3 text-[16px] font-bold rounded-[12px] h-auto bg-transparent"
            >
              Lihat Cara Kerjanya
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 flex-wrap text-white">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-[14px] font-medium">
                Tersertifikasi PSE
              </span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-[14px] font-medium">
                ISO 27001 Certified
              </span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span className="text-[14px] font-medium">
                Setup dalam 5 menit
              </span>
            </div>
          </div>
        </div>
      </section>
      <footer className="bg-[#111827] text-white py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-5 gap-12 mb-12">
            {/* Brand Column */}
            <div className="col-span-1">
              <h3 className="text-[20px] font-bold mb-4">EventHub</h3>
              <p className="text-[14px] text-gray-400 mb-6 leading-relaxed">
                Platform matchmaking sponsor berbasis AI pertama di Indonesia
                untuk ekosistem event yang lebih transparan.
              </p>
              <div className="flex gap-3">
                <button className="w-10 h-10 rounded-lg bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>
                <button className="w-10 h-10 rounded-lg bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.953 4.57a10 10 0 002.856-3.51 10.02 10.02 0 01-2.856 1.1 4.99 4.99 0 002.191-2.75 10.018 10.018 0 01-3.167 1.21 4.97 4.97 0 00-8.592 4.53A14.145 14.145 0 011.671 3.15a4.99 4.99 0 001.544 6.66 4.98 4.98 0 01-2.26-.616v.06a4.98 4.98 0 003.99 4.89 4.98 4.98 0 01-2.25.086 4.985 4.985 0 004.657 3.461A10.02 10.02 0 010 19.033a14.12 14.12 0 007.671 2.248c9.176 0 14.178-7.607 14.178-14.207 0-.216-.005-.433-.014-.648A10.13 10.13 0 0023.953 4.57z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Platform Column */}
            <div>
              <h4 className="text-[14px] font-bold tracking-widest mb-6 text-gray-300">
                PLATFORM
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-[14px] text-gray-400 hover:text-white transition"
                  >
                    Katalog Event
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[14px] text-gray-400 hover:text-white transition"
                  >
                    AI Matching
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[14px] text-gray-400 hover:text-white transition"
                  >
                    Harga Token
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[14px] text-gray-400 hover:text-white transition"
                  >
                    Studi Kasus
                  </a>
                </li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h4 className="text-[14px] font-bold tracking-widest mb-6 text-gray-300">
                PERUSAHAAN
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-[14px] text-gray-400 hover:text-white transition"
                  >
                    Tentang Kami
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[14px] text-gray-400 hover:text-white transition"
                  >
                    Karir
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[14px] text-gray-400 hover:text-white transition"
                  >
                    Kontak
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[14px] text-gray-400 hover:text-white transition"
                  >
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Column */}
            <div>
              <h4 className="text-[14px] font-bold tracking-widest mb-6 text-gray-300">
                LEGAL
              </h4>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-[14px] text-gray-400 hover:text-white transition"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[14px] text-gray-400 hover:text-white transition"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[14px] text-gray-400 hover:text-white transition"
                  >
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-700 pt-8">
            <div className="flex items-center justify-between">
              <p className="text-[12px] text-gray-400">
                © 2024 EventHub. Built for precision.
              </p>
              <div className="flex items-center gap-4">
                <button className="text-[12px] text-gray-400 hover:text-white transition">
                  ID (Bahasa)
                </button>
                <span className="text-gray-600">•</span>
                <p className="text-[12px] text-gray-400">Made in Jakarta</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
