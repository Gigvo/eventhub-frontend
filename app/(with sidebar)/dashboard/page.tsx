import React from "react";
import Image from "next/image";
import { Calendar, MapPin, Bell, Zap } from "lucide-react";

export default function Dashboard() {
  const stats = [
    {
      label: "EVENT AKTIF",
      value: "4",
      icon: Calendar,
      iconType: "lucide",
      color: "bg-[#EFF6FF]",
    },
    {
      label: "SPONSOR MASUK",
      value: "12",
      icon: "/icons/sponsor.svg",
      iconType: "svg",
      color: "bg-[#F3F4F6]",
    },
    {
      label: "MENUNGGU RESPON",
      value: "5",
      icon: "icons/bell-danger.svg",
      iconType: "svg",
      color: "bg-[#FFDAD6]",
    },
    {
      label: "SISA TOKEN",
      value: "45",
      icon: "icons/token2.svg",
      iconType: "svg",
      color: "bg-[#F9FAFB]",
    },
  ];

  const events = [
    {
      id: 1,
      title: "Jakarta Tech Fest 2024",
      date: "12 Nov",
      location: "GBK, Jakarta",
      image: "/events/event1.jpg",
      sponsors: 3,
      status: "AKTIF",
    },
    {
      id: 2,
      title: "Startup Pitch Night",
      date: "20 Des",
      location: "BSD City",
      image: "/events/event2.jpg",
      status: "DRAFT",
    },
    {
      id: 3,
      title: "Exhibition: Future of Art",
      date: "05 Okt",
      location: "Senayan City",
      image: "/events/event3.jpg",
      status: "SELESAI",
    },
  ];

  const proposals = [
    {
      id: 1,
      company: "Telkom Indonesia",
      event: "Jakarta Tech Fest",
      package: "PLATINUM",
      date: "20 Apr 2026",
      status: "Menunggu",
      statusColor: "bg-yellow-100 text-yellow-800",
    },
    {
      id: 2,
      company: "GoTo Group",
      event: "Startup Pitch Night",
      package: "GOLD",
      date: "28 Apr 2026",
      status: "Tertarik",
      statusColor: "bg-blue-100 text-blue-800",
    },
    {
      id: 3,
      company: "Bank BCA",
      event: "Jakarta Tech Fest",
      package: "PLATINUM",
      date: "27 Apr 2026",
      status: "Disertujui",
      statusColor: "bg-green-100 text-green-800",
    },
    {
      id: 4,
      company: "Shopee",
      event: "Future of Art",
      package: "SILVER",
      date: "26 Apr 2026",
      status: "Ditolak",
      statusColor: "bg-red-100 text-red-800",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Selamat pagi, Budi!
        </h1>
        <p className="text-gray-600 mt-1">
          Ini adalah ringkasan performa event dan kemitraan Anda hari ini.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
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

      {/* Events Section */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Event Kamu</h2>
          <a href="#" className="text-blue-600 font-semibold hover:underline">
            Lihat Semua
          </a>
        </div>

        <div className="flex flex-row items-center gap-6 items-stretch">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition w-full "
            >
              {/* Event Image */}
              <div className="relative h-40 bg-gray-200">
                <div className="absolute top-3 left-3">
                  <span className="bg-black text-white text-xs font-semibold px-3 py-1 rounded">
                    {event.status}
                  </span>
                </div>
              </div>

              {/* Event Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {event.title}
                </h3>

                <div className="flex items-center gap-3 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span>{event.location}</span>
                  </div>
                </div>

                {event.sponsors && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex -space-x-2">
                      {Array.from({ length: Math.min(event.sponsors, 3) }).map(
                        (_, i) => (
                          <div
                            key={i}
                            className="w-6 h-6 bg-gray-300 rounded-full border-2 border-white"
                          />
                        ),
                      )}
                    </div>
                    <span className="text-xs text-gray-600">
                      {event.sponsors} Sponsor Berminat
                    </span>
                  </div>
                )}

                <button className="w-full text-blue-600 font-semibold text-sm hover:underline">
                  Lanjutkan Draft →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Proposals Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Proposal Terbaru</h2>
          <a href="#" className="text-blue-600 font-semibold hover:underline">
            Lihat Semua
          </a>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Perusahaan
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Event
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Paket
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Tanggal
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((proposal) => (
                <tr
                  key={proposal.id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                      <span className="font-semibold text-gray-900">
                        {proposal.company}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{proposal.event}</td>
                  <td className="px-6 py-4 ">
                    <span
                      className={
                        "text-xs font-semibold uppercase bg-[#F3F4F6] px-2 py-1 " +
                        (proposal.package === "PLATINUM"
                          ? "text-[#B45309]"
                          : proposal.package === "GOLD"
                            ? "text-[#334155]"
                            : "text-[#1D4ED8]") +
                        " rounded"
                      }
                    >
                      {proposal.package}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{proposal.date}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded ${proposal.statusColor}`}
                    >
                      {proposal.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href="#"
                      className="text-blue-600 font-semibold text-sm hover:underline"
                    >
                      Lihat
                    </a>
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
