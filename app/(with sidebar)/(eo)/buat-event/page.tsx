"use client";
import React, { useState, useRef, useEffect, Suspense } from "react";
import {
  Upload,
  Info,
  MapPin,
  Video,
  X,
  Plus,
  Lock,
  ArrowLeft,
  Sparkles,
  Search,
  FileText,
  CheckCircle2,
  Target,
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

  // Step 3 - Paket Sponsorship
  totalBudget: string;
  packages: Array<{
    id: number;
    name: string;
    price: string;
    benefits: string[];
    maxSlots: string;
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
  { number: 4, title: "Layanan AI" },
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

function BuatEventForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [confirmDeskripsi, setConfirmDeskripsi] = useState(false);
  const [confirmEstimasi, setConfirmEstimasi] = useState(false);
  const [confirmDemografi, setConfirmDemografi] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingProposal, setIsGeneratingProposal] = useState(false);
  const [eventId, setEventId] = useState<string | null>(null);
  const [proposalTone, setProposalTone] = useState<
    "FORMAL" | "CASUAL" | "PERSUASIVE"
  >("PERSUASIVE");
  const [showAddPackageForm, setShowAddPackageForm] = useState(false);
  const [benefitInput, setBenefitInput] = useState("");
  const [newPackage, setNewPackage] = useState({
    name: "",
    price: "",
    benefits: [] as string[],
    maxSlots: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  const [uploadedPdf, setUploadedPdf] = useState<File | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [pdfDragActive, setPdfDragActive] = useState(false);
  const [isConfirmStep2DialogOpen, setIsConfirmStep2DialogOpen] =
    useState(false);
  const [showAIBuilderTone, setShowAIBuilderTone] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<number>(45);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await apiCall<{
          success: boolean;
          data: { tokenBalance: number };
        }>("/billing/balance");
        if (res?.success && res?.data) {
          setTokenBalance(res.data.tokenBalance);
        }
      } catch (e) {
        console.error("Failed to fetch balance:", e);
      }
    };
    if (currentStep === 4) {
      fetchBalance();
    }
  }, [currentStep]);

  useEffect(() => {
    const idParam = searchParams.get("id");
    const stepParam = searchParams.get("step");

    if (idParam) {
      setEventId(idParam);
      if (stepParam) {
        setCurrentStep(parseInt(stepParam, 10) || 1);
      }

      // Fetch existing event details from backend to load draft and tiers
      const fetchEventData = async () => {
        try {
          const res = await apiCall<any>(`/events/${idParam}`);
          if (res.success && res.data) {
            const event = res.data;

            // Format dates
            let formattedStart = "";
            let formattedEnd = "";
            if (event.startDate) {
              const startDate = new Date(event.startDate);
              const year = startDate.getFullYear();
              const month = String(startDate.getMonth() + 1).padStart(2, "0");
              const day = String(startDate.getDate()).padStart(2, "0");
              formattedStart = `${year}-${month}-${day}`;
            }
            if (event.endDate) {
              const endDate = new Date(event.endDate);
              const year = endDate.getFullYear();
              const month = String(endDate.getMonth() + 1).padStart(2, "0");
              const day = String(endDate.getDate()).padStart(2, "0");
              formattedEnd = `${year}-${month}-${day}`;
            }

            // Map tiers/packages
            const mappedPackages = Array.isArray(event.tiers)
              ? event.tiers.map((tier: any, idx: number) => ({
                  id: idx + 1,
                  name: tier.name,
                  price: new Intl.NumberFormat("id-ID").format(tier.price),
                  benefits: tier.benefits || [],
                  maxSlots: tier.maxSlots ? String(tier.maxSlots) : "",
                }))
              : [];

            setFormData((prev) => ({
              ...prev,
              namaEvent: event.title || prev.namaEvent,
              tanggalMulai: formattedStart || prev.tanggalMulai,
              tanggalSelesai: formattedEnd || prev.tanggalSelesai,
              formatEvent: event.isOnline ? "online" : "offline",
              kota: event.city || prev.kota,
              kategoriEvent: event.category || prev.kategoriEvent,
              alamatEvent: event.venue || prev.alamatEvent,
              bannerPreview: event.bannerUrl || prev.bannerPreview,
              deskripsiEvent: event.description || prev.deskripsiEvent,
              estimasiPeserta: event.expectedAttendees || prev.estimasiPeserta,
              targetIndustri: event.theme || prev.targetIndustri,
              audienceAgeMin: event.audienceAgeMin || prev.audienceAgeMin,
              audienceAgeMax: event.audienceAgeMax || prev.audienceAgeMax,
              audienceInterests:
                event.audienceInterests || prev.audienceInterests,
              packages: mappedPackages,
            }));

            // If they are returning to step 3, we auto-confirm the checklist since they already created the event!
            if (stepParam === "3") {
              setConfirmDeskripsi(true);
              setConfirmEstimasi(true);
              setConfirmDemografi(true);
            }
          }
        } catch (error) {
          console.error("Failed to fetch event draft data:", error);
        }
      };

      fetchEventData();
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
    audienceInterests: [],

    totalBudget: "250.000.000",
    packages: [],
    contactInfo: {
      nama: "Contoh: Budi Santoso",
      whatsapp: "0812XXXXXXXX",
    },
  });

  // Load progress from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("buatEventFormProgress");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.formData) {
          // Restore form data (bannerFile is always null initially)
          setFormData((prev) => ({
            ...prev,
            ...parsed.formData,
            bannerFile: null,
          }));
        }
        if (parsed.eventId) {
          setEventId(parsed.eventId);
        }
        if (typeof parsed.confirmDeskripsi === "boolean") {
          setConfirmDeskripsi(parsed.confirmDeskripsi);
        }
        if (typeof parsed.confirmEstimasi === "boolean") {
          setConfirmEstimasi(parsed.confirmEstimasi);
        }
        if (typeof parsed.confirmDemografi === "boolean") {
          setConfirmDemografi(parsed.confirmDemografi);
        }

        // Only restore step if URL doesn't specify one
        const stepParam = searchParams.get("step");
        if (!stepParam && parsed.currentStep) {
          setCurrentStep(parsed.currentStep);
        }
      }
    } catch (e) {
      console.error("Failed to load form progress:", e);
    }
  }, [searchParams]);

  // Save progress to localStorage
  useEffect(() => {
    try {
      // Exclude bannerFile from JSON stringify since File objects are not serializable
      const { bannerFile, ...serializableFormData } = formData;
      const progress = {
        formData: serializableFormData,
        currentStep,
        eventId,
        confirmDeskripsi,
        confirmEstimasi,
        confirmDemografi,
      };
      localStorage.setItem("buatEventFormProgress", JSON.stringify(progress));
    } catch (e) {
      console.error("Failed to save form progress:", e);
    }
  }, [
    formData,
    currentStep,
    eventId,
    confirmDeskripsi,
    confirmEstimasi,
    confirmDemografi,
  ]);

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
        newErrors.targetIndustri = "Theme Event wajib diisi";
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
        isOnline: formData.formatEvent === "online",
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
    maxSlots: string,
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
        ...(maxSlots ? { maxSlots: parseInt(maxSlots, 10) } : {}),
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
          maxSlots: maxSlots,
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
        // Save dummy PDF proposal to firebase storage
        try {
          let pdfContent = "";
          try {
            const rawContent = response.data.content;
            const parsed =
              typeof rawContent === "string"
                ? JSON.parse(rawContent)
                : rawContent;

            let bodyText = `Proposal Event: ${formData.namaEvent || "Event"}\n\n`;
            if (parsed) {
              bodyText += `1. EXECUTIVE SUMMARY\n${parsed.executiveSummary || ""}\n\n`;
              bodyText += `2. LATAR BELAKANG EVENT\n${parsed.eventBackground || ""}\n\n`;
              if (parsed.objectives && Array.isArray(parsed.objectives)) {
                bodyText += `3. TUJUAN\n${parsed.objectives.map((o: any, idx: number) => `${idx + 1}. ${o}`).join("\n")}\n\n`;
              }
              bodyText += `4. TARGET AUDIENS\n${parsed.targetAudience || ""}\n\n`;
              bodyText += `5. MENGAPA EVENT INI\n${parsed.whyThisEvent || ""}\n\n`;
              if (
                parsed.sponsorshipBenefits &&
                Array.isArray(parsed.sponsorshipBenefits)
              ) {
                bodyText += `6. MANFAAT SPONSORSHIP\n${parsed.sponsorshipBenefits.map((b: any, idx: number) => `${idx + 1}. ${b}`).join("\n")}\n\n`;
              }
              bodyText += `7. CALL TO ACTION\n${parsed.callToAction || ""}\n`;
            }

            // Simple text wrap helper to prevent lines from spilling off the PDF page
            const wrapText = (text: string, maxChars: number = 80) => {
              const lines: string[] = [];
              const paragraphs = text.split("\n");
              for (const p of paragraphs) {
                const words = p.split(" ");
                let currentLine = "";
                for (const w of words) {
                  if ((currentLine + " " + w).length <= maxChars) {
                    currentLine = currentLine ? currentLine + " " + w : w;
                  } else {
                    lines.push(currentLine);
                    currentLine = w;
                  }
                }
                if (currentLine) lines.push(currentLine);
                lines.push(""); // spacer between paragraphs
              }
              return lines;
            };

            const wrappedLines = wrapText(bodyText);
            const escapedLines = wrappedLines
              .map((line) => {
                const escaped = line
                  .replace(/\\/g, "\\\\")
                  .replace(/\(/g, "\\(")
                  .replace(/\)/g, "\\)");
                return `(${escaped}) Tj T*`;
              })
              .join("\n");

            const streamContent = `BT\n/F1 10 Tf\n12 TL\n50 750 Td\n${escapedLines}\nET`;
            const streamLength = streamContent.length;

            pdfContent = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000111 00000 n\n0000000262 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n${262 + streamLength + 25}\n%%EOF`;
          } catch (e) {
            console.error("Failed to parse and generate real PDF:", e);
            pdfContent =
              "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << >> /MediaBox [0 0 612 792] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 20 >>\nstream\nBT /F1 12 Tf ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000111 00000 n\n0000000212 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n281\n%%EOF";
          }

          const file = new Blob([pdfContent], { type: "application/pdf" });
          const path = `events/${eventId}/proposal.pdf`;
          const storageRef = ref(storage, path);

          await uploadBytes(storageRef, file);

          // Get public download URL
          const fileUrl = await getDownloadURL(storageRef);
          console.log("Firebase generated proposal file URL: ", fileUrl);

          // POST generated proposal URL to backend
          await apiCall<any>(`/events/${eventId}/proposal`, {
            method: "POST",
            body: JSON.stringify({
              source: "GENERATED",
              fileUrl: fileUrl,
            }),
          });
        } catch (uploadError) {
          console.error(
            "Failed to upload generated proposal to firebase:",
            uploadError,
          );
        }

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

        // Clear local storage progress draft
        localStorage.removeItem("buatEventFormProgress");

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
        formData.audienceInterests.length > 0 &&
        confirmDeskripsi &&
        confirmEstimasi &&
        confirmDemografi
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
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-3xl font-bold">Buat Event Baru</h1>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm sm:text-base text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={18} />
              Kembali
            </button>
          </div>

          {/* Step Indicators */}
          <div className="flex flex-wrap md:flex-nowrap items-center gap-2 sm:gap-4">
            {STEPS.map((step, idx) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold text-xs sm:text-base transition ${
                    currentStep === step.number
                      ? "bg-blue-600 text-white"
                      : currentStep > step.number
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {currentStep > step.number ? "✓" : step.number}
                </div>
                <div className="hidden sm:block ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 whitespace-nowrap">
                    {step.title}
                  </p>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`w-6 sm:w-12 h-1 mx-2 sm:mx-4 rounded ${
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
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
        {/* Step 1: Info Dasar */}
        {currentStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Section - Form */}
            <div className="col-span-1 lg:col-span-2 space-y-6 p-4 sm:p-8 rounded-[8px] border border-[#E5E7EB] bg-white shadow-sm">
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

              {/* Tanggal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] font-semibold text-gray-700 block mb-2 uppercase">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    name="tanggalMulai"
                    value={formData.tanggalMulai}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-semibold text-gray-700 block mb-2 uppercase">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] font-semibold text-gray-700 block mb-2 uppercase">
                    Kota
                  </label>
                  <input
                    type="text"
                    name="kota"
                    value={formData.kota}
                    onChange={handleInputChange}
                    placeholder="Contoh: Yogyakarta"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 text-sm"
                  />
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
              <div className="p-4 sm:p-8 rounded-[8px] border border-[#E5E7EB] bg-white shadow-sm flex flex-col items-center justify-center">
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
          <div className="max-w-4xl mx-auto bg-white p-4 sm:p-8 rounded-[8px] border border-[#E5E7EB] shadow-sm space-y-6 sm:space-y-8">
            {/* AI Optimization Banner */}
            <div className="bg-gradient-to-r from-[#2B59FF] to-[#638FFF] rounded-2xl p-5 sm:p-6 text-white shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 relative overflow-hidden border border-blue-400/20">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center flex-shrink-0 shadow-inner border border-white/10 text-3xl">
                <Target />
              </div>
              <div className="flex-1 space-y-1">
                <h3 className="text-base sm:text-lg font-bold leading-tight tracking-wide">
                  Langkah terakhir sebelum sponsor menemukanmu!
                </h3>
                <p className="text-xs sm:text-[14px] text-white/95 leading-relaxed font-medium">
                  Semakin lengkap detail event, semakin tinggi peluang Match AI
                  kami menemukan partner yang tepat.
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center px-4 py-1.5 rounded-full border border-white/25 bg-white/10 text-xs font-bold text-white/90 backdrop-blur-sm gap-1.5">
                    Step 2 dari 3 - Hampir selesai!
                  </span>
                </div>
              </div>
            </div>

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
            <div className="flex flex-col md:flex-row gap-6 items-stretch">
              {/* Estimasi Peserta */}
              <div className="flex-1 bg-[#F9FAFB80] p-4 sm:p-6 rounded-[8px]">
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase">
                    Estimasi Peserta
                  </label>
                  <input
                    type="number"
                    name="estimasiPeserta"
                    value={formData.estimasiPeserta || ""}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setFormData({
                        ...formData,
                        estimasiPeserta: isNaN(val) ? 0 : val,
                      });
                    }}
                    placeholder="Contoh: 2500"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 text-sm bg-white text-gray-900"
                  />
                  <p className="text-[11px] text-gray-500 mt-2">
                    Masukkan perkiraan jumlah audiens yang akan menghadiri event
                    Anda.
                  </p>
                </div>
              </div>

              {/* Theme Event */}
              <div className="flex-1 bg-[#F9FAFB80] p-4 sm:p-6 rounded-[8px]">
                <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase">
                  Theme Event
                </label>
                <input
                  type="text"
                  name="targetIndustri"
                  value={formData.targetIndustri}
                  onChange={(e) => {
                    handleInputChange(e);
                    setErrors((prev) => ({ ...prev, targetIndustri: "" }));
                  }}
                  placeholder="Contoh: Digital Innovation, Green Energy, Esports"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none text-sm bg-white ${
                    errors.targetIndustri
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-blue-600"
                  }`}
                />
                {errors.targetIndustri && (
                  <p className="text-red-600 text-sm font-medium mt-2">
                    {errors.targetIndustri}
                  </p>
                )}
              </div>
            </div>

            {/* Age Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 uppercase">
                  Usia Minimum Audiens
                </label>
                <input
                  type="number"
                  value={formData.audienceAgeMin || ""}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setFormData({
                      ...formData,
                      audienceAgeMin: isNaN(val) ? 0 : val,
                    });
                  }}
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
                  value={formData.audienceAgeMax || ""}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setFormData({
                      ...formData,
                      audienceAgeMax: isNaN(val) ? 0 : val,
                    });
                  }}
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

            {/* Confirmation Section */}
            <div className="mt-8 p-6 bg-[#FFF7ED] border border-[#FED7AA] rounded-xl text-[#92400E]">
              <div className="flex gap-3.5 mb-4">
                <Image
                  src={"/icons/caution.svg"}
                  alt={"caution"}
                  width={18}
                  height={15}
                ></Image>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#78350F]">
                    Perhatian — Analisis Audiens Tidak Dapat Diubah
                  </h3>
                  <p className="text-sm text-[#92400E]/90 leading-relaxed font-medium">
                    Data audiens dan deskripsi event tidak dapat diubah setelah
                    Anda melanjutkan ke Paket Sponsorship. Harap pastikan data
                    berikut sudah benar:
                  </p>
                </div>
              </div>

              <div className="space-y-3.5 pl-8 pt-1">
                {[
                  {
                    id: "confirmDeskripsi",
                    label: "Deskripsi Lengkap Event",
                    checked: confirmDeskripsi,
                    onChange: setConfirmDeskripsi,
                  },
                  {
                    id: "confirmEstimasi",
                    label: "Estimasi Jumlah Peserta & Tier",
                    checked: confirmEstimasi,
                    onChange: setConfirmEstimasi,
                  },
                  {
                    id: "confirmDemografi",
                    label: "Target Demografi & Industri",
                    checked: confirmDemografi,
                    onChange: setConfirmDemografi,
                  },
                ].map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-3 cursor-pointer group select-none"
                  >
                    <input
                      type="checkbox"
                      id={item.id}
                      checked={item.checked}
                      onChange={(e) => item.onChange(e.target.checked)}
                      className="w-[18px] h-[18px] border-2 border-[#D97706] text-[#D97706] rounded focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#D97706]"
                    />
                    <span className="text-sm font-semibold text-[#78350F] group-hover:text-[#92400E] transition">
                      {item.label}
                    </span>
                  </label>
                ))}
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
                {/* <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
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
                </div> */}
                {/* <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
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
                </div> */}

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

                        {/* Max Slots */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">
                            Jumlah Slot
                          </label>
                          <input
                            type="number"
                            min={1}
                            placeholder="Contoh: 1"
                            value={newPackage.maxSlots}
                            onChange={(e) =>
                              setNewPackage({
                                ...newPackage,
                                maxSlots: e.target.value,
                              })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                          />
                          <p className="text-xs text-gray-400 mt-1">
                            Kosongkan jika tidak ada batas slot
                          </p>
                        </div>

                        {/* Benefits */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">
                            Benefit
                          </label>
                          <div className="flex flex-wrap gap-2 mb-3 border border-gray-300 rounded-lg h-10 p-2">
                            {newPackage.benefits.map((benefit) => (
                              <div
                                key={benefit}
                                className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium "
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
                                  className="hover:text-blue-900 transition "
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* Benefit Tag Input */}
                          <input
                            type="text"
                            value={benefitInput}
                            onChange={(e) => setBenefitInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const trimmed = benefitInput.trim();
                                if (
                                  trimmed &&
                                  !newPackage.benefits.includes(trimmed)
                                ) {
                                  setNewPackage({
                                    ...newPackage,
                                    benefits: [...newPackage.benefits, trimmed],
                                  });
                                }
                                setBenefitInput("");
                              }
                            }}
                            placeholder="Tambah benefit (tekan Enter)"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                          />
                        </div>

                        {/* Form Buttons */}
                        <div className="flex gap-3 pt-4">
                          <button
                            onClick={async () => {
                              await handleAddPackage(
                                newPackage.name,
                                newPackage.price,
                                newPackage.benefits,
                                newPackage.maxSlots,
                              );
                              setNewPackage({
                                name: "",
                                price: "",
                                benefits: [],
                                maxSlots: "",
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
                                maxSlots: "",
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
                      className="mb-6 bg-white p-4 sm:p-6 rounded-lg border border-gray-200 shadow-sm"
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

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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

                        {/* Max Slots */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase">
                            Jumlah Slot
                          </label>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-700">
                              {pkg.maxSlots
                                ? `${pkg.maxSlots} slot`
                                : "Tidak terbatas"}
                            </span>
                          </div>
                        </div>

                        {/* Benefit */}
                        <div className="col-span-1 sm:col-span-2">
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
                                <button
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      packages: prev.packages.map((p) =>
                                        p.id === pkg.id
                                          ? {
                                              ...p,
                                              benefits: p.benefits.filter(
                                                (b) => b !== benefit,
                                              ),
                                            }
                                          : p,
                                      ),
                                    }))
                                  }
                                  className="hover:text-blue-900 transition ml-0.5"
                                >
                                  <X size={13} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Kontak Person */}
                {/* <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
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
                </div> */}
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="max-w-5xl mx-auto space-y-8 sm:space-y-12 animate-fadeIn pb-12">
            {/* Header */}
            <div className="text-center space-y-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Pilih Layanan AI EventHub
              </h2>
              <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
                Optimalkan proposal Anda dengan teknologi AI kami untuk menarik
                mitra strategis lebih cepat.
              </p>
            </div>

            {/* Grid options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-stretch">
              {/* Option 1: AI Proposal Builder */}
              <div className="bg-white rounded-2xl border-2 border-gray-100 hover:border-blue-500 hover:shadow-xl transition-all duration-300 p-4 sm:p-8 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute right-0 top-0 bg-blue-500/10 text-blue-600 px-4 py-1.5 rounded-bl-2xl font-bold text-sm flex items-center gap-1">
                  <Sparkles size={14} className="animate-pulse" />5 Token
                </div>

                <div className="space-y-6">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                    <FileText size={28} />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      AI Proposal Builder
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      Generate a professional, high-converting sponsorship
                      proposal document automatically based on your event data.
                      Hemat waktu hingga 5 jam penulisan.
                    </p>
                  </div>

                  {/* Bullet points or Tone Selection */}
                  {!showAIBuilderTone ? (
                    <ul className="space-y-3 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-green-500" />
                        <span>Optimasi copywriting profesional</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-green-500" />
                        <span>Struktur proposal standar B2B</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-green-500" />
                        <span>Format PDF siap kirim</span>
                      </li>
                    </ul>
                  ) : (
                    <div className="space-y-4 pt-4 border-t border-gray-100 animate-fadeIn">
                      <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                        Pilih Gaya Penulisan (Tone)
                      </h4>
                      <div className="flex flex-col gap-2.5">
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
                            className={`p-3 rounded-xl border-2 text-left transition flex items-start gap-3 w-full ${
                              proposalTone === value
                                ? "border-blue-600 bg-blue-50/50"
                                : "border-gray-200 hover:border-blue-300 bg-gray-50/30"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                                proposalTone === value
                                  ? "border-blue-600 text-blue-600"
                                  : "border-gray-300"
                              }`}
                            >
                              {proposalTone === value && (
                                <div className="w-2 h-2 rounded-full bg-blue-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p
                                className={`font-bold text-xs ${
                                  proposalTone === value
                                    ? "text-blue-700"
                                    : "text-gray-800"
                                }`}
                              >
                                {label}
                              </p>
                              <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">
                                {desc}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-8 flex gap-3">
                  {showAIBuilderTone && (
                    <Button
                      onClick={() => setShowAIBuilderTone(false)}
                      variant="outline"
                      className="rounded-xl border-gray-200 text-gray-500 hover:bg-gray-50"
                    >
                      Batal
                    </Button>
                  )}
                  <Button
                    onClick={() => {
                      if (!showAIBuilderTone) {
                        setShowAIBuilderTone(true);
                      } else {
                        handleSaveAndContinue();
                      }
                    }}
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition duration-300 shadow-md flex items-center justify-center gap-2"
                  >
                    <Sparkles size={16} />
                    {isSubmitting
                      ? "Memproses..."
                      : showAIBuilderTone
                        ? "Mulai Generate"
                        : "Gunakan AI Builder"}
                  </Button>
                </div>
              </div>

              {/* Option 2: AI Smart Review */}
              <div className="bg-white rounded-2xl border-2 border-gray-100 hover:border-indigo-500 hover:shadow-xl transition-all duration-300 p-4 sm:p-8 flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute right-0 top-0 bg-indigo-500/10 text-indigo-600 px-4 py-1.5 rounded-bl-2xl font-bold text-sm flex items-center gap-1">
                  <Search size={14} />3 Token
                </div>

                <div className="space-y-6">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                    <Search size={28} />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      AI Smart Review
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      Analyze your existing proposal and get actionable insights
                      to improve your match score and attract more sponsors.
                      Dapatkan feedback instan.
                    </p>
                  </div>

                  {/* Bullet points */}
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-green-500" />
                      <span>Prediksi tingkat keberhasilan match</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-green-500" />
                      <span>Rekomendasi perbaikan penawaran</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-green-500" />
                      <span>Analisis perbandingan kompetitor</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-8">
                  <Button
                    onClick={() => setIsUploadDialogOpen(true)}
                    variant="outline"
                    className="w-full border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 font-semibold py-3 rounded-xl transition duration-300 flex items-center justify-center gap-2"
                  >
                    <Search size={16} />
                    Gunakan Smart Review
                  </Button>
                </div>
              </div>
            </div>

            {/* Bottom elements */}
            <div className="flex flex-col items-center space-y-4 pt-4 border-t border-gray-100">
              <Button
                variant="ghost"
                onClick={() => setIsUploadDialogOpen(true)}
                className="text-gray-600 hover:text-gray-900 font-medium bg-gray-100 hover:bg-gray-200 px-6 py-2 rounded-full transition duration-300 text-sm sm:text-base text-center w-full sm:w-auto"
              >
                Saya punya proposal sendiri
              </Button>

              {/* Token Info Widget */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 bg-blue-50/50 border border-blue-100 rounded-2xl px-4 sm:px-6 py-3 sm:py-4 max-w-md w-full">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                    🪙
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
                      Sisa Token Anda
                    </p>
                    <p className="text-base sm:text-lg font-bold text-gray-900">
                      {tokenBalance} Tokens
                    </p>
                  </div>
                </div>
                <Button
                  variant="link"
                  onClick={() => window.open("/token-management", "_blank")}
                  className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 text-sm p-0 self-end sm:self-auto"
                >
                  + Beli Token
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 sm:mt-12 sticky bottom-0 bg-white border-t p-4 sm:p-6 z-10">
          <Button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            variant="outline"
            disabled={currentStep === 1 || currentStep === 3}
            className="text-sm sm:text-base px-3 sm:px-5"
          >
            Kembali
          </Button>

          <div className="flex gap-2 sm:gap-4">
            {currentStep === 1 && (
              <Button
                onClick={() => setCurrentStep(2)}
                disabled={!canProceedToNextStep()}
                className="bg-blue-600 hover:bg-blue-700 text-sm sm:text-base px-3 sm:px-5"
              >
                Lanjut ke Langkah 2
              </Button>
            )}

            {currentStep === 2 && (
              <Button
                onClick={() => setIsConfirmStep2DialogOpen(true)}
                disabled={!canProceedToNextStep() || isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-sm sm:text-base px-3 sm:px-5"
              >
                Lanjut ke Langkah 3
              </Button>
            )}

            {currentStep === 3 && (
              <Button
                onClick={() => {
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
                  setCurrentStep(4);
                }}
                disabled={formData.packages.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-sm sm:text-base px-3 sm:px-5"
              >
                Lanjut ke Layanan AI
              </Button>
            )}
          </div>
        </div>

        {/* Dialog for Uploading Proposal PDF */}
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent className="sm:max-w-lg p-6 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-955 flex items-center gap-2">
                <Upload className="text-indigo-600" size={24} />
                Upload Proposal PDF
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 pt-4">
              <p className="text-sm text-gray-500">
                Unggah file proposal sponsorship Anda dalam format PDF (maks.
                10MB) untuk dianalisis oleh AI Smart Review.
              </p>

              <div
                onDragEnter={(e) => {
                  e.preventDefault();
                  setPdfDragActive(true);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setPdfDragActive(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setPdfDragActive(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setPdfDragActive(false);
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    const file = e.dataTransfer.files[0];
                    if (file.type === "application/pdf") {
                      setUploadedPdf(file);
                    } else {
                      showNotification("error", "File harus berupa PDF.");
                    }
                  }
                }}
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "application/pdf";
                  input.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files;
                    if (files && files.length > 0) {
                      const file = files[0];
                      if (file.type === "application/pdf") {
                        setUploadedPdf(file);
                      } else {
                        showNotification("error", "File harus berupa PDF.");
                      }
                    }
                  };
                  input.click();
                }}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-3 ${
                  pdfDragActive
                    ? "border-indigo-600 bg-indigo-50/50"
                    : uploadedPdf
                      ? "border-green-300 bg-green-50/30"
                      : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50/50"
                }`}
              >
                {uploadedPdf ? (
                  <>
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      ✓
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">
                        {uploadedPdf.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(uploadedPdf.size / (1024 * 1024)).toFixed(2)} MB •
                        Klik untuk ganti
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <Upload size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">
                        Klik untuk unggah atau seret file PDF ke sini
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Maksimal 10MB (PDF saja)
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsUploadDialogOpen(false);
                    setUploadedPdf(null);
                  }}
                  disabled={isUploadingPdf}
                  className="flex-1 rounded-xl"
                >
                  Batal
                </Button>
                <Button
                  onClick={async () => {
                    if (!uploadedPdf || !eventId) return;
                    try {
                      setIsUploadingPdf(true);
                      showNotification("success", "Mengunggah proposal PDF...");

                      // 1. Upload to Firebase
                      const path = `events/${eventId}/proposal.pdf`;
                      const storageRef = ref(storage, path);
                      await uploadBytes(storageRef, uploadedPdf);
                      const fileUrl = await getDownloadURL(storageRef);

                      // 2. POST proposal
                      await apiCall<any>(`/events/${eventId}/proposal`, {
                        method: "POST",
                        body: JSON.stringify({
                          source: "UPLOAD",
                          fileUrl: fileUrl,
                        }),
                      });

                      // 3. POST smart review
                      await apiCall<any>("/ai/smart-review", {
                        method: "POST",
                        body: JSON.stringify({ eventId }),
                      });

                      showNotification(
                        "success",
                        "Smart Review berhasil dimulai!",
                      );
                      setIsUploadDialogOpen(false);
                      setUploadedPdf(null);

                      // 4. Redirect
                      router.push(
                        `/proposal-smart-review?id=${eventId}&tab=smart-review`,
                      );
                    } catch (err: any) {
                      console.error("Smart review trigger failed:", err);
                      showNotification(
                        "error",
                        err?.message || "Gagal menjalankan smart review.",
                      );
                    } finally {
                      setIsUploadingPdf(false);
                    }
                  }}
                  disabled={!uploadedPdf || isUploadingPdf}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl"
                >
                  {isUploadingPdf ? "Memproses..." : "Mulai Smart Review"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Step 2 Confirmation Dialog */}
        <Dialog
          open={isConfirmStep2DialogOpen}
          onOpenChange={setIsConfirmStep2DialogOpen}
        >
          <DialogContent
            className="w-[95%] sm:max-w-xl max-h-[90vh] overflow-y-auto p-5 sm:p-6 rounded-2xl"
            showCloseButton={false}
          >
            <DialogHeader className="flex flex-col items-center">
              {/* Circular clipboard icon */}
              <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4 shadow-sm">
                <FileText size={28} className="text-[#3b82f6]" />
              </div>

              {/* Title & Description */}
              <DialogTitle className="text-xl font-extrabold text-gray-900 text-center mb-1 font-inter">
                Konfirmasi Data Sebelum Melanjutkan
              </DialogTitle>
              <p className="text-xs text-gray-500 text-center mb-6">
                Data pada langkah ini akan dikunci secara permanen setelah Anda
                lanjut.
              </p>
            </DialogHeader>

            {/* Content summary */}
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block font-inter">
                Ringkasan Data yang Akan Dikunci
              </span>

              {/* Deskripsi Event */}
              <div className="bg-gray-50/60 p-4 rounded-xl border border-gray-100/80 flex items-center justify-between gap-3 overflow-hidden text-ellipsis">
                <div className="space-y-1 overflow-hidden flex-1">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
                    Deskripsi Event
                  </span>
                  <p className="text-sm font-semibold text-gray-800">
                    {formData.deskripsiEvent || "-"}
                  </p>
                </div>
                <Lock size={15} className="text-gray-400 flex-shrink-0" />
              </div>

              {/* Estimasi Peserta */}
              <div className="bg-gray-50/60 p-4 rounded-xl border border-gray-100/80 flex items-center justify-between gap-3 text-ellipsis">
                <div className="space-y-1 flex-1">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
                    Estimasi Peserta
                  </span>
                  <p className="text-sm font-semibold text-gray-800">
                    {formData.estimasiPeserta
                      ? `${formData.estimasiPeserta.toLocaleString()} Orang`
                      : "-"}
                  </p>
                </div>
                <Lock size={15} className="text-gray-400 flex-shrink-0" />
              </div>

              {/* Target Demografi */}
              <div className="bg-gray-50/60 p-4 rounded-xl border border-gray-100/80 flex items-center justify-between gap-3 text-ellipsis">
                <div className="space-y-1.5 overflow-hidden flex-1">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
                    Target Demografi
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {formData.audienceInterests.length > 0 ? (
                      formData.audienceInterests.map((interest) => (
                        <span
                          key={interest}
                          className="text-[10px] font-semibold bg-gray-200/60 text-gray-600 px-2 py-0.5 rounded-full capitalize"
                        >
                          {interest}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm font-semibold text-gray-800">
                        -
                      </span>
                    )}
                  </div>
                </div>
                <Lock size={15} className="text-gray-400 flex-shrink-0" />
              </div>

              {/* Theme Event */}
              <div className="bg-gray-50/60 p-4 rounded-xl border border-gray-100/80 flex items-center justify-between gap-3 text-ellipsis">
                <div className="space-y-1 flex-1">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
                    Theme Event
                  </span>
                  <p className="text-sm font-semibold text-gray-800">
                    {formData.targetIndustri || "-"}
                  </p>
                </div>
                <Lock size={15} className="text-gray-400 flex-shrink-0" />
              </div>

              {/* Warning/Caution Box */}
              <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl text-amber-800 flex gap-3 text-xs leading-relaxed font-semibold">
                <Info
                  size={16}
                  className="text-amber-600 flex-shrink-0 mt-0.5"
                />
                <p>
                  Data di atas tidak dapat diubah setelah ini. Data ini
                  digunakan AI untuk mencocokkan Anda dengan sponsor potensial
                  secara akurat.
                </p>
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-6">
              <button
                onClick={() => setIsConfirmStep2DialogOpen(false)}
                className="text-sm font-bold text-gray-500 hover:text-gray-700 flex items-center gap-2 py-3 px-4 rounded-xl transition"
              >
                <ArrowLeft size={16} />
                Kembali & Periksa
              </button>
              <Button
                onClick={async () => {
                  setIsConfirmStep2DialogOpen(false);
                  await handleCreateEvent();
                }}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl shadow-md transition flex items-center gap-1.5"
              >
                {isSubmitting ? "Memproses..." : "Ya, Lanjutkan →"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default function BuatEventPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-gray-500">Memuat halaman...</div>
      }
    >
      <BuatEventForm />
    </Suspense>
  );
}
