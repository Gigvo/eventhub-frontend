"use client";

import React, { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Upload,
  Download,
  AlertCircle,
  FileText,
  CloudUpload,
  Sparkles,
  X,
  Plus,
  Trash2,
  Eye,
  Edit2,
  FileJson,
  CheckCircle2,
  Target,
  Users,
  Calendar,
  MapPin,
  HelpCircle,
  Gift,
  PhoneCall,
  ChevronRight,
  TrendingUp,
  Award,
  Check,
  Globe,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { apiCall } from "@/lib/api-client";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import Tiptap from "@/components/proposal-builder/tiptap";

import ProposalTerbaru from "@/components/proposal-terbaru";

interface SponsorshipPackage {
  tierName: string;
  price: string;
  benefits: string[];
}

interface ProposalJSON {
  title: string;
  executiveSummary: string;
  aboutOrganizer: string;
  eventBackground: string;
  eventTheme: string;
  objectives: string[];
  activities: string[];
  targetAudience: string;
  audienceReach: string;
  whySponsor: string;
  sponsorshipPackages: SponsorshipPackage[];
  generalBenefits: string[];
  closingStatement: string;
  callToAction: string;
}

const isValidProposalJson = (contentStr: string): boolean => {
  try {
    const parsed = JSON.parse(contentStr);
    return (
      typeof parsed === "object" &&
      parsed !== null &&
      ("executiveSummary" in parsed || "title" in parsed)
    );
  } catch (e) {
    return false;
  }
};

const parseProposal = (contentStr: string): ProposalJSON => {
  try {
    const parsed = JSON.parse(contentStr);
    return {
      title: parsed.title || "",
      executiveSummary: parsed.executiveSummary || "",
      aboutOrganizer: parsed.aboutOrganizer || "",
      eventBackground: parsed.eventBackground || "",
      eventTheme: parsed.eventTheme || "",
      objectives: Array.isArray(parsed.objectives) ? parsed.objectives : [],
      activities: Array.isArray(parsed.activities) ? parsed.activities : [],
      targetAudience: parsed.targetAudience || "",
      audienceReach: parsed.audienceReach || "",
      whySponsor: parsed.whySponsor || parsed.whyThisEvent || "",
      sponsorshipPackages: Array.isArray(parsed.sponsorshipPackages)
        ? parsed.sponsorshipPackages
        : [],
      generalBenefits: Array.isArray(parsed.generalBenefits)
        ? parsed.generalBenefits
        : Array.isArray(parsed.sponsorshipBenefits)
          ? parsed.sponsorshipBenefits
          : [],
      closingStatement: parsed.closingStatement || "",
      callToAction: parsed.callToAction || "",
    };
  } catch (e) {
    return {
      title: "",
      executiveSummary: "",
      aboutOrganizer: "",
      eventBackground: "",
      eventTheme: "",
      objectives: [],
      activities: [],
      targetAudience: "",
      audienceReach: "",
      whySponsor: "",
      sponsorshipPackages: [],
      generalBenefits: [],
      closingStatement: "",
      callToAction: "",
    };
  }
};

function buildHtml(content: ProposalJSON, eventName: string): string {
  const listItems = (items: string[]) =>
    items ? items.map((i) => `<li>${i}</li>`).join("") : "";

  const packagesHtml = (packages: SponsorshipPackage[]) => {
    if (!packages || !Array.isArray(packages)) return "";
    return packages
      .map(
        (pkg) => `
<h3>${pkg.tierName} (${pkg.price})</h3>
<ul>${listItems(pkg.benefits)}</ul>
      `,
      )
      .join("");
  };

  const titleText = content.title || `${eventName} — Proposal Sponsorship`;

  return `
<h1>${titleText}</h1>

<h2>Executive Summary</h2>
<p>${content.executiveSummary || ""}</p>

<h2>Tentang Penyelenggara</h2>
<p>${content.aboutOrganizer || ""}</p>

<h2>Latar Belakang Event</h2>
<p>${content.eventBackground || ""}</p>

<h2>Tema Event</h2>
<p>${content.eventTheme || ""}</p>

<h2>Tujuan</h2>
<ul>${listItems(content.objectives)}</ul>

<h2>Rencana Aktivitas</h2>
<ul>${listItems(content.activities)}</ul>

<h2>Target Audiens</h2>
<p>${content.targetAudience || ""}</p>

<h2>Jangkauan Audiens</h2>
<p>${content.audienceReach || ""}</p>

<h2>Mengapa Sponsor Harus Bergabung</h2>
<p>${content.whySponsor || ""}</p>

<h2>Paket Sponsorship</h2>
${packagesHtml(content.sponsorshipPackages)}

<h2>Benefit Umum</h2>
<ul>${listItems(content.generalBenefits)}</ul>

<h2>Penutup</h2>
<p>${content.closingStatement || ""}</p>

<h2>Call to Action</h2>
<p>${content.callToAction || ""}</p>
  `.trim();
}

function parseHtmlToProposalContent(html: string): ProposalJSON {
  const defaultContent: ProposalJSON = {
    title: "",
    executiveSummary: "",
    aboutOrganizer: "",
    eventBackground: "",
    eventTheme: "",
    objectives: [],
    activities: [],
    targetAudience: "",
    audienceReach: "",
    whySponsor: "",
    sponsorshipPackages: [],
    generalBenefits: [],
    closingStatement: "",
    callToAction: "",
  };

  if (typeof window === "undefined") return defaultContent;

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Helper to extract content after a specific heading text
  const getSectionContent = (headingText: string): string => {
    const headings = Array.from(doc.querySelectorAll("h2"));
    const heading = headings.find((h) =>
      h.textContent?.toLowerCase().includes(headingText.toLowerCase()),
    );
    if (!heading) return "";

    let content = "";
    let next = heading.nextElementSibling;
    while (next && next.tagName !== "H2" && next.tagName !== "H1") {
      if (next.tagName === "P") {
        content += (content ? "\n" : "") + (next.textContent || "");
      }
      next = next.nextElementSibling;
    }
    return content;
  };

  // Helper to extract list items after a specific heading text
  const getSectionList = (headingText: string): string[] => {
    const headings = Array.from(doc.querySelectorAll("h2"));
    const heading = headings.find((h) =>
      h.textContent?.toLowerCase().includes(headingText.toLowerCase()),
    );
    if (!heading) return [];

    const items: string[] = [];
    let next = heading.nextElementSibling;
    while (next && next.tagName !== "H2" && next.tagName !== "H1") {
      if (next.tagName === "UL" || next.tagName === "OL") {
        const lis = next.querySelectorAll("li");
        lis.forEach((li) => {
          if (li.textContent) items.push(li.textContent);
        });
      }
      next = next.nextElementSibling;
    }
    return items;
  };

  const getSponsorshipPackages = (): SponsorshipPackage[] => {
    const headings = Array.from(doc.querySelectorAll("h2"));
    const sponsorHeading = headings.find((h) =>
      h.textContent?.toLowerCase().includes("paket sponsorship"),
    );
    if (!sponsorHeading) return [];

    const packages: SponsorshipPackage[] = [];
    let next = sponsorHeading.nextElementSibling;
    while (next && next.tagName !== "H2" && next.tagName !== "H1") {
      if (next.tagName === "H3") {
        const h3Text = next.textContent || "";
        const match = h3Text.match(/^(.*?)\s*\((.*?)\)$/);
        const tierName = match ? match[1].trim() : h3Text.trim();
        const price = match ? match[2].trim() : "";

        const benefits: string[] = [];
        let listSibling = next.nextElementSibling;
        if (
          listSibling &&
          (listSibling.tagName === "UL" || listSibling.tagName === "OL")
        ) {
          const lis = listSibling.querySelectorAll("li");
          lis.forEach((li) => {
            if (li.textContent) benefits.push(li.textContent);
          });
        }
        packages.push({ tierName, price, benefits });
      }
      next = next.nextElementSibling;
    }
    return packages;
  };

  const h1El = doc.querySelector("h1");
  const title = h1El ? h1El.textContent || "" : "";

  return {
    title,
    executiveSummary:
      getSectionContent("Executive Summary") ||
      getSectionContent("Ringkasan Eksekutif"),
    aboutOrganizer:
      getSectionContent("Tentang Penyelenggara") ||
      getSectionContent("Organizer"),
    eventBackground:
      getSectionContent("Latar Belakang Event") ||
      getSectionContent("Background"),
    eventTheme:
      getSectionContent("Tema Event") ||
      getSectionContent("Theme") ||
      getSectionContent("Tema"),
    objectives: getSectionList("Tujuan") || getSectionList("Objectives"),
    activities: getSectionList("Aktivitas") || getSectionList("Activities"),
    targetAudience:
      getSectionContent("Target Audiens") || getSectionContent("Audience"),
    audienceReach:
      getSectionContent("Jangkauan Audiens") || getSectionContent("Reach"),
    whySponsor:
      getSectionContent("Mengapa Sponsor") ||
      getSectionContent("Mengapa Event Ini"),
    sponsorshipPackages: getSponsorshipPackages(),
    generalBenefits:
      getSectionList("Benefit Umum") ||
      getSectionList("General Benefits") ||
      getSectionList("Manfaat"),
    closingStatement:
      getSectionContent("Penutup") || getSectionContent("Closing"),
    callToAction:
      getSectionContent("Call to Action") || getSectionContent("CTA"),
  };
}

interface EventTier {
  id: string;
  name: string;
  price: number;
  benefits: string[];
  maxSlots: number;
}

interface MyEvent {
  id: string;
  slug: string;
  title: string;
  category: string;
  bannerUrl: string | null;
  startDate: string;
  endDate: string;
  city: string;
  venue: string;
  expectedAttendees: number;
  status: string;
  tiers: EventTier[];
  proposal: {
    id: string;
    source: string;
    aiScore: number | null;
    aiFeedback: any;
    fileUrl: string | null;
    content: string | null;
  } | null;
  _count: { offers: number };
}

export default function ProposalSmartReview() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  // Controlled tab for programmatic switching from event-kamu CTA
  const [activeTab, setActiveTab] = useState("terbaru");

  // Lazy initialize eventId and eventName from localStorage or API
  const [eventId, setEventId] = useState<string | null>(null);
  const [eventName, setEventName] = useState("Event");
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myEvents, setMyEvents] = useState<MyEvent[]>([]);
  const [proposalAnalysis, setProposalAnalysis] = useState<{
    id: string;
    source: string;
    aiScore: number | null;
    aiFeedback: any;
    fileUrl: string | null;
    content: string | null;
  } | null>(null);
  const [isFetchingAnalysis, setIsFetchingAnalysis] = useState(false);

  // Editor state
  const [isEditingProposal, setIsEditingProposal] = useState(false);
  const [editedContent, setEditedContent] = useState<string>("");
  const [editorHtml, setEditorHtml] = useState<string>("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSavingProposal, setIsSavingProposal] = useState(false);
  const [isRunningSmartReview, setIsRunningSmartReview] = useState(false);

  // Structured proposal states
  const [editorTab, setEditorTab] = useState<"preview" | "edit" | "raw">(
    "preview",
  );
  const [proposalForm, setProposalForm] = useState<ProposalJSON | null>(null);

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [aiOptions, setAiOptions] = useState({
    proposalScore: true,
    identifyIssues: false,
    matchEventData: true,
  });

  // Helper function to show notification
  const showNotification = (
    type: "success" | "error",
    message: string,
    duration = 4000,
  ) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), duration);
  };

  const handleOpenEditor = async (contentStr?: string | null) => {
    if (!eventId) return;
    setIsEditingProposal(true);
    let rawContent = "";
    if (contentStr) {
      rawContent = contentStr;
    } else {
      try {
        const res = await apiCall<{ data: any }>(`/events/${eventId}`);
        if (res.data?.proposal?.content) {
          rawContent = res.data.proposal.content;
        }
      } catch (err) {
        console.error(err);
      }
    }

    setEditedContent(rawContent);
    if (isValidProposalJson(rawContent)) {
      const parsed = parseProposal(rawContent);
      setProposalForm(parsed);
      setEditorHtml(buildHtml(parsed, eventName || "Event"));
      setEditorTab("preview");
    } else {
      setProposalForm(null);
      setEditorHtml(rawContent);
      setEditorTab("raw");
    }
  };

  const handleTabChange = (tab: "preview" | "edit" | "raw") => {
    if (tab === "preview" || tab === "edit") {
      if (isValidProposalJson(editedContent)) {
        setProposalForm(parseProposal(editedContent));
      } else {
        showNotification(
          "error",
          "Format proposal tidak valid untuk tampilan terstruktur. Silakan edit lewat Rich Text Editor di tab Tiptap terlebih dahulu.",
        );
        return;
      }
    } else if (tab === "raw") {
      if (isValidProposalJson(editedContent)) {
        const parsed = parseProposal(editedContent);
        setEditorHtml(buildHtml(parsed, eventName || "Event"));
      } else {
        setEditorHtml(editedContent);
      }
    }
    setEditorTab(tab);
  };

  const handleTiptapChange = (html: string) => {
    setEditorHtml(html);
    if (isValidProposalJson(editedContent)) {
      const parsedContent = parseHtmlToProposalContent(html);
      setEditedContent(JSON.stringify(parsedContent));
      setProposalForm(parsedContent);
    } else {
      setEditedContent(html);
    }
  };

  const updateFormField = (field: keyof ProposalJSON, value: any) => {
    if (!proposalForm) return;
    const updated = { ...proposalForm, [field]: value };
    setProposalForm(updated);
    setEditedContent(JSON.stringify(updated));
  };

  const updateFormArrayField = (
    field: "objectives" | "generalBenefits" | "activities",
    index: number,
    value: string,
  ) => {
    if (!proposalForm) return;
    const newArray = [...proposalForm[field]];
    newArray[index] = value;
    updateFormField(field, newArray);
  };

  const addFormArrayItem = (
    field: "objectives" | "generalBenefits" | "activities",
  ) => {
    if (!proposalForm) return;
    const newArray = [...proposalForm[field], ""];
    updateFormField(field, newArray);
  };

  const removeFormArrayItem = (
    field: "objectives" | "generalBenefits" | "activities",
    index: number,
  ) => {
    if (!proposalForm) return;
    const newArray = proposalForm[field].filter((_, i) => i !== index);
    updateFormField(field, newArray);
  };

  const updatePackageField = (
    index: number,
    field: keyof SponsorshipPackage,
    value: any,
  ) => {
    if (!proposalForm) return;
    const pkgs = [...proposalForm.sponsorshipPackages];
    pkgs[index] = { ...pkgs[index], [field]: value };
    updateFormField("sponsorshipPackages", pkgs);
  };

  const addPackage = () => {
    if (!proposalForm) return;
    const pkgs = [
      ...proposalForm.sponsorshipPackages,
      { tierName: "Baru", price: "Rp 0", benefits: [] },
    ];
    updateFormField("sponsorshipPackages", pkgs);
  };

  const removePackage = (index: number) => {
    if (!proposalForm) return;
    const pkgs = proposalForm.sponsorshipPackages.filter((_, i) => i !== index);
    updateFormField("sponsorshipPackages", pkgs);
  };

  const updatePackageBenefit = (
    pkgIndex: number,
    benefitIndex: number,
    value: string,
  ) => {
    if (!proposalForm) return;
    const pkgs = [...proposalForm.sponsorshipPackages];
    const benefits = [...pkgs[pkgIndex].benefits];
    benefits[benefitIndex] = value;
    pkgs[pkgIndex] = { ...pkgs[pkgIndex], benefits };
    updateFormField("sponsorshipPackages", pkgs);
  };

  const addPackageBenefit = (pkgIndex: number) => {
    if (!proposalForm) return;
    const pkgs = [...proposalForm.sponsorshipPackages];
    const benefits = [...pkgs[pkgIndex].benefits, ""];
    pkgs[pkgIndex] = { ...pkgs[pkgIndex], benefits };
    updateFormField("sponsorshipPackages", pkgs);
  };

  const removePackageBenefit = (pkgIndex: number, benefitIndex: number) => {
    if (!proposalForm) return;
    const pkgs = [...proposalForm.sponsorshipPackages];
    const benefits = pkgs[pkgIndex].benefits.filter(
      (_, i) => i !== benefitIndex,
    );
    pkgs[pkgIndex] = { ...pkgs[pkgIndex], benefits };
    updateFormField("sponsorshipPackages", pkgs);
  };

  const handleDownloadPDF = async () => {
    const activeEvent = myEvents.find((e) => e.id === eventId);
    const proposal = activeEvent?.proposal;

    if (proposal?.source === "GENERATED" && proposal.content) {
      showNotification("success", "Menyiapkan dokumen PDF...");

      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      document.body.appendChild(iframe);

      let htmlContent = proposal.content;
      try {
        if (htmlContent.startsWith("{")) {
          const parsed = JSON.parse(htmlContent);
          htmlContent = buildHtml(parsed, eventName);
        }
      } catch (e) {}

      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(`
          <html>
            <head>
              <title>Proposal_${eventName.replace(/[^a-zA-Z0-9]/g, "_")}</title>
              <style>
                body { 
                  font-family: 'Segoe UI', system-ui, sans-serif; 
                  line-height: 1.6; 
                  padding: 40px; 
                  color: #1a1a1a; 
                  max-width: 800px;
                  margin: 0 auto;
                }
                h1 { color: #003EC7; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 30px; }
                h2 { color: #111827; margin-top: 32px; margin-bottom: 16px; font-size: 1.5rem; }
                p { margin-bottom: 16px; text-align: justify; }
                ul, ol { margin-bottom: 24px; padding-left: 24px; }
                li { margin-bottom: 8px; }
                @media print {
                  body { padding: 0; }
                }
              </style>
            </head>
            <body>
              <h1>Proposal: ${eventName}</h1>
              ${htmlContent}
            </body>
          </html>
        `);
        doc.close();

        iframe.contentWindow?.focus();
        setTimeout(() => {
          iframe.contentWindow?.print();
          setTimeout(() => document.body.removeChild(iframe), 1000);
        }, 500);
      }
      return;
    }

    const fileUrl = proposal?.fileUrl;
    if (!fileUrl) {
      showNotification("error", "Proposal PDF tidak ditemukan.");
      return;
    }

    try {
      showNotification("success", "Mengunduh proposal PDF...");
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error("Gagal mengambil file PDF");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `proposal-${eventName.toLowerCase().replace(/\s+/g, "-")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(
        "Gagal mengunduh file secara langsung, membuka di tab baru:",
        error,
      );
      window.open(fileUrl, "_blank");
    }
  };

  const handleSaveProposal = async () => {
    if (!eventId) return;
    setIsSavingProposal(true);
    try {
      const res = await apiCall<any>(`/events/${eventId}/proposal/content`, {
        method: "PATCH",
        body: JSON.stringify({ content: editedContent }),
      });
      if (res.success) {
        showNotification("success", "Proposal berhasil disimpan");
      }
    } catch (err) {
      showNotification("error", "Gagal menyimpan proposal");
    } finally {
      setIsSavingProposal(false);
    }
  };

  const handleRunSmartReview = async () => {
    if (!eventId) return;
    setIsRunningSmartReview(true);
    try {
      const res = await apiCall<any>(`/ai/smart-review`, {
        method: "POST",
        body: JSON.stringify({ eventId }),
      });
      if (res.success) {
        showNotification(
          "success",
          "Smart review sedang berjalan, silakan muat ulang halaman setelah beberapa saat.",
        );
      }
    } catch (err) {
      showNotification("error", "Gagal menjalankan smart review");
    } finally {
      setIsRunningSmartReview(false);
    }
  };

  const handlePublishEvent = async () => {
    if (!eventId) return;
    try {
      setIsPublishing(true);

      if (editorHtml) {
        const parsedContent = parseHtmlToProposalContent(editorHtml);
        await apiCall(`/events/${eventId}/proposal/content`, {
          method: "PATCH",
          body: JSON.stringify({
            content: JSON.stringify(parsedContent),
          }),
        });
      }

      await apiCall(`/events/${eventId}/publish`, { method: "POST" });
      showNotification("success", "Event berhasil dipublikasikan!");

      // Update local event status to PUBLISHED in myEvents state
      setMyEvents((prevEvents) =>
        prevEvents.map((ev) =>
          ev.id === eventId ? { ...ev, status: "PUBLISHED" } : ev,
        ),
      );

      // Re-fetch active event details to sync all analysis
      await fetchEventDetails(eventId);
    } catch (error) {
      console.error("Failed to publish event:", error);
      showNotification(
        "error",
        "Gagal mempublikasikan event. Silakan coba lagi.",
      );
    } finally {
      setIsPublishing(false);
    }
  };

  useEffect(() => {
    async function loadEventData() {
      try {
        const response = await apiCall<{ data: MyEvent[] }>("/events/my", {});
        if (response?.data && Array.isArray(response.data)) {
          setMyEvents(response.data);

          // 1. Check URL parameters first (passed from katalog-event-eo)
          if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const urlId = params.get("id");
            const urlTab = params.get("tab");

            if (urlTab) setActiveTab(urlTab);

            if (urlId) {
              const eventFromUrl = response.data.find((e) => e.id === urlId);
              if (eventFromUrl) {
                setEventId(eventFromUrl.id);
                setEventName(eventFromUrl.title);
                return;
              }
            }
          }

          // 2. Fallback to localStorage
          const savedStep3Data = localStorage.getItem("buatEventStep3Data");
          if (savedStep3Data) {
            const data = JSON.parse(savedStep3Data);
            if (data.eventId) {
              setEventId(data.eventId);
              setEventName(data.eventName || "Event");
              return;
            }
          }

          // 3. Fallback to latest event
          const latestEvent = response.data[0];
          if (latestEvent) {
            setEventId(latestEvent.id);
            setEventName(latestEvent.title || "Event");
          }
        }
      } catch (error) {
        console.error("Failed to load events:", error);
      } finally {
        setIsLoadingEvents(false);
      }
    }

    loadEventData();
  }, []);
  async function fetchEventDetails(id: string) {
    setIsFetchingAnalysis(true);
    try {
      const res = await apiCall<{
        success: boolean;
        data: MyEvent;
      }>(`/events/${id}`, {
        method: "GET",
      });

      if (res?.success && res?.data) {
        setMyEvents((prevEvents) =>
          prevEvents.map((e) => (e.id === id ? res.data : e)),
        );

        if (res.data.proposal) {
          setProposalAnalysis({
            id: res.data.proposal.id,
            source: res.data.proposal.source,
            aiScore: res.data.proposal.aiScore,
            aiFeedback: res.data.proposal.aiFeedback,
            fileUrl: res.data.proposal.fileUrl,
            content: res.data.proposal.content,
          });
        } else {
          setProposalAnalysis(null);
        }
      }
    } catch (err) {
      console.error("Gagal memuat detail event:", err);
      setProposalAnalysis(null);
    } finally {
      setIsFetchingAnalysis(false);
    }
  }

  useEffect(() => {
    if (!eventId) {
      setProposalAnalysis(null);
      return;
    }

    fetchEventDetails(eventId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !eventId) {
      showNotification("error", "File atau Event ID tidak ditemukan.");
      return;
    }

    const file = files[0];

    // Validate file type — PDF only (per UPLOAD_GUIDE.md)
    if (file.type !== "application/pdf") {
      showNotification("error", "File harus berupa PDF.");
      return;
    }

    // Validate file size (max 10MB per UPLOAD_GUIDE.md)
    if (file.size > 10 * 1024 * 1024) {
      showNotification("error", "Ukuran file maksimal 10MB.");
      return;
    }

    try {
      setIsSubmitting(true);

      // Step 1: Upload file to Firebase Storage
      // Path: events/{eventId}/proposal.pdf (per UPLOAD_GUIDE.md)
      const path = `events/${eventId}/proposal.pdf`;
      const storageRef = ref(storage, path);

      await uploadBytes(storageRef, file);

      // Step 2: Get download URL
      const fileUrl = await getDownloadURL(storageRef);
      console.log("response firebase: ", fileUrl);

      const responseSet = await apiCall<{
        success: boolean;
        data: {
          id: string;
          source: string;
          aiScore: number | null;
          aiFeedback: string | null;
          fileUrl: string;
          content: string | null;
        };
      }>(`/events/${eventId}/proposal`, {
        method: "POST",
        body: JSON.stringify({
          source: "UPLOAD",
          fileUrl: fileUrl,
        }),
      });

      // Immediately show what the API returned (aiScore may be null if AI is still processing)
      if (responseSet?.data) setProposalAnalysis(responseSet.data);

      showNotification(
        "success",
        "Proposal berhasil diupload! Analisis AI sedang berjalan...",
      );
      setIsUploadDialogOpen(false);
      // Re-fetch event details after 5s to pick up completed AI score
      if (eventId) setTimeout(() => fetchEventDetails(eventId), 5000);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal mengupload proposal";
      showNotification("error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Loading State */}
      {isLoadingEvents && (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-gray-600">Memuat event Anda...</p>
          </div>
        </div>
      )}

      {!isLoadingEvents && (
        <>
          {eventId === null ? (
            // No event found - show message
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center max-w-md">
                <div className="mb-4 text-6xl">📋</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Belum ada event
                </h2>
                <p className="text-gray-600 mb-6">
                  Silakan buat event terlebih dahulu sebelum upload proposal.
                </p>
                <Button
                  onClick={() => router.push("/buat-event")}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                >
                  Buat Event Baru
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Notification Toast */}
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

              {isEditingProposal ? (
                <div className="flex flex-col h-auto lg:h-[85vh] bg-gray-50 border rounded-lg lg:overflow-hidden overflow-visible mb-8">
                  {/* Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white border-b">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-xs sm:text-sm text-gray-500">
                        Buat Event &gt; Sponsorship &gt;{" "}
                        <span className="font-semibold text-gray-900">
                          Proposal Smart Review
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700"
                      >
                        {eventName}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                      <Button
                        variant="outline"
                        className="gap-2 text-xs px-3 py-1.5 flex-1 md:flex-none justify-center"
                        onClick={handleDownloadPDF}
                      >
                        <Download className="w-4 h-4" /> Unduh PDF
                      </Button>
                      <Button
                        onClick={handleSaveProposal}
                        disabled={isSavingProposal}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 flex-1 md:flex-none justify-center"
                      >
                        {isSavingProposal ? "Menyimpan..." : "Simpan Perubahan"}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setIsEditingProposal(false)}
                        className="p-2"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row flex-1 lg:overflow-hidden overflow-visible">
                    {/* Left Side: Workspace */}
                    <div className="flex-1 flex flex-col lg:overflow-hidden overflow-visible bg-gray-50 lg:border-r border-b lg:border-b-0 min-h-[500px] lg:min-h-0">
                      {/* Workspace Tabs Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-3 bg-white border-b">
                        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-gray-100 rounded-lg">
                          <button
                            onClick={() => handleTabChange("preview")}
                            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-md text-[10px] sm:text-xs font-semibold transition-all ${
                              editorTab === "preview"
                                ? "bg-white text-blue-700 shadow-sm"
                                : "text-gray-600 hover:text-gray-950 hover:bg-gray-200/50"
                            }`}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Visual Preview
                          </button>
                          <button
                            onClick={() => handleTabChange("edit")}
                            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-md text-[10px] sm:text-xs font-semibold transition-all ${
                              editorTab === "edit"
                                ? "bg-white text-blue-700 shadow-sm"
                                : "text-gray-600 hover:text-gray-950 hover:bg-gray-200/50"
                            }`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Structured Editor
                          </button>
                          <button
                            onClick={() => handleTabChange("raw")}
                            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-md text-[10px] sm:text-xs font-semibold transition-all ${
                              editorTab === "raw"
                                ? "bg-white text-blue-700 shadow-sm"
                                : "text-gray-600 hover:text-gray-950 hover:bg-gray-200/50"
                            }`}
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Rich Text Editor
                          </button>
                        </div>
                      </div>

                      {/* Workspace Body */}
                      <div className="flex-1 p-6 overflow-y-auto">
                        {editorTab === "preview" && (
                          <div className="max-w-4xl mx-auto pb-12">
                            {/* Premium Proposal Visual Mockup */}
                            <div className="bg-white shadow-xl rounded-2xl border border-gray-200/60 overflow-hidden">
                              {/* Header Card */}
                              <div className="relative bg-gradient-to-br from-[#0B1936] to-[#003EC7] text-white p-12 overflow-hidden">
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                                <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

                                <div className="relative z-10 space-y-4">
                                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-semibold text-blue-200 uppercase tracking-wider">
                                    <Sparkles className="w-3.5 h-3.5 text-blue-300 animate-pulse" />
                                    Proposal Kemitraan & Sponsorship
                                  </div>

                                  <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl leading-tight">
                                    {eventName}
                                  </h1>

                                  <p className="text-base text-blue-100 max-w-2xl font-light">
                                    Menghubungkan ekosistem inovasi, mahasiswa
                                    berbakat, dan mitra industri strategis untuk
                                    menciptakan dampak nyata bagi masa depan
                                    teknologi.
                                  </p>

                                  {/* Quick Meta Stats Row */}
                                  {(() => {
                                    const activeEvent = myEvents.find(
                                      (e) => e.id === eventId,
                                    );
                                    if (!activeEvent) return null;

                                    const dateStr =
                                      activeEvent.startDate ===
                                      activeEvent.endDate
                                        ? new Date(
                                            activeEvent.startDate,
                                          ).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                          })
                                        : `${new Date(activeEvent.startDate).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} - ${new Date(activeEvent.endDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}`;

                                    return (
                                      <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-white/10 mt-8">
                                        <div className="flex items-center gap-3">
                                          <div className="p-2 rounded-lg bg-white/10 text-white">
                                            <Calendar className="w-4 h-4" />
                                          </div>
                                          <div>
                                            <p className="text-[10px] text-blue-200 uppercase font-semibold">
                                              TANGGAL
                                            </p>
                                            <p className="text-xs font-bold">
                                              {dateStr}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          <div className="p-2 rounded-lg bg-white/10 text-white">
                                            <MapPin className="w-4 h-4" />
                                          </div>
                                          <div>
                                            <p className="text-[10px] text-blue-200 uppercase font-semibold">
                                              LOKASI
                                            </p>
                                            <p className="text-xs font-bold truncate max-w-[150px]">
                                              {activeEvent.venue
                                                ? `${activeEvent.venue}, `
                                                : ""}
                                              {activeEvent.city}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-3 col-span-2 sm:col-span-1">
                                          <div className="p-2 rounded-lg bg-white/10 text-white">
                                            <Users className="w-4 h-4" />
                                          </div>
                                          <div>
                                            <p className="text-[10px] text-blue-200 uppercase font-semibold">
                                              ESTIMASI AUDIENS
                                            </p>
                                            <p className="text-xs font-bold">
                                              {activeEvent.expectedAttendees.toLocaleString(
                                                "id-ID",
                                              )}{" "}
                                              Orang
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>

                              {/* Body Contents */}
                              <div className="p-12 space-y-12 bg-white">
                                {proposalForm ? (
                                  <>
                                    {/* Executive Summary */}
                                    {proposalForm.executiveSummary && (
                                      <div className="space-y-3">
                                        <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center gap-1.5">
                                          <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                                          Ringkasan Eksekutif
                                        </h3>
                                        <div className="relative pl-6 border-l-4 border-blue-600 py-1 bg-gradient-to-r from-blue-50/30 to-transparent pr-4 rounded-r-lg">
                                          <p className="text-base text-gray-700 font-medium leading-relaxed italic">
                                            "{proposalForm.executiveSummary}"
                                          </p>
                                        </div>
                                      </div>
                                    )}

                                    {/* About Organizer */}
                                    {proposalForm.aboutOrganizer && (
                                      <div className="space-y-4">
                                        <h3 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                                          Tentang Penyelenggara
                                        </h3>
                                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                                          {proposalForm.aboutOrganizer}
                                        </p>
                                      </div>
                                    )}

                                    {/* Event Background */}
                                    {proposalForm.eventBackground && (
                                      <div className="space-y-4">
                                        <h3 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                                          Latar Belakang Kegiatan
                                        </h3>
                                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                                          {proposalForm.eventBackground}
                                        </p>
                                      </div>
                                    )}

                                    {/* Event Theme */}
                                    {proposalForm.eventTheme && (
                                      <div className="space-y-4">
                                        <h3 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                                          Tema Kegiatan
                                        </h3>
                                        <div className="p-6 rounded-xl border border-indigo-100 bg-indigo-50/30 flex items-start gap-4">
                                          <div className="p-3 bg-indigo-100 text-indigo-700 rounded-lg flex-shrink-0">
                                            <Sparkles className="w-5 h-5 animate-pulse" />
                                          </div>
                                          <p className="text-sm text-gray-700 font-semibold leading-relaxed whitespace-pre-line">
                                            {proposalForm.eventTheme}
                                          </p>
                                        </div>
                                      </div>
                                    )}

                                    {/* Objectives */}
                                    {proposalForm.objectives &&
                                      proposalForm.objectives.length > 0 && (
                                        <div className="space-y-4">
                                          <h3 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                                            Tujuan & Sasaran
                                          </h3>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {proposalForm.objectives.map(
                                              (obj, i) => (
                                                <div
                                                  key={i}
                                                  className="flex gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200 transition-all duration-200"
                                                >
                                                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                                                    {i + 1}
                                                  </div>
                                                  <p className="text-xs text-gray-700 font-medium leading-normal mt-0.5">
                                                    {obj}
                                                  </p>
                                                </div>
                                              ),
                                            )}
                                          </div>
                                        </div>
                                      )}

                                    {/* Activities */}
                                    {proposalForm.activities &&
                                      proposalForm.activities.length > 0 && (
                                        <div className="space-y-4">
                                          <h3 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                                            Rencana Aktivitas
                                          </h3>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {proposalForm.activities.map(
                                              (act, i) => (
                                                <div
                                                  key={i}
                                                  className="flex gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200 transition-all duration-200"
                                                >
                                                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
                                                    {i + 1}
                                                  </div>
                                                  <p className="text-xs text-gray-700 font-medium leading-normal mt-0.5">
                                                    {act}
                                                  </p>
                                                </div>
                                              ),
                                            )}
                                          </div>
                                        </div>
                                      )}

                                    {/* Target Audience & Reach */}
                                    {(proposalForm.targetAudience ||
                                      proposalForm.audienceReach) && (
                                      <div className="space-y-4">
                                        <h3 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                                          Target Peserta & Jangkauan
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          {proposalForm.targetAudience && (
                                            <div className="p-6 rounded-xl border border-blue-100 bg-blue-50/30 flex items-start gap-4">
                                              <div className="p-3 bg-blue-100 text-blue-700 rounded-lg flex-shrink-0">
                                                <Users className="w-5 h-5" />
                                              </div>
                                              <div className="space-y-1">
                                                <h4 className="text-xs font-bold text-gray-900 uppercase">
                                                  Target Peserta
                                                </h4>
                                                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                                                  {proposalForm.targetAudience}
                                                </p>
                                              </div>
                                            </div>
                                          )}
                                          {proposalForm.audienceReach && (
                                            <div className="p-6 rounded-xl border border-teal-100 bg-teal-50/30 flex items-start gap-4">
                                              <div className="p-3 bg-teal-100 text-teal-700 rounded-lg flex-shrink-0">
                                                <Globe className="w-5 h-5" />
                                              </div>
                                              <div className="space-y-1">
                                                <h4 className="text-xs font-bold text-gray-900 uppercase">
                                                  Jangkauan Audiens
                                                </h4>
                                                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                                                  {proposalForm.audienceReach}
                                                </p>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {/* Why Sponsor */}
                                    {proposalForm.whySponsor && (
                                      <div className="space-y-4">
                                        <h3 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                                          Mengapa Sponsor Harus Bergabung
                                        </h3>
                                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                                          {proposalForm.whySponsor}
                                        </p>
                                      </div>
                                    )}

                                    {/* Sponsorship Packages */}
                                    {proposalForm.sponsorshipPackages &&
                                      proposalForm.sponsorshipPackages.length >
                                        0 && (
                                        <div className="space-y-4">
                                          <h3 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                                            Paket Sponsorship
                                          </h3>
                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {proposalForm.sponsorshipPackages.map(
                                              (pkg, i) => (
                                                <div
                                                  key={i}
                                                  className="border rounded-xl p-5 bg-gradient-to-b from-white to-gray-50/50 shadow-sm relative overflow-hidden flex flex-col justify-between"
                                                >
                                                  <div className="space-y-3">
                                                    <div className="space-y-1">
                                                      <h4 className="text-sm font-extrabold text-gray-900">
                                                        {pkg.tierName}
                                                      </h4>
                                                      <p className="text-xs font-black text-blue-600">
                                                        {pkg.price}
                                                      </p>
                                                    </div>
                                                    <ul className="space-y-1.5 pt-2">
                                                      {pkg.benefits.map(
                                                        (b, bIdx) => (
                                                          <li
                                                            key={bIdx}
                                                            className="text-[11px] text-gray-600 flex items-start gap-1.5"
                                                          >
                                                            <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                                                            <span>{b}</span>
                                                          </li>
                                                        ),
                                                      )}
                                                    </ul>
                                                  </div>
                                                </div>
                                              ),
                                            )}
                                          </div>
                                        </div>
                                      )}

                                    {/* General Benefits */}
                                    {proposalForm.generalBenefits &&
                                      proposalForm.generalBenefits.length >
                                        0 && (
                                        <div className="space-y-4">
                                          <h3 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                                            Keuntungan Sponsorship (General
                                            Benefits)
                                          </h3>
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                            {proposalForm.generalBenefits.map(
                                              (benefit, i) => (
                                                <div
                                                  key={i}
                                                  className="flex gap-3 items-start p-4 border border-gray-100 rounded-xl bg-white hover:shadow-md hover:border-gray-200/80 transition-all duration-200"
                                                >
                                                  <div className="p-1 rounded-full bg-green-50 text-green-600 flex-shrink-0 mt-0.5">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                  </div>
                                                  <p className="text-xs text-gray-600 font-semibold leading-relaxed">
                                                    {benefit}
                                                  </p>
                                                </div>
                                              ),
                                            )}
                                          </div>
                                        </div>
                                      )}

                                    {/* Closing Statement */}
                                    {proposalForm.closingStatement && (
                                      <div className="space-y-4">
                                        <h3 className="text-lg font-bold text-gray-900 border-b pb-2 flex items-center gap-2">
                                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                                          Penutup
                                        </h3>
                                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                                          {proposalForm.closingStatement}
                                        </p>
                                      </div>
                                    )}

                                    {/* Call to Action */}
                                    {proposalForm.callToAction && (
                                      <div className="pt-4">
                                        <div className="p-8 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 shadow-sm flex flex-col md:flex-row gap-6 items-center">
                                          <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                                            <PhoneCall className="w-5 h-5" />
                                          </div>
                                          <div className="space-y-1 text-center md:text-left flex-1">
                                            <h4 className="text-sm font-bold text-gray-900">
                                              Mari Berkolaborasi!
                                            </h4>
                                            <p className="text-xs text-gray-600 leading-relaxed">
                                              {proposalForm.callToAction}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  /* Fallback when not a structured JSON - render plain text nicely */
                                  <div className="space-y-6">
                                    <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-100 text-yellow-800 rounded-lg text-xs">
                                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                      <span>
                                        Proposal ini menggunakan format teks
                                        bebas. Untuk menggunakan format layout
                                        modern yang berstruktur, klik tab{" "}
                                        <strong>Structured Editor</strong> untuk
                                        mereset atau format proposal ke JSON.
                                      </span>
                                    </div>
                                    <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">
                                      {editedContent ||
                                        "Mulai menulis proposal Anda..."}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {editorTab === "edit" && (
                          <div className="max-w-3xl mx-auto space-y-6 pb-12">
                            {proposalForm ? (
                              <>
                                {/* Form - Title */}
                                <Card className="p-6 space-y-3">
                                  <label className="text-sm font-bold text-gray-900 block">
                                    Judul Proposal (Proposal Title)
                                  </label>
                                  <input
                                    type="text"
                                    className="w-full rounded-lg border border-gray-200 px-3.5 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    value={proposalForm.title}
                                    onChange={(e) =>
                                      updateFormField("title", e.target.value)
                                    }
                                    placeholder="Tulis judul proposal..."
                                  />
                                </Card>

                                {/* Form - Executive Summary */}
                                <Card className="p-6 space-y-3">
                                  <label className="text-sm font-bold text-gray-900 block">
                                    Ringkasan Eksekutif (Executive Summary)
                                  </label>
                                  <textarea
                                    className="w-full rounded-lg border border-gray-200 px-3.5 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    rows={4}
                                    value={proposalForm.executiveSummary}
                                    onChange={(e) =>
                                      updateFormField(
                                        "executiveSummary",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Tulis ringkasan eksekutif..."
                                  />
                                </Card>

                                {/* Form - About Organizer */}
                                <Card className="p-6 space-y-3">
                                  <label className="text-sm font-bold text-gray-900 block">
                                    Tentang Penyelenggara (About Organizer)
                                  </label>
                                  <textarea
                                    className="w-full rounded-lg border border-gray-200 px-3.5 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    rows={4}
                                    value={proposalForm.aboutOrganizer}
                                    onChange={(e) =>
                                      updateFormField(
                                        "aboutOrganizer",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Tulis informasi penyelenggara..."
                                  />
                                </Card>

                                {/* Form - Event Background */}
                                <Card className="p-6 space-y-3">
                                  <label className="text-sm font-bold text-gray-900 block">
                                    Latar Belakang Kegiatan (Event Background)
                                  </label>
                                  <textarea
                                    className="w-full rounded-lg border border-gray-200 px-3.5 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    rows={4}
                                    value={proposalForm.eventBackground}
                                    onChange={(e) =>
                                      updateFormField(
                                        "eventBackground",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Tulis latar belakang kegiatan..."
                                  />
                                </Card>

                                {/* Form - Event Theme */}
                                <Card className="p-6 space-y-3">
                                  <label className="text-sm font-bold text-gray-900 block">
                                    Tema Kegiatan (Event Theme)
                                  </label>
                                  <textarea
                                    className="w-full rounded-lg border border-gray-200 px-3.5 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    rows={2}
                                    value={proposalForm.eventTheme}
                                    onChange={(e) =>
                                      updateFormField(
                                        "eventTheme",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Tulis tema kegiatan..."
                                  />
                                </Card>

                                {/* Form - Objectives */}
                                <Card className="p-6 space-y-4">
                                  <div className="flex justify-between items-center border-b pb-3">
                                    <div>
                                      <label className="text-sm font-bold text-gray-900 block">
                                        Tujuan & Sasaran (Objectives)
                                      </label>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        addFormArrayItem("objectives")
                                      }
                                      className="text-xs font-semibold gap-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                                    >
                                      <Plus className="w-3.5 h-3.5" /> Tambah
                                    </Button>
                                  </div>
                                  <div className="space-y-2.5 pt-1">
                                    {proposalForm.objectives.map((obj, idx) => (
                                      <div
                                        key={idx}
                                        className="flex gap-2 items-center"
                                      >
                                        <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                                          {idx + 1}
                                        </div>
                                        <input
                                          type="text"
                                          className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                          value={obj}
                                          onChange={(e) =>
                                            updateFormArrayField(
                                              "objectives",
                                              idx,
                                              e.target.value,
                                            )
                                          }
                                          placeholder={`Tujuan ${idx + 1}...`}
                                        />
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            removeFormArrayItem(
                                              "objectives",
                                              idx,
                                            )
                                          }
                                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 h-auto rounded-lg"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    ))}
                                    {proposalForm.objectives.length === 0 && (
                                      <p className="text-xs text-gray-400 italic text-center py-4">
                                        Belum ada tujuan ditambahkan.
                                      </p>
                                    )}
                                  </div>
                                </Card>

                                {/* Form - Activities */}
                                <Card className="p-6 space-y-4">
                                  <div className="flex justify-between items-center border-b pb-3">
                                    <div>
                                      <label className="text-sm font-bold text-gray-900 block">
                                        Rencana Aktivitas (Activities)
                                      </label>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        addFormArrayItem("activities")
                                      }
                                      className="text-xs font-semibold gap-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                                    >
                                      <Plus className="w-3.5 h-3.5" /> Tambah
                                    </Button>
                                  </div>
                                  <div className="space-y-2.5 pt-1">
                                    {proposalForm.activities.map((act, idx) => (
                                      <div
                                        key={idx}
                                        className="flex gap-2 items-center"
                                      >
                                        <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                                          {idx + 1}
                                        </div>
                                        <input
                                          type="text"
                                          className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                          value={act}
                                          onChange={(e) =>
                                            updateFormArrayField(
                                              "activities",
                                              idx,
                                              e.target.value,
                                            )
                                          }
                                          placeholder={`Aktivitas ${idx + 1}...`}
                                        />
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            removeFormArrayItem(
                                              "activities",
                                              idx,
                                            )
                                          }
                                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 h-auto rounded-lg"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    ))}
                                    {proposalForm.activities.length === 0 && (
                                      <p className="text-xs text-gray-400 italic text-center py-4">
                                        Belum ada aktivitas ditambahkan.
                                      </p>
                                    )}
                                  </div>
                                </Card>

                                {/* Form - Target Audience */}
                                <Card className="p-6 space-y-3">
                                  <label className="text-sm font-bold text-gray-900 block">
                                    Target Peserta & Audiens (Target Audience)
                                  </label>
                                  <textarea
                                    className="w-full rounded-lg border border-gray-200 px-3.5 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    rows={4}
                                    value={proposalForm.targetAudience}
                                    onChange={(e) =>
                                      updateFormField(
                                        "targetAudience",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Tulis demografi dan target audiens..."
                                  />
                                </Card>

                                {/* Form - Audience Reach */}
                                <Card className="p-6 space-y-3">
                                  <label className="text-sm font-bold text-gray-900 block">
                                    Jangkauan Audiens (Audience Reach)
                                  </label>
                                  <textarea
                                    className="w-full rounded-lg border border-gray-200 px-3.5 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    rows={3}
                                    value={proposalForm.audienceReach}
                                    onChange={(e) =>
                                      updateFormField(
                                        "audienceReach",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Tulis potensi jangkauan audiens..."
                                  />
                                </Card>

                                {/* Form - Why Sponsor */}
                                <Card className="p-6 space-y-3">
                                  <label className="text-sm font-bold text-gray-900 block">
                                    Mengapa Sponsor Harus Bergabung (Why
                                    Sponsor)
                                  </label>
                                  <textarea
                                    className="w-full rounded-lg border border-gray-200 px-3.5 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    rows={4}
                                    value={proposalForm.whySponsor}
                                    onChange={(e) =>
                                      updateFormField(
                                        "whySponsor",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Tulis alasan mengapa sponsor harus bergabung..."
                                  />
                                </Card>

                                {/* Form - Sponsorship Packages */}
                                <Card className="p-6 space-y-4">
                                  <div className="flex justify-between items-center border-b pb-3">
                                    <div>
                                      <label className="text-sm font-bold text-gray-900 block">
                                        Paket Sponsorship (Packages)
                                      </label>
                                      <p className="text-xs text-gray-500">
                                        Pilihan paket sponsorship yang
                                        ditawarkan kepada calon partner.
                                      </p>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={addPackage}
                                      className="text-xs font-semibold gap-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                                    >
                                      <Plus className="w-3.5 h-3.5" /> Tambah
                                      Paket
                                    </Button>
                                  </div>
                                  <div className="space-y-4 pt-1">
                                    {proposalForm.sponsorshipPackages.map(
                                      (pkg, pIdx) => (
                                        <div
                                          key={pIdx}
                                          className="p-4 border rounded-xl bg-gray-50/50 space-y-3 relative"
                                        >
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removePackage(pIdx)}
                                            className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50 p-2 h-auto rounded-lg"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                              <label className="text-[10px] font-bold text-gray-500 uppercase">
                                                Nama Tier
                                              </label>
                                              <input
                                                type="text"
                                                className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                                value={pkg.tierName}
                                                onChange={(e) =>
                                                  updatePackageField(
                                                    pIdx,
                                                    "tierName",
                                                    e.target.value,
                                                  )
                                                }
                                              />
                                            </div>
                                            <div>
                                              <label className="text-[10px] font-bold text-gray-500 uppercase">
                                                Harga
                                              </label>
                                              <input
                                                type="text"
                                                className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                                value={pkg.price}
                                                onChange={(e) =>
                                                  updatePackageField(
                                                    pIdx,
                                                    "price",
                                                    e.target.value,
                                                  )
                                                }
                                              />
                                            </div>
                                          </div>
                                          <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                              <label className="text-[10px] font-bold text-gray-500 uppercase">
                                                Benefit Paket
                                              </label>
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                  addPackageBenefit(pIdx)
                                                }
                                                className="text-[10px] text-blue-600 hover:text-blue-700 p-1 h-auto"
                                              >
                                                + Tambah Benefit
                                              </Button>
                                            </div>
                                            <div className="space-y-1.5">
                                              {pkg.benefits.map(
                                                (benefit, bIdx) => (
                                                  <div
                                                    key={bIdx}
                                                    className="flex gap-2 items-center"
                                                  >
                                                    <input
                                                      type="text"
                                                      className="flex-1 rounded-lg border border-gray-200 px-3 py-1 text-[11px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                                      value={benefit}
                                                      onChange={(e) =>
                                                        updatePackageBenefit(
                                                          pIdx,
                                                          bIdx,
                                                          e.target.value,
                                                        )
                                                      }
                                                      placeholder={`Benefit ${bIdx + 1}...`}
                                                    />
                                                    <Button
                                                      type="button"
                                                      variant="ghost"
                                                      size="sm"
                                                      onClick={() =>
                                                        removePackageBenefit(
                                                          pIdx,
                                                          bIdx,
                                                        )
                                                      }
                                                      className="text-red-500 hover:text-red-700 p-1 h-auto"
                                                    >
                                                      <X className="w-3.5 h-3.5" />
                                                    </Button>
                                                  </div>
                                                ),
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      ),
                                    )}
                                    {proposalForm.sponsorshipPackages.length ===
                                      0 && (
                                      <p className="text-xs text-gray-400 italic text-center py-4">
                                        Belum ada paket ditambahkan.
                                      </p>
                                    )}
                                  </div>
                                </Card>

                                {/* Form - General Benefits */}
                                <Card className="p-6 space-y-4">
                                  <div className="flex justify-between items-center border-b pb-3">
                                    <div>
                                      <label className="text-sm font-bold text-gray-900 block">
                                        Benefit Umum (General Benefits)
                                      </label>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        addFormArrayItem("generalBenefits")
                                      }
                                      className="text-xs font-semibold gap-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                                    >
                                      <Plus className="w-3.5 h-3.5" /> Tambah
                                    </Button>
                                  </div>
                                  <div className="space-y-2.5 pt-1">
                                    {proposalForm.generalBenefits.map(
                                      (benefit, idx) => (
                                        <div
                                          key={idx}
                                          className="flex gap-2 items-center"
                                        >
                                          <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                                            {idx + 1}
                                          </div>
                                          <input
                                            type="text"
                                            className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                            value={benefit}
                                            onChange={(e) =>
                                              updateFormArrayField(
                                                "generalBenefits",
                                                idx,
                                                e.target.value,
                                              )
                                            }
                                            placeholder={`Benefit ${idx + 1}...`}
                                          />
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              removeFormArrayItem(
                                                "generalBenefits",
                                                idx,
                                              )
                                            }
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 h-auto rounded-lg"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        </div>
                                      ),
                                    )}
                                    {proposalForm.generalBenefits.length ===
                                      0 && (
                                      <p className="text-xs text-gray-400 italic text-center py-4">
                                        Belum ada benefit umum ditambahkan.
                                      </p>
                                    )}
                                  </div>
                                </Card>

                                {/* Form - Closing Statement */}
                                <Card className="p-6 space-y-3">
                                  <label className="text-sm font-bold text-gray-900 block">
                                    Kalimat Penutup (Closing Statement)
                                  </label>
                                  <textarea
                                    className="w-full rounded-lg border border-gray-200 px-3.5 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    rows={4}
                                    value={proposalForm.closingStatement}
                                    onChange={(e) =>
                                      updateFormField(
                                        "closingStatement",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Tulis kalimat penutup..."
                                  />
                                </Card>

                                {/* Form - Call to Action */}
                                <Card className="p-6 space-y-3">
                                  <label className="text-sm font-bold text-gray-900 block">
                                    Ajakan Bertindak (Call to Action)
                                  </label>
                                  <textarea
                                    className="w-full rounded-lg border border-gray-200 px-3.5 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                    rows={4}
                                    value={proposalForm.callToAction}
                                    onChange={(e) =>
                                      updateFormField(
                                        "callToAction",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Tulis kalimat ajakan bertindak..."
                                  />
                                </Card>
                              </>
                            ) : (
                              /* Convert text option if not parsed JSON */
                              <Card className="p-8 text-center space-y-4">
                                <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto" />
                                <h3 className="text-base font-bold text-gray-900">
                                  Format Proposal Bukan JSON Terstruktur
                                </h3>
                                <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                                  Proposal ini tersimpan dalam format teks biasa
                                  atau memiliki sintaks JSON yang rusak. Apakah
                                  Anda ingin mengonversi proposal ini menjadi
                                  format terstruktur yang modern?
                                </p>
                                <Button
                                  type="button"
                                  onClick={() => {
                                    const template = {
                                      title: "",
                                      executiveSummary:
                                        editedContent ||
                                        "Kami siap menyelenggarakan event spektakuler ini...",
                                      aboutOrganizer: "",
                                      eventBackground: "",
                                      eventTheme: "",
                                      objectives: [
                                        "Meningkatkan exposure sponsor",
                                        "Menyediakan wadah networking",
                                      ],
                                      activities: [],
                                      targetAudience: "",
                                      audienceReach: "",
                                      whySponsor: "",
                                      sponsorshipPackages: [],
                                      generalBenefits: [
                                        "Exposure logo di backdrop",
                                        "Booth promosi khusus",
                                      ],
                                      closingStatement: "",
                                      callToAction:
                                        "Mari bergabung bersama kami untuk menyukseskan event ini!",
                                    };
                                    setProposalForm(template);
                                    setEditedContent(JSON.stringify(template));
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-6 py-2"
                                >
                                  Konversi ke Format Terstruktur
                                </Button>
                              </Card>
                            )}
                          </div>
                        )}

                        {editorTab === "raw" && (
                          <div className="max-w-3xl mx-auto">
                            <Tiptap
                              content={editorHtml || undefined}
                              onChange={handleTiptapChange}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Side: AI Smart Review */}
                    <div className="w-full lg:w-96 bg-white lg:border-l border-t lg:border-t-0 p-4 sm:p-6 lg:overflow-y-auto overflow-visible flex flex-col gap-6">
                      <div className="flex items-center gap-2 text-[#003EC7] font-semibold text-sm">
                        <Sparkles className="w-4 h-4" /> AI Smart Review
                      </div>

                      <div className="bg-[#003EC7] text-white rounded-lg p-6 text-center">
                        <div className="text-xs uppercase tracking-wider mb-2 opacity-80">
                          PROPOSAL READINESS
                        </div>
                        <div className="text-5xl font-bold mb-1">
                          {(() => {
                            const activeEvent = myEvents.find(
                              (e) => e.id === eventId,
                            );
                            const proposal = activeEvent?.proposal;
                            const aiScore =
                              proposal?.source === "UPLOAD"
                                ? (proposalAnalysis?.aiScore ?? null)
                                : (proposal?.aiScore ?? null);
                            return aiScore ?? "0";
                          })()}
                          <span className="text-xl opacity-80">/100</span>
                        </div>
                        <div className="text-sm font-medium mt-2">
                          {(() => {
                            const activeEvent = myEvents.find(
                              (e) => e.id === eventId,
                            );
                            const score =
                              (activeEvent?.proposal?.source === "UPLOAD"
                                ? proposalAnalysis?.aiScore
                                : activeEvent?.proposal?.aiScore) ?? 0;
                            if (score >= 80) return "Sangat Baik";
                            if (score >= 60) return "Cukup Baik";
                            return "Perlu Perbaikan";
                          })()}
                        </div>
                      </div>

                      <Button
                        onClick={handleRunSmartReview}
                        disabled={isRunningSmartReview}
                        variant="outline"
                        className="w-full border-[#003EC7] text-[#003EC7] hover:bg-blue-50"
                      >
                        {isRunningSmartReview
                          ? "Menjalankan..."
                          : "Run AI Smart Review"}
                      </Button>

                      {/* Mapping Issues */}
                      {(() => {
                        const activeEvent = myEvents.find(
                          (e) => e.id === eventId,
                        );
                        const proposal = activeEvent?.proposal;
                        const feedbackStr =
                          proposal?.source === "UPLOAD"
                            ? proposalAnalysis?.aiFeedback
                            : proposal?.aiFeedback;

                        if (!feedbackStr)
                          return (
                            <div className="text-sm text-gray-500 text-center mt-4">
                              Belum ada analisis.
                            </div>
                          );
                        try {
                          const feedback =
                            typeof feedbackStr === "object" &&
                            feedbackStr !== null
                              ? feedbackStr
                              : JSON.parse(feedbackStr);
                          return (
                            <div>
                              <div className="text-xs font-bold text-gray-500 uppercase mb-3">
                                MASALAH ({feedback.issues?.length || 0})
                              </div>
                              {feedback.issues?.map((issue: any, i: number) => (
                                <div
                                  key={i}
                                  className={`p-4 rounded border mb-3 ${issue.severity === "CRITICAL" ? "bg-red-50 border-red-100 text-red-900" : issue.severity === "WARNING" ? "bg-orange-50 border-orange-100 text-orange-900" : "bg-blue-50 border-blue-100 text-blue-900"}`}
                                >
                                  <div className="font-semibold text-sm mb-2 flex gap-2 items-start">
                                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    {issue.category}
                                  </div>
                                  <p className="text-xs opacity-90 mb-3">
                                    {issue.description}
                                  </p>
                                  <div className="text-xs p-3 bg-white rounded bg-opacity-60 border border-black border-opacity-5">
                                    <div className="font-semibold text-[#003EC7] flex items-center gap-1 mb-1">
                                      <Sparkles className="w-3 h-3" /> Saran AI
                                    </div>
                                    {issue.suggestion}
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        } catch (e) {
                          return null;
                        }
                      })()}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Breadcrumb & Title */}
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900"></h1>
                  </div>

                  {/* Tabs */}
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="mb-6 sm:mb-8"
                  >
                    <TabsList
                      className="flex flex-wrap items-center gap-4 sm:gap-8"
                      variant={"line"}
                    >
                      {/* <TabsTrigger value="event-kamu">Event Kamu</TabsTrigger> */}
                      <TabsTrigger value="terbaru">
                        Proposal Terbaru
                      </TabsTrigger>
                      <TabsTrigger value="smart-review">
                        Proposal Smart Review
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="smart-review" className="mt-6">
                      {/* Guard: no event selected yet */}
                      {!eventId ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                          <div className="text-5xl mb-4">📋</div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Belum ada event dipilih
                          </h3>
                          <p className="text-sm text-gray-500 mb-6 max-w-sm">
                            Buka tab <strong>Event Kamu</strong> dan klik tombol
                            pada salah satu event untuk membuka Smart
                            Review-nya.
                          </p>
                          <button
                            onClick={() => setActiveTab("event-kamu")}
                            className="px-5 py-2 bg-[#003EC7] text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                          >
                            Lihat Event Kamu
                          </button>
                        </div>
                      ) : (
                        (() => {
                          const activeEvent = myEvents.find(
                            (e) => e.id === eventId,
                          );
                          const eventProposal = activeEvent?.proposal ?? null;
                          const tier = activeEvent?.tiers?.[0] ?? null;

                          // For UPLOAD: use proposalAnalysis (fetched via Firebase → POST)
                          // For GENERATED: aiScore is already in /events/my
                          const proposal = eventProposal;
                          const aiScore =
                            eventProposal?.source === "UPLOAD"
                              ? (proposalAnalysis?.aiScore ?? null)
                              : (eventProposal?.aiScore ?? null);

                          return (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                              {/* Left Column - Proposals */}
                              <div className="col-span-1 lg:col-span-2 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                                    Proposal
                                  </h2>
                                  <Button
                                    className="gap-2 px-4 py-2 bg-[#003EC7] w-full sm:w-auto justify-center"
                                    onClick={() => setIsUploadDialogOpen(true)}
                                  >
                                    <Upload className="w-4 h-4" />
                                    Upload Proposal
                                  </Button>
                                </div>

                                {/* Info Banner */}
                                <div className="bg-[#E5E7EB] border border-[#D0E1FB] rounded-lg p-4 flex items-center gap-3">
                                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                  <p className="text-sm text-blue-900">
                                    Semua proposal di halaman ini dikurasi untuk{" "}
                                    <strong>{eventName}</strong>
                                  </p>
                                </div>

                                {/* Proposal Card */}
                                {!proposal ? (
                                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center text-center">
                                    <FileText className="w-8 h-8 text-gray-300 mb-3" />
                                    <p className="text-sm text-gray-500 mb-1">
                                      Belum ada proposal
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      Upload proposal PDF untuk mendapatkan
                                      analisis AI
                                    </p>
                                  </div>
                                ) : proposal.source === "GENERATED" ? (
                                  <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border border-gray-200 bg-[#DDE1FF4D]">
                                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                                      <div className="flex items-center gap-4">
                                        <div className="flex-shrink-0">
                                          <div className="w-14 h-14 border-4 rounded-full flex items-center justify-center text-[#003EC7] text-xl font-bold border-[#003EC7]">
                                            {proposal.aiScore ?? "–"}
                                          </div>
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-xs font-semibold">
                                              AI GENERATED
                                            </Badge>
                                            <h3 className="font-semibold text-gray-900 text-sm">
                                              Proposal {eventName}
                                            </h3>
                                          </div>
                                          {tier && (
                                            <div className="flex gap-3 text-xs text-[#4B5563]">
                                              <span className="bg-white rounded-[4px] px-2 py-1">
                                                Tier: {tier.name}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                          handleOpenEditor(proposal.content)
                                        }
                                        className="w-full sm:w-auto flex-shrink-0 sm:ml-auto bg-white justify-center"
                                      >
                                        Buka & Edit
                                      </Button>
                                    </div>
                                  </Card>
                                ) : (
                                  <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border border-gray-200">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                      <div className="flex gap-3 flex-1 items-center">
                                        <div className="flex-shrink-0 p-4 bg-[#F3F4F6] rounded-[8px] flex items-center justify-center text-[#9CA3AF]">
                                          <FileText className="w-9 h-9" />
                                        </div>
                                        <div className="flex-1">
                                          <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <Badge
                                              variant="outline"
                                              className="text-xs font-semibold bg-gray-50"
                                            >
                                              MANUAL UPLOAD
                                            </Badge>
                                            <h3 className="font-semibold text-gray-900 text-sm">
                                              Proposal {eventName}
                                            </h3>
                                          </div>
                                          <p className="text-xs text-gray-500">
                                            Skor AI:{" "}
                                            <strong>
                                              {proposal.aiScore ?? "–"}
                                            </strong>
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            setIsUploadDialogOpen(true)
                                          }
                                          className="flex-1 sm:flex-none justify-center text-xs"
                                        >
                                          Ganti PDF
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            handleOpenEditor(proposal.content)
                                          }
                                          className="flex-1 sm:flex-none bg-white justify-center text-xs"
                                        >
                                          Buka & Edit
                                        </Button>
                                      </div>
                                    </div>
                                  </Card>
                                )}
                              </div>

                              {/* Right Column - AI Analysis */}
                              <div className="col-span-1">
                                <Card className="p-6 bg-white sticky top-6">
                                  <div className="mb-6 pb-4 border-b">
                                    <div className="flex items-center gap-2 mb-3">
                                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                        🤖 AI ANALYSIS
                                      </span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                      Review untuk: {eventName}
                                    </h3>
                                  </div>

                                  {isFetchingAnalysis ? (
                                    <div className="text-center py-8">
                                      <div className="flex items-center justify-center mb-4">
                                        <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-[#003EC7] animate-spin" />
                                      </div>
                                      <p className="text-xs text-gray-400">
                                        Mengambil hasil analisis...
                                      </p>
                                    </div>
                                  ) : aiScore === null ? (
                                    !proposal ? (
                                      // No proposal uploaded yet
                                      <div className="text-center py-8">
                                        <div className="text-4xl mb-3">📊</div>
                                        <p className="text-sm font-medium text-gray-700 mb-1">
                                          Belum ada analisis
                                        </p>
                                        <p className="text-xs text-gray-400">
                                          Upload proposal PDF untuk mendapatkan
                                          skor AI
                                        </p>
                                        <Button
                                          className="mt-4 bg-[#003EC7] hover:bg-blue-700 text-sm"
                                          onClick={() =>
                                            setIsUploadDialogOpen(true)
                                          }
                                        >
                                          Upload Sekarang
                                        </Button>
                                      </div>
                                    ) : (
                                      // Proposal uploaded, AI still processing
                                      <div className="text-center py-8">
                                        <div className="flex items-center justify-center mb-4">
                                          <div className="w-16 h-16 rounded-full border-4 border-blue-200 border-t-[#003EC7] animate-spin" />
                                        </div>
                                        <p className="text-sm font-semibold text-gray-800 mb-1">
                                          Sedang dianalisis...
                                        </p>
                                        <p className="text-xs text-gray-400 mb-4">
                                          AI sedang membaca dan mengevaluasi
                                          proposal kamu. Ini mungkin memerlukan
                                          beberapa detik.
                                        </p>
                                        {/* <Button
                                      onClick={() => loadEventData()}
                                      className="text-xs text-blue-600 hover:underline"
                                      variant={"ghost"}
                                    >
                                      Refresh hasil →
                                    </Button> */}
                                      </div>
                                    )
                                  ) : (
                                    <>
                                      {/* Overall score ring */}
                                      <div className="flex items-center justify-center mb-6">
                                        <div className="w-20 h-20 rounded-full border-4 border-[#003EC7] flex items-center justify-center">
                                          <span className="text-2xl font-bold text-[#003EC7]">
                                            {aiScore}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Sub-scores (derived from single aiScore) */}
                                      <div className="grid grid-cols-2 gap-4 mb-4">
                                        {[
                                          {
                                            label: "STRUKTUR",
                                            value: Math.min(
                                              100,
                                              Math.round(aiScore * 1.1),
                                            ),
                                          },
                                          {
                                            label: "VISUAL",
                                            value: Math.max(
                                              0,
                                              Math.round(aiScore * 0.9),
                                            ),
                                          },
                                          {
                                            label: "NARASI",
                                            value: Math.min(
                                              100,
                                              Math.round(aiScore * 1.05),
                                            ),
                                          },
                                          {
                                            label: "RELEVANSI",
                                            value: Math.max(
                                              0,
                                              Math.round(aiScore * 0.95),
                                            ),
                                          },
                                        ].map(({ label, value }) => (
                                          <div
                                            key={label}
                                            className="bg-[#F9FAFB] rounded-[4px] p-3"
                                          >
                                            <p className="text-xs font-semibold text-blue-600 mb-1">
                                              {label}
                                            </p>
                                            <p className="text-3xl font-bold text-gray-900">
                                              {value}{" "}
                                              <span className="text-xs text-gray-500">
                                                / 100
                                              </span>
                                            </p>
                                          </div>
                                        ))}
                                      </div>

                                      {/* Score bar */}
                                      <div className="mb-4">
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                          <span>Skor Keseluruhan</span>
                                          <span
                                            className={
                                              aiScore >= 70
                                                ? "text-green-600"
                                                : aiScore >= 50
                                                  ? "text-yellow-600"
                                                  : "text-red-600"
                                            }
                                          >
                                            {aiScore >= 70
                                              ? "Baik"
                                              : aiScore >= 50
                                                ? "Cukup"
                                                : "Perlu Perbaikan"}
                                          </span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                          <div
                                            className={`h-2 rounded-full transition-all ${
                                              aiScore >= 70
                                                ? "bg-green-500"
                                                : aiScore >= 50
                                                  ? "bg-yellow-500"
                                                  : "bg-red-500"
                                            }`}
                                            style={{ width: `${aiScore}%` }}
                                          />
                                        </div>
                                      </div>

                                      <Button
                                        className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2"
                                        onClick={() =>
                                          handleOpenEditor(proposal?.content)
                                        }
                                      >
                                        Lihat Analisis Lengkap →
                                      </Button>
                                    </>
                                  )}
                                </Card>
                                {activeEvent?.status === "DRAFT" && (
                                  <Button
                                    onClick={handlePublishEvent}
                                    disabled={isPublishing}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 mt-4 transition-colors"
                                  >
                                    <Sparkles className="w-5 h-5" />
                                    {isPublishing
                                      ? "Mempublikasikan..."
                                      : "Publish Event"}
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })()
                      )}
                    </TabsContent>

                    <TabsContent value="terbaru">
                      <ProposalTerbaru />
                    </TabsContent>
                  </Tabs>

                  {/* Upload Dialog */}
                  <Dialog
                    open={isUploadDialogOpen}
                    onOpenChange={setIsUploadDialogOpen}
                  >
                    <DialogContent className="sm:max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Upload Proposal</DialogTitle>
                      </DialogHeader>

                      <div className="space-y-6">
                        {/* Info Banner */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-blue-900 mb-0.5">
                              Akan dikaitkan dengan: {eventName}
                            </p>
                          </div>
                        </div>

                        {/* File Upload Area */}
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:border-gray-400 cursor-pointer transition-colors"
                        >
                          <div className="bg-blue-50 rounded-full p-4 mb-3">
                            <CloudUpload className="w-8 h-8 text-blue-500" />
                          </div>
                          <p className="font-medium text-gray-900 mb-1">
                            Tarik & lepas file di sini
                          </p>
                          <p className="text-xs text-gray-500 mb-4">
                            Mendukung PDF, DOCX hingga 15MB
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-sm"
                          >
                            Pilih File dari Komputer
                          </Button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.docx,.doc,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={(e) => handleFileUpload(e.target.files)}
                            className="hidden"
                          />
                        </div>

                        {/* AI Options */}
                        <div className="space-y-4">
                          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <Sparkles className="w-6 h-6 text-[#0052FF]" />
                            OPSI REVIEW AI
                          </h3>

                          {/* Option 1 */}
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Nilai skor proposal
                              </p>
                              <p className="text-xs text-gray-500">
                                Analisis potensi keberlanjutan sponsor
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                setAiOptions((prev) => ({
                                  ...prev,
                                  proposalScore: !prev.proposalScore,
                                }))
                              }
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                aiOptions.proposalScore
                                  ? "bg-blue-600"
                                  : "bg-gray-300"
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  aiOptions.proposalScore
                                    ? "translate-x-6"
                                    : "translate-x-1"
                                }`}
                              />
                            </button>
                          </div>

                          {/* Option 2 */}
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Identifikasi masalah
                              </p>
                              <p className="text-xs text-gray-500">
                                Temukan kekurangan data atau inkonsistensi
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                setAiOptions((prev) => ({
                                  ...prev,
                                  identifyIssues: !prev.identifyIssues,
                                }))
                              }
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                aiOptions.identifyIssues
                                  ? "bg-blue-600"
                                  : "bg-gray-300"
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  aiOptions.identifyIssues
                                    ? "translate-x-6"
                                    : "translate-x-1"
                                }`}
                              />
                            </button>
                          </div>

                          {/* Option 3 */}
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                Cocockan data event
                              </p>
                              <p className="text-xs text-gray-500">
                                Verifikasi kesesuaian dengan target sponsor
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                setAiOptions((prev) => ({
                                  ...prev,
                                  matchEventData: !prev.matchEventData,
                                }))
                              }
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                aiOptions.matchEventData
                                  ? "bg-blue-600"
                                  : "bg-gray-300"
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  aiOptions.matchEventData
                                    ? "translate-x-6"
                                    : "translate-x-1"
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-end gap-3 pt-4">
                        <DialogClose asChild>
                          <Button
                            variant="outline"
                            className=" px-6 py-2"
                            disabled={isSubmitting}
                          >
                            Batal
                          </Button>
                        </DialogClose>
                        <Button
                          disabled={isSubmitting || !eventId}
                          onClick={() => fileInputRef.current?.click()}
                          className=" bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
                        >
                          {isSubmitting
                            ? "Mengupload..."
                            : "Upload & Analisis →"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
