"use client";

import React, { useState, useEffect } from "react";
import ProposalTerbaru from "../proposal-terbaru";
import Image from "next/image";
import { Calendar, MapPin } from "lucide-react";
import { apiCall } from "@/lib/api-client";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

interface userData {
  id: string;
  email: string;
  name: string;
  role: string;
  tokenBalance: string;
  eoProfile: EOProfile;
}

export interface EOProfile {
  id: string;
  organizationName: string;
  organizationType: string;
  campus: string;
  logoUrl: string | null;
}

interface EventTier {
  id: string;
  name: string;
  price: number;
  benefits: string[];
  maxSlots: number;
}

interface EOEvent {
  id: string;
  title: string;
  city: string;
  category: string;
  venue: string;
  startDate: string;
  endDate: string;
  status: string;
  bannerUrl: string | null;
  tiers: EventTier[];
  proposal: { id: string; source: string; aiScore: number };
  _count: { offers: number };
}

interface Offer {
  id: string;
  eventId: string;
  companyProfileId: string;
  tierId: string;
  status: "UNDER_REVIEW" | "ACCEPTED" | "REJECTED" | "PENDING" | string;
  initiatedBy: "COMPANY" | "EO" | string;
  message: string;
  createdAt: string; // Format ISO 8601
  updatedAt: string; // Format ISO 8601
  respondedAt: string | null;
  closedAt: string | null;
  event: OfferEvent;
  companyProfile: CompanyProfile;
  tier: OfferTier;
}

interface OfferEvent {
  id: string;
  title: string;
  slug: string;
}

interface CompanyProfile {
  id: string;
  companyName: string;
  industry: string;
  logoUrl: string | null;
  city: string;
}

interface OfferTier {
  name: string;
  price: number;
}

export default function DashboardEO() {
  const router = useRouter();
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });

  const [events, setEvents] = useState<EOEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [user, setUser] = useState<userData | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [eventsRes, offersRes, userRes] = await Promise.all([
          apiCall<{ data: EOEvent[] }>("/events/my"),
          apiCall<{ data: Offer[] }>("/offers/incoming"),
          apiCall<{ data: userData }>("/auth/me"),
        ]);

        setEvents(eventsRes.data.slice(0, 3));
        setOffers(offersRes.data);
        setUser(userRes.data);
      } catch (error) {
        console.error("Gagal mengambil data", error);
        setEvents([]);
        setOffers([]);
        setUser(null);
      } finally {
        setEventsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const activeEvents = events.filter(
    (event) => event.status === "PUBLISHED",
  ).length;

  const incomingOffers = offers.length;

  const waitingOffers = offers.filter(
    (offer) => offer.status === "UNDER_REVIEW",
  ).length;

  const EOName = user?.eoProfile?.organizationName || "EO";
  const tokenBalance = user?.tokenBalance || "0";

  const stats = [
    {
      label: "EVENT AKTIF",
      value: activeEvents,
      icon: Calendar,
      iconType: "lucide",
      color: "bg-[#EFF6FF]",
    },
    {
      label: "SPONSOR MASUK",
      value: incomingOffers,
      icon: "/icons/sponsor.svg",
      iconType: "svg",
      color: "bg-[#F3F4F6]",
    },
    {
      label: "MENUNGGU RESPON",
      value: waitingOffers,
      icon: "icons/bell-danger.svg",
      iconType: "svg",
      color: "bg-[#FFDAD6]",
    },
    {
      label: "SISA TOKEN",
      value: tokenBalance,
      icon: "icons/token2.svg",
      iconType: "svg",
      color: "bg-[#F9FAFB]",
    },
  ];

  const statusColors: Record<string, string> = {
    DRAFT: "bg-gray-700",
    PUBLISHED: "bg-green-600",
    ACTIVE: "bg-blue-600",
    COMPLETED: "bg-purple-600",
  };
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Selamat pagi, {EOName}
        </h1>
        <p className="text-gray-600 mt-1">
          Ini adalah ringkasan performa event dan kemitraan Anda hari ini.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon as React.ElementType;
          return (
            <div
              key={index}
              className="bg-white rounded-lg p-6 border border-gray-200"
            >
              <div
                className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center mb-4`}
              >
                {stat.iconType === "svg" ? (
                  <Image
                    src={stat.icon as string}
                    alt={stat.label}
                    width={24}
                    height={24}
                    unoptimized
                  />
                ) : (
                  <Icon size={24} className="text-gray-700" />
                )}
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                {stat.label}
              </p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Events */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Event Kamu</h2>
          <Button
            onClick={() => router.push("/katalog-event-eo")}
            className="text-blue-600 font-semibold hover:underline"
            variant={"ghost"}
          >
            Lihat Semua
          </Button>
        </div>
        <div className="flex flex-row items-stretch gap-6">
          {eventsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-gray-200 w-full animate-pulse"
              >
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
              <div
                key={event.id}
                className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition w-full"
              >
                <div className="relative h-40 bg-gray-200">
                  {event.bannerUrl ? (
                    <Image
                      src={event.bannerUrl}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                  ) : null}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`${statusColors[event.status] ?? "bg-gray-700"} text-white text-xs font-semibold px-3 py-1 rounded`}
                    >
                      {event.status}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    {event.title}
                  </h3>
                  <div className="flex items-center gap-3 mb-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>{formatDate(event.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      <span>{event.city}</span>
                    </div>
                  </div>
                  {event._count.offers > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex -space-x-2">
                        {Array.from({
                          length: Math.min(event._count.offers, 3),
                        }).map((_, i) => (
                          <div
                            key={i}
                            className="w-6 h-6 bg-gray-300 rounded-full border-2 border-white"
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600">
                        {event._count.offers} Sponsor Berminat
                      </span>
                    </div>
                  )}
                  <button className="w-full text-blue-600 font-semibold text-sm hover:underline">
                    Lanjutkan Draft →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Proposals Table */}
      <div>
        <ProposalTerbaru />
      </div>
    </div>
  );
}
