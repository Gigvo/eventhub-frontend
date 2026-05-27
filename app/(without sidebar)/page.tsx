"use client";
import Image from "next/image";
import NavbarLanding from "@/components/landing/navbar-landing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, FileUp, Handshake } from "lucide-react";
import Marquee from "@/components/landing/marquee/marquee";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

const BRANDS = ["SAMSUNG", "TOKOPEDIA", "TELKOMSEL", "TRAVELOKA", "GRAB"];

export default function Home() {
  const router = useRouter();

  // Stagger container variants for steps
  const stepsContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const stepItemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } as any },
  };

  // Stagger container variants for testimonials
  const testimonialsContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const testimonialItemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } as any },
  };

  return (
    <>
      <NavbarLanding />

      {/* Hero Section */}
      <section className="flex flex-col-reverse lg:flex-row items-center justify-between gap-12 lg:gap-16 max-w-7xl mx-auto px-4 sm:px-8 py-12 lg:py-24 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] } as any}
          className="flex-1 w-full text-center lg:text-left"
        >
          <Badge className="font-inter text-[#4A72FF] bg-[#EEF2FF] hover:bg-[#EEF2FF] border-none px-4 py-2 rounded-full mb-6 sm:mb-8 inline-flex items-center gap-2 font-bold tracking-wide text-xs mx-auto lg:mx-0">
            <Sparkles className="w-4 h-4" />
            DI PERCAYA 500+ EO DI INDONESIA
          </Badge>

          <h1 className="text-[36px] sm:text-[48px] lg:text-[64px] leading-tight lg:leading-[1.05] font-[900] tracking-tight text-[#111827] mb-6 font-inter">
            Temukan <br className="hidden sm:inline" />
            Sponsorship yang <br className="hidden sm:inline" />
            <span className="text-[#4A72FF]">Tepat Sasaran.</span>
          </h1>

          <p className="text-[16px] sm:text-[17px] leading-relaxed text-[#6B7280] max-w-xl mx-auto lg:mx-0 mb-8 sm:mb-12">
            Hubungkan eventmu dengan ratusan perusahaan sponsor yang tepat otomatis, cerdas, tanpa cold pitching.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-8 sm:mb-16">
            <Button
              className="bg-[#2563EB] hover:bg-[#3b5bdb] text-white px-8 py-4 text-[16px] rounded-[12px] font-semibold h-auto w-full sm:w-auto"
              style={{
                boxShadow:
                  "0px 4px 6px -4px #2563EB33, 0px 10px 15px -3px #2563EB33",
              }}
              onClick={() => router.push("/register")}
            >
              Daftar
            </Button>
          </div>

          <div className="flex items-center justify-center lg:justify-start gap-4 pt-4 border-t border-gray-200/60 w-fit mx-auto lg:mx-0 pr-8">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-[3px] border-white bg-gray-200 overflow-hidden relative"></div>
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-[3px] border-white bg-gray-300 overflow-hidden relative"></div>
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-[3px] border-white bg-gray-400 overflow-hidden relative"></div>
            </div>
            <p className="text-[13px] sm:text-[14px] text-[#6B7280] font-medium">
              Dipercaya oleh 500+ Event Organizer & Brand
            </p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] } as any}
          className="relative w-full h-[250px] sm:h-[400px] lg:h-[600px] flex-1"
        >
          <Image
            src={"/hero-image.webp"}
            alt="hero-image"
            fill
            className="object-contain"
            priority
          />
        </motion.div>
      </section>

      {/* Marquee Brands */}
      <Marquee>
        {BRANDS.map((brand) => (
          <div key={brand} className="text-[20px] p-4 font-bold text-gray-300">
            {brand}
          </div>
        ))}
      </Marquee>

      {/* Smart Matching Steps Section */}
      <section className="flex flex-col items-center max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-20 w-full overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" } as any}
          className="text-center max-w-3xl mb-8"
        >
          <h2 className="font-extrabold text-[24px] sm:text-[30px] leading-tight text-[#111827] mb-4">
            Dari Upload Event ke Deal Sponsor, Semua di Satu Tempat
          </h2>
          <p className="text-[#6B7280] text-sm sm:text-[15px]">
            Tidak ada lagi email yang tidak dibalas. Tidak ada lagi proposal yang salah sasaran.
          </p>
        </motion.div>

        <motion.div
          variants={stepsContainerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col lg:flex-row items-stretch gap-6 sm:gap-8 py-8 w-full"
        >
          <motion.div
            variants={stepItemVariants}
            className="flex-1 p-6 rounded-lg bg-gray-50 border border-gray-100 flex flex-col justify-between hover:shadow-md transition duration-300"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <FileUp className="w-8 h-8 text-[#4A72FF]" />
                <span className="text-[40px] font-[900] text-gray-200">01</span>
              </div>
              <h3 className="text-[18px] font-bold text-[#111827] mb-2">
                Buat Event dalam 5 Menit
              </h3>
              <p className="text-[14px] text-[#6B7280]">
                Isi nama event, target audiens, kebutuhan budget, dan paket sponsor. Generate proposal sponsorship dengan AI.
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={stepItemVariants}
            className="flex-1 p-6 rounded-[20px] bg-white border-2 border-[#4A72FF] flex flex-col justify-between shadow-sm hover:shadow-md transition duration-300"
          >
            <div>
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
                <span className="text-[40px] font-[900] text-gray-200">02</span>
              </div>
              <h3 className="text-[18px] font-bold text-[#111827] mb-2">
                Smart Matching
              </h3>
              <p className="text-[14px] text-[#4A72FF] font-semibold mb-1">
                Langkah ini otomatis dilakukan AI
              </p>
              <p className="text-[14px] text-[#6B7280]">
                Algoritma kami mencocokkan eventmu dengan perusahaan yang memiliki target audiens serupa.
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={stepItemVariants}
            className="flex-1 p-6 rounded-lg bg-gray-50 border border-gray-100 flex flex-col justify-between hover:shadow-md transition duration-300"
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                <Handshake className="w-8 h-8 text-[#4A72FF]" />
                <span className="text-[40px] font-[900] text-gray-200">03</span>
              </div>
              <h3 className="text-[18px] font-bold text-[#111827] mb-2">
                Terima & Negosiasi
              </h3>
              <p className="text-[14px] text-[#6B7280]">
                Kirim penawaran ke perusahaan langsung dari platform, tanpa menunggu.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Feature Details & Analytics Section */}
      <section className="py-12 sm:py-20 w-full px-4 sm:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          {/* Left Side */}
          <motion.div
            initial={{ opacity: 0, x: -35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] } as any}
            className="flex-1 lg:flex-[2] w-full space-y-8"
          >
            <div className="flex flex-col sm:flex-row items-start gap-4 border border-[#E5E7EB] rounded-[24px] p-6 sm:p-8 bg-white">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                <FileUp className="w-6 h-6 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[20px] sm:text-[24px] font-bold text-[#111827] mb-2 leading-tight">
                  Proposal Smart Review
                </h3>
                <p className="text-[14px] sm:text-[15px] text-[#6B7280] leading-relaxed">
                  Menganalisis proposal secara cerdas berdasarkan data relevansi, target audiens, dan kebutuhan sponsor agar peluang diterima proposal menjadi lebih tinggi.
                </p>
              </div>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
              <div className="border border-[#E5E7EB] rounded-[24px] p-6 sm:p-8 bg-white hover:shadow-sm transition">
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
                  AI menyusun proposal profesional yang dipersonalisasi untuk setiap perusahaan target.
                </p>
              </div>
              <div className="border border-[#E5E7EB] rounded-[24px] p-6 sm:p-8 bg-white hover:shadow-sm transition">
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
                  Kelola pitching dan promosi event dengan sistem token transparan untuk menghubungi perusahaan dan meningkatkan jangkauan event.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Side */}
          <motion.div
            initial={{ opacity: 0, x: 35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] } as any}
            className="flex-1 w-full flex flex-col gap-6"
          >
            {/* Card 1 */}
            <div className="bg-gradient-to-br from-[#4A72FF] to-[#5B82FF] rounded-[32px] p-6 sm:p-8 text-white min-h-[200px] flex flex-col justify-between shadow-sm">
              <div>
                <Badge className="bg-white/25 text-white border-0 mb-4 font-bold text-[11px] px-3 py-1">
                  ANALYTICS
                </Badge>
                <h3 className="text-[22px] sm:text-[26px] font-bold mb-3 leading-tight">
                  Dashboard Real-Time
                </h3>
                <p className="text-[14px] sm:text-[15px] text-white/90 leading-relaxed">
                  Pantau status proposal, laporan perusahaan, dan pipeline sponsorship dalam satu tampilan.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-gradient-to-br from-[#4A72FF] to-[#5B82FF] rounded-[32px] p-6 sm:p-8 text-white min-h-[220px] flex flex-col justify-between shadow-sm">
              <h3 className="text-[24px] sm:text-[28px] font-bold leading-tight mb-4">Siap untuk Mulai?</h3>
              <Link href={"/register"}>
                <Button className="bg-white text-[#4A72FF] hover:bg-gray-50 px-6 py-3 font-bold rounded-[10px] w-fit">
                  Coba Sekarang
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-20 w-full bg-[#FAFAFA] px-4 sm:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 } as any}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-[26px] sm:text-[36px] font-bold text-[#111827] mb-3">
              Cerita Sukses dari Komunitas
            </h2>
            <p className="text-sm sm:text-[16px] text-[#6B7280]">
              Membantu Event Organizer mendapatkan pendanaan lebih cepat.
            </p>
          </motion.div>

          <motion.div
            variants={testimonialsContainerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8"
          >
            {/* Testimonial Card 1 */}
            <motion.div
              variants={testimonialItemVariants}
              className="bg-white rounded-[16px] p-6 sm:p-8 border border-[#E5E7EB] hover:shadow-sm transition"
            >
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
                &quot;Biasanya butuh 2 minggu untuk dapat sponsor. Di EventHub, dalam 3 hari sudah ada 4 perusahaan yang tertarik. &quot;
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
            </motion.div>

            {/* Testimonial Card 2 */}
            <motion.div
              variants={testimonialItemVariants}
              className="bg-white rounded-[16px] p-6 sm:p-8 border border-[#E5E7EB] hover:shadow-sm transition"
            >
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
                &quot;AI Match Scorenya surprisingly akurat. Kami langsung tahu event yang sesuai tanpa harus review satu-satu.&quot;
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
            </motion.div>

            {/* Testimonial Card 3 */}
            <motion.div
              variants={testimonialItemVariants}
              className="bg-white rounded-[16px] p-6 sm:p-8 border border-[#E5E7EB] hover:shadow-sm transition"
            >
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
                &quot;Kami tidak lagi bayar jasa konsultan sponsorship. EventHub replace itu semua dengan biaya lebih murah.&quot;
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
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] } as any}
        className="py-16 sm:py-24 lg:py-32 w-full bg-[#2563EB] px-4 sm:px-8 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <h2 className="text-[30px] sm:text-[48px] font-[900] text-white mb-4 leading-tight">
            Mulai Gratis Hari Ini
          </h2>
          <p className="text-sm sm:text-[18px] text-white/90 mb-12 max-w-2xl">
            Bergabunglah dengan 500+ EO yang sudah mendapatkan sponsor lebih cepat bersama EventHub.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mb-12 w-full sm:w-auto">
            <Link href={"/register"} className="w-full sm:w-auto">
              <Button className="bg-white text-[#4A72FF] hover:bg-gray-50 px-8 py-3 text-[16px] font-bold rounded-[12px] h-auto w-full">
                Daftar Sekarang
              </Button>
            </Link>

            <Button
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 px-8 py-3 text-[16px] font-bold rounded-[12px] h-auto bg-transparent w-full sm:w-auto"
            >
              Lihat Cara Kerjanya
            </Button>
          </div>

          <div className="flex items-center justify-center gap-6 sm:gap-8 flex-wrap text-white">
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
              <span className="text-[13px] sm:text-[14px] font-medium">
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
              <span className="text-[13px] sm:text-[14px] font-medium">
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
              <span className="text-[13px] sm:text-[14px] font-medium">
                Setup dalam 5 menit
              </span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-[#111827] text-white py-12 sm:py-16 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-12 mb-12">
            {/* Brand Column */}
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-[20px] font-bold mb-4">EventHub</h3>
              <p className="text-[14px] text-gray-400 mb-6 leading-relaxed">
                Platform matchmaking sponsor berbasis AI pertama di Indonesia untuk ekosistem event yang lebih transparan.
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
                  <a href="#" className="text-[14px] text-gray-400 hover:text-white transition">
                    Katalog Event
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[14px] text-gray-400 hover:text-white transition">
                    AI Matching
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[14px] text-gray-400 hover:text-white transition">
                    Harga Token
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[14px] text-gray-400 hover:text-white transition">
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
                  <a href="#" className="text-[14px] text-gray-400 hover:text-white transition">
                    Tentang Kami
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[14px] text-gray-400 hover:text-white transition">
                    Karir
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[14px] text-gray-400 hover:text-white transition">
                    Kontak
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[14px] text-gray-400 hover:text-white transition">
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
                  <a href="#" className="text-[14px] text-gray-400 hover:text-white transition">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[14px] text-gray-400 hover:text-white transition">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[14px] text-gray-400 hover:text-white transition">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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
