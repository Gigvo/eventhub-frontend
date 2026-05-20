"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  Info,
  MapPin,
  Video,
  X,
  Plus,
  Lock,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiCall } from "@/lib/api-client";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";

interface FormData {
  // Step 1 - Info Dasar
  namaEvent: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  formatEvent: string;
  kota: string;
  kategoriEvent: string;
  alamatEvent: string;
  bannerFile: File | null;
  bannerPreview: string;

  // Step 2 - Detail Event & Audiens
  deskripsiEvent: string;
  estimasiPeserta: number;
  targetIndustri: string;
  audienceAgeMin: number;
  audienceAgeMax: number;
  audienceInterests: string[];
  channelData: {
    instagram: string;
    tiktok: string;
    website: string;
  };

  // Step 3 - Paket Sponsorship
  totalBudget: string;
  packages: Array<{
    id: number;
    name: string;
    price: string;
    benefits: string[];
  }>;
  contactInfo: {
    nama: string;
    whatsapp: string;
  };
}

const STEPS = [
  { number: 1, title: "Informasi Dasar" },
  { number: 2, title: "Detail & Audiens" },
  { number: 3, title: "Paket Sponsorship" },
];

const availableInterests = [
  "technology",
  "startup",
  "AI",
  "programming",
  "business",
  "marketing",
  "innovation",
  "education",
  "finance",
  "healthcare",
];

const availableBenefits = [
  "Booth 3x3 Utama",
  "Logo di Backdrop",
  "Add Mention MC",
];

export default function BuatEventPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);
  const [eventId, setEventId] = useState<string | null>(null);
  const [proposalTone, setProposalTone] = useState<
    "FORMAL" | "CASUAL" | "PERSUASIVE"
  >("PERSUASIVE");
  const [showAddPackageForm, setShowAddPackageForm] = useState(false);
  const [newPackage, setNewPackage] = useState({
    name: "",
    price: "",
    benefits: [] as string[],
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  useEffect(() => {
    const idParam = searchParams.get("id");
    const stepParam = searchParams.get("step");
    if (idParam && stepParam === "3") {
      setEventId(idParam);
      setCurrentStep(3);
    }
  }, [searchParams]);

  const [errors, setErrors] = useState<{
    kategoriEvent?: string;
    targetIndustri?: string;
    audienceInterests?: string;
    deskripsiEvent?: string;
  }>({});
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [formData, setFormData] = useState<FormData>({
    namaEvent: "",
    tanggalMulai: "",
    tanggalSelesai: "",
    formatEvent: "",
    kota: "",
    kategoriEvent: "",
    alamatEvent: "",
    bannerFile: null,
    bannerPreview: "",
    deskripsiEvent: "",
    estimasiPeserta: 2500,
    targetIndustri: "",
    audienceAgeMin: 18,
    audienceAgeMax: 45,
    audienceInterests: ["technology", "startup"],
    channelData: {
      instagram: "@username",
      tiktok: "@username",
      website: "www.event.com",
    },
    totalBudget: "250.000.000",
    packages: [],
    contactInfo: {
      nama: "Contoh: Budi Santoso",
      whatsapp: "0812XXXXXXXX",
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (files: FileList) => {
    const file = files[0];
    if (
      file &&
      (file.type.startsWith("image/") || file.type === "application/pdf")
    ) {
      setFormData((prev) => ({
        ...prev,
        bannerFile: file,
      }));
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev) => ({
          ...prev,
          bannerPreview: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files) {
      handleFileChange(e.dataTransfer.files);
    }
  };

  const removeDemografi = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      audienceInterests: prev.audienceInterests.filter((t) => t !== tag),
    }));
  };

  const addDemografi = (tag: string) => {
    if (!formData.audienceInterests.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        audienceInterests: [...prev.audienceInterests, tag],
      }));
    }
  };

  // Helper function to show notification
  const showNotification = (
    type: "success" | "error",
    message: string,
    duration = 4000,
  ) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), duration);
  };

  // Handle Step 2 → Step 3: Create event and proceed
  const handleCreateEvent = async () => {
    try {
      setIsSubmitting(true);
      const newErrors: typeof errors = {};

      // Validation
      if (!formData.kategoriEvent) {
        newErrors.kategoriEvent = "Kategori Event wajib dipilih";
      }
      if (!formData.targetIndustri) {
        newErrors.targetIndustri = "Target Industri Sponsor wajib dipilih";
      }
      if (formData.audienceInterests.length === 0) {
        newErrors.audienceInterests = "Minimal 1 Target Interest harus dipilih";
      }
      if (formData.deskripsiEvent.length < 20) {
        newErrors.deskripsiEvent = "Deskripsi Event harus minimal 20 karakter";
      }

      // If there are errors, set them and return
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsSubmitting(false);
        return;
      }

      // Clear errors if validation passes
      setErrors({});

      // Parse dates and format as YYYY-MM-DD
      const startDate = new Date(formData.tanggalMulai);
      const endDate = new Date(formData.tanggalSelesai);

      const formatDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const payload = {
        title: formData.namaEvent,
        description: formData.deskripsiEvent,
        category: formData.kategoriEvent,
        theme: formData.targetIndustri,
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        city: formData.kota,
        venue: formData.alamatEvent,
        isOnline:
          formData.formatEvent === "online" ||
          formData.formatEvent === "hybrid",
        expectedAttendees: formData.estimasiPeserta,
        audienceAgeMin: formData.audienceAgeMin,
        audienceAgeMax: formData.audienceAgeMax,
        audienceInterests: formData.audienceInterests,
      };

      console.log("Creating event with payload:", payload);

      const response = await apiCall<any>("/events", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (response.success) {
        const newEventId = response.data.id;
        setEventId(newEventId);

        if (formData.bannerFile) {
          try {
            const file = formData.bannerFile;
            if (file.size > 5 * 1024 * 1024) {
              throw new Error("Ukuran banner maksimal 5MB");
            }
            if (!file.type.startsWith("image/")) {
              throw new Error("Banner harus berupa gambar");
            }

            const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
            const path = `events/${newEventId}/banner.${ext}`;
            const storageRef = ref(storage, path);

            await uploadBytes(storageRef, file);
            const downloadUrl = await getDownloadURL(storageRef);

            await apiCall(`/events/${newEventId}`, {
              method: "PATCH",
              body: JSON.stringify({ bannerUrl: downloadUrl }),
            });
          } catch (uploadError) {
            console.error("Failed to upload banner:", uploadError);
            showNotification(
              "error",
              "Gagal mengupload banner, namun event berhasil dibuat.",
            );
          }
        }

        setCurrentStep(3);
        showNotification(
          "success",
          "Event berhasil dibuat! Sekarang tambahkan paket sponsorship.",
        );
      }
    } catch (error) {
      console.error("Failed to create event:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Gagal membuat event. Silakan coba lagi.";
      showNotification("error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Step 3: Add sponsorship tier/package
  const handleAddPackage = async (
    packageName: string,
    price: string,
    benefits: string[],
  ) => {
    if (!eventId) {
      showNotification("error", "Event ID tidak ditemukan. Silakan coba lagi.");
      return;
    }

    try {
      setIsSubmitting(true);

      if (!packageName || !price) {
        showNotification("error", "Nama paket dan harga tidak boleh kosong");
        return;
      }

      const tierPayload = {
        name: packageName,
        price: parseInt(price.replace(/\D/g, "")),
        benefits: benefits,
      };

      console.log(`Creating tier for event ${eventId}:`, tierPayload);

      const response = await apiCall<any>(`/events/${eventId}/tiers`, {
        method: "POST",
        body: JSON.stringify(tierPayload),
      });

      if (response.success) {
        // Add to local state to show in UI
        const newPackage = {
          id: formData.packages.length + 1,
          name: packageName,
          price: price,
          benefits: benefits,
        };
        setFormData((prev) => ({
          ...prev,
          packages: [...prev.packages, newPackage],
        }));
        showNotification("success", "Paket sponsorship berhasil ditambahkan!");
      }
    } catch (error) {
      console.error("Failed to add package:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Gagal menambahkan paket. Silakan coba lagi.";
      showNotification("error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle final save — calls AI proposal builder then navigates to proposal-builder page
  const handleSaveAndContinue = async () => {
    if (!eventId) {
      showNotification(
        "error",
        "Event ID tidak ditemukan. Silakan buat event terlebih dahulu.",
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setIsGeneratingProposal(true);

      const response = await apiCall<any>("/ai/proposal-builder", {
        method: "POST",
        body: JSON.stringify({
          eventId,
          tone: proposalTone,
          targetSponsorIndustry: formData.targetIndustri,
          additionalContext: formData.deskripsiEvent,
        }),
      });

      if (response?.data) {
        // Store the AI-generated proposal so proposal-builder page can read it
        localStorage.setItem(
          "generatedProposal",
          JSON.stringify({
            proposalId: response.data.proposal.id,
            eventId,
            eventName: formData.namaEvent,
            content: response.data.content,
            savedAt: new Date().toISOString(),
          }),
        );

        // Also keep step3 data for other pages that rely on it
        localStorage.setItem(
          "buatEventStep3Data",
          JSON.stringify({
            eventId,
            totalBudget: formData.totalBudget,
            packages: formData.packages,
            contactInfo: formData.contactInfo,
            eventName: formData.namaEvent,
            savedAt: new Date().toISOString(),
          }),
        );

        router.push("/proposal-builder");
      }
    } catch (error) {
      console.error("Failed to generate proposal:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Gagal membuat proposal. Silakan coba lagi.";
      showNotification("error", errorMessage);
      setIsGeneratingProposal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedToNextStep = () => {
    if (currentStep === 1) {
      return (
        formData.namaEvent &&
        formData.tanggalMulai &&
        formData.tanggalSelesai &&
        formData.formatEvent &&
        formData.kota &&
        formData.kategoriEvent &&
        formData.alamatEvent
      );
    }
    if (currentStep === 2) {
      return (
        formData.deskripsiEvent.length >= 20 &&
        formData.targetIndustri &&
        formData.audienceInterests.length > 0
      );
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* AI Generation Loading Dialog */}
      {isGeneratingProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            {/* Animated header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-blue-600 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">
                  AI Sedang Membuat Proposal...
                </p>
                <p className="text-xs text-gray-500">
                  Ini mungkin memakan waktu 10–30 detik
                </p>
              </div>
            </div>

            {/* Event summary */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Event</span>
                <span className="font-semibold text-gray-900 text-right max-w-[60%] truncate">
                  {formData.namaEvent || "-"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Target Industri</span>
                <span className="font-semibold text-gray-900">
                  {formData.targetIndustri || "-"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Estimasi Peserta</span>
                <span className="font-semibold text-gray-900">
                  {formData.estimasiPeserta.toLocaleString("id-ID")} orang
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Paket</span>
                <span className="font-semibold text-gray-900">
                  {formData.packages.length} paket
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Kota</span>
                <span className="font-semibold text-gray-900">
                  {formData.kota || "-"}
                </span>
              </div>
            </div>

            {/* Loading bar */}
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-500 h-1.5 rounded-full animate-[loading_2s_ease-in-out_infinite]"
                style={{
                  width: "60%",
                  animation: "pulse 1.5s ease-in-out infinite",
                }}
              />
            </div>
            <p className="text-center text-xs text-gray-400 mt-3">
              ✨ Menganalisis data event dan menyusun narasi terbaik...
            </p>
          </div>
        </div>
      )}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
            notification.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          <div className="text-xl font-bold">
            {notification.type === "success" ? "✓" : "⚠"}
          </div>
          <p className="font-medium">{notification.message}</p>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Buat Event Baru</h1>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
              Kembali
            </button>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center gap-4">
            {STEPS.map((step, idx) => (
              <div key={step.number} className="flex items-center">
                <button
                  onClick={() =>
                    currentStep !== step.number && setCurrentStep(step.number)
                  }
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition ${
                    currentStep === step.number
                      ? "bg-blue-600 text-white"
                      : currentStep > step.number
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {currentStep > step.number ? "✓" : step.number}
                </button>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {step.title}
                  </p>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`w-12 h-1 mx-4 rounded ${
                      currentStep > step.number ? "bg-green-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Step 1: Info Dasar */}
        {currentStep === 1 && (
          <div className="grid grid-cols-3 gap-8">
            {/* Left Section - Form */}
            <div className="col-span-2 space-y-6 p-8 rounded-[8px] border border-[#E5E7EB] bg-white shadow-sm">
              {/* Nama Event */}
              <div>
                <label className="text-[12px] font-semibold text-gray-700 block mb-2 uppercase">
                  Nama Event
                </label>
                <input
                  type="text"
                  name="namaEvent"
                  value={formData.namaEvent}
                  onChange={handleInputChange}
                  placeholder="Contoh: Nesco 2026"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 text-sm"
                />
              </div>

              {/* Tanggal & Waktu */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] font-semibold text-gray-700 block mb-2 uppercase">
                    Tanggal & Waktu Mulai
                  </label>
                  <input
                    type="datetime-local"
                    name="tanggalMulai"
                    value={formData.tanggalMulai}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-gray-700 block mb-2 uppercase">
                    Tanggal & Waktu Selesai
                  </label>
                  <input
                    type="datetime-local"
                    name="tanggalSelesai"
                    value={formData.tanggalSelesai}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 text-sm"
                  />
                </div>
              </div>

              {/* Format Event */}
              <div>
                <label className="text-[12px] font-semibold text-gray-700 block mb-3 uppercase">
                  Format Event
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    {
                      value: "offline",
                      label: "Offline",
                      description: "Tatap Muka Langsung",
                      icon: MapPin,
                    },
                    {
                      value: "online",
                      label: "Online",
                      description: "Video Conference",
                      icon: Video,
                    },
                    {
                      value: "hybrid",
                      label: "Hybrid",
                      description: "Kombinasi Keduanya",
                      icon: null,
                    },
                  ].map((format) => (
                    <button
                      key={format.value}
                      onClick={() =>
                        setFormData({ ...formData, formatEvent: format.value })
                      }
                      className={`p-4 border-2 rounded-lg text-center transition ${
                        formData.formatEvent === format.value
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <div className="flex justify-center mb-2">
                        {format.icon && (
                          <format.icon size={24} className="text-[#9CA3AF]" />
                        )}
                        {!format.icon && (
                          <div className="w-6 h-6 text-[#9CA3AF]">⚙️</div>
                        )}
                      </div>
                      <p className="font-semibold text-sm">{format.label}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {format.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Kota & Kategori */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] font-semibold text-gray-700 block mb-2 uppercase">
                    Kota
                  </label>
                  <select
                    name="kota"
                    value={formData.kota}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 text-sm bg-white"
                  >
                    <option value="">Pilih Kota</option>
                    <option value="Jakarta">Jakarta</option>
                    <option value="Bandung">Bandung</option>
                    <option value="Surabaya">Surabaya</option>
                    <option value="Yogyakarta">Yogyakarta</option>
                  </select>
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-gray-700 block mb-2 uppercase">
                    Kategori Event
                  </label>
                  <select
                    name="kategoriEvent"
                    value={formData.kategoriEvent}
                    onChange={(e) => {
                      handleInputChange(e);
                      setErrors((prev) => ({ ...prev, kategoriEvent: "" }));
                    }}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none text-sm bg-white ${
                      errors.kategoriEvent
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-300 focus:border-blue-600"
                    }`}
                  >
                    <option value="">Pilih Kategori</option>
                    <option value="TECHNOLOGY">Technology</option>
                    <option value="BUSINESS">Business</option>
                    <option value="ARTS">Arts</option>
                    <option value="SPORTS">Sports</option>
                    <option value="EDUCATION">Education</option>
                    <option value="SOCIAL">Social</option>
                    <option value="ENTERTAINMENT">Entertainment</option>
                    <option value="COMPETITION">Competition</option>
                    <option value="CONFERENCE">Conference</option>
                    <option value="WORKSHOP">Workshop</option>
                    <option value="OTHER">Other</option>
                  </select>
                  {errors.kategoriEvent && (
                    <p className="text-red-600 text-xs font-medium mt-1">
                      {errors.kategoriEvent}
                    </p>
                  )}
                </div>
              </div>

              {/* Alamat Event */}
              <div>
                <label className="text-[12px] font-semibold text-gray-700 block mb-2 uppercase">
                  Alamat Event / Venue
                </label>
                <textarea
                  name="alamatEvent"
                  value={formData.alamatEvent}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama tempat atau alamat lengkap"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 text-sm"
                />
              </div>
            </div>

            {/* Right Section - Banner Upload */}
            <div className="space-y-6">
              <div className="p-8 rounded-[8px] border border-[#E5E7EB] bg-white shadow-sm flex flex-col items-center justify-center">
                <label className="text-[12px] font-semibold text-gray-700 block mb-4 uppercase w-full text-left">
                  Banner Event
                </label>

                {formData.bannerPreview ? (
                  <div className="relative w-full mb-4 group">
                    <Image
                      src={formData.bannerPreview}
                      alt="Banner preview"
                      width={400}
                      height={200}
                      className="mx-auto rounded-lg w-full h-auto object-cover max-h-48"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData({
                          ...formData,
                          bannerFile: null,
                          bannerPreview: "",
                        });
                      }}
                      className="absolute top-2 right-2 bg-white text-red-600 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-gray-200 hover:bg-red-50"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : null}

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-auto py-4 border-dashed border-2 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-all text-gray-500 bg-gray-50"
                    >
                      <Upload className="mr-2 h-5 w-5" />
                      {formData.bannerPreview
                        ? "Ganti Banner Event"
                        : "Upload Banner Event"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-center">
                        Upload Banner Event
                      </DialogTitle>
                    </DialogHeader>
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`mt-4 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
                        isDragActive
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      <div>
                        <Upload
                          className="mx-auto mb-3 text-blue-600"
                          size={40}
                        />
                        <p className="font-semibold text-gray-900 mb-1">
                          Klik untuk unggah atau seret file ke sini
                        </p>
                        <p className="text-xs text-gray-600 mb-2">
                          Rekomendasi ukuran: 1200 × 630 px
                        </p>
                        <p className="text-xs text-gray-600">
                          Maks. 5MB (JPG, PNG, WEBP)
                        </p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={(e) =>
                          e.target.files && handleFileChange(e.target.files)
                        }
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Detail Event & Audiens */}
        {currentStep === 2 && (
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-[8px] border border-[#E5E7EB] shadow-sm space-y-8">
            {/* Deskripsi Event */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase">
                Deskripsi Event Lengkap
              </label>
              <textarea
                name="deskripsiEvent"
                placeholder="Ceritakan tujuan event, agenda utama, dan apa yang membuat event ini unik..."
                value={formData.deskripsiEvent}
                onChange={(e) => {
                  handleInputChange(e);
                  setErrors((prev) => ({ ...prev, deskripsiEvent: "" }));
                }}
                rows={6}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none resize-none ${
                  errors.deskripsiEvent
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 focus:border-blue-600"
                }`}
              />
              <div className="flex justify-between text-sm mt-1">
                <span
                  className={
                    formData.deskripsiEvent.length < 20
                      ? "text-red-600 font-medium"
                      : "text-gray-500"
                  }
                >
                  Minimal 20 karakter ({formData.deskripsiEvent.length} / 20)
                </span>
              </div>
              {errors.deskripsiEvent && (
                <p className="text-red-600 text-sm font-medium mt-2">
                  {errors.deskripsiEvent}
                </p>
              )}
            </div>

            {/* Estimasi & Target */}
            <div className="flex flex-row items-center gap-6">
              {/* Estimasi Peserta */}
              <div className="flex-1 bg-[#F9FAFB80] p-6 rounded-[8px]">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase">
                    Estimasi Peserta
                  </label>
                  <div className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {formData.estimasiPeserta.toLocaleString()}
                  </div>
                </div>
                <div className="flex flex-col justify-center items-center gap-4">
                  <Slider
                    min={50}
                    max={10000}
                    step={50}
                    value={[formData.estimasiPeserta]}
                    onValueChange={(value) =>
                      setFormData({ ...formData, estimasiPeserta: value[0] })
                    }
                  />
                  <div className="flex items-center justify-between w-full">
                    <span className="text-sm text-gray-600">50</span>
                    <span className="text-sm text-gray-600">5000</span>
                    <span className="text-sm text-gray-600">10.000+</span>
                  </div>
                </div>
              </div>

              {/* Target Industri */}
              <div className="flex-1 bg-[#F9FAFB80] p-6 rounded-[8px]">
                <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase">
                  Target Industri Sponsor
                </label>
                <select
                  name="targetIndustri"
                  value={formData.targetIndustri}
                  onChange={(e) => {
                    handleInputChange(e);
                    setErrors((prev) => ({ ...prev, targetIndustri: "" }));
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none ${
                    errors.targetIndustri
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-600"
                  }`}
                >
                  <option value="">Pilih Industri Utama</option>
                  <option value="Technology">Technology</option>
                  <option value="Finance">Finance & Banking</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Retail">Retail</option>
                  <option value="Startup">Startup</option>
                  <option value="Other">Other</option>
                </select>
                {errors.targetIndustri && (
                  <p className="text-red-600 text-sm font-medium mt-2">
                    {errors.targetIndustri}
                  </p>
                )}
              </div>
            </div>

            {/* Age Range */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase">
                  Usia Minimum Audiens
                </label>
                <input
                  type="number"
                  value={formData.audienceAgeMin}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      audienceAgeMin: parseInt(e.target.value) || 0,
                    })
                  }
                  min="0"
                  max="100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase">
                  Usia Maksimal Audiens
                </label>
                <input
                  type="number"
                  value={formData.audienceAgeMax}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      audienceAgeMax: parseInt(e.target.value) || 100,
                    })
                  }
                  min="0"
                  max="100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            {/* Target Interests */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase">
                Target Interests
              </label>
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.audienceInterests.map((interest) => (
                  <div
                    key={interest}
                    className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {interest}
                    <button
                      onClick={() => removeDemografi(interest)}
                      className="hover:text-blue-900 transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                {/* Dropdown untuk menambah interests */}
                <div className="relative">
                  <button
                    onClick={() =>
                      setOpenDropdown(openDropdown === -1 ? null : -1)
                    }
                    className="text-blue-600 font-medium text-sm hover:text-blue-700 transition"
                  >
                    + Tambah interest...
                  </button>
                  {openDropdown === -1 && (
                    <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-max">
                      {availableInterests
                        .filter((d) => !formData.audienceInterests.includes(d))
                        .map((d) => (
                          <button
                            key={d}
                            onClick={() => {
                              addDemografi(d);
                              setErrors((prev) => ({
                                ...prev,
                                audienceInterests: "",
                              }));
                            }}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm first:rounded-t-lg last:rounded-b-lg"
                          >
                            {d}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </div>
              {errors.audienceInterests && (
                <p className="text-red-600 text-sm font-medium">
                  {errors.audienceInterests}
                </p>
              )}
            </div>

            {/* Kanal Promosi */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase">
                Kanal Promosi & Media Sosial
              </label>
              <div className="grid grid-cols-3 gap-4">
                {/* Instagram */}
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <span className="px-4 py-3 bg-gray-100 font-semibold text-gray-700 text-sm">
                    IG
                  </span>
                  <input
                    type="text"
                    placeholder="@username"
                    value={formData.channelData.instagram}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        channelData: {
                          ...formData.channelData,
                          instagram: e.target.value,
                        },
                      })
                    }
                    className="flex-1 px-4 py-3 focus:outline-none"
                  />
                </div>

                {/* TikTok */}
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <span className="px-4 py-3 bg-gray-100 font-semibold text-gray-700 text-sm">
                    TT
                  </span>
                  <input
                    type="text"
                    placeholder="@username"
                    value={formData.channelData.tiktok}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        channelData: {
                          ...formData.channelData,
                          tiktok: e.target.value,
                        },
                      })
                    }
                    className="flex-1 px-4 py-3 focus:outline-none"
                  />
                </div>

                {/* Website */}
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <span className="px-4 py-3 bg-gray-100 font-semibold text-gray-700 text-sm">
                    🌐
                  </span>
                  <input
                    type="url"
                    placeholder="www.event.com"
                    value={formData.channelData.website}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        channelData: {
                          ...formData.channelData,
                          website: e.target.value,
                        },
                      })
                    }
                    className="flex-1 px-4 py-3 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Paket Sponsorship */}
        {currentStep === 3 && (
          <div className="max-w-7xl">
            {/* Event Created Confirmation */}
            {eventId && (
              <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-green-600 font-bold text-2xl">✓</div>
                  <div>
                    <p className="font-semibold text-green-900">
                      Event berhasil dibuat!
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-6">
              {/* Main Content */}
              <div className="flex-1">
                {/* Target Pendanaan */}
                <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Target Pendanaan
                  </h2>
                  <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">
                    Total Budget Sponsor
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <span className="px-4 py-3 bg-gray-50 text-gray-700 font-medium text-sm">
                          IDR
                        </span>
                        <input
                          type="text"
                          value={formData.totalBudget}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              totalBudget: e.target.value,
                            })
                          }
                          className="flex-1 px-4 py-3 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Target Sponsor Industri
                  </h2>

                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="border border-gray-300 rounded-lg">
                        <input
                          type="text"
                          value={formData.targetIndustri}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              targetIndustri: e.target.value,
                            })
                          }
                          placeholder="Technology"
                          className="flex-1 px-4 py-3 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Paket Sponsorship */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Paket Sponsorship
                    </h2>
                    <button
                      onClick={() => setShowAddPackageForm(!showAddPackageForm)}
                      className="text-blue-600 font-medium text-sm hover:text-blue-700 flex items-center gap-2"
                    >
                      <Plus size={16} />
                      Tambah Paket
                    </button>
                  </div>

                  {/* Add Package Form */}
                  {showAddPackageForm && (
                    <div className="mb-6 bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                      <h3 className="text-sm font-semibold text-gray-900 mb-4">
                        Tambah Paket Sponsorship Baru
                      </h3>

                      <div className="space-y-4">
                        {/* Package Name */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">
                            Nama Paket
                          </label>
                          <input
                            type="text"
                            placeholder="Contoh: Paket Platinum"
                            value={newPackage.name}
                            onChange={(e) =>
                              setNewPackage({
                                ...newPackage,
                                name: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                          />
                        </div>

                        {/* Price */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">
                            Harga Paket
                          </label>
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <span className="px-4 py-3 bg-gray-50 text-gray-700 font-medium text-sm">
                              IDR
                            </span>
                            <input
                              type="text"
                              placeholder="100.000.000"
                              value={newPackage.price}
                              onChange={(e) =>
                                setNewPackage({
                                  ...newPackage,
                                  price: e.target.value,
                                })
                              }
                              className="flex-1 px-4 py-3 focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Benefits */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">
                            Benefit
                          </label>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {newPackage.benefits.map((benefit) => (
                              <div
                                key={benefit}
                                className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                              >
                                {benefit}
                                <button
                                  onClick={() =>
                                    setNewPackage({
                                      ...newPackage,
                                      benefits: newPackage.benefits.filter(
                                        (b) => b !== benefit,
                                      ),
                                    })
                                  }
                                  className="hover:text-blue-900 transition"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* Add Benefit Dropdown */}
                          <div className="relative">
                            <button
                              onClick={() =>
                                setOpenDropdown(openDropdown === -2 ? null : -2)
                              }
                              className="text-blue-600 font-medium text-sm hover:text-blue-700 transition"
                            >
                              + Tambah benefit...
                            </button>
                            {openDropdown === -2 && (
                              <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10 min-w-max">
                                {availableBenefits
                                  .filter(
                                    (b) => !newPackage.benefits.includes(b),
                                  )
                                  .map((benefit) => (
                                    <button
                                      key={benefit}
                                      onClick={() => {
                                        setNewPackage({
                                          ...newPackage,
                                          benefits: [
                                            ...newPackage.benefits,
                                            benefit,
                                          ],
                                        });
                                        setOpenDropdown(null);
                                      }}
                                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 text-sm first:rounded-t-lg last:rounded-b-lg"
                                    >
                                      {benefit}
                                    </button>
                                  ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Form Buttons */}
                        <div className="flex gap-3 pt-4">
                          <button
                            onClick={async () => {
                              await handleAddPackage(
                                newPackage.name,
                                newPackage.price,
                                newPackage.benefits,
                              );
                              setNewPackage({
                                name: "",
                                price: "",
                                benefits: [],
                              });
                              setShowAddPackageForm(false);
                            }}
                            disabled={
                              !newPackage.name ||
                              !newPackage.price ||
                              isSubmitting
                            }
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium text-sm transition"
                          >
                            {isSubmitting ? "Menyimpan..." : "Simpan Paket"}
                          </button>
                          <button
                            onClick={() => {
                              setShowAddPackageForm(false);
                              setNewPackage({
                                name: "",
                                price: "",
                                benefits: [],
                              });
                            }}
                            className="flex-1 bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium text-sm transition"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Packages List */}
                  {formData.packages.length === 0 && !showAddPackageForm && (
                    <div className="p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 text-center">
                      <p className="text-gray-600 font-medium">
                        Belum ada paket sponsorship. Klik &quot;Tambah
                        Paket&quot; untuk memulai.
                      </p>
                    </div>
                  )}

                  {formData.packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="mb-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <Image
                          src={"/icons/award-blue.svg"}
                          alt="award"
                          width={24}
                          height={28}
                        />
                        <h3 className="text-sm font-semibold text-gray-900">
                          {pkg.name}
                        </h3>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        {/* Harga */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">
                            Harga Paket
                          </label>
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <span className="px-4 py-3 bg-gray-50 text-gray-700 font-medium text-sm">
                              IDR
                            </span>
                            <input
                              type="text"
                              value={pkg.price}
                              disabled
                              className="flex-1 px-4 py-3 focus:outline-none bg-gray-50"
                            />
                          </div>
                        </div>

                        {/* Benefit */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">
                            Benefit
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {pkg.benefits.map((benefit) => (
                              <div
                                key={benefit}
                                className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                              >
                                {benefit}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tone Proposal */}
                <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">
                    Tone Proposal AI
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">
                    Pilih gaya penulisan yang akan digunakan AI untuk membuat
                    proposal sponsorship.
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {(
                      [
                        {
                          value: "FORMAL",
                          label: "Formal",
                          desc: "Profesional & resmi, cocok untuk perusahaan besar",
                        },
                        {
                          value: "CASUAL",
                          label: "Kasual",
                          desc: "Santai & ramah, cocok untuk komunitas & startup",
                        },
                        {
                          value: "PERSUASIVE",
                          label: "Persuasif",
                          desc: "Meyakinkan & berdampak, fokus pada ROI sponsor",
                        },
                      ] as const
                    ).map(({ value, label, desc }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setProposalTone(value)}
                        className={`p-4 rounded-lg border-2 text-left transition ${
                          proposalTone === value
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300"
                        }`}
                      >
                        <p
                          className={`font-semibold text-sm mb-1 ${
                            proposalTone === value
                              ? "text-blue-700"
                              : "text-gray-800"
                          }`}
                        >
                          {label}
                        </p>
                        <p className="text-xs text-gray-500 leading-snug">
                          {desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Kontak Person */}
                <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6">
                    Kontak Person EO
                  </h2>

                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        value={formData.contactInfo.nama}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contactInfo: {
                              ...formData.contactInfo,
                              nama: e.target.value,
                            },
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">
                        WhatsApp Number
                      </label>
                      <input
                        type="text"
                        value={formData.contactInfo.whatsapp}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contactInfo: {
                              ...formData.contactInfo,
                              whatsapp: e.target.value,
                            },
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div className="w-full bg-[#2563EB] text-white px-6 py-8 rounded-lg flex items-center justify-center gap-4 mb-6 transition">
                    <div className="px-2 py-3 bg-white/20 rounded-[4px]">
                      <Lock size={28} />
                    </div>
                    <div>
                      <p className="font-semibold text-[18px]">
                        Gated Contact Info
                      </p>
                      <p className="text-sm">
                        Informasi kontak Anda akan disembunyikan dan hanya dapat
                        dilihat oleh sponsor yang memberikan penawaran.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-12 sticky bottom-0 bg-white border-t p-6">
          <Button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            variant="outline"
            disabled={currentStep === 1 || currentStep === 3}
          >
            Kembali
          </Button>

          <div className="flex gap-4">
            {currentStep === 1 && (
              <Button
                onClick={() => setCurrentStep(2)}
                disabled={!canProceedToNextStep()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Lanjut ke Langkah 2
              </Button>
            )}

            {currentStep === 2 && (
              <Button
                onClick={handleCreateEvent}
                disabled={!canProceedToNextStep() || isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting
                  ? "Membuat Event..."
                  : "Buat Event & Lanjut ke Paket"}
              </Button>
            )}

            {currentStep === 3 && (
              <Button
                onClick={handleSaveAndContinue}
                disabled={isSubmitting || formData.packages.length === 0}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? "Menyimpan..." : "Simpan & Lanjutkan"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
