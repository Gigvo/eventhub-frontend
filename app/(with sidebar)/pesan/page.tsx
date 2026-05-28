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
  Lock,
  ArrowLeft,
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
  initiatedBy?: string;
  event: {
    id: string;
    title: string;
    slug: string;
    eoProfile?: {
      id: string;
      organizationName: string;
      campus?: string;
      logoUrl?: string | null;
    };
  };
  companyProfile?: {
    id: string;
    companyName: string;
    industry?: string;
    logoUrl?: string | null;
  };
  tier?: {
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

          let offersRes;
          let pitchesRes;
          if (u.role === "COMPANY") {
            const [oRes, pRes] = await Promise.all([
              apiCall<{ success: boolean; data: Offer[] }>("/offers/my").catch(
                (err) => {
                  console.error("Failed to load company offers", err);
                  return null;
                },
              ),
              apiCall<{ success: boolean; data: Offer[] }>(
                "/pitches/incoming",
              ).catch((err) => {
                console.error("Failed to load incoming pitches", err);
                return null;
              }),
            ]);
            offersRes = oRes;
            pitchesRes = pRes;
          } else {
            const [oRes, pRes] = await Promise.all([
              apiCall<{ success: boolean; data: Offer[] }>(
                "/offers/incoming",
              ).catch((err) => {
                console.error("Failed to load incoming offers", err);
                return null;
              }),
              apiCall<{ success: boolean; data: Offer[] }>("/pitches/my").catch(
                (err) => {
                  console.error("Failed to load eo pitches", err);
                  return null;
                },
              ),
            ]);
            offersRes = oRes;
            pitchesRes = pRes;
          }

          const allOffers: Offer[] = [];
          if (offersRes?.success && Array.isArray(offersRes.data)) {
            allOffers.push(...offersRes.data);
          }
          if (pitchesRes?.success && Array.isArray(pitchesRes.data)) {
            allOffers.push(...pitchesRes.data);
          }
          // Sort by latest createdAt descending
          allOffers.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
          setOffers(allOffers);
        }
      } catch (err) {
        console.error("Failed to load user or offers", err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const fetchOfferDetail = async (
    offerId: string,
    role: string,
    initiatedBy?: string,
  ) => {
    try {
      let endpoint = "";
      if (initiatedBy === "EO") {
        endpoint =
          role === "COMPANY"
            ? `/pitches/incoming/${offerId}`
            : `/pitches/my/${offerId}`;
      } else {
        endpoint =
          role === "COMPANY"
            ? `/offers/my/${offerId}`
            : `/offers/incoming/${offerId}`;
      }
      const res = await apiCall<{ success: boolean; data: Offer }>(endpoint);
      if (res?.success) {
        setSelectedOffer(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch detail", err);
    }
  };

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
      const interval = setInterval(() => {
        fetchMessages(selectedOffer.id);
      }, 3000);
      return () => clearInterval(interval);
    } else {
      setMessages([]);
    }
  }, [selectedOffer?.id]);

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
    <div className="flex h-[calc(100vh-64px)] md:h-[calc(100vh-128px)] bg-white rounded-none md:rounded-lg border-0 md:border border-gray-200 overflow-hidden shadow-none md:shadow-sm m-0 md:m-6">
      {/* Sidebar */}
      <div
        className={`shrink-0 border-r border-gray-200 flex flex-col bg-[#FAFAFA] ${selectedOffer ? "hidden md:flex w-[300px] lg:w-[380px]" : "w-full md:w-[300px] lg:w-[380px] flex"}`}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Messages</h2>
          </div>

          <div className="flex gap-2">
            <button className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-sm font-medium">
              Semua
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {offers.map((offer) => {
            const isSelected = selectedOffer?.id === offer.id;
            const isEO = user?.role === "EO";
            const title = isEO
              ? offer.companyProfile?.companyName || "Sponsor"
              : offer.event?.title || "Event";
            const subtitle = isEO
              ? offer.event?.title || "Event"
              : offer.event?.eoProfile?.organizationName || "Organizer";
            const badgeText = offer.status.replace("_", " ");

            return (
              <div
                key={offer.id}
                onClick={() => {
                  setSelectedOffer(offer);
                  if (user) {
                    fetchOfferDetail(offer.id, user.role);
                  }
                }}
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
                  ) : !isEO && offer.event?.eoProfile?.logoUrl ? (
                    <Image
                      src={offer.event.eoProfile.logoUrl}
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

                  <div className="flex flex-wrap gap-1.5">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                        offer.status === "ACCEPTED" ||
                        offer.status === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : offer.status === "REJECTED"
                            ? "bg-red-100 text-red-700"
                            : offer.status === "PENDING"
                              ? "bg-gray-100 text-gray-700"
                              : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {badgeText}
                    </span>
                    {offer.tier?.name && (
                      <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-blue-100 text-blue-700">
                        {offer.tier.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      {selectedOffer ? (
        <div className="flex-1 flex flex-col bg-white relative h-full min-w-0">
          {/* Header */}
          <div className="h-[72px] border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <button
                onClick={() => setSelectedOffer(null)}
                className="md:hidden p-1 mr-1 text-gray-550 hover:text-gray-700 shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center overflow-hidden shrink-0">
                <span className="text-blue-600 font-bold text-lg">
                  {user?.role === "EO"
                    ? selectedOffer.companyProfile?.companyName
                        ?.charAt(0)
                        ?.toUpperCase()
                    : selectedOffer.event?.title?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-gray-900 truncate text-sm sm:text-base">
                  {user?.role === "EO"
                    ? selectedOffer.companyProfile?.companyName
                    : selectedOffer.event?.title}
                </h3>
                <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-green-600 font-medium mt-0.5 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></span>
                  <span className="truncate">
                    Membahas {selectedOffer.event?.title} -{" "}
                    {selectedOffer.tier?.name}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* <Button
                variant="outline"
                className="rounded-full text-sm font-semibold flex items-center gap-2"
              >
                <FileText size={16} /> Lihat Proposal
              </Button>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical size={20} />
              </button> */}
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
            {selectedOffer.message &&
              (() => {
                const isMe = selectedOffer.initiatedBy === user?.role;
                const senderName = isMe
                  ? user?.name
                  : (user?.role === "COMPANY"
                      ? selectedOffer.event?.eoProfile?.organizationName
                      : selectedOffer.companyProfile?.companyName) || "Mitra";
                return (
                  <div
                    className={`flex gap-3 max-w-[80%] ${isMe ? "ml-auto flex-row-reverse" : ""}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0 flex items-center justify-center overflow-hidden">
                      <span className="text-xs font-bold text-gray-600">
                        {senderName?.charAt(0).toUpperCase()}
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
                        <p
                          className={`font-semibold mb-1 text-[10px] uppercase ${isMe ? "text-blue-200" : "text-gray-500"}`}
                        >
                          Pesan Penawaran Awal ({senderName})
                        </p>
                        {selectedOffer.message}
                      </div>
                      <div
                        className={`text-[10px] text-gray-400 mt-1.5 font-medium flex items-center gap-1 ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        {formatDate(selectedOffer.createdAt)}
                        {isMe && (
                          <CheckCircle2 size={12} className="text-blue-500" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

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
            {selectedOffer.status === "NEGOTIATING" ||
            selectedOffer.status === "UNDER_REVIEW" ||
            selectedOffer.status === "PENDING" ? (
              <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition shadow-sm">
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

                  <div className="flex justify-between items-end">
                    <div className="flex justify-between text-[10px] mt-1">
                      <span className="text-gray-500">
                        ({newMessage.length} / 2000 characters)
                      </span>
                    </div>
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
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-amber-800">
                <Lock className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                <div className="text-xs sm:text-sm">
                  <p className="font-bold text-amber-900 mb-0.5">
                    Fitur Chat Dinonaktifkan
                  </p>
                  <p className="text-amber-700 leading-relaxed font-medium">
                    {selectedOffer.status === "ACCEPTED" ||
                    selectedOffer.status === "APPROVED"
                      ? "Penawaran sponsorship telah disetujui. Komunikasi lebih lanjut dilakukan melalui WhatsApp atau email resmi."
                      : selectedOffer.status === "REJECTED"
                        ? "Penawaran ini telah ditolak. Negosiasi pesan tidak lagi tersedia."
                        : "Pesan hanya dapat dikirim ketika status penawaran sedang dalam tahap NEGOSIASI."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/50 h-full hidden md:flex">
          <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center mb-6">
            <MessageSquare size={32} className="text-blue-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Pilih penawaran untuk membaca pesan
          </h2>
          <p className="text-sm text-gray-500 max-w-sm text-center mb-8 leading-relaxed">
            Kelola komunikasi dengan sponsor dan mitra secara efisien.
          </p>
        </div>
      )}
    </div>
  );
}
