"use client";

import React, { useState, useEffect } from "react";
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

interface ProposalContent {
  executiveSummary: string;
  eventBackground: string;
  objectives: string[];
  targetAudience: string;
  whyThisEvent: string;
  sponsorshipBenefits: string[];
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
    items.map((i) => `<li>${i}</li>`).join("");

  return `
<h1>${eventName} — Proposal Sponsorship</h1>

<h2>Executive Summary</h2>
<p>${content.executiveSummary}</p>

<h2>Latar Belakang Event</h2>
<p>${content.eventBackground}</p>

<h2>Tujuan</h2>
<ul>${listItems(content.objectives)}</ul>

<h2>Target Audiens</h2>
<p>${content.targetAudience}</p>

<h2>Mengapa Event Ini?</h2>
<p>${content.whyThisEvent}</p>

<h2>Manfaat Sponsorship</h2>
<ul>${listItems(content.sponsorshipBenefits)}</ul>

<h2>Call to Action</h2>
<p>${content.callToAction}</p>
  `.trim();
}

function scoreLabel(score: number): string {
  if (score >= 81) return "Sangat Baik";
  if (score >= 61) return "Baik";
  if (score >= 41) return "Cukup";
  return "Perlu Perbaikan";
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
      return stored ? (JSON.parse(stored) as StoredProposal) : null;
    } catch {
      return null;
    }
  });

  const [editorContent] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    try {
      const stored = localStorage.getItem("generatedProposal");
      if (!stored) return "";
      const parsed = JSON.parse(stored) as StoredProposal;
      return buildHtml(parsed.content, parsed.eventName);
    } catch {
      return "";
    }
  });

  const [review, setReview] = useState<SmartReview | null>(null);
  const [reviewLoading, setReviewLoading] = useState(() => !!proposal?.eventId);
  const [reviewError, setReviewError] = useState<string | null>(null);

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

  const criticalCount =
    review?.issues.filter((i) => i.severity === "CRITICAL").length ?? 0;
  const warningCount =
    review?.issues.filter((i) => i.severity === "WARNING").length ?? 0;

  return (
    <div className="flex gap-6 p-6">
      {/* Editor */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Proposal Builder</h1>
          {proposal && (
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              ✨ Dibuat oleh AI — {proposal.eventName}
            </span>
          )}
        </div>
        <Tiptap content={editorContent || undefined} />
      </div>

      {/* Sidebar */}
      <div className="space-y-6 max-w-sm w-full">
        {/* Header */}
        <h2 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
          <span className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">
            ✓
          </span>
          AI Smart Review
        </h2>

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

        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors">
          <Sparkles className="w-5 h-5" />
          Publish Event
        </button>
      </div>
    </div>
  );
}
