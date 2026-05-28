"use client";
import React, { useState, useEffect } from "react";
import { apiCall } from "@/lib/api-client";
import {
  FileText,
  Bookmark,
  Handshake,
  Zap,
  Star,
  Info,
  Calendar,
  MapPin,
  Users,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface userData {
  id: string;
  email: string;
  name: string;
  role: string;
  tokenBalance: string;
  companyProfile: companyProfile;
}

interface companyProfile {
  id: string;
  userId: string;
  companyName: string;
  industry: string;
}

interface CatalogEvent {
  id: string;
  title: string;
  slug: string;
  category: string;
  city: string;
  startDate: string;
  expectedAttendees: number;
  eoProfile?: { organizationName: string };
  eoOrganizationName?: string;
  _count?: { offers: number };
  bannerUrl?: string | null;
  similarity?: number;
  finalScore?: number;
}

export interface EoProfile {
  id: string;
  organizationName: string;
  campus: string;
  logoUrl: string | null;
}

interface EventData {
  id: string;
  title: string;
  slug: string;
  category: string;
  bannerUrl: string | null;
  startDate: string;
  endDate: string;
  city: string;
  expectedAttendees: number;
  eoProfile: EoProfile;
  status: string;
}

interface SponsorshipTier {
  name: "gold" | string;
  price: number;
  benefits: string[];
}

interface Pitches {
  id: string;
  eventId: string;
  companyProfileId: string;
  tierId: string;
  status: "ACCEPTED" | "PENDING" | "REJECTED" | string;
  initiatedBy: "EO" | "COMPANY" | string;
  message: string;
  createdAt: string;
  updatedAt: string;
  respondedAt: string;
  closedAt: string;
  event: EventData;
  tier: SponsorshipTier;
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

export default function DashboardCompany() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<CatalogEvent[]>([]);
  const [pitches, setPitches] = useState<Pitches[]>([]);
  const [recoLoading, setRecoLoading] = useState(true);
  const [saved, setSaved] = useState<EventData[]>([]);
  const [user, setUser] = useState<userData | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [eventsRes, pitchesRes, savedRes, userRes] = await Promise.all([
          apiCall<any>("/recommendations/events?limit=3"),
          apiCall<{ data: Pitches[] }>("/pitches/incoming"),
          apiCall<{ data: EventData[] }>("/saved-events"),
          apiCall<{ data: userData }>("/auth/me"),
        ]);

        const rawRecommendations =
          eventsRes?.recommendations || eventsRes?.data || [];
        const sortedRecommendations = [...rawRecommendations].sort(
          (a: any, b: any) => {
            const scoreA = a.finalScore ?? a.similarity ?? 0;
            const scoreB = b.finalScore ?? b.similarity ?? 0;
            return scoreB - scoreA;
          },
        );

        setRecommendations(sortedRecommendations);
        setPitches(pitchesRes.data);
        setSaved(savedRes.data);
        setUser(userRes.data);
      } catch (error) {
        console.error("Gagal mengambil data", error);
        setRecommendations([]);
        setPitches([]);
        setSaved([]);
        setUser(null);
      } finally {
        setRecoLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });

  const formatPrice = (price: number) => {
    if (price >= 1_000_000_000) return `${(price / 1_000_000_000).toFixed(1)}M`;
    if (price >= 1_000_000) return `${Math.round(price / 1_000_000)}jt`;
    return `${Math.round(price / 1_000)}rb`;
  };

  const proposalBaru = pitches.length;
  const tersimpan = saved.length;
  const kerjasamaAktifCount = pitches.filter(
    (pitch) => pitch.status === "ACCEPTED",
  ).length;
  const kerjasamaAktif = pitches.filter((pitch) => pitch.status === "ACCEPTED");
  const companyName = user?.companyProfile?.companyName || "Perusahaan";
  const tokenBalance = user?.tokenBalance || "0";

  const stats = [
    {
      label: "PROPOSAL BARU",
      value: proposalBaru,
      sub: "",
      subColor: "text-blue-600",
      icon: FileText,
    },
    {
      label: "TERSIMPAN",
      value: tersimpan,
      sub: "Proposal siap review",
      subColor: "text-gray-500",
      icon: Bookmark,
    },
    {
      label: "KERJASAMA AKTIF",
      value: kerjasamaAktifCount,
      sub: "",
      subColor: "text-orange-500",
      icon: Handshake,
    },
    {
      label: "SISA TOKEN",
      value: tokenBalance,
      sub: "",
      subColor: "",
      icon: Zap,
    },
  ];

  const statusColors: Record<string, string> = {
    ACCEPTED: "bg-green-100 text-green-600 border-green-600",
    PENDING: "bg-yellow-100 text-yellow-600 border-yellow-600",
    REJECTED: "bg-red-100 text-red-600 border-red-600",
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 w-full min-w-0">
      <div className="max-w-7xl mx-auto w-full space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="mb-2 sm:mb-4">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            Selamat datang, {companyName}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Berikut adalah ringkasan performa sponsor Anda hari ini.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-white rounded-lg p-5 border border-gray-200"
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  {stat.label}
                </p>
                <stat.icon size={18} className="text-gray-400" />
              </div>
              <p className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
                {stat.value}
              </p>
              <p className={`text-xs font-medium ${stat.subColor}`}>
                {stat.sub}
              </p>
            </div>
          ))}
        </div>

        {/* Recommendations */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <h2 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
              <Star size={16} className="text-blue-500" />
              REKOMENDASI UNTUK ANDA
            </h2>
            <a
              href="./events"
              className="text-sm text-blue-600 font-semibold hover:underline"
            >
              Lihat Semua
            </a>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 flex items-center gap-2 text-xs text-blue-700 mb-4">
            <Info size={14} className="flex-shrink-0" />
            <p>
              Diurutkan berdasarkan kesesuaian industri, target audience, dan
              track record event organizer.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {recoLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse"
                >
                  <div className="h-36 bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                  </div>
                </div>
              ))
            ) : recommendations.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                <Star size={40} className="mx-auto mb-3 text-gray-300" />
                <p>Belum ada rekomendasi event tersedia.</p>
              </div>
            ) : (
              recommendations.map((r) => {
                const categoryColor =
                  CATEGORY_COLORS[r.category] ?? "bg-gray-600";
                return (
                  <div
                    key={r.id}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-36 bg-gradient-to-br from-gray-700 to-gray-900 overflow-hidden flex items-center justify-center">
                        {r.bannerUrl ? (
                          <img
                            src={r.bannerUrl}
                            alt={r.title}
                            className="w-full h-full object-cover opacity-90 transition hover:scale-105 duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-indigo-700 via-indigo-800 to-purple-900" />
                        )}
                        <span
                          className={`absolute top-2 left-2 ${categoryColor} text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm z-10`}
                        >
                          {r.category}
                        </span>

                        {/* AI Match Badge */}
                        {(r.finalScore !== undefined ||
                          r.similarity !== undefined) && (
                          <div className="absolute bottom-2 left-2 bg-indigo-600/90 backdrop-blur-sm text-white text-[10px] font-extrabold px-2 py-1 rounded-full flex items-center gap-1 shadow z-10 border border-white/10">
                            AI Match:{" "}
                            {Math.round(
                              (r.finalScore ?? r.similarity ?? 0) * 100,
                            )}
                            %
                          </div>
                        )}

                        <div className="absolute top-2 right-2 bg-white/90 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 z-10">
                          {r._count?.offers !== undefined && r._count.offers > 0
                            ? `${r._count.offers} offer`
                            : "Baru"}
                        </div>
                      </div>
                      <div className="p-4 pb-4">
                        <p className="text-[11px] text-gray-500 mb-1">
                          {r.eoOrganizationName ||
                            r.eoProfile?.organizationName ||
                            "Organizer"}
                        </p>
                        <h3 className="font-bold text-gray-900 text-sm mb-2 leading-tight line-clamp-1">
                          {r.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar size={11} />
                            {formatDate(r.startDate)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={11} />
                            {r.city}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={11} />
                            {r.expectedAttendees.toLocaleString("id-ID")}+
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 pt-0">
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() =>
                            router.push(`/katalog-event/${r.slug}`)
                          }
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded-lg transition"
                        >
                          Lihat Detail
                        </Button>
                        {/* <button className="w-8 h-8 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-gray-50 transition">
                        <Bookmark size={14} className="text-gray-400" />
                      </button> */}
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b border-gray-100 gap-2">
            <h2 className="font-bold text-gray-900 text-sm sm:text-base">
              KERJASAMA BERJALAN
            </h2>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => (window.location.href = "./kerjasama-aktif")}
                className="bg-white border border-gray-200 text-gray-700 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-50 transition"
              >
                Lihat Selengkapnya
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {[
                    "NAMA EVENT",
                    "ORGANIZER",
                    "NILAI KONTRAK",
                    "STATUS",
                    "PROGRES",
                    "",
                  ].map((h, i) => (
                    <th
                      key={i}
                      className="px-6 py-3 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {kerjasamaAktif.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-sm text-gray-900">
                        {p.event.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(p.event.startDate)} -{" "}
                        {formatDate(p.event.endDate)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-blue-100 rounded flex items-center justify-center">
                          <FileText size={12} className="text-blue-600" />
                        </div>
                        <span className="text-sm text-gray-700">
                          {p.event.eoProfile.organizationName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {p.tier.price}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded ${statusColors[p.status]}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 min-w-[160px]">
                      {(() => {
                        const now = new Date();
                        const start = p.event.startDate
                          ? new Date(p.event.startDate)
                          : new Date();
                        const end = p.event.endDate
                          ? new Date(p.event.endDate)
                          : new Date();

                        let progress = 0;
                        let label = "";

                        if (now < start) {
                          progress = 25;
                          label = "Persiapan";
                        } else if (now >= start && now <= end) {
                          progress = 65;
                          label = "Aktif";
                        } else {
                          progress = 90;
                          label = "Pelaporan";
                        }

                        return (
                          <>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                              <div
                                className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <p className="text-[10px] font-medium text-gray-500">
                              {progress}% — {label}
                            </p>
                          </>
                        );
                      })()}
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
      </div>
    </div>
  );
}
