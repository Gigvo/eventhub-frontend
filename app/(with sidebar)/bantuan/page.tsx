"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Rocket,
  Play,
  Headphones,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles,
  HelpCircle,
} from "lucide-react";

export default function BantuanPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqData = [
    {
      q: "Bagaimana cara membuat event baru?",
      a: (
        <div className="space-y-3 text-slate-600 text-sm leading-relaxed">
          <p className="font-semibold text-slate-800">
            Langkah-langkah membuat event:
          </p>
          <ol className="list-decimal pl-5 space-y-1.5 text-slate-600">
            <li>
              Klik tombol{" "}
              <span className="font-bold text-slate-900">
                &quot;Buat Event&quot;
              </span>{" "}
              di sidebar kiri
            </li>
            <li>Isi nama, tanggal, dan deskripsi event</li>
            <li>Upload banner event (rasio 16:9, maks 5MB)</li>
            <li>Tentukan target audiens dan kategori sponsor</li>
            <li>
              Klik{" "}
              <span className="font-bold text-blue-600">
                &quot;Simpan & Publikasi&quot;
              </span>
            </li>
          </ol>
          <div className="mt-3 p-3 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg text-xs text-amber-800 italic">
            <strong>Note:</strong> &quot;Pastikan data profil Anda sudah lengkap
            sebelum membuat event.&quot;
          </div>
        </div>
      ),
    },
    {
      q: "Apa itu Token dan bagaimana cara menggunakannya?",
      a: (
        <p className="text-slate-600 text-sm leading-relaxed">
          Token adalah mata uang internal EventHub yang digunakan untuk
          mengakses fitur premium seperti
          <span className="font-semibold text-slate-900">
            {" "}
            generate otomatis proposal
          </span>
          , review dan scoring proposal, dan mengirim penawaran sponsorship ke
          perusahaan. Token dapat diperoleh melalui halaman Token Management
          atau dengan upgrade ke paket Pro.
        </p>
      ),
    },
    {
      q: "Bagaimana cara menarik dana sponsorship?",
      a: (
        <p className="text-slate-600 text-sm leading-relaxed">
          Dana sponsorship dapat ditarik setelah event Anda selesai dan sponsor
          telah mengkonfirmasi kesepakatan di platform. Proses penarikan
          dilakukan melalui platform pembayaran mitra kami.
        </p>
      ),
    },
  ];

  const steps = [
    {
      num: 1,
      title: "Buat Event",
      desc: "Lengkapi data event Anda dengan visual yang menarik dan data audiens yang akurat.",
    },
    {
      num: 2,
      title: "Cari Sponsor",
      desc: "Gunakan algoritma AI kami untuk mencocokkan event Anda dengan sponsor yang paling relevan.",
    },
    {
      num: 3,
      title: "Ajukan Kemitraan",
      desc: "Kirim penawaran proposal terstruktur langsung ke brand yang Anda minati dengan sekali klik.",
    },
    {
      num: 4,
      title: "Terima Sponsorship",
      desc: "Kelola kesepakatan masuk, tanda tangani MoU digital, dan cairkan dana sponsorship secara aman.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-6 sm:px-10 lg:px-12 space-y-12">
      {/* Hero Header */}
      <div className="max-w-6xl mx-auto space-y-3 text-left">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Apa yang bisa kami bantu?
        </h1>
        <p className="text-slate-500 text-sm sm:text-base max-w-2xl leading-relaxed">
          Temukan jawaban atau hubungi tim kami untuk solusi sponsorship event
          Anda.
        </p>
      </div>

      {/* FAQ Accordion Section */}
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="border-b pb-3 border-slate-100">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-blue-600" />
            Pertanyaan yang Sering Diajukan
          </h2>
        </div>

        <div className="space-y-4">
          {faqData.map((item, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="bg-white border border-slate-100 rounded-2xl overflow-hidden transition-all duration-300 hover:border-slate-200 shadow-sm"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-sm sm:text-base text-slate-800 hover:bg-slate-50/50 transition duration-200"
                >
                  <span>{item.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  )}
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen
                      ? "max-h-[500px] border-t border-slate-50 p-6"
                      : "max-h-0"
                  }`}
                >
                  {item.a}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4 Steps Section */}
      <div className="max-w-6xl mx-auto space-y-6 pt-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-amber-500 animate-pulse" />4 Langkah
          Sukses di EventHub
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <Card
              key={step.num}
              className="p-6 bg-white border border-slate-100 rounded-2xl relative overflow-hidden group hover:shadow-md hover:border-blue-100 transition duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                  {step.num}
                </div>
                <div className="space-y-2">
                  <h4 className="text-base font-bold text-slate-900">
                    {step.title}
                  </h4>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
