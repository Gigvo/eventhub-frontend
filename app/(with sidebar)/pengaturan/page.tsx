"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiCall } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Camera,
  User,
  Phone,
  Mail,
  Calendar,
  Award,
  Zap,
  Sparkles,
  CheckCircle2,
  Wallet,
  ShoppingCart,
  ArrowRight,
  Lock,
  Loader2,
  Pencil,
  Plus,
} from "lucide-react";
import Image from "next/image";

interface userData {
  id: string;
  email: string;
  name: string;
  role: string;
  tokenBalance?: string;
  eoProfile?: {
    id: string;
    organizationName: string;
    organizationType: string;
    campus: string;
    logoUrl: string | null;
    description?: string;
    phoneNumber?: string;
    city?: string;
    createdAt?: string;
  };
  companyProfile?: {
    id: string;
    companyName: string;
    industry: string;
    logoUrl: string | null;
    description?: string;
    targetAudience?: string;
    createdAt?: string;
    preferences?: {
      preferredCategories?: string[];
      preferredAudienceAgeMin?: number;
      preferredAudienceAgeMax?: number;
      preferredInterests?: string[];
    };
  };
}

const AVAILABLE_CATEGORIES = [
  "TECHNOLOGY",
  "BUSINESS",
  "COMPETITION",
  "ART",
  "MUSIC",
  "SPORT",
  "EDUCATION",
];

export default function PengaturanPage() {
  const router = useRouter();

  // User details
  const [currentUser, setCurrentUser] = useState<userData | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("dims.wira@mail.com");
  const [memberSince, setMemberSince] = useState("Januari 2025");
  const [isLoading, setIsLoading] = useState(true);

  // Form State - EO
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // Form State - COMPANY (Preferensi Sponsorship)
  const [compDescription, setCompDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [preferredCategories, setPreferredCategories] = useState<string[]>([
    "TECHNOLOGY",
  ]);
  const [preferredAudienceAgeMin, setPreferredAudienceAgeMin] = useState(18);
  const [preferredAudienceAgeMax, setPreferredAudienceAgeMax] = useState(35);
  const [preferredInterests, setPreferredInterests] = useState<string[]>([
    "AI",
    "startup",
    "fintech",
  ]);
  const [interestInput, setInterestInput] = useState("");

  // Stats
  const [totalEvents, setTotalEvents] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);

  // Status indicators
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch initial profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const userRes = await apiCall<{ success: boolean; data: userData }>(
          "/auth/me",
        );

        if (userRes?.success && userRes?.data) {
          const u = userRes.data;
          setCurrentUser(u);
          setRole(u.role);

          if (u.email) setUserEmail(u.email);

          if (u.role === "EO") {
            if (u.name) setFullName(u.name);
            if (u.eoProfile) {
              if (u.eoProfile.description)
                setDescription(u.eoProfile.description);
              if (u.eoProfile.logoUrl) setLogoUrl(u.eoProfile.logoUrl);

              // Format phone number
              const rawPhone = u.eoProfile.phoneNumber || "";
              if (rawPhone.startsWith("+62")) {
                setPhoneNumber(rawPhone.replace("+62", "").trim());
              } else if (rawPhone.startsWith("62")) {
                setPhoneNumber(rawPhone.slice(2).trim());
              } else if (rawPhone.startsWith("0")) {
                setPhoneNumber(rawPhone.slice(1).trim());
              } else {
                setPhoneNumber(rawPhone);
              }

              if (u.eoProfile.createdAt) {
                const dateObj = new Date(u.eoProfile.createdAt);
                setMemberSince(
                  dateObj.toLocaleDateString("id-ID", {
                    month: "long",
                    year: "numeric",
                  }),
                );
              }
            }

            // Fetch EO statistics
            const [eventsRes, offersRes, balanceRes] = await Promise.all([
              apiCall<{ data: any[] }>("/events/my").catch(() => ({
                data: [],
              })),
              apiCall<{ data: any[] }>("/offers/incoming").catch(() => ({
                data: [],
              })),
              apiCall<{ success: boolean; data: { tokenBalance: number } }>(
                "/billing/balance",
              ).catch(() => ({
                success: false,
                data: { tokenBalance: 45 },
              })),
            ]);

            setTotalEvents(eventsRes?.data?.length || 0);
            setTokenBalance(balanceRes?.data?.tokenBalance ?? 0);
          } else if (u.role === "COMPANY") {
            if (u.name) setFullName(u.name);
            if (u.companyProfile) {
              const cp = u.companyProfile;
              if (cp.companyName) setFullName(cp.companyName);
              if (cp.description) setCompDescription(cp.description);
              if (cp.targetAudience) setTargetAudience(cp.targetAudience);
              if (cp.logoUrl) setLogoUrl(cp.logoUrl);

              if (cp.createdAt) {
                const dateObj = new Date(cp.createdAt);
                setMemberSince(
                  dateObj.toLocaleDateString("id-ID", {
                    month: "long",
                    year: "numeric",
                  }),
                );
              }

              if (cp.preferences) {
                const prefs = cp.preferences;
                if (Array.isArray(prefs.preferredCategories)) {
                  setPreferredCategories(prefs.preferredCategories);
                }
                if (prefs.preferredAudienceAgeMin !== undefined) {
                  setPreferredAudienceAgeMin(
                    Number(prefs.preferredAudienceAgeMin),
                  );
                }
                if (prefs.preferredAudienceAgeMax !== undefined) {
                  setPreferredAudienceAgeMax(
                    Number(prefs.preferredAudienceAgeMax),
                  );
                }
                if (Array.isArray(prefs.preferredInterests)) {
                  setPreferredInterests(prefs.preferredInterests);
                }
              }
            }

            // Fetch COMPANY statistics
            const [pitchesRes, savedRes, balanceRes] = await Promise.all([
              apiCall<{ data: any[] }>("/pitches/incoming").catch(() => ({
                data: [],
              })),
              apiCall<{ data: any[] }>("/saved-events").catch(() => ({
                data: [],
              })),
              apiCall<{ success: boolean; data: { tokenBalance: number } }>(
                "/billing/balance",
              ).catch(() => ({
                success: false,
                data: { tokenBalance: 45 },
              })),
            ]);

            setTotalEvents(pitchesRes?.data?.length || 0);
            setTokenBalance(balanceRes?.data?.tokenBalance ?? 0);
          }
        }
      } catch (err) {
        console.error("Failed to load user profile", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Category Selector Toggle
  const toggleCategory = (cat: string) => {
    setPreferredCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  // Add tag to preferred interests
  const handleAddInterest = () => {
    const val = interestInput.trim();
    if (val && !preferredInterests.includes(val)) {
      setPreferredInterests([...preferredInterests, val]);
    }
    setInterestInput("");
  };

  // Remove tag
  const handleRemoveInterest = (tag: string) => {
    setPreferredInterests(preferredInterests.filter((t) => t !== tag));
  };

  // Submit EO Changes
  const handleSubmitEO = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus("idle");
    setErrorMessage("");

    try {
      let formattedPhone = phoneNumber.trim();
      if (!formattedPhone.startsWith("0") && !formattedPhone.startsWith("+")) {
        formattedPhone = "0" + formattedPhone;
      }

      await apiCall<{ success: boolean }>("/profile/eo", {
        method: "PATCH",
        body: JSON.stringify({
          name: fullName,
          description: description,
          phoneNumber: formattedPhone,
        }),
      });

      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 4000);
    } catch (err: any) {
      console.error("Failed to update EO profile", err);
      setSaveStatus("error");
      setErrorMessage(
        err?.message || "Gagal menyimpan perubahan. Silakan coba lagi.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Submit COMPANY Changes
  const handleSubmitCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus("idle");
    setErrorMessage("");

    try {
      await apiCall<{ success: boolean }>("/profile/company", {
        method: "PATCH",
        body: JSON.stringify({
          description: compDescription,
          targetAudience: targetAudience,
          preferences: {
            preferredCategories: preferredCategories,
            preferredAudienceAgeMin: Number(preferredAudienceAgeMin),
            preferredAudienceAgeMax: Number(preferredAudienceAgeMax),
            preferredInterests: preferredInterests,
          },
        }),
      });

      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 4000);
    } catch (err: any) {
      console.error("Failed to update company profile", err);
      setSaveStatus("error");
      setErrorMessage(
        err?.message || "Gagal menyimpan perubahan. Silakan coba lagi.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Helper for Initials
  const getInitials = (name: string) => {
    if (!name) return "US";
    const cleanName = name.replace(/[^a-zA-Z ]/g, "").trim();
    const parts = cleanName.split(" ").filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0] ? parts[0].slice(0, 2).toUpperCase() : "US";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-[#003EC7] animate-spin" />
          <p className="text-sm font-semibold text-slate-500">
            Memuat Pengaturan Profil...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 md:p-8 animate-fadeIn">
      {/* Header section */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Pengaturan
        </h1>
        <p className="text-sm text-slate-550 mt-1 font-medium leading-relaxed">
          Kelola akun dan preferensi operasional Anda untuk hasil maksimal.
        </p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* LEFT COLUMN: Profile Form (EO or COMPANY) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status banners */}
          {saveStatus === "success" && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 animate-slideIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-sm font-semibold">
                Perubahan profil Anda berhasil disimpan!
              </div>
            </div>
          )}

          {saveStatus === "error" && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-3 animate-slideIn">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 shrink-0 animate-ping" />
              <div className="text-sm font-semibold">{errorMessage}</div>
            </div>
          )}

          {role === "EO" ? (
            /* ──────────────── EVENT ORGANIZER FORM ──────────────── */
            <Card className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
              <div className="border-b border-[#F1F5F9] px-6 py-5 bg-[#FAFCFF]">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Profil Event Organizer
                </h2>
              </div>

              <form onSubmit={handleSubmitEO} className="p-6 sm:p-8 space-y-8">
                {/* Form fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs sm:text-sm font-bold text-slate-700">
                      Nama Lengkap
                    </label>
                    <Input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nama Lengkap Anda"
                      className="w-full h-11 border border-slate-200 focus:border-[#1A56DB] focus:ring-1 focus:ring-[#1A56DB] rounded-xl text-slate-800 text-sm font-semibold transition bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs sm:text-sm font-bold text-slate-700">
                      Nomor Telepon
                    </label>
                    <div className="flex rounded-xl overflow-hidden border border-slate-200 focus-within:border-[#1A56DB] focus-within:ring-1 focus-within:ring-[#1A56DB] transition bg-white">
                      <span className="bg-[#F8FAFC] border-r border-slate-200 px-4 flex items-center justify-center text-slate-500 text-sm font-bold select-none">
                        +62
                      </span>
                      <Input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) =>
                          setPhoneNumber(e.target.value.replace(/\D/g, ""))
                        }
                        placeholder="Nomor Telepon / WhatsApp"
                        className="flex-1 h-11 border-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none text-slate-800 text-sm font-semibold"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-bold text-slate-700">
                    Deskripsi Organisasi
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    placeholder="Ceritakan pengalaman organisasi Anda dalam mengelola event..."
                    className="w-full p-4 border border-slate-200 focus:border-[#1A56DB] focus:ring-1 focus:ring-[#1A56DB] rounded-xl text-slate-800 text-sm font-semibold transition bg-white outline-none resize-none leading-relaxed"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="bg-[#1A56DB] hover:bg-blue-800 text-white font-bold px-8 h-11 rounded-xl shadow-md transition active:scale-[0.98] disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      "Simpan Perubahan"
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            /* ──────────────── COMPANY / SPONSOR PREFERENCES FORM ──────────────── */
            <Card className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
              <div className="border-b border-[#F1F5F9] px-6 py-5 bg-[#FAFCFF]">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Preferensi Sponsorship
                </h2>
              </div>

              <form
                onSubmit={handleSubmitCompany}
                className="p-6 sm:p-8 space-y-6"
              >
                {/* Description Target & Audience description */}
                <div className="gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs sm:text-sm font-bold text-slate-700">
                      Target Audiens
                    </label>
                    <Input
                      type="text"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="Mahasiswa, Fresh Graduate"
                      className="w-full h-11 border border-slate-200 focus:border-[#1A56DB] focus:ring-1 focus:ring-[#1A56DB] rounded-xl text-slate-800 text-sm font-semibold bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs sm:text-sm font-bold text-slate-700">
                      Deskripsi Perusahaan Target
                    </label>
                    <textarea
                      value={compDescription}
                      onChange={(e) => setCompDescription(e.target.value)}
                      placeholder="Misal: Perusahaan Fintech rintisan"
                      rows={5}
                      className="w-full p-4 border border-slate-200 focus:border-[#1A56DB] focus:ring-1 focus:ring-[#1A56DB] rounded-xl text-slate-800 text-sm font-semibold transition bg-white outline-none resize-none leading-relaxed"
                    />
                  </div>
                </div>

                {/* Event Category Selector */}
                <div className="space-y-3">
                  <label className="block text-xs sm:text-sm font-bold text-slate-700">
                    Kategori Event
                  </label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {AVAILABLE_CATEGORIES.map((cat) => {
                      const isSelected = preferredCategories.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleCategory(cat)}
                          className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-full transition-all duration-200 border ${
                            isSelected
                              ? "bg-[#1A56DB] border-[#1A56DB] text-white hover:bg-blue-800 shadow-sm"
                              : "bg-white border-[#E2E8F0] text-slate-700 hover:bg-[#F8FAFC]"
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Target Audience Age Range */}
                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-bold text-slate-700">
                    Rentang Usia Audiens
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="w-24">
                      <Input
                        type="number"
                        value={preferredAudienceAgeMin}
                        onChange={(e) =>
                          setPreferredAudienceAgeMin(Number(e.target.value))
                        }
                        className="h-11 border border-slate-200 rounded-xl text-center font-bold text-slate-800"
                        min={0}
                      />
                    </div>
                    <span className="text-slate-400 text-xs sm:text-sm font-medium">
                      s/d
                    </span>
                    <div className="w-24">
                      <Input
                        type="number"
                        value={preferredAudienceAgeMax}
                        onChange={(e) =>
                          setPreferredAudienceAgeMax(Number(e.target.value))
                        }
                        className="h-11 border border-slate-200 rounded-xl text-center font-bold text-slate-800"
                        min={0}
                      />
                    </div>
                  </div>
                </div>

                {/* Target Interests (Tags) */}
                <div className="space-y-3 pt-2">
                  <label className="block text-xs sm:text-sm font-bold text-slate-700">
                    Minat Audiens (Tags)
                  </label>

                  {/* Tag display box */}
                  <div className="w-full min-h-[50px] border border-slate-200 rounded-xl p-3 flex flex-wrap gap-2 bg-slate-50/50">
                    {preferredInterests.length === 0 ? (
                      <span className="text-slate-400 text-xs font-semibold py-1">
                        Belum ada tag minat ditambahkan.
                      </span>
                    ) : (
                      preferredInterests.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 bg-[#EFF6FF] border border-blue-100 text-[#1E40AF] text-xs font-bold px-3 py-1.5 rounded-full"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveInterest(tag)}
                            className="hover:text-red-600 font-black leading-none text-sm cursor-pointer ml-1"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  {/* Tag addition field */}
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={interestInput}
                      onChange={(e) => setInterestInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddInterest();
                        }
                      }}
                      placeholder="Tambah minat baru (contoh: AI, startup) lalu tekan Enter"
                      className="flex-1 h-11 border border-slate-200 focus:border-[#1A56DB] focus:ring-1 focus:ring-[#1A56DB] rounded-xl text-slate-800 text-sm font-semibold bg-white"
                    />
                    <Button
                      type="button"
                      onClick={handleAddInterest}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 h-11 px-4 rounded-xl shadow-none"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="bg-[#1A56DB] hover:bg-blue-800 text-white font-bold px-8 h-11 rounded-xl shadow-md transition active:scale-[0.98] disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      "Simpan Perubahan"
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN: Stacked cards */}
        <div className="space-y-6">
          {/* CARD 1: Profile Summary Preview Card */}
          <Card className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden p-6 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg relative text-white font-extrabold text-3xl">
                {logoUrl ? (
                  <Image
                    src={logoUrl || ""}
                    alt="Preview avatar"
                    fill
                    className="object-cover rounded-2xl"
                    unoptimized
                  />
                ) : (
                  getInitials(fullName)
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900 truncate px-2">
                {fullName || "Nama Akun Anda"}
              </h3>
              <div className="inline-block px-4 py-1 bg-[#EEF2FF] text-[#003EC7] rounded-full text-xs font-black tracking-wider uppercase">
                {role === "EO" ? "EVENT ORGANIZER" : "SPONSOR / COMPANY"}
              </div>
            </div>

            <div className="border-t border-[#F1F5F9] pt-4 space-y-3.5 text-left text-sm">
              <div className="flex justify-between items-center gap-2">
                <span className="text-slate-450 font-bold">Email Utama</span>
                <span className="text-slate-800 font-extrabold truncate">
                  {userEmail}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-slate-450 font-bold">Member Sejak</span>
                <span className="text-slate-800 font-extrabold">
                  {memberSince}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl p-4 text-center">
                <div className="text-2xl font-black text-[#003EC7]">
                  {totalEvents}
                </div>
                <div className="text-[10px] font-black text-slate-450 tracking-wider uppercase mt-1">
                  {role === "EO" ? "TOTAL EVENT" : "PROPOSAL BARU"}
                </div>
              </div>
            </div>
          </Card>

          {/* CARD 2: Token Quota & Management Card */}
          <Card className="border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden bg-white">
            <div className="bg-gradient-to-br from-[#1E40AF] to-[#1D4ED8] p-6 text-white space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black tracking-widest text-[#93C5FD] uppercase">
                  SISA TOKEN
                </span>
              </div>

              <div className="text-5xl font-black tracking-tight">
                {tokenBalance}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold text-[#BFDBFE]">
                  <span>
                    {tokenBalance < 20 ? "Hampir Habis" : "Saldo Cukup"}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-4 bg-white">
              <Button
                onClick={() => router.push("/token-management")}
                className="w-full bg-[#E0A922] hover:bg-[#C99416] hover:shadow-md active:scale-[0.99] text-white font-extrabold h-11 rounded-xl transition flex items-center justify-center gap-2 shadow-sm border-none"
              >
                <ShoppingCart className="w-4 h-4" />
                Isi Ulang Token
              </Button>

              <button
                onClick={() => router.push("/token-management")}
                className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-black text-[#1A56DB] hover:text-blue-800 transition py-1"
              >
                Lihat Riwayat Token
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
