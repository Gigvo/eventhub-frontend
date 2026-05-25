"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Edit,
  MoreVertical,
  FileText,
  Download,
  Send,
  CheckCircle2,
  Paperclip,
  Bold,
  Italic,
  List,
  MessageSquare,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";
import { apiCall } from "@/lib/api-client";
import { Button } from "@/components/ui/button";

interface UserAuth {
  id: string;
  role: string;
  name: string;
}

interface Offer {
  id: string;
  status: string;
  message: string;
  createdAt: string;
  event: {
    id: string;
    title: string;
    slug: string;
  };
  companyProfile: {
    id: string;
    companyName: string;
    industry: string;
    logoUrl: string | null;
  };
  tier: {
    name: string;
    price: number;
  };
}

interface Message {
  id: string;
  offerId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    role: string;
  };
}

export default function PesanPage() {
  const [user, setUser] = useState<UserAuth | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const userRes = await apiCall<{ success: boolean; data: UserAuth }>(
          "/auth/me",
        );
        if (userRes?.success) {
          const u = userRes.data;
          setUser(u);
          const endpoint =
            u.role === "COMPANY" ? "/offers/my" : "/offers/incoming";
          const offersRes = await apiCall<{ success: boolean; data: Offer[] }>(
            endpoint,
          );
          if (offersRes?.success) {
            setOffers(offersRes.data);
          }
        }
      } catch (err) {
        console.error("Failed to load user or offers", err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const fetchMessages = async (offerId: string) => {
    try {
      const res = await apiCall<{ success: boolean; data: Message[] }>(
        `/offers/${offerId}/messages`,
      );
      if (res?.success) {
        // Sort messages chronologically
        const sorted = [...res.data].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
        setMessages(sorted);
      }
    } catch (err) {
      console.error("Failed to fetch messages", err);
    }
  };

  useEffect(() => {
    if (selectedOffer) {
      fetchMessages(selectedOffer.id);
      // Asynchronous polling every 3 seconds for new messages
      const interval = setInterval(() => {
        fetchMessages(selectedOffer.id);
      }, 3000);
      return () => clearInterval(interval);
    } else {
      setMessages([]);
    }
  }, [selectedOffer]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedOffer) return;

    setIsSending(true);
    try {
      const res = await apiCall<{ success: boolean; data: Message }>(
        `/offers/${selectedOffer.id}/messages`,
        {
          method: "POST",
          body: JSON.stringify({ content: newMessage }),
        },
      );
      if (res?.success) {
        setMessages((prev) => [...prev, res.data]);
        setNewMessage("");
      }
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return (
      d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) +
      (d.getHours() < 12 ? " AM" : " PM")
    );
  };

  const formatShortDate = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
      return d.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };

  if (isLoading)
    return (
      <div className="flex h-[calc(100vh-128px)] items-center justify-center text-gray-500 font-medium m-6">
        Memuat percakapan...
      </div>
    );

  return (
    <div className="flex h-[calc(100vh-128px)] bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm m-6">
      {/* Sidebar */}
      <div className="w-[300px] lg:w-[380px] shrink-0 border-r border-gray-200 flex flex-col bg-[#FAFAFA] hidden md:flex">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Messages</h2>
            {/* <button className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition">
              <Edit size={20} />
            </button> */}
          </div>
          {/* <div className="relative mb-4">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
            />
          </div> */}
          <div className="flex gap-2">
            <button className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-sm font-medium">
              Semua
            </button>
            {/* <button className="px-4 py-1.5 bg-transparent text-gray-600 hover:bg-gray-200 rounded-full text-sm font-medium transition">Belum Dibaca</button>
            <button className="px-4 py-1.5 bg-transparent text-gray-600 hover:bg-gray-200 rounded-full text-sm font-medium transition">Arsip</button> */}
          </div>
        </div>

        {/* <div className="bg-blue-100/50 px-4 py-2 flex items-center text-xs font-bold text-blue-800 tracking-wider border-b border-gray-100">
          <span className="w-2 h-2 rounded-full bg-blue-600 mr-2"></span>2 PESAN
          BELUM DIBACA
        </div> */}

        <div className="flex-1 overflow-y-auto">
          {offers.map((offer) => {
            const isSelected = selectedOffer?.id === offer.id;
            const isEO = user?.role === "EO";
            const title = isEO
              ? offer.companyProfile?.companyName || "Sponsor"
              : offer.event?.title;
            const subtitle = isEO
              ? offer.event?.title
              : offer.companyProfile?.companyName || "Sponsor";
            const badgeText = isEO
              ? offer.status.replace("_", " ")
              : offer.tier?.name;

            return (
              <div
                key={offer.id}
                onClick={() => setSelectedOffer(offer)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition flex gap-3 ${isSelected ? "bg-blue-50/50" : "hover:bg-gray-50"}`}
              >
                <div className="w-10 h-10 rounded-full bg-white border border-gray-200 overflow-hidden shrink-0 relative flex items-center justify-center">
                  {isEO && offer.companyProfile?.logoUrl ? (
                    <Image
                      src={offer.companyProfile.logoUrl}
                      alt={title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="font-bold text-gray-400 text-lg">
                      {title.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-sm text-gray-900 truncate pr-2">
                      {title}
                    </h4>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                      {formatShortDate(offer.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-blue-600 font-medium mb-1 truncate">
                    {subtitle}
                  </p>
                  <p className="text-xs text-gray-500 truncate mb-2">
                    {offer.message || "Memulai percakapan..."}
                  </p>

                  <span
                    className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                      isEO
                        ? offer.status === "ACCEPTED"
                          ? "bg-green-100 text-green-700"
                          : offer.status === "REJECTED"
                            ? "bg-red-100 text-red-700"
                            : offer.status === "PENDING"
                              ? "bg-gray-100 text-gray-700"
                              : "bg-yellow-100 text-yellow-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {badgeText}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      {selectedOffer ? (
        <div className="flex-1 flex flex-col bg-white relative h-full">
          {/* Header */}
          <div className="h-[72px] border-b border-gray-200 px-6 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center overflow-hidden shrink-0">
                <span className="text-blue-600 font-bold text-lg">
                  {user?.role === "EO"
                    ? selectedOffer.companyProfile?.companyName
                        ?.charAt(0)
                        ?.toUpperCase()
                    : selectedOffer.event?.title?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">
                  {user?.role === "EO"
                    ? selectedOffer.companyProfile?.companyName
                    : selectedOffer.event?.title}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  Membahas {selectedOffer.event?.title} -{" "}
                  {selectedOffer.tier?.name}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                className="rounded-full text-sm font-semibold flex items-center gap-2"
              >
                <FileText size={16} /> Lihat Proposal
              </Button>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical size={20} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 flex flex-col gap-6">
            <div className="text-center mt-2 mb-4">
              <span className="bg-white border border-gray-200 text-gray-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                {new Date(selectedOffer.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Display the initial offer message */}
            {selectedOffer.message && (
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-blue-100 shrink-0 flex items-center justify-center overflow-hidden">
                  <span className="text-xs font-bold text-blue-600">S</span>
                </div>
                <div>
                  <div className="p-4 rounded-2xl text-sm leading-relaxed bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm">
                    <p className="font-semibold mb-1 text-xs text-gray-500 uppercase">
                      Pesan Penawaran Awal
                    </p>
                    {selectedOffer.message}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1.5 font-medium flex items-center gap-1 justify-start">
                    {formatDate(selectedOffer.createdAt)}
                  </div>
                </div>
              </div>
            )}

            {messages.map((msg) => {
              const isMe = msg.senderId === user?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-[80%] ${isMe ? "ml-auto flex-row-reverse" : ""}`}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0 flex items-center justify-center overflow-hidden">
                    <span className="text-xs font-bold text-gray-600">
                      {isMe
                        ? user?.name?.charAt(0).toUpperCase()
                        : msg.sender?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div
                      className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        isMe
                          ? "bg-blue-600 text-white rounded-tr-sm"
                          : "bg-white border border-gray-200 text-gray-800 rounded-tl-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                    <div
                      className={`text-[10px] text-gray-400 mt-1.5 font-medium flex items-center gap-1 ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      {formatDate(msg.createdAt)}{" "}
                      {isMe && (
                        <CheckCircle2 size={12} className="text-blue-500" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} className="h-2" />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-200 shrink-0">
            <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition shadow-sm">
              {/* <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex items-center gap-3">
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  <Bold size={16} />
                </button>
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  <Italic size={16} />
                </button>
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  <List size={16} />
                </button>
                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  <Paperclip size={16} />
                </button>
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-700 p-1"
                >
                  <ImageIcon size={16} />
                </button>
              </div> */}
              <form onSubmit={handleSend} className="bg-white p-3 relative">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Tulis pesan formal Anda di sini..."
                  className="w-full resize-none outline-none text-sm text-gray-800 placeholder:text-gray-400 min-h-[60px]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                />
                <div className="flex justify-between items-end mt-2">
                  <span className="text-[10px] text-gray-400">
                    Draft disimpan otomatis pada{" "}
                    {new Date().toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <Button
                    type="submit"
                    disabled={isSending || !newMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2 h-auto text-sm font-semibold flex items-center gap-2 shadow-sm transition"
                  >
                    Kirim Pesan <Send size={14} />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50 h-full">
          <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-6">
            <MessageSquare size={32} className="text-blue-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Pilih penawaran untuk membaca pesan
          </h2>
          <p className="text-sm text-gray-500 max-w-sm text-center mb-8 leading-relaxed">
            Kelola komunikasi dengan sponsor dan mitra secara efisien. Semua
            riwayat chat, lampiran proposal, dan rincian paket tersedia di sini.
          </p>
          <div className="flex flex-col gap-3 w-full max-w-md px-6">
            <div className="bg-white p-4 rounded-xl border border-gray-200 flex gap-4 items-start shadow-sm">
              <div className="mt-1">
                <Search className="text-gray-400" size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900">
                  Gunakan Filter
                </h4>
                <p className="text-xs text-gray-500">
                  Cari berdasarkan status pesan atau kategori acara.
                </p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 flex gap-4 items-start shadow-sm">
              <div className="mt-1">
                <FileText className="text-gray-400" size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900">
                  Cek Proposal
                </h4>
                <p className="text-xs text-gray-500">
                  Proposal terlampir otomatis di dalam percakapan terkait.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
