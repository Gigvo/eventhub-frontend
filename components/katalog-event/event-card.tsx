import React from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin } from "lucide-react";

interface EventCardProps {
  id: string;
  title: string;
  image: string;
  category: string;
  organizer: string;
  organizerAvatar: string;
  date: string;
  location: string;
  budget: string;
  onViewDetails: (id: string) => void;
}

export default function EventCard({
  id,
  title,
  image,
  category,
  organizer,
  organizerAvatar,
  date,
  location,
  budget,
  onViewDetails,
}: EventCardProps) {
  return (
    <div className="flex flex-col rounded-lg border border-gray-200 overflow-hidden bg-white hover:shadow-lg transition-shadow">
      {/* Image Container */}
      <div className="relative w-full h-48 bg-gray-200">
        <Image src={image} alt={title} fill className="object-cover" />
        <Badge className="absolute top-3 left-3 bg-blue-500">{category}</Badge>
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

        {/* Budget */}
        <div className="mb-4 flex items-center gap-2 justify-between pt-4 border-t border-gray-200">
          <span className="text-sm text-gray-500">BUDGET</span>
          <p className="text-sm font-light text-[#003EC7] ">{budget}</p>
        </div>

        {/* Button */}
        <Button
          onClick={() => onViewDetails(id)}
          variant="outline"
          className="w-full mt-auto py-2 border border-[#003EC7] bg-white text-[#003EC7] rounded-[4px]"
        >
          Lihat Detail
        </Button>
      </div>
    </div>
  );
}
