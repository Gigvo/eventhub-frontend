"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { apiCall } from "@/lib/api-client";
import { auth } from "@/lib/firebase";
import Image from "next/image";
import { Calendar, Building2, BadgeCheck, Info } from "lucide-react";
import Footer from "@/components/footer";
import NavbarOnboarding from "@/components/onboarding/navbar-onboarding";
import { useAuth } from "@/providers/auth-provider";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Role = "EO" | "COMPANY" | null;

interface OrganizerProfile {
  organizationName: string;
  organizationType: string;
  city: string;
  description: string;
  campus: string;
  phoneNumber: string;
}

interface SponsorProfile {
  companyName: string;
  industry: string;
  city: string;
  description: string;
  website: string;
  phoneNumber: string;
  targetAudience: string[];
}

interface SponsorPreferences {
  preferredCategories: string[];
  preferredAudienceAgeMin: number | "";
  preferredAudienceAgeMax: number | "";
  preferredInterests: string[];
}

const DRAFT_KEY = "onboardingDraft";

function loadDraft() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function Onboarding() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [isHydrated, setIsHydrated] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [role, setRole] = useState<Role>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");

  // Resolve userName (from responsive version — handles firebase displayName fallback)
  useEffect(() => {
    if (authLoading) return;
    if (typeof window !== "undefined") {
      const sessionName = sessionStorage.getItem("pendingFullName");
      const firebaseName =
        auth.currentUser?.displayName ||
        auth.currentUser?.email?.split("@")[0] ||
        "User";
      let resolvedName = sessionName || firebaseName;
      if (resolvedName.trim().length < 2) {
        resolvedName = "User Hub";
      }
      setUserName(resolvedName);
    }
  }, [authLoading]);

  const [organizerData, setOrganizerData] = useState<OrganizerProfile>({
    organizationName: "",
    organizationType: "",
    city: "",
    description: "",
    campus: "",
    phoneNumber: "",
  });

  const [sponsorData, setSponsorData] = useState<SponsorProfile>({
    companyName: "",
    industry: "",
    city: "",
    description: "",
    website: "",
    phoneNumber: "",
    targetAudience: [],
  });

  const [sponsorPrefs, setSponsorPrefs] = useState<SponsorPreferences>({
    preferredCategories: [],
    preferredAudienceAgeMin: "",
    preferredAudienceAgeMax: "",
    preferredInterests: [],
  });

  const [audienceInput, setAudienceInput] = useState("");
  const [interestInput, setInterestInput] = useState("");

  useEffect(() => {
    if (authLoading) return;

    const currentUid = auth.currentUser?.uid ?? null;
    const draft = loadDraft();

    if (draft) {
      const isStale = draft.uid && currentUid && draft.uid !== currentUid;
      if (isStale) {
        localStorage.removeItem(DRAFT_KEY);
      } else {
        // eslint-disable-next-line
        if (draft.currentStep != null) setCurrentStep(draft.currentStep);
        if (draft.role != null) setRole(draft.role);
        if (draft.organizerData)
          setOrganizerData((prev) => ({ ...prev, ...draft.organizerData }));
        if (draft.sponsorData)
          setSponsorData((prev) => ({ ...prev, ...draft.sponsorData }));
        if (draft.sponsorPrefs)
          setSponsorPrefs((prev) => ({ ...prev, ...draft.sponsorPrefs }));
      }
    }
    setIsHydrated(true);
  }, [authLoading]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      const uid = auth.currentUser?.uid ?? null;
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          uid,
          currentStep,
          role,
          organizerData,
          sponsorData,
          sponsorPrefs,
        }),
      );
    } catch {}
  }, [isHydrated, currentStep, role, organizerData, sponsorData, sponsorPrefs]);

  const addTag = (
    key: "targetAudience" | "preferredInterests",
    value: string,
  ) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (key === "targetAudience") {
      setSponsorData((prev) => ({
        ...prev,
        targetAudience: prev.targetAudience.includes(trimmed)
          ? prev.targetAudience
          : [...prev.targetAudience, trimmed],
      }));
      setAudienceInput("");
    } else {
      setSponsorPrefs((prev) => ({
        ...prev,
        preferredInterests: prev.preferredInterests.includes(trimmed)
          ? prev.preferredInterests
          : [...prev.preferredInterests, trimmed],
      }));
      setInterestInput("");
    }
  };

  const removeTag = (
    key: "targetAudience" | "preferredInterests",
    tag: string,
  ) => {
    if (key === "targetAudience") {
      setSponsorData((prev) => ({
        ...prev,
        targetAudience: prev.targetAudience.filter((t) => t !== tag),
      }));
    } else {
      setSponsorPrefs((prev) => ({
        ...prev,
        preferredInterests: prev.preferredInterests.filter((t) => t !== tag),
      }));
    }
  };

  const toggleCategory = (cat: string) => {
    setSponsorPrefs((prev) => ({
      ...prev,
      preferredCategories: prev.preferredCategories.includes(cat)
        ? prev.preferredCategories.filter((c) => c !== cat)
        : [...prev.preferredCategories, cat],
    }));
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleOrganizerChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setOrganizerData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSponsorChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setSponsorData((prev) => ({ ...prev, [name]: value }));
  };

  // Full API submit from responsive version, goes to step 3 (review) on success
  const handleSubmitProfile = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      if (role === "EO") {
        if (
          !organizerData.organizationName ||
          !organizerData.organizationType ||
          !organizerData.city
        ) {
          setSubmitError("Nama organisasi, jenis, dan kota wajib diisi.");
          return;
        }

        if (organizerData.description.length < 10) {
          setSubmitError("Deskripsi organisasi minimal 10 karakter.");
          return;
        }

        await apiCall("/auth/register", {
          method: "POST",
          requireAuth: true,
          body: JSON.stringify({
            role: "EO",
            name: userName,
            profile: {
              organizationName: organizerData.organizationName,
              organizationType: organizerData.organizationType,
              campus: organizerData.campus,
              phoneNumber: organizerData.phoneNumber,
              city: organizerData.city,
              description: organizerData.description,
            },
          }),
        });

        try {
          await apiCall("/profile/eo", {
            method: "PATCH",
            requireAuth: true,
            body: JSON.stringify({
              name: userName,
              description: organizerData.description,
              phoneNumber: organizerData.phoneNumber,
            }),
          });
        } catch (patchErr) {
          console.warn("PATCH /profile/eo failed (non-blocking):", patchErr);
        }
      } else if (role === "COMPANY") {
        const targetAudienceStr = sponsorData.targetAudience.join(", ");
        if (!sponsorData.companyName) {
          setSubmitError("Nama perusahaan wajib diisi.");
          return;
        }
        if (!sponsorData.industry) {
          setSubmitError("Industri wajib dipilih.");
          return;
        }
        if (!sponsorData.city) {
          setSubmitError("Kota wajib dipilih.");
          return;
        }
        if (sponsorData.description.length < 10) {
          setSubmitError("Deskripsi perusahaan minimal 10 karakter.");
          return;
        }
        if (targetAudienceStr.length < 10) {
          setSubmitError(
            "Target audiens terlalu singkat. Tambahkan minimal 1-2 tag yang cukup deskriptif.",
          );
          return;
        }

        const normalizedWebsite = sponsorData.website
          ? /^https?:\/\//i.test(sponsorData.website)
            ? sponsorData.website
            : `https://${sponsorData.website}`
          : undefined;

        await apiCall("/auth/register", {
          method: "POST",
          requireAuth: true,
          body: JSON.stringify({
            role: "COMPANY",
            name: userName,
            profile: {
              companyName: sponsorData.companyName,
              industry: sponsorData.industry,
              description: sponsorData.description,
              ...(normalizedWebsite ? { website: normalizedWebsite } : {}),
              phoneNumber: sponsorData.phoneNumber,
              city: sponsorData.city,
              targetAudience: targetAudienceStr,
            },
          }),
        });

        try {
          await apiCall("/profile/company", {
            method: "PATCH",
            requireAuth: true,
            body: JSON.stringify({
              preferences: {
                preferredCategories: sponsorPrefs.preferredCategories,
                ...(sponsorPrefs.preferredAudienceAgeMin !== ""
                  ? {
                      preferredAudienceAgeMin: Number(
                        sponsorPrefs.preferredAudienceAgeMin,
                      ),
                    }
                  : {}),
                ...(sponsorPrefs.preferredAudienceAgeMax !== ""
                  ? {
                      preferredAudienceAgeMax: Number(
                        sponsorPrefs.preferredAudienceAgeMax,
                      ),
                    }
                  : {}),
                preferredInterests: sponsorPrefs.preferredInterests,
              },
            }),
          });
        } catch (patchErr) {
          console.warn(
            "PATCH /profile/company failed (non-blocking):",
            patchErr,
          );
        }
      }

      sessionStorage.removeItem("pendingFullName");
      localStorage.removeItem(DRAFT_KEY);

      setCurrentStep(3);
    } catch (error: any) {
      console.error("Failed to submit profile:", error);
      setSubmitError(
        error?.message ?? "Gagal menyimpan profil. Silakan coba lagi.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isHydrated) return null;

  // Step 1: Role Selection
  if (currentStep === 1) {
    return (
      <>
        <NavbarOnboarding />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl p-6 sm:p-12">
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Apa peran Anda?
              </h1>
              <p className="text-gray-600">
                Pilih peran yang sesuai dengan tujuan Anda di EventHub.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {/* Event Organizer Option */}
              <div
                onClick={() => setRole("EO")}
                className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                  role === "EO"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-300 hover:border-blue-600 hover:bg-blue-50"
                }`}
              >
                <div className="flex justify-center mb-4">
                  <Calendar className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-center mb-1">
                  Saya Event Organizer
                </h3>
                <p className="text-sm text-gray-600 text-center">
                  Mencari sponsor untuk event saya
                </p>
              </div>

              {/* Sponsor Option */}
              <div
                onClick={() => setRole("COMPANY")}
                className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                  role === "COMPANY"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-300 hover:border-blue-600 hover:bg-blue-50"
                }`}
              >
                <div className="flex justify-center mb-4">
                  <Building2 className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-center mb-1">
                  Saya Perusahaan / Sponsor
                </h3>
                <p className="text-sm text-gray-600 text-center">
                  Mencari event untuk sponsorship
                </p>
              </div>
            </div>

            <Button
              onClick={() => setCurrentStep(2)}
              disabled={!role}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Lanjutkan
            </Button>
            <p className="text-center text-sm text-gray-600 mt-4">
              Sudah punya akun?{" "}
              <a href="/login" className="text-blue-600 hover:underline">
                Masuk di sini
              </a>
            </p>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  // Step 2: Event Organizer Profile
  if (currentStep === 2 && role === "EO") {
    return (
      <>
        <NavbarOnboarding />
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 mt-16 sm:mt-20">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
              Lengkapi Profil Eventmu
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Form Section */}
              <div className="lg:col-span-2 space-y-6 p-4 sm:p-6 bg-white rounded-[8px] shadow-sm border border-[#C3C5D9]">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Organisasi
                  </label>
                  <Input
                    type="text"
                    name="organizationName"
                    placeholder="Contoh: BEM KM Universitas Gadjah Mada"
                    value={organizerData.organizationName}
                    onChange={handleOrganizerChange}
                    className="w-full h-10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jenis Organisasi
                  </label>
                  <Select
                    value={organizerData.organizationType}
                    onValueChange={(value) =>
                      setOrganizerData((prev) => ({
                        ...prev,
                        organizationType: value,
                      }))
                    }
                  >
                    <SelectTrigger className="w-full h-10">
                      <SelectValue placeholder="Pilih jenis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value="BEM"
                        className="data-[highlighted]:!bg-[#0052FF] data-[highlighted]:!text-white"
                      >
                        BEM
                      </SelectItem>
                      <SelectItem
                        value="HIMA"
                        className="data-[highlighted]:!bg-[#0052FF] data-[highlighted]:!text-white"
                      >
                        HIMA
                      </SelectItem>
                      <SelectItem
                        value="UKM"
                        className="data-[highlighted]:!bg-[#0052FF] data-[highlighted]:!text-white"
                      >
                        UKM
                      </SelectItem>
                      <SelectItem
                        value="OTHER"
                        className="data-[highlighted]:!bg-[#0052FF] data-[highlighted]:!text-white"
                      >
                        Lainnya
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kota Domisili
                  </label>
                  <Input
                    type="text"
                    name="city"
                    placeholder="Contoh: Yogyakarta"
                    value={organizerData.city}
                    onChange={handleOrganizerChange}
                    className="w-full h-10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kampus / Institusi Asal
                  </label>
                  <Input
                    type="text"
                    name="campus"
                    placeholder="Nama universitas atau institusi asal"
                    value={organizerData.campus}
                    onChange={handleOrganizerChange}
                    className="w-full h-10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor WhatsApp / Telepon
                  </label>
                  <div className="flex">
                    <span className="bg-gray-100 border border-gray-300 border-r-0 rounded-l-lg px-3 flex items-center text-gray-600 text-sm self-stretch">
                      +62
                    </span>
                    <Input
                      type="text"
                      name="phoneNumber"
                      placeholder="812-3456-7890"
                      value={organizerData.phoneNumber}
                      onChange={handleOrganizerChange}
                      className="flex-1 rounded-l-none border-l-0 h-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi Singkat Organisasi
                  </label>
                  <textarea
                    name="description"
                    placeholder="Ceritakan sedikit tentang visi atau fokus acara organisasi Anda"
                    value={organizerData.description}
                    onChange={handleOrganizerChange}
                    rows={4}
                    className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 transition ${
                      organizerData.description && organizerData.description.length < 10
                        ? "border-amber-550 focus:border-amber-550 focus:ring-amber-200"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                    }`}
                  />
                  {organizerData.description && organizerData.description.length < 10 && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      ⚠️ Deskripsi terlalu singkat (minimal 10 karakter).
                    </p>
                  )}
                </div>
              </div>

              {/* Preview Section — hidden on mobile, shown on lg+ */}
              <div className="hidden lg:block max-w-103 sticky top-6 self-start">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                  PREVIEW PROFIL EO
                </h3>
                <div className="p-6 rounded-[8px]">
                  <div className="relative">
                    <Image
                      src={"/bg-eo.jpg"}
                      alt="bg-eo"
                      width={400}
                      height={120}
                      className="object-cover rounded-md"
                    />
                  </div>

                  <div className="bg-white rounded-[8px] px-6 pb-6 pt-12 relative">
                    <div className="absolute -top-9 w-18 h-18 bg-white rounded-[8px] flex items-center shadow-lg">
                      <Image
                        src={"/icons/organization.svg"}
                        alt="organization"
                        width={36}
                        height={18}
                        className="object-cover rounded-md mx-auto"
                      />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {organizerData.organizationName || "Nama Organisasi Anda"}
                    </h4>
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <Badge className="rounded-[4px] bg-[#FFDBD2] text-black">
                        {organizerData.organizationType || "Tipe belum dipilih"}
                      </Badge>
                      <Badge className="rounded-[4px] bg-[#ECEEF0] text-black">
                        📍 {organizerData.city || "Kota belum diisi"}
                      </Badge>
                    </div>
                    <p className="text-[#747688] text-[12px] mt-4">
                      {organizerData.description ||
                        "Deskripsi organisasi akan muncul di sini. Jelaskan apa yang membuat organisasi Anda unik bagi calon sponsor."}
                    </p>
                  </div>
                </div>
                <div className="flex bg-[#0052FF1A] text-[#0038B6] m-6 mt-4 rounded-[8px] p-3 text-sm gap-2">
                  <Info />
                  Profil yang lengkap meningkatkan peluang Anda mendapatkan
                  sponsorship hingga 40%.
                </div>
              </div>
            </div>

            {submitError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[8px] text-sm mt-6">
                {submitError}
              </div>
            )}

            <div className="flex gap-4 justify-between w-full mt-8 sm:mt-10 pt-6 border-t border-[#C3C5D9]">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
                className="px-6 sm:px-8"
              >
                ← Kembali
              </Button>
              <Button
                onClick={handleSubmitProfile}
                className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Menyimpan..." : "Lanjutkan →"}
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Step 2: Sponsor / Company Profile
  if (currentStep === 2 && role === "COMPANY") {
    return (
      <>
        <NavbarOnboarding />
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 mt-16 sm:mt-20">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
              Lengkapi Profil Perusahaanmu
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Form Section */}
              <div className="lg:col-span-2 space-y-6 p-4 sm:p-6 bg-white rounded-[8px] shadow-sm border border-[#C3C5D9]">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Perusahaan
                  </label>
                  <Input
                    type="text"
                    name="companyName"
                    placeholder="Contoh: PT Teknologi Maju"
                    value={sponsorData.companyName}
                    onChange={handleSponsorChange}
                    className="w-full h-10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industri
                  </label>
                  <Select
                    value={sponsorData.industry}
                    onValueChange={(value) =>
                      setSponsorData((prev) => ({ ...prev, industry: value }))
                    }
                  >
                    <SelectTrigger className="w-full h-10">
                      <SelectValue placeholder="Pilih industri" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value="Teknologi"
                        className="data-[highlighted]:!bg-[#0052FF] data-[highlighted]:!text-white"
                      >
                        Teknologi
                      </SelectItem>
                      <SelectItem
                        value="Finance"
                        className="data-[highlighted]:!bg-[#0052FF] data-[highlighted]:!text-white"
                      >
                        Finance
                      </SelectItem>
                      <SelectItem
                        value="Retail"
                        className="data-[highlighted]:!bg-[#0052FF] data-[highlighted]:!text-white"
                      >
                        Retail
                      </SelectItem>
                      <SelectItem
                        value="Manufaktur"
                        className="data-[highlighted]:!bg-[#0052FF] data-[highlighted]:!text-white"
                      >
                        Manufaktur
                      </SelectItem>
                      <SelectItem
                        value="Lainnya"
                        className="data-[highlighted]:!bg-[#0052FF] data-[highlighted]:!text-white"
                      >
                        Lainnya
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kota Domisili
                  </label>
                  <Input
                    type="text"
                    name="city"
                    placeholder="Contoh: Jakarta"
                    value={sponsorData.city}
                    onChange={handleSponsorChange}
                    className="w-full h-10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor Telepon
                  </label>
                  <Input
                    type="text"
                    name="phoneNumber"
                    placeholder="021-555-1234"
                    value={sponsorData.phoneNumber}
                    onChange={handleSponsorChange}
                    className="w-full h-10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website
                  </label>
                  <Input
                    type="url"
                    name="website"
                    placeholder="https://perusahaan.com"
                    value={sponsorData.website}
                    onChange={handleSponsorChange}
                    className="w-full h-10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi Singkat Perusahaan
                  </label>
                  <textarea
                    name="description"
                    placeholder="Jelaskan sedikit tentang fokus perusahaan Anda secara singkat"
                    value={sponsorData.description}
                    onChange={handleSponsorChange}
                    rows={3}
                    className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 transition ${
                      sponsorData.description && sponsorData.description.length < 10
                        ? "border-amber-550 focus:border-amber-550 focus:ring-amber-200"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                    }`}
                  />
                  {sponsorData.description && sponsorData.description.length < 10 && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      ⚠️ Deskripsi terlalu singkat (minimal 10 karakter).
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Audiens Sponsorship
                  </label>
                  <div className="w-full min-h-[44px] border border-gray-300 rounded-lg px-3 py-2 flex flex-wrap gap-2 mb-2">
                    {sponsorData.targetAudience.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-sm px-3 py-0.5 rounded-full"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag("targetAudience", tag)}
                          className="hover:text-blue-900 font-bold leading-none"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={audienceInput}
                    onChange={(e) => setAudienceInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag("targetAudience", audienceInput);
                      }
                    }}
                    placeholder="Tambah target audiens (cth: Mahasiswa, UMKM) - tekan Enter"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                  />
                  <p
                    className={`text-xs mt-1.5 ${
                      sponsorData.targetAudience.join(", ").length >= 10
                        ? "text-green-600 font-semibold"
                        : "text-amber-600"
                    }`}
                  >
                    {sponsorData.targetAudience.join(", ").length >= 10
                      ? "✓ Target audiens telah memenuhi panjang minimum (minimal 10 karakter)."
                      : `⚠ Total panjang tag target audiens saat ini: ${sponsorData.targetAudience.join(", ").length}/10 karakter (minimal 10 karakter).`}
                  </p>
                </div>

                {/* Preferred Categories */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori Event yang Diminati
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "TECHNOLOGY",
                      "BUSINESS",
                      "COMPETITION",
                      "FESTIVAL",
                      "CONFERENCE",
                      "WORKSHOP",
                      "MUSIC",
                      "SPORTS",
                    ].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                          sponsorPrefs.preferredCategories.includes(cat)
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "bg-white border-gray-300 text-gray-700 hover:border-blue-400"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Audience Age Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rentang Usia Audiens Target
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={10}
                      max={100}
                      placeholder="Min (cth: 18)"
                      value={sponsorPrefs.preferredAudienceAgeMin}
                      onChange={(e) =>
                        setSponsorPrefs((prev) => ({
                          ...prev,
                          preferredAudienceAgeMin:
                            e.target.value === "" ? "" : Number(e.target.value),
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-gray-500 shrink-0">—</span>
                    <input
                      type="number"
                      min={10}
                      max={100}
                      placeholder="Max (cth: 35)"
                      value={sponsorPrefs.preferredAudienceAgeMax}
                      onChange={(e) =>
                        setSponsorPrefs((prev) => ({
                          ...prev,
                          preferredAudienceAgeMax:
                            e.target.value === "" ? "" : Number(e.target.value),
                        }))
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Preferred Interests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minat / Topik yang Relevan
                  </label>
                  <div className="w-full min-h-[44px] border border-gray-300 rounded-lg px-3 py-2 flex flex-wrap gap-2 mb-2">
                    {sponsorPrefs.preferredInterests.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-sm px-3 py-0.5 rounded-full"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag("preferredInterests", tag)}
                          className="hover:text-purple-900 font-bold leading-none"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={interestInput}
                    onChange={(e) => setInterestInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag("preferredInterests", interestInput);
                      }
                    }}
                    placeholder="Tambah minat (cth: AI, fintech, startup) — tekan Enter"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Preview Section — hidden on mobile, shown on lg+ */}
              <div className="hidden lg:block max-w-103 sticky top-6 self-start">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                  PREVIEW PROFIL COMPANY
                </h3>
                <div className="p-6 rounded-[8px]">
                  <div className="relative">
                    <Image
                      src={"/bg-eo.jpg"}
                      alt="bg-eo"
                      width={400}
                      height={120}
                      className="object-cover rounded-md"
                    />
                  </div>

                  <div className="bg-white rounded-[8px] px-6 pb-6 pt-12 relative">
                    <div className="absolute -top-9 w-18 h-18 bg-white rounded-[8px] flex items-center shadow-lg">
                      <Image
                        src={"/icons/company.svg"}
                        alt="organization"
                        width={36}
                        height={18}
                        className="object-cover rounded-md mx-auto"
                      />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {sponsorData.companyName || "Nama Perusahaan Anda"}
                      <div className="rounded-[4px] text-sm text-[#434656]">
                        {sponsorData.industry || "Industri belum dipilih"}
                      </div>
                    </h4>
                    <Badge className="rounded-[4px] bg-[#ECEEF0] text-black">
                      📍 {sponsorData.city || "Kota belum diisi"}
                    </Badge>
                    <p className="text-[#747688] text-[12px] mt-4">
                      {sponsorData.description ||
                        "Deskripsi perusahaan akan muncul di sini."}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {sponsorData.targetAudience.map((target) => (
                        <Badge key={target} variant={"outline"}>
                          {target}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex bg-[#0052FF1A] text-[#0038B6] m-6 mt-4 rounded-[8px] p-3 text-sm gap-2">
                  <Info />
                  Profil yang lengkap meningkatkan peluang Anda mendapatkan
                  sponsorship hingga 40%.
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full mt-8 sm:mt-10 pt-6 border-t border-[#C3C5D9]">
              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[8px] text-sm">
                  {submitError}
                </div>
              )}
              <div className="flex gap-4 justify-between">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="px-6 sm:px-8"
                >
                  ← Kembali
                </Button>
                <Button
                  onClick={handleSubmitProfile}
                  className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Menyimpan..." : "Lanjutkan →"}
                </Button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Step 3: Review/Confirmation
  if (currentStep === 3) {
    return (
      <>
        <NavbarOnboarding />
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
              Review Profil Anda
            </h1>

            <Card className="p-6 sm:p-8 mb-8">
              {role === "EO" ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Nama Organisasi</p>
                    <p className="font-semibold text-gray-900">
                      {organizerData.organizationName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Jenis Organisasi</p>
                    <p className="font-semibold text-gray-900">
                      {organizerData.organizationType}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Kota</p>
                    <p className="font-semibold text-gray-900">
                      {organizerData.city}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Kampus / Institusi</p>
                    <p className="font-semibold text-gray-900">
                      {organizerData.campus || "Tidak ada"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Deskripsi</p>
                    <p className="font-semibold text-gray-900">
                      {organizerData.description || "Tidak ada"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Nama Perusahaan</p>
                    <p className="font-semibold text-gray-900">
                      {sponsorData.companyName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Industri</p>
                    <p className="font-semibold text-gray-900">
                      {sponsorData.industry}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Kota</p>
                    <p className="font-semibold text-gray-900">
                      {sponsorData.city}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Target Audiens</p>
                    <p className="font-semibold text-gray-900">
                      {sponsorData.targetAudience.join(", ") || "Tidak ada"}
                    </p>
                  </div>
                </div>
              )}
            </Card>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(2)}
                className="px-6 sm:px-8"
              >
                ← Kembali Edit
              </Button>
              <Button
                onClick={() => setCurrentStep(4)}
                className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8"
              >
                Konfirmasi →
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Step 4: Success
  if (currentStep === 4) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex flex-col gap-4 items-center justify-center p-4">
          <div className="w-full max-w-md p-8 sm:p-12 text-center">
            <div className="mb-6 flex justify-center">
              <BadgeCheck size={58} className="text-[#003EC7]" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Profil Berhasil Disimpan!
            </h1>
            <p className="text-gray-600 mb-8">
              Akun Anda sudah siap. Selamat datang di EventHub untuk
              memaksimalkan kemampuan strategi sponsorship dan membangun
              kolaborasi bisnis secara lebih efisien.
            </p>

            <div className="flex gap-4">
              <Link href={"/dashboard"} className="flex-1">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Buka Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return null;
}
