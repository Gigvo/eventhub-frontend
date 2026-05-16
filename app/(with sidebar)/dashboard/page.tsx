"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Calendar,
  MapPin,
  Bookmark,
  Handshake,
  MoreVertical,
  Zap,
  FileText,
  Info,
  Star,
  Users,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { apiCall } from "@/lib/api-client";

// ─── EO Dashboard ────────────────────────────────────────────────────────────

interface EOEvent {
  id: string;
  title: string;
  city: string;
  venue: string;
  startDate: string;
  status: string;
  bannerUrl: string | null;
  _count: { offers: number };
}

function EODashboard() {
  const stats = [
    { label: "EVENT AKTIF", value: "4", icon: Calendar, iconType: "lucide", color: "bg-[#EFF6FF]" },
    { label: "SPONSOR MASUK", value: "12", icon: "/icons/sponsor.svg", iconType: "svg", color: "bg-[#F3F4F6]" },
    { label: "MENUNGGU RESPON", value: "5", icon: "icons/bell-danger.svg", iconType: "svg", color: "bg-[#FFDAD6]" },
    { label: "SISA TOKEN", value: "45", icon: "icons/token2.svg", iconType: "svg", color: "bg-[#F9FAFB]" },
  ];

  const proposals = [
    { id: 1, company: "Telkom Indonesia", event: "Jakarta Tech Fest", package: "PLATINUM", date: "20 Apr 2026", status: "Menunggu", statusColor: "bg-yellow-100 text-yellow-800" },
    { id: 2, company: "GoTo Group", event: "Startup Pitch Night", package: "GOLD", date: "28 Apr 2026", status: "Tertarik", statusColor: "bg-blue-100 text-blue-800" },
    { id: 3, company: "Bank BCA", event: "Jakarta Tech Fest", package: "PLATINUM", date: "27 Apr 2026", status: "Disertujui", statusColor: "bg-green-100 text-green-800" },
    { id: 4, company: "Shopee", event: "Future of Art", package: "SILVER", date: "26 Apr 2026", status: "Ditolak", statusColor: "bg-red-100 text-red-800" },
  ];

  const [events, setEvents] = useState<EOEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    apiCall<{ data: EOEvent[] }>("/events/my")
      .then((res) => setEvents(res.data.slice(0, 3)))
      .catch(() => setEvents([]))
      .finally(() => setEventsLoading(false));
  }, []);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short" });

  const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-700",
    PUBLISHED: "bg-green-600",
    ACTIVE: "bg-blue-600",
    COMPLETED: "bg-purple-600",
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Selamat pagi, Budi!</h1>
        <p className="text-gray-600 mt-1">Ini adalah ringkasan performa event dan kemitraan Anda hari ini.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon as React.ElementType;
          return (
            <div key={index} className="bg-white rounded-lg p-6 border border-gray-200">
              <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center mb-4`}>
                {stat.iconType === "svg" ? (
                  <Image src={stat.icon as string} alt={stat.label} width={24} height={24} unoptimized />
                ) : (
                  <Icon size={24} className="text-gray-700" />
                )}
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Events */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Event Kamu</h2>
          <a href="#" className="text-blue-600 font-semibold hover:underline">Lihat Semua</a>
        </div>
        <div className="flex flex-row items-stretch gap-6">
          {eventsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 w-full animate-pulse">
                <div className="h-40 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))
          ) : events.length === 0 ? (
            <div className="text-center py-12 text-gray-500 w-full">
              <Calendar size={40} className="mx-auto mb-3 text-gray-300" />
              <p>Belum ada event. Buat event pertamamu!</p>
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition w-full">
                <div className="relative h-40 bg-gray-200">
                  {event.bannerUrl ? (
                    <Image src={event.bannerUrl} alt={event.title} fill className="object-cover" />
                  ) : null}
                  <div className="absolute top-3 left-3">
                    <span className={`${statusColors[event.status] ?? "bg-gray-700"} text-white text-xs font-semibold px-3 py-1 rounded`}>
                      {event.status}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">{event.title}</h3>
                  <div className="flex items-center gap-3 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2"><Calendar size={16} /><span>{formatDate(event.startDate)}</span></div>
                    <div className="flex items-center gap-2"><MapPin size={16} /><span>{event.city}</span></div>
                  </div>
                  {event._count.offers > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex -space-x-2">
                        {Array.from({ length: Math.min(event._count.offers, 3) }).map((_, i) => (
                          <div key={i} className="w-6 h-6 bg-gray-300 rounded-full border-2 border-white" />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">{event._count.offers} Sponsor Berminat</span>
                    </div>
                  )}
                  <button className="w-full text-blue-600 font-semibold text-sm hover:underline">Lanjutkan Draft →</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Proposals Table */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Proposal Terbaru</h2>
          <a href="#" className="text-blue-600 font-semibold hover:underline">Lihat Semua</a>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {["Perusahaan", "Event", "Paket", "Tanggal", "Status", "Aksi"].map((h) => (
                  <th key={h} className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {proposals.map((p) => (
                <tr key={p.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full" />
                      <span className="font-semibold text-gray-900">{p.company}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{p.event}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold uppercase bg-[#F3F4F6] px-2 py-1 rounded ${p.package === "PLATINUM" ? "text-[#B45309]" : p.package === "GOLD" ? "text-[#334155]" : "text-[#1D4ED8]"}`}>
                      {p.package}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{p.date}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-3 py-1 rounded ${p.statusColor}`}>{p.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <a href="#" className="text-blue-600 font-semibold text-sm hover:underline">Lihat</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Company Dashboard ────────────────────────────────────────────────────────

interface CatalogEvent {
  id: string;
  title: string;
  category: string;
  city: string;
  startDate: string;
  expectedAttendees: number;
  eoProfile: { organizationName: string };
  tiers: { id: string; name: string; price: number }[];
  _count: { offers: number };
}

const CATEGORY_COLORS: Record<string, string> = {
  TECHNOLOGY: "bg-blue-600",
  WORKSHOP: "bg-purple-600",
  CONFERENCE: "bg-indigo-600",
  FESTIVAL: "bg-orange-500",
  SPORTS: "bg-green-600",
  "E-SPORTS": "bg-green-600",
  MUSIC: "bg-pink-600",
  ART: "bg-rose-500",
};

function CompanyDashboard() {
  const stats = [
    { label: "PROPOSAL BARU", value: "24", sub: "+8 Proposal hari ini", subColor: "text-blue-600", icon: FileText },
    { label: "TERSIMPAN", value: "112", sub: "Proposal siap review", subColor: "text-gray-500", icon: Bookmark },
    { label: "KERJASAMA AKTIF", value: "12", sub: "2 Menuju penyelesaian", subColor: "text-orange-500", icon: Handshake },
    { label: "SISA TOKEN", value: "850", sub: "Segera isi ulang (Low)", subColor: "text-red-500", icon: Zap },
  ];

  const partnerships = [
    { id: 1, event: "Startup Asia Expo 2024", dates: "22 Okt - 25 Okt", organizer: "Innovate ID", value: "Rp 120.000.000", status: "BERJALAN", statusColor: "bg-blue-100 text-blue-700", progress: 75, progressLabel: "Menuju Pelaporan" },
    { id: 2, event: "Eco Run Jakarta", dates: "05 Des 2024", organizer: "Green Events", value: "Rp 45.000.000", status: "PERSIAPAN", statusColor: "bg-orange-100 text-orange-700", progress: 20, progressLabel: "Tanda Tangan Kontrak" },
  ];

  const [recommendations, setRecommendations] = useState<CatalogEvent[]>([]);
  const [recoLoading, setRecoLoading] = useState(true);

  useEffect(() => {
    apiCall<{ data: CatalogEvent[] }>("/catalog/events?limit=3")
      .then((res) => setRecommendations(res.data.slice(0, 3)))
      .catch(() => setRecommendations([]))
      .finally(() => setRecoLoading(false));
  }, []);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short" });

  const formatPrice = (price: number) => {
    if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(1)}M`;
    if (price >= 1_000_000) return `${Math.round(price / 1_000_000)}jt`;
    return `${Math.round(price / 1_000)}rb`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Selamat datang, PT Maju Digital</h1>
        <p className="text-gray-500 mt-1 text-sm">Berikut adalah ringkasan performa sponsor Anda hari ini.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-lg p-5 border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{stat.label}</p>
              <stat.icon size={18} className="text-gray-400" />
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-1">{stat.value}</p>
            <p className={`text-xs font-medium ${stat.subColor}`}>{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Star size={16} className="text-blue-500" />
            REKOMENDASI UNTUK ANDA
          </h2>
          <a href="#" className="text-sm text-blue-600 font-semibold hover:underline">Lihat Semua</a>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex items-center gap-2 text-xs text-blue-700 mb-4">
          <Info size={14} />
          Diurutkan berdasarkan kesesuaian industri, target audience, dan track record event organizer.
        </div>
        <div className="grid grid-cols-3 gap-4">
          {recoLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                <div className="h-36 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))
          ) : recommendations.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-gray-500">
              <Star size={40} className="mx-auto mb-3 text-gray-300" />
              <p>Belum ada rekomendasi event tersedia.</p>
            </div>
          ) : (
            recommendations.map((r) => {
              const categoryColor = CATEGORY_COLORS[r.category] ?? "bg-gray-600";
              const tier = r.tiers[0];
              return (
                <div key={r.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition">
                  <div className="relative h-36 bg-gradient-to-br from-gray-700 to-gray-900">
                    <span className={`absolute top-2 left-2 ${categoryColor} text-white text-[10px] font-bold px-2 py-0.5 rounded`}>
                      {r.category}
                    </span>
                    <div className="absolute top-2 right-2 bg-white/90 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                      <Star size={10} className="fill-blue-500 text-blue-500" />
                      {r._count.offers > 0 ? `${r._count.offers} offer` : "Baru"}
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-[11px] text-gray-500 mb-1">{r.eoProfile.organizationName}</p>
                    <h3 className="font-bold text-gray-900 text-sm mb-2 leading-tight">{r.title}</h3>
                    <div className="flex items-center gap-3 text-[11px] text-gray-500 mb-3">
                      <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(r.startDate)}</span>
                      <span className="flex items-center gap-1"><MapPin size={11} />{r.city}</span>
                      <span className="flex items-center gap-1"><Users size={11} />{r.expectedAttendees.toLocaleString("id-ID")}+</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-3 mb-3">
                      {[
                        { label: "BUDGET", value: tier ? formatPrice(tier.price) : "-" },
                        { label: "PAKET", value: tier?.name ?? "-" },
                        { label: "OFFER", value: `${r._count.offers} masuk` },
                      ].map((item) => (
                        <div key={item.label}>
                          <p className="text-[9px] text-gray-400 font-semibold uppercase">{item.label}</p>
                          <p className="text-xs font-bold text-blue-600">{item.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded-lg transition">
                        Lihat Proposal
                      </button>
                      <button className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition">
                        <Bookmark size={14} className="text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Active Partnerships */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">KERJASAMA BERJALAN</h2>
          <div className="flex items-center gap-2">
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 8h10M11 12h4" />
              </svg>
            </button>
            <button className="bg-white border border-gray-200 text-gray-700 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-50 transition">
              Lihat Selengkapnya
            </button>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {["NAMA EVENT", "ORGANIZER", "NILAI KONTRAK", "STATUS", "PROGRES", ""].map((h, i) => (
                <th key={i} className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {partnerships.map((p) => (
              <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <p className="font-semibold text-sm text-gray-900">{p.event}</p>
                  <p className="text-xs text-gray-500">{p.dates}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-blue-100 rounded flex items-center justify-center">
                      <FileText size={12} className="text-blue-600" />
                    </div>
                    <span className="text-sm text-gray-700">{p.organizer}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.value}</td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded ${p.statusColor}`}>{p.status}</span>
                </td>
                <td className="px-6 py-4 min-w-[160px]">
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full"
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-500">{p.progress}% — {p.progressLabel}</p>
                </td>
                <td className="px-6 py-4">
                  <button className="p-1 hover:bg-gray-100 rounded">
                    <MoreVertical size={16} className="text-gray-400" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Page — Role Switcher ────────────────────────────────────────────────

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    apiCall<{ data: { role: string } }>("/auth/me")
      .then((res) => setRole(res.data.role))
      .catch(() => setRole(null))
      .finally(() => setRoleLoading(false));
  }, [authLoading, isAuthenticated]);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (role === "COMPANY") return <CompanyDashboard />;
  return <EODashboard />;
}
