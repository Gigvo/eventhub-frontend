"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import EventCard from "@/components/katalog-event/event-card-company";
import { apiCall } from "@/lib/api-client";
import { useAuth } from "@/providers/auth-provider";
import { Search, Filter, Info } from "lucide-react";

interface ApiEvent {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  city: string;
  isOnline: boolean;
  expectedAttendees: number;
  audienceAgeMin: number;
  audienceAgeMax: number;
  audienceInterests: string[];
  startDate: string;
  endDate: string;
  bannerUrl: string | null;
  publishedAt: string | null;
  eoOrganizationName: string;
  eoLogoUrl: string | null;
  eoCampus: string;
  similarity: number;
  finalScore: number;
  scoreBreakdown: {
    semantic: number;
    category: number;
    city: number;
    audience: number;
  };
}

interface EventCardProps {
  id: string;
  slug: string;
  title: string;
  image: string;
  category: string;
  organizer: string;
  organizerAvatar: string;
  date: string;
  location: string;
  budget: string;
  finalScore: number;
  onViewDetails: (slug: string) => void;
}

interface FilterState {
  categories: string[];
  scales: string[];
  budgetMin: string;
  budgetMax: string;
}

const ITEMS_PER_PAGE = 4;

export default function KatalogEvent() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedCategory, setSelectedCategory] = useState<string>("semua");
  const [selectedScale, setSelectedScale] = useState<string>("semua");
  const [events, setEvents] = useState<EventCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentEvent, setRecentEvent] = useState<string | null>(null);

  useEffect(() => {
    apiCall<{ data: ApiEvent[] }>("/events/my", {})
      .then((res) => {
        if (res?.data && Array.isArray(res.data) && res.data.length > 0)
          setRecentEvent(res.data[0].id);
      })
      .catch((err) => console.error("Failed to load events:", err));
  }, []);

  // Fetch recommendations from API — wait for recentEvent to be set
  useEffect(() => {
    if (!recentEvent) return;
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiCall<{
          recommendations: ApiEvent[];
          meta: { total: number };
        }>(`/recommendations/sponsors/${recentEvent}`, { requireAuth: true });

        // Transform API response to EventCard format
        const transformedEvents: EventCardProps[] =
          response.recommendations.map((event: ApiEvent) => {
            const startDate = new Date(event.startDate);
            const endDate = new Date(event.endDate);

            const dateRange =
              startDate.getTime() === endDate.getTime()
                ? startDate.toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : `${startDate.getDate()} - ${endDate.toLocaleDateString(
                    "id-ID",
                    { day: "numeric", month: "short", year: "numeric" },
                  )}`;

            return {
              id: event.id,
              slug: event.slug,
              title: event.title,
              image: event.bannerUrl || "/event-1.png",
              category: event.category,
              organizer: event.eoOrganizationName,
              organizerAvatar: "/avatar-1.png",
              date: dateRange,
              location: event.city,
              budget: `${Math.round(event.finalScore * 100)}% match`,
              finalScore: event.finalScore,
              onViewDetails: () => {},
            };
          });

        setEvents(transformedEvents);
      } catch (err) {
        console.error("Failed to fetch recommendations:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch events");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [recentEvent]);

  // Sort events
  let sortedEvents = [...events];

  // Filter by search query
  if (searchQuery.trim()) {
    sortedEvents = sortedEvents.filter(
      (event) =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.category.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }

  // Pagination
  const totalPages = Math.ceil(sortedEvents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedEvents = sortedEvents.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const getPaginationItems = (): (number | string)[] => {
    const items: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 3; i++) {
          items.push(i);
        }
        items.push("...");
        items.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        items.push(1);
        items.push("...");
        for (let i = totalPages - 2; i <= totalPages; i++) {
          items.push(i);
        }
      } else {
        items.push(1);
        items.push("...");
        items.push(currentPage - 1);
        items.push(currentPage);
        items.push(currentPage + 1);
        items.push("...");
        items.push(totalPages);
      }
    }

    return items;
  };

  const handleViewDetails = (slug: string) => {
    router.push(`/katalog-event/${slug}`);
  };

  return (
    <>
      {!authLoading && !isAuthenticated && (
        <div className="bg-blue-100 border-b border-blue-200 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                Masuk untuk mengakses sponsorship
              </p>
              <p className="text-xs text-blue-700">
                Akses fitur eksklusif AI Matching dan lebih sponsorship langsung
                ke penyelengara event.
              </p>
            </div>
          </div>
          <button
            onClick={() => router.push("/login")}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-6 py-2 rounded-md whitespace-nowrap"
          >
            Login Sekarang
          </button>
        </div>
      )}

      <div className="min-h-screen bg-gray-50 py-8 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Katalog Event</h1>
            <p className="text-gray-600 text-sm mb-6">
              Telisuri ribuan event potensial untuk brand Anda di seluruh
              Indonesia.
            </p>
          </div>

          {/* Filter Bar and Search */}
          <div className="flex items-center justify-between gap-4 mb-8 bg-white p-4 rounded-lg">
            <div className="flex items-center gap-2 flex-1">
              <Filter className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-600 mr-2">
                Filter:
              </span>

              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua</SelectItem>
                  <SelectItem value="TECHNOLOGY">Technology</SelectItem>
                  <SelectItem value="WORKSHOP">Workshop</SelectItem>
                  <SelectItem value="CONFERENCE">Conference</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedScale} onValueChange={setSelectedScale}>
                <SelectTrigger className="w-32 h-8 text-xs">
                  <SelectValue placeholder="Skala" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua</SelectItem>
                  <SelectItem value="Jakarta">Jakarta</SelectItem>
                  <SelectItem value="Bandung">Bandung</SelectItem>
                  <SelectItem value="Yogyakarta">Yogyakarta</SelectItem>
                  <SelectItem value="Surabaya">Surabaya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search Bar */}
            <div className="relative w-80">
              <Search className="absolute left-3 top-2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Cari event atau nama penyelenggara..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 h-8 text-sm"
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex gap-6">
            {/* Events Grid */}
            <div className="flex-1">
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">Memuat event...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-500 text-lg">
                    Gagal memuat event: {error}
                  </p>
                </div>
              ) : paginatedEvents.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {paginatedEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        {...event}
                        onViewDetails={handleViewDetails}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  <div className="flex justify-center mt-12">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={() =>
                              setCurrentPage((prev) => Math.max(1, prev - 1))
                            }
                            className={
                              currentPage === 1
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                          />
                        </PaginationItem>

                        {getPaginationItems().map((item, index) =>
                          item === "..." ? (
                            <PaginationItem key={`ellipsis-${index}`}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          ) : (
                            <PaginationItem key={item}>
                              <PaginationLink
                                href="#"
                                isActive={currentPage === item}
                                onClick={() => setCurrentPage(item as number)}
                              >
                                {item}
                              </PaginationLink>
                            </PaginationItem>
                          ),
                        )}

                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={() =>
                              setCurrentPage((prev) =>
                                Math.min(totalPages, prev + 1),
                              )
                            }
                            className={
                              currentPage === totalPages
                                ? "pointer-events-none opacity-50"
                                : ""
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    Tidak ada event yang sesuai dengan filter Anda
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
