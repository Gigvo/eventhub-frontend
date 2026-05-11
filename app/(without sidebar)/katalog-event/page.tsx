"use client";

import React, { useState } from "react";
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
import EventCard from "@/components/katalog-event/event-card";
import Footer from "@/components/footer";

// Mock data for events
const mockEvents = [
  {
    id: "1",
    title: "Indonesia Cloud Summit 2024",
    image: "/event-1.png",
    category: "TEKNOLOGI",
    organizer: "TechGlobal Indonesia",
    organizerAvatar: "/avatar-1.png",
    date: "24 Okt - 26 Okt 2024",
    location: "Jakarta Selatan",
    budget: "Rp 250jt - 1.2M",
  },
  {
    id: "2",
    title: "Java Jazz After Party",
    image: "/event-1.png",
    category: "MUSIK & SENI",
    organizer: "LoudWave Entertainment",
    organizerAvatar: "/avatar-1.png",
    date: "15 Nov 2024",
    location: "BSD City, Tangerang",
    budget: "Rp 50jt - 300jt",
  },
  {
    id: "3",
    title: "Startup Founder Expo 2024",
    image: "/event-1.png",
    category: "STARTUP",
    organizer: "Founder Circle ID",
    organizerAvatar: "/avatar-1.png",
    date: "02 Des 2024",
    location: "Surabaya, Jatim",
    budget: "Rp 150jt - 600jt",
  },
  {
    id: "4",
    title: "Digital Marketing Conference",
    image: "/event-1.png",
    category: "TEKNOLOGI",
    organizer: "Digital Pro Indonesia",
    organizerAvatar: "/avatar-1.png",
    date: "10 Jan 2025",
    location: "Jakarta Pusat",
    budget: "Rp 300jt - 1.5M",
  },
  {
    id: "5",
    title: "Fashion Week Jakarta",
    image: "/event-1.png",
    category: "MUSIK & SENI",
    organizer: "Fashion Indonesia Group",
    organizerAvatar: "/avatar-1.png",
    date: "20 Jan 2025",
    location: "Jakarta Selatan",
    budget: "Rp 500jt - 2.5M",
  },
  {
    id: "6",
    title: "Tech Innovation Summit",
    image: "/event-1.png",
    category: "TEKNOLOGI",
    organizer: "Innovation Hub Asia",
    organizerAvatar: "/avatar-1.png",
    date: "15 Feb 2025",
    location: "Bandung",
    budget: "Rp 200jt - 800jt",
  },
  {
    id: "7",
    title: "Business Networking Event",
    image: "/event-1.png",
    category: "STARTUP",
    organizer: "Business Connect ID",
    organizerAvatar: "/avatar-1.png",
    date: "01 Mar 2025",
    location: "Jakarta Timur",
    budget: "Rp 100jt - 400jt",
  },
  {
    id: "8",
    title: "Music Festival 2025",
    image: "/event-1.png",
    category: "MUSIK & SENI",
    organizer: "Festival Productions",
    organizerAvatar: "/avatar-1.png",
    date: "22 Mar 2025",
    location: "Yogyakarta",
    budget: "Rp 400jt - 2M",
  },
  {
    id: "9",
    title: "E-Sports Tournament",
    image: "/event-1.png",
    category: "TEKNOLOGI",
    organizer: "Gaming League ID",
    organizerAvatar: "/avatar-1.png",
    date: "10 Apr 2025",
    location: "Medan",
    budget: "Rp 150jt - 700jt",
  },
];

interface FilterState {
  categories: string[];
  scales: string[];
  budgetMin: string;
  budgetMax: string;
}

const ITEMS_PER_PAGE = 3;

export default function KatalogEvent() {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("terbaru");
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    scales: [],
    budgetMin: "",
    budgetMax: "",
  });

  // Handle category filter
  const handleCategoryChange = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
    setCurrentPage(1); // Reset to first page
  };

  // Handle scale filter
  const handleScaleChange = (scale: string) => {
    setFilters((prev) => ({
      ...prev,
      scales: prev.scales.includes(scale)
        ? prev.scales.filter((s) => s !== scale)
        : [...prev.scales, scale],
    }));
    setCurrentPage(1);
  };

  // Reset filters
  const handleResetFilter = () => {
    setFilters({
      categories: [],
      scales: [],
      budgetMin: "",
      budgetMax: "",
    });
    setCurrentPage(1);
  };

  // Helper function to parse budget range
  const parseBudgetValue = (budgetStr: string): [number, number] => {
    // Extract numbers from format like "Rp 250jt - 1.2M"
    const match = budgetStr.match(/[\d.]+/g);
    if (!match || match.length < 2) return [0, Infinity];

    const parseNumber = (numStr: string, unit: string): number => {
      const num = parseFloat(numStr);
      if (unit.includes("M")) return num * 1000000000; // Miliar
      if (unit.includes("jt")) return num * 1000000; // Juta
      return num;
    };

    const minMatch = budgetStr.match(/([\d.]+)\s*jt/i);
    const maxMatch = budgetStr.match(/([\d.]+)\s*M/i);

    const min = minMatch ? parseFloat(minMatch[1]) * 1000000 : 0;
    const max = maxMatch
      ? parseFloat(maxMatch[1]) * 1000000000
      : parseFloat(minMatch?.[1] || "0") * 1000000;

    return [min, max];
  };

  // Filter events based on selected filters
  let filteredEvents = mockEvents.filter((event) => {
    const categoryMatch =
      filters.categories.length === 0 ||
      filters.categories.some((cat) =>
        event.category.toLowerCase().includes(cat.toLowerCase()),
      );

    const scaleMatch =
      filters.scales.length === 0 ||
      filters.scales.some((scale) =>
        event.location.toLowerCase().includes(scale.toLowerCase()),
      );

    // Budget filter
    let budgetMatch = true;
    if (filters.budgetMin || filters.budgetMax) {
      const [eventMin, eventMax] = parseBudgetValue(event.budget);
      const filterMin = filters.budgetMin ? parseInt(filters.budgetMin) : 0;
      const filterMax = filters.budgetMax
        ? parseInt(filters.budgetMax)
        : Infinity;

      budgetMatch = eventMin <= filterMax && eventMax >= filterMin;
    }

    return categoryMatch && scaleMatch && budgetMatch;
  });

  // Sort events
  if (sortBy === "terbaru") {
    filteredEvents = filteredEvents.reverse();
  }

  // Pagination
  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedEvents = filteredEvents.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  // Generate pagination items
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

  const handleViewDetails = (id: string) => {};

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8 mx-60">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-500">Beranda /</span>
              <span className="text-sm text-gray-700 font-medium">
                Katalog Event
              </span>
            </div>
            <h1 className="text-4xl font-bold mb-6">Katalog Event</h1>

            {/* Sort Dropdown */}
            <div className="flex justify-end items-center gap-2">
              <span className="text-sm font-medium mr-2 text-[#434656]">
                URUTKAN:
              </span>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="terbaru">Terbaru</SelectItem>
                  <SelectItem value="terlama">Terlama</SelectItem>
                  <SelectItem value="populer">Populer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex gap-6">
            {/* Sidebar Filters */}
            <div className="max-w-72">
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-lg font-semibold mb-6">Filter</h2>

                {/* Categories */}
                <div className="mb-8">
                  <h3 className="font-semibold text-sm text-gray-700 mb-4">
                    KATEGORI
                  </h3>
                  <div className="space-y-3">
                    {["Teknologi", "Musik & Seni", "Bisnis & Startup"].map(
                      (category) => (
                        <label
                          key={category}
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <Checkbox
                            checked={filters.categories.includes(category)}
                            onCheckedChange={() =>
                              handleCategoryChange(category)
                            }
                          />
                          <span className="text-sm text-gray-700">
                            {category}
                          </span>
                        </label>
                      ),
                    )}
                  </div>
                </div>

                {/* Scales */}
                <div className="mb-8 pb-8 border-b">
                  <h3 className="font-semibold text-sm text-gray-700 mb-4">
                    SKALA
                  </h3>
                  <div className="space-y-3">
                    {["Nasional", "Internasional"].map((scale) => (
                      <label
                        key={scale}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <Checkbox
                          checked={filters.scales.includes(scale)}
                          onCheckedChange={() => handleScaleChange(scale)}
                        />
                        <span className="text-sm text-gray-700">{scale}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Budget Range */}
                <div className="mb-6">
                  <h3 className="font-semibold text-sm text-gray-700 mb-4">
                    BUDGET
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-gray-600">Min</label>
                      <Input
                        type="number"
                        placeholder="Rp"
                        value={filters.budgetMin}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            budgetMin: e.target.value,
                          }))
                        }
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Max</label>
                      <Input
                        type="number"
                        placeholder="Rp"
                        value={filters.budgetMax}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            budgetMax: e.target.value,
                          }))
                        }
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Reset Button */}
                <Button
                  onClick={handleResetFilter}
                  variant="outline"
                  className="w-full"
                >
                  Reset Filter
                </Button>
              </div>
            </div>

            {/* Events Grid */}
            <div className="flex-1">
              {paginatedEvents.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
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
      <Footer />
    </>
  );
}
