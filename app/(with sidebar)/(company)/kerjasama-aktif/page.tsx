"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import KerjasamaCard from "@/components/kerjasama-aktif/kerjasama-card";
import { apiCall } from "@/lib/api-client";

export default function KerjasamaAktif() {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [offersRes, pitchesRes] = await Promise.all([
          apiCall<{ data: any[] }>("/offers/my", {}).catch(() => ({
            data: [],
          })),
          apiCall<{ data: any[] }>("/pitches/incoming", {}).catch(() => ({
            data: [],
          })),
        ]);

        const offers = Array.isArray(offersRes?.data) ? offersRes.data : [];
        const pitches = Array.isArray(pitchesRes?.data) ? pitchesRes.data : [];

        const allDeals = [...offers, ...pitches].filter(
          (d) => d.status === "ACCEPTED" || d.status === "APPROVED",
        );

        setDeals(allDeals);
      } catch (err) {
        console.error("Failed to load deals", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const now = new Date();

  const berjalanDeals = deals.filter((d) => {
    const start = d.event?.startDate ? new Date(d.event.startDate) : new Date();
    const end = d.event?.endDate ? new Date(d.event.endDate) : new Date();
    return now >= start && now <= end;
  });

  const persiapanDeals = deals.filter((d) => {
    const start = d.event?.startDate ? new Date(d.event.startDate) : new Date();
    return now < start;
  });

  const menujuSelesaiDeals = deals.filter((d) => {
    const end = d.event?.endDate ? new Date(d.event.endDate) : new Date();
    return now > end;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Kerjasama Aktif</h1>
        <p className="text-sm text-gray-500 mt-1">
          Kelola dan pantau seluruh kerjasama event Anda yang sedang
          berlangsung.
        </p>
      </div>

      <Tabs defaultValue="berjalan" className="w-full">
        <TabsList className="bg-transparent border-b border-gray-200 w-full justify-start rounded-none h-auto p-0 mb-8 flex gap-8">
          <TabsTrigger
            value="berjalan"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#3446C1] data-[state=active]:text-[#3446C1] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 font-semibold text-gray-500"
          >
            Berjalan ({berjalanDeals.length})
          </TabsTrigger>
          <TabsTrigger
            value="persiapan"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#3446C1] data-[state=active]:text-[#3446C1] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 font-semibold text-gray-500"
          >
            Persiapan ({persiapanDeals.length})
          </TabsTrigger>
          <TabsTrigger
            value="menuju-selesai"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#3446C1] data-[state=active]:text-[#3446C1] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 font-semibold text-gray-500"
          >
            Menuju Selesai ({menujuSelesaiDeals.length})
          </TabsTrigger>
        </TabsList>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3446C1]"></div>
          </div>
        ) : (
          <>
            <TabsContent value="berjalan" className="mt-0">
              <div className="flex flex-col gap-4">
                {berjalanDeals.length > 0 ? (
                  berjalanDeals.map((deal) => (
                    <KerjasamaCard key={deal.id} {...deal} />
                  ))
                ) : (
                  <div className="bg-white p-10 rounded-xl border border-dashed border-gray-300 text-center text-gray-500">
                    Tidak ada kerjasama yang sedang berjalan.
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="persiapan" className="mt-0">
              <div className="flex flex-col gap-4">
                {persiapanDeals.length > 0 ? (
                  persiapanDeals.map((deal) => (
                    <KerjasamaCard key={deal.id} {...deal} />
                  ))
                ) : (
                  <div className="bg-white p-10 rounded-xl border border-dashed border-gray-300 text-center text-gray-500">
                    Tidak ada kerjasama dalam tahap persiapan.
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="menuju-selesai" className="mt-0">
              <div className="flex flex-col gap-4">
                {menujuSelesaiDeals.length > 0 ? (
                  menujuSelesaiDeals.map((deal) => (
                    <KerjasamaCard key={deal.id} {...deal} />
                  ))
                ) : (
                  <div className="bg-white p-10 rounded-xl border border-dashed border-gray-300 text-center text-gray-500">
                    Tidak ada kerjasama yang menuju selesai.
                  </div>
                )}
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
