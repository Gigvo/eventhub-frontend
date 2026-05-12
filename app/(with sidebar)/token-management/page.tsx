"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import Image from "next/image";

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

  const tokenPackages: TokenPackage[] = [
    {
      id: "starter",
      name: "Starter",
      tokens: 10,
      price: 150000,
    },
    {
      id: "growth",
      name: "Growth",
      tokens: 30,
      price: 400000,
      popular: true,
    },
    {
      id: "business",
      name: "Business",
      tokens: 100,
      price: 1200000,
    },
  ];

  const transactions: Transaction[] = [
    {
      id: "1",
      date: "24 Oct 2025",
      description: "Top Up Package M (30 Tokens)",
      amount: "Rp 400.000",
      method: "VIRTUAL ACCOUNT",
      status: "success",
    },
    {
      id: "2",
      date: "22 Oct 2025",
      description: "Proposal: Tech Summit 2024",
      amount: "- 2 Tokens",
      method: "SYSTEM WALLET",
      status: "completed",
    },
    {
      id: "3",
      date: "19 Oct 2025",
      description: "Top Up Package S (10 Tokens)",
      amount: "Rp 150.000",
      method: "QRIS",
      status: "pending",
    },
  ];

  const boostEvents: BoostEvent[] = [
    {
      id: "1",
      name: "JAJA JAZZ FESTIVAL 2024",
      startDate: "23 Oct",
      endDate: "25 Oct",
      status: "AKTIF",
    },
    {
      id: "2",
      name: "STARTUP WORLD CUP JAKARTA",
      startDate: "24 Oct",
      endDate: "27 Oct",
      status: "AKTIF",
    },
  ];

  const paymentMethods = [
    { icon: Landmark, label: "Transfer Bank" },
    { icon: QrCode, label: "QRIS" },
    { icon: Banknote, label: "Virtual Account" },
    { icon: Wallet, label: "E-Wallet" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">SUCCESS</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">PENDING</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">COMPLETED</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const calculateEventProgress = (startDate: string, endDate: string) => {
    // Parse dates - assuming format like "23 Oct"
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header with Token Count and Stats */}
          <div className="flex items-center gap-6 bg-white p-6 rounded-[8px] shadow-sm">
            {/* Token Count Circle */}
            <div className="flex flex-col items-center justify-center p-6">
              <div className="relative h-32 w-32">
                <svg
                  className="h-full w-full transform -rotate-90"
                  viewBox="0 0 100 100"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#4f46e5"
                    strokeWidth="8"
                    strokeDasharray="282.74"
                    strokeDashoffset="282.74"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-2xl font-bold text-gray-900">45</div>
                  <div className="text-xs text-gray-500">TOKENS</div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="flex items-center gap-4 w-full">
              <Card className="flex flex-col items-start justify-center p-4 flex-1 bg-[#F3F4F6] rounded-[4px]">
                <div className="text-xs text-gray-500 text-center">
                  PROPOSALS SENT
                </div>
                <div className="text-2xl font-bold text-gray-900">12</div>
                <Progress value={75} className="w-full mt-2" />
              </Card>
              <Card className="flex flex-col items-start justify-center p-4 flex-1 bg-[#F3F4F6] rounded-[4px]">
                <div className="text-xs text-gray-500 text-center">
                  CONTACTS OPENED
                </div>
                <div className="text-2xl font-bold text-gray-900">08</div>
                <Progress value={75} className="w-full mt-2" />
              </Card>
              <Card className="flex flex-col items-start justify-center p-4 flex-1 bg-[#F3F4F6] rounded-[4px]">
                <div className="text-xs text-gray-500 text-center">
                  BOOSTS ACTIVE
                </div>
                <div className="text-2xl font-bold text-gray-900">02</div>
                <Progress value={75} className="w-full mt-2" />
              </Card>
            </div>
          </div>

          {/* Top Up Tokens Section */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Top Up Tokens
            </h2>
            <div className="flex gap-6 items-stretch">
              {tokenPackages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`relative p-6 transition-all flex-1 rounded-[8px] border border-[#E5E7EB] ${
                    pkg.popular
                      ? "border-2 border-indigo-600 bg-indigo-50"
                      : "hover:shadow-lg"
                  } ${selectedPackage === pkg.id ? "ring-2 ring-indigo-600" : ""}`}
                >
                  {pkg.popular && (
                    <div className="absolute right-0 top-0">
                      <p className="bg-[#505F76] px-3 py-1 text-white text-[10px]">
                        POPULER
                      </p>
                    </div>
                  )}
                  <Image
                    src={"/icons/token.svg"}
                    alt="token"
                    width={24}
                    height={28}
                    className=""
                  />
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    {pkg.name}
                  </h3>
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-gray-900">
                      {pkg.tokens} Tokens
                    </div>
                    <div className="text-sm text-gray-500">
                      Rp {pkg.price.toLocaleString("id-ID")}
                    </div>
                  </div>
                  <Button
                    onClick={() => setSelectedPackage(pkg.id)}
                    variant={pkg.popular ? "default" : "outline"}
                    className="w-full"
                  >
                    Pilih
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method Section */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Pilih Metode Pembayaran
            </h2>
            <Card className="p-6">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {paymentMethods.map((method, idx) => (
                  <button
                    key={idx}
                    className="flex items-center gap-2 rounded-lg border-2 border-gray-200 p-4 transition-all hover:border-indigo-600 hover:bg-indigo-50"
                  >
                    <method.icon className="h-6 w-6 text-gray-700" />
                    <span className="text-xs text-center font-medium text-gray-700">
                      {method.label}
                    </span>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Transaction History */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Transaction History
              </h2>
              <Button variant="ghost" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Download CSV
              </Button>
            </div>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">
                        DATE
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">
                        DESCRIPTION
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">
                        AMOUNT
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">
                        METHOD
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700">
                        STATUS
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {tx.date}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {tx.description}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {tx.amount}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {tx.method}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {getStatusBadge(tx.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* How to Use Tokens */}
          <Card className="p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Zap className="h-5 w-5 text-yellow-500" />
              Cara Pakai Token
            </h3>
            <div className="space-y-4">
              <div className=" flex items-start gap-3">
                <SendHorizonal className="mb-2 h-5 w-5 text-indigo-600" />
                <div>
                  <div className="font-semibold text-gray-900">
                    Proposal Sponsorship
                  </div>
                  <div className="text-sm text-gray-600">
                    Memerlukan <span className="font-bold">2-5 Tokens</span> per
                    proposal tergantung skala sponsor.
                  </div>
                </div>
              </div>
              <div className=" flex items-start gap-3">
                <UserSearch className="mb-2 h-5 w-5 text-purple-600" />
                <div>
                  <div className="font-semibold text-gray-900">
                    Buka Kontak Sponsor
                  </div>
                  <div className="text-sm text-gray-600">
                    Dapatkan akses langsung WhatsApp/Email dengan{" "}
                    <span className="font-bold">1 Token</span> per kontak.
                  </div>
                </div>
              </div>
              <div className=" flex items-start gap-3">
                <Zap className="mb-2 h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-semibold text-gray-900">Boost Event</div>
                  <div className="text-sm text-gray-600">
                    Tingkatkan visibilitas event di halaman utama dengan{" "}
                    <span className="font-bold">10 Tokens</span> per 24 jam.
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Boost Aktif */}
          <Card className="p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Zap className="h-5 w-5 text-yellow-500" />
              Boost Aktif
            </h3>
            <div className="space-y-4">
              {boostEvents.map((event) => (
                <div key={event.id} className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {event.name}
                      </div>
                    </div>
                    <p className="font-bold text-[#505F76] text-xs">
                      {event.status}
                    </p>
                  </div>
                  <Progress
                    value={calculateEventProgress(
                      event.startDate,
                      event.endDate,
                    )}
                    className="h-2"
                  />
                  <div className="text-xs text-gray-600 flex items-center justify-between">
                    <p>
                      Mulai: {event.startDate} <span className="mx-1">•</span>
                    </p>
                    <p>Selesai: {event.endDate}</p>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full text-sm mt-2">
                + Boost Event Lainnya
              </Button>
            </div>
          </Card>

          {/* Support Section */}
          <Card
            className="overflow-hidden  p-6 text-white"
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
                className=" border-white text-black hover:bg-white hover:text-gray-900 px-4 py-1.5 rounded-[4px]"
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
