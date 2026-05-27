"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Tiptap from "@/components/proposal-builder/tiptap";
import {
  AlertCircle,
  Target,
  Sparkles,
  CheckCircle2,
  Info,
  Loader2,
} from "lucide-react";
import { apiCall } from "@/lib/api-client";
import NavbarProposalBuilder from "@/components/proposal-builder/navbar";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface SponsorshipPackage {
  tierName: string;
  price: string;
  benefits: string[];
}

interface ProposalContent {
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

interface StoredProposal {
  proposalId: string;
  eventId: string;
  eventName: string;
  content: ProposalContent;
  savedAt: string;
}

interface ReviewIssue {
  severity: "CRITICAL" | "WARNING" | "INFO";
  category: string;
  description: string;
  suggestion: string;
}

interface SmartReview {
  score: number;
  strengths: string[];
  issues: ReviewIssue[];
  summary: string;
}

function buildHtml(content: ProposalContent, eventName: string): string {
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

function scoreLabel(score: number): string {
  if (score >= 81) return "Sangat Baik";
  if (score >= 61) return "Baik";
  if (score >= 41) return "Cukup";
  return "Perlu Perbaikan";
}

function parseHtmlToProposalContent(html: string): ProposalContent {
  const defaultContent: ProposalContent = {
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
      h.textContent?.toLowerCase().includes(headingText.toLowerCase())
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
      h.textContent?.toLowerCase().includes(headingText.toLowerCase())
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
      h.textContent?.toLowerCase().includes("paket sponsorship")
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
        if (listSibling && (listSibling.tagName === "UL" || listSibling.tagName === "OL")) {
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
    executiveSummary: getSectionContent("Executive Summary") || getSectionContent("Ringkasan Eksekutif"),
    aboutOrganizer: getSectionContent("Tentang Penyelenggara") || getSectionContent("Organizer"),
    eventBackground: getSectionContent("Latar Belakang Event") || getSectionContent("Background"),
    eventTheme: getSectionContent("Tema Event") || getSectionContent("Theme") || getSectionContent("Tema"),
    objectives: getSectionList("Tujuan") || getSectionList("Objectives"),
    activities: getSectionList("Aktivitas") || getSectionList("Activities"),
    targetAudience: getSectionContent("Target Audiens") || getSectionContent("Audience"),
    audienceReach: getSectionContent("Jangkauan Audiens") || getSectionContent("Reach"),
    whySponsor: getSectionContent("Mengapa Sponsor") || getSectionContent("Mengapa Event Ini"),
    sponsorshipPackages: getSponsorshipPackages(),
    generalBenefits: getSectionList("Benefit Umum") || getSectionList("General Benefits") || getSectionList("Manfaat"),
    closingStatement: getSectionContent("Penutup") || getSectionContent("Closing"),
    callToAction: getSectionContent("Call to Action") || getSectionContent("CTA"),
  };
}

const SEVERITY_CONFIG = {
  CRITICAL: {
    bg: "bg-red-50 border-red-200",
    icon: <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />,
    titleColor: "text-red-700",
    bodyColor: "text-red-600",
    badge: "bg-red-100 text-red-700",
    label: "KRITIS",
  },
  WARNING: {
    bg: "bg-yellow-50 border-yellow-200",
    icon: (
      <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
    ),
    titleColor: "text-yellow-800",
    bodyColor: "text-yellow-700",
    badge: "bg-yellow-100 text-yellow-700",
    label: "PERINGATAN",
  },
  INFO: {
    bg: "bg-blue-50 border-blue-200",
    icon: <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />,
    titleColor: "text-blue-800",
    bodyColor: "text-blue-700",
    badge: "bg-blue-100 text-blue-700",
    label: "INFO",
  },
};

export default function ProposalBuilder() {
  const [proposal] = useState<StoredProposal | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem("generatedProposal");
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      if (parsed && parsed.content && typeof parsed.content === "string") {
        parsed.content = JSON.parse(parsed.content);
      }
      return parsed as StoredProposal;
    } catch {
      return null;
    }
  });

  const [editorContent] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    try {
      const stored = localStorage.getItem("generatedProposal");
      if (!stored) return "";
      const parsed = JSON.parse(stored);
      if (parsed && parsed.content && typeof parsed.content === "string") {
        parsed.content = JSON.parse(parsed.content);
      }
      return buildHtml(parsed.content, parsed.eventName);
    } catch {
      return "";
    }
  });

  const [review, setReview] = useState<SmartReview | null>(null);
  const [reviewLoading, setReviewLoading] = useState(() => !!proposal?.eventId);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<"success" | "error" | null>(null);
  const [editedHtml, setEditedHtml] = useState<string>("");

  useEffect(() => {
    if (editorContent) {
      setEditedHtml(editorContent);
    }
  }, [editorContent]);

  const router = useRouter();

  const handlePublish = async () => {
    if (!proposal?.eventId) return;
    try {
      setIsPublishing(true);
      setPublishResult(null);

      // PATCH the edited proposal content to the backend before publishing!
      if (editedHtml) {
        const parsedContent = parseHtmlToProposalContent(editedHtml);
        console.log("Saving edited proposal content:", parsedContent);
        await apiCall(`/events/${proposal.eventId}/proposal/content`, {
          method: "PATCH",
          body: JSON.stringify({
            content: JSON.stringify(parsedContent),
          }),
        });
      }

      await apiCall(`/events/${proposal.eventId}/publish`, { method: "POST" });
      setPublishResult("success");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (error) {
      console.error("Failed to publish event:", error);
      setPublishResult("error");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!editedHtml) return;
    
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <html>
          <head>
            <title>Proposal_Event</title>
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
            ${editedHtml}
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
  };

  useEffect(() => {
    if (!proposal?.eventId) return;
    apiCall<{ data: { review: SmartReview } }>("/ai/smart-review", {
      method: "POST",
      body: JSON.stringify({ eventId: proposal.eventId }),
    })
      .then((res) => setReview(res.data.review))
      .catch(() => setReviewError("Gagal memuat Smart Review."))
      .finally(() => setReviewLoading(false));
  }, [proposal?.eventId]);

  const [isRerunningReview, setIsRerunningReview] = useState(false);

  const handleRerunReview = async () => {
    if (!proposal?.eventId) return;
    try {
      setIsRerunningReview(true);
      setReviewError(null);
      setReviewLoading(true);

      // Step 1: Save current editor content to backend first so AI reviews the updated content
      if (editedHtml) {
        const parsedContent = parseHtmlToProposalContent(editedHtml);
        await apiCall(`/events/${proposal.eventId}/proposal/content`, {
          method: "PATCH",
          body: JSON.stringify({
            content: JSON.stringify(parsedContent),
          }),
        });
      }

      // Step 2: Request fresh AI Smart Review
      const res = await apiCall<{ data: { review: SmartReview } }>("/ai/smart-review", {
        method: "POST",
        body: JSON.stringify({ eventId: proposal.eventId }),
      });
      if (res?.data?.review) {
        setReview(res.data.review);
      }
    } catch (err) {
      console.error("Failed to rerun smart review:", err);
      setReviewError("Gagal memperbarui analisis Smart Review.");
    } finally {
      setReviewLoading(false);
      setIsRerunningReview(false);
    }
  };

  const criticalCount =
    review?.issues.filter((i) => i.severity === "CRITICAL").length ?? 0;
  const warningCount =
    review?.issues.filter((i) => i.severity === "WARNING").length ?? 0;

  return (
    <>
      <NavbarProposalBuilder />
      <div className="flex items-center justify-between px-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="#">Buat Event</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="#">Sponsorship</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Proposal Smart Review</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex gap-4">
          <Button variant={"outline"} onClick={handleDownloadPDF}>Unduh PDF</Button>
          <Button
            className="bg-[#003EC7]"
            onClick={handlePublish}
            disabled={isPublishing || !proposal?.eventId}
          >
            {isPublishing ? "Mempublish..." : "🚀 Publish Event"}
          </Button>
        </div>
      </div>

      <div className="flex gap-6 p-6">
        {/* Editor */}
        <div className="w-full">
          <Tiptap content={editorContent || undefined} onChange={setEditedHtml} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6 max-w-sm w-full">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-gray-100 pb-3">
            <h2 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
              <span className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">
                ✓
              </span>
              AI Smart Review
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRerunReview}
              disabled={reviewLoading || isRerunningReview}
              className="text-xs h-8 gap-1 border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-200 transition-colors"
            >
              {isRerunningReview ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Menganalisis...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Perbarui Analisis
                </>
              )}
            </Button>
          </div>

          {/* Loading state */}
          {reviewLoading && (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin" />
              <p className="text-xs">Menganalisis proposal…</p>
            </div>
          )}

          {/* Error state */}
          {reviewError && !reviewLoading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
              {reviewError}
            </div>
          )}

          {/* Loaded state */}
          {review && !reviewLoading && (
            <>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                <p className="text-xs font-semibold tracking-wider opacity-90">
                  PROPOSAL READINESS
                </p>
                <p className="text-4xl font-bold mt-2">{review.score}/100</p>
                <p className="text-sm mt-1 opacity-90">
                  {scoreLabel(review.score)}
                </p>

                <div className="flex gap-2 mt-4">
                  {criticalCount > 0 && (
                    <span className="bg-red-500/30 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {criticalCount} Kritis
                    </span>
                  )}
                  {warningCount > 0 && (
                    <span className="bg-yellow-400/30 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {warningCount} Peringatan
                    </span>
                  )}
                  {criticalCount === 0 && warningCount === 0 && (
                    <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Tidak ada masalah kritis
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Ringkasan
                </p>
                <p className="text-xs text-gray-700 leading-relaxed">
                  {review.summary}
                </p>
              </div>

              {review.issues.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">
                    Masalah ({review.issues.length})
                  </p>
                  <div className="space-y-3">
                    {review.issues.map((issue, i) => {
                      const cfg = SEVERITY_CONFIG[issue.severity];
                      return (
                        <div
                          key={i}
                          className={`border rounded-lg p-4 flex gap-3 ${cfg.bg}`}
                        >
                          {cfg.icon}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${cfg.badge}`}
                              >
                                {cfg.label}
                              </span>
                              <span className="text-[9px] text-gray-400 font-medium uppercase">
                                {issue.category}
                              </span>
                            </div>
                            <p
                              className={`text-xs font-semibold ${cfg.titleColor} mb-1`}
                            >
                              {issue.description}
                            </p>
                            <p
                              className={`text-[11px] leading-relaxed ${cfg.bodyColor}`}
                            >
                              💡 {issue.suggestion}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {review.strengths.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">
                    Keunggulan ({review.strengths.length})
                  </p>
                  <div className="space-y-2">
                    {review.strengths.map((strength, i) => (
                      <div
                        key={i}
                        className="border border-green-200 bg-green-50 rounded-lg p-3 flex gap-3"
                      >
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-green-800 leading-relaxed">
                          {strength}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {!proposal && !reviewLoading && (
            <div className="text-center py-10 text-gray-400 text-xs">
              Tidak ada proposal yang dimuat.
            </div>
          )}

          {publishResult === "success" && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm text-center">
              ✅ Event berhasil dipublish! Mengarahkan ke dashboard…
            </div>
          )}
          {publishResult === "error" && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm text-center">
              ❌ Gagal mempublish event. Silakan coba lagi.
            </div>
          )}

          <button
            onClick={handlePublish}
            disabled={isPublishing || !proposal?.eventId}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Sparkles className="w-5 h-5" />
            {isPublishing ? "Mempublish..." : "Publish Event"}
          </button>

        </div>
      </div>
    </>
  );
}
