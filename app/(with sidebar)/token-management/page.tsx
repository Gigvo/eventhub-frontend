"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Download,
  SendHorizonal,
  Zap,
  HelpCircle,
  UserSearch,
  Landmark,
  QrCode,
  Wallet,
  Banknote,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Script from "next/script";
import { apiCall } from "@/lib/api-client";

interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  price: number;
  popular?: boolean;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: string | number;
  method: string;
  status: "success" | "pending" | "completed";
}

interface BoostEvent {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
}

const TokenManagement = () => {
  const [activeTab, setActiveTab] = useState<"packages" | "payment">(
    "packages",
  );
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [tokenPackages, setTokenPackages] = useState<TokenPackage[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTopUpLoading, setIsTopUpLoading] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const [proposalsCount, setProposalsCount] = useState<number>(12);
  const [contactsCount, setContactsCount] = useState<number>(8);
  const [boostsCount, setBoostsCount] = useState<number>(2);

  const loadBillingData = async () => {
    setIsLoading(true);
    try {
      const [packagesRes, balanceRes, transactionsRes, usageRes, userRes] =
        await Promise.all([
          apiCall<{ success: boolean; data: any[] }>("/billing/packages"),
          apiCall<{ success: boolean; data: { tokenBalance: number } }>(
            "/billing/balance",
          ),
          apiCall<{ success: boolean; data: any[] | { data: any[] } }>(
            "/billing/transactions",
          ),
          apiCall<{ success: boolean; data: any[] }>("/billing/usage"),
          apiCall<{ success: boolean; data: any }>("/auth/me"),
        ]);

      if (packagesRes?.success && packagesRes?.data) {
        const mapped = packagesRes.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          tokens: p.tokenAmount,
          price: p.priceIdr,
          popular: p.id === "PRO",
        }));
        setTokenPackages(mapped);
      }

      if (balanceRes?.success && balanceRes?.data) {
        setTokenBalance(balanceRes.data.tokenBalance);
      }

      if (userRes?.success && userRes?.data) {
        setUserRole(userRes.data.role);
      }

      const txData = transactionsRes?.data;
      const rawTxList = Array.isArray(txData)
        ? txData
        : txData &&
            typeof txData === "object" &&
            "data" in txData &&
            Array.isArray((txData as any).data)
          ? (txData as any).data
          : [];
      const rawUsageList = usageRes?.data || [];

      // Calculate dynamic counts from live usage history
      const liveProposals = rawUsageList.filter(
        (u: any) =>
          u.feature === "PROPOSAL_BUILDER" || u.feature === "SMART_REVIEW",
      ).length;
      const liveContacts = rawUsageList.filter(
        (u: any) => u.feature === "UNLOCK_CONTACT",
      ).length;
      if (rawUsageList.length > 0) {
        setProposalsCount(liveProposals > 0 ? liveProposals : 12);
        setContactsCount(liveContacts > 0 ? liveContacts : 8);
      }

      const combined = [
        ...rawTxList.map((tx: any) => ({
          id: tx.id,
          date: new Date(tx.createdAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          rawDate: new Date(tx.createdAt),
          description: `Top Up ${tx.packageName || "Package"} (${tx.tokenAmount} Tokens)`,
          amount: `Rp ${tx.priceIdr.toLocaleString("id-ID")}`,
          method: tx.paymentMethod || "MIDTRANS",
          status: tx.status.toLowerCase(),
        })),
        ...rawUsageList.map((us: any) => ({
          id: us.id,
          date: new Date(us.createdAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
          rawDate: new Date(us.createdAt),
          description:
            us.feature === "PROPOSAL_BUILDER"
              ? "AI Proposal Builder"
              : us.feature === "SMART_REVIEW"
                ? "AI Smart Review"
                : "Buka Kontak Sponsor",
          amount: `- ${us.cost} Tokens`,
          method: "SYSTEM WALLET",
          status: "completed",
        })),
      ].sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());

      setTransactions(combined);
    } catch (e) {
      console.error("Failed to load billing data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBillingData();
  }, []);

  const handleTopup = async (packageId: string) => {
    setSelectedPackage(packageId);
    setIsTopUpLoading(true);
    try {
      const res = await apiCall<{
        success: boolean;
        data: {
          transaction: any;
          snapToken: string;
          redirectUrl: string;
        };
      }>("/billing/topup", {
        method: "POST",
        body: JSON.stringify({ packageId }),
      });
      if (res?.success && res?.data?.snapToken) {
        const snap = (window as any).snap;
        if (snap) {
          snap.pay(res.data.snapToken, {
            onSuccess: (result: any) => {
              loadBillingData();
            },
            onPending: (result: any) => {
              loadBillingData();
            },
            onError: (err: any) => {
              alert("Pembayaran gagal!");
            },
            onClose: () => {
              loadBillingData();
            },
          });
        } else {
          window.open(res.data.redirectUrl, "_blank");
        }
      }
    } catch (error) {
      console.error("Topup failed:", error);
      alert("Gagal melakukan top-up token.");
    } finally {
      setIsTopUpLoading(false);
    }
  };

  const paymentMethods = [
    { icon: Landmark, label: "Transfer Bank" },
    { icon: QrCode, label: "QRIS" },
    { icon: Banknote, label: "Virtual Account" },
    { icon: Wallet, label: "E-Wallet" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
      case "completed":
        return <Badge className="bg-green-100 text-green-800">SUCCESS</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">PENDING</Badge>;
      default:
        return (
          <Badge className="bg-red-100 text-red-800">
            {status.toUpperCase()}
          </Badge>
        );
    }
  };

  const calculateEventProgress = (startDate: string, endDate: string) => {
    const months: { [key: string]: number } = {
      Jan: 0,
      Feb: 1,
      Mar: 2,
      Apr: 3,
      May: 4,
      Jun: 5,
      Jul: 6,
      Aug: 7,
      Sep: 8,
      Oct: 9,
      Nov: 10,
      Dec: 11,
    };

    const parseDateString = (dateStr: string) => {
      const parts = dateStr.split(" ");
      const day = parseInt(parts[0]);
      const month = months[parts[1]];
      const year = new Date().getFullYear();
      return new Date(year, month, day);
    };

    const start = parseDateString(startDate);
    const end = parseDateString(endDate);
    const now = new Date();

    if (now < start) {
      return 0;
    }
    if (now > end) {
      return 100;
    }

    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.round((elapsed / totalDuration) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 animate-fadeIn">
      {/* Midtrans Snap Script dynamically loaded */}
      <Script
        src="https://app.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
      />

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header with Token Count and Stats */}
          <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-800 p-6 sm:p-8 rounded-2xl shadow-lg text-white flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full -ml-16 -mb-16 blur-2xl pointer-events-none"></div>

            {/* Left side: Token Balance text */}
            <div className="space-y-3 z-10 text-center md:text-left flex-1">
              <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold tracking-wider text-indigo-100 uppercase">
                Dompet Token Anda
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Sisa Saldo Token
              </h2>
              <p className="text-indigo-250/90 text-xs sm:text-sm max-w-md">
                Gunakan token Anda untuk mengakses AI Proposal Builder,
                melakukan AI Smart Review, atau membuka kontak sponsor
                potensial.
              </p>
            </div>

            {/* Right side: Beautiful filled Token circle */}
            <div className="flex flex-col items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 p-5 sm:p-6 rounded-2xl shadow-inner z-10 min-w-[180px] sm:min-w-[200px] w-full md:w-auto flex-shrink-0">
              <div className="relative h-28 w-28">
                <svg
                  className="h-full w-full transform -rotate-90"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.15)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="8"
                    strokeDasharray="282.74"
                    strokeDashoffset={
                      282.74 * (1 - Math.min(tokenBalance, 500) / 500)
                    }
                    strokeLinecap="round"
                    className="drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-3xl font-black text-white tracking-tight">
                    {isLoading ? "..." : tokenBalance}
                  </div>
                  <div className="text-[10px] font-bold text-indigo-200 tracking-widest">
                    TOKENS
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Up Tokens Section */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Top Up Tokens
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 items-stretch">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-48 bg-gray-100 rounded-xl animate-pulse"
                  />
                ))
              ) : tokenPackages.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-500">
                  Tidak ada paket tersedia
                </div>
              ) : (
                tokenPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`relative p-5 sm:p-6 transition-all rounded-2xl border border-[#E5E7EB] bg-white flex flex-col justify-between ${
                      pkg.popular
                        ? "border-2 border-indigo-650 bg-indigo-50/50 shadow-sm"
                        : "hover:shadow-lg"
                    } ${selectedPackage === pkg.id ? "ring-2 ring-indigo-600" : ""}`}
                  >
                    {pkg.popular && (
                      <div className="absolute right-0 top-0">
                        <p className="bg-[#505F76] px-3 py-1 text-white text-[10px] font-bold tracking-wide rounded-bl-lg">
                          POPULER
                        </p>
                      </div>
                    )}
                    <div>
                      <Image
                        src={"/icons/token.svg"}
                        alt="token"
                        width={24}
                        height={28}
                        className="mb-3"
                      />
                      <h3 className="mb-1 text-base sm:text-lg font-semibold text-gray-900">
                        {pkg.name}
                      </h3>
                      <div className="mb-4">
                        <div className="text-xl sm:text-2xl font-bold text-gray-900">
                          {pkg.tokens} Tokens
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 font-medium">
                          Rp {pkg.price.toLocaleString("id-ID")}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleTopup(pkg.id)}
                      disabled={isTopUpLoading}
                      variant={pkg.popular ? "default" : "outline"}
                      className="w-full mt-2"
                    >
                      {isTopUpLoading && selectedPackage === pkg.id
                        ? "Memproses..."
                        : "Pilih"}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Transaction History */}
          <div>
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-gray-900">
                Transaction History
              </h2>
            </div>
            <Card className="overflow-hidden rounded-2xl border border-gray-250/60 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] sm:min-w-0">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        DATE
                      </th>
                      <th className="px-4 sm:px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        DESCRIPTION
                      </th>
                      <th className="px-4 sm:px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        AMOUNT
                      </th>
                      <th className="px-4 sm:px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        METHOD
                      </th>
                      <th className="px-4 sm:px-6 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        STATUS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {transactions.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 sm:px-6 py-10 text-center text-sm text-gray-505 font-medium"
                        >
                          Belum ada riwayat transaksi token.
                        </td>
                      </tr>
                    ) : (
                      transactions.map((tx) => (
                        <tr
                          key={tx.id}
                          className="hover:bg-gray-50/80 transition-colors"
                        >
                          <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-900 whitespace-nowrap">
                            {tx.date}
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-900">
                            {tx.description}
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-900 font-semibold">
                            {tx.amount}
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                            {tx.method}
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-xs sm:text-sm whitespace-nowrap">
                            {getStatusBadge(tx.status)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* How to Use Tokens */}
          <Card className="p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-sm bg-white">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Zap className="h-5 w-5 text-yellow-500" />
              Cara Pakai Token
            </h3>

            {userRole === "COMPANY" ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 flex items-center justify-center rounded-2xl flex-shrink-0">
                    <UserSearch className="h-6 w-6 text-[#78350F]" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-base leading-snug">
                      Ajukan Kerjasama Sponsor
                    </div>
                    <div className="text-sm text-gray-500 mt-1 leading-normal">
                      Perusahaan dapat mengirim penawaran kerja sama langsung
                      kepada Event Organizer dengan{" "}
                      <span className="font-bold">2 Token</span>.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className=" flex items-start gap-3">
                  <SendHorizonal className="mb-2 h-5 w-5 text-indigo-650 shrink-0" />
                  <div>
                    <div className="font-semibold text-gray-900">
                      AI Proposal Builder
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      Memerlukan <span className="font-bold">5 Token</span> per
                      proposal.
                    </div>
                  </div>
                </div>
                <div className=" flex items-start gap-3">
                  <UserSearch className="mb-2 h-5 w-5 text-purple-655 shrink-0" />
                  <div>
                    <div className="font-semibold text-gray-900">
                      Buat Penawaran
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      Buat Penawaran dengan{" "}
                      <span className="font-bold">2 Token</span>.
                    </div>
                  </div>
                </div>
                <div className=" flex items-start gap-3">
                  <Zap className="mb-2 h-5 w-5 text-blue-650 shrink-0" />
                  <div>
                    <div className="font-semibold text-gray-900">
                      AI Smart Review
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      Dapatkan proposal terbaik dengan review otomatis dengan
                      <span className="font-bold"> 3 Token</span>.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Support Section */}
          <Card
            className="overflow-hidden p-5 sm:p-6 text-white rounded-2xl shadow-md"
            style={{
              backgroundImage: `linear-gradient(0deg, rgba(17, 24, 39, 1) 0%, rgba(17, 24, 39, 0.4) 50%, rgba(17, 24, 39, 0) 100%), url(/support.png)`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="space-y-3">
              <div className="text-sm font-semibold mt-15">
                Butuh bantuan billing?
              </div>
              <div className="text-xs text-gray-300">
                Hubungi tim support kami untuk bantuan terkait pembayaran dan
                token management.
              </div>
              <Button
                variant="outline"
                className="border-white text-black hover:bg-white hover:text-gray-900 px-4 py-1.5 rounded-[4px]"
              >
                Hubungi Support
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TokenManagement;
