"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Bookmark } from "lucide-react";
import { apiCall } from "@/lib/api-client";

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

export default function EventCard({
  id,
  slug,
  title,
  image,
  category,
  organizer,
  organizerAvatar,
  date,
  location,
  budget,
  finalScore,
  onViewDetails,
}: EventCardProps) {
  const [save, setSave] = useState(false);

  const scorePercent = Math.round(finalScore * 100);
  const scoreBadge =
    scorePercent >= 70
      ? "bg-green-100 text-green-700"
      : scorePercent >= 50
        ? "bg-yellow-100 text-yellow-700"
        : "bg-gray-100 text-gray-600";
  return (
    <div className="flex flex-col rounded-lg border border-gray-200 overflow-hidden bg-white hover:shadow-lg transition-shadow">
      {/* Image Container */}
      <div className="relative w-full h-48 bg-gray-200">
        <Image src={image} alt={title} fill className="object-cover" />
        <Badge className="absolute top-3 left-3 bg-blue-500">{category}</Badge>
        <span
          className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${scoreBadge}`}
        >
          ✦ {scorePercent}% match
        </span>
      </div>

      {/* Content Container */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Organizer Info */}
        <div className="flex items-center gap-3 mb-3">
          <Image
            src={organizerAvatar}
            alt={organizer}
            width={32}
            height={32}
            className="rounded-full"
          />
          <span className="text-sm text-gray-600">{organizer}</span>
        </div>

        {/* Event Title */}
        <h3 className="text-lg font-semibold mb-3 line-clamp-2">{title}</h3>

        {/* Date and Location */}
        <div className="space-y-2 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>
        </div>

        {/* Button */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => onViewDetails(slug)}
            variant="outline"
            className="w-full mt-auto py-2 border border-[#003EC7] bg-white text-[#003EC7] rounded-[4px] flex-1"
          >
            Lihat Proposal
          </Button>
          <Button>
            <Bookmark />
          </Button>
        </div>
      </div>
    </div>
  );
}
