"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { apiCall } from "@/lib/api-client";
import Image from "next/image";
import { Calendar, Building2, BadgeCheck } from "lucide-react";
import Footer from "@/components/footer";
import NavbarOnboarding from "@/components/onboarding/navbar-onboarding";
import { useAuth } from "@/providers/auth-provider";

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
  targetAudience: string;
}

export default function Onboarding() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [role, setRole] = useState<Role>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userName] = useState<string>(() =>
    typeof window !== "undefined"
      ? (sessionStorage.getItem("pendingFullName") ?? "")
      : "",
  );

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
    targetAudience: "",
  });

  // Auth guard: redirect to /login if not authenticated.
  // If already registered (has role in backend), redirect to /dashboard.
  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const checkProfile = async () => {
      try {
        const data = await apiCall<{ data: { role: string } }>("/auth/me");
        if (data?.data?.role) {
          router.push("/dashboard");
        }
      } catch {
        // Not yet registered in backend — stay on onboarding
      }
    };

    checkProfile();
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

  // POST /auth/register is called when the user clicks "Lanjutkan" on Step 2
  const handleSubmitProfile = async () => {
    try {
      setIsSubmitting(true);

      if (role === "EO") {
        if (
          !organizerData.organizationName ||
          !organizerData.organizationType ||
          !organizerData.city
        ) {
          return;
        }

        await apiCall("/auth/register", {
          method: "POST",
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
      } else if (role === "COMPANY") {
        if (
          !sponsorData.companyName ||
          !sponsorData.industry ||
          !sponsorData.city
        ) {
          return;
        }

        const normalizedWebsite = sponsorData.website
          ? /^https?:\/\//i.test(sponsorData.website)
            ? sponsorData.website
            : `https://${sponsorData.website}`
          : undefined;

        await apiCall("/auth/register", {
          method: "POST",
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
              targetAudience: sponsorData.targetAudience,
            },
          }),
        });
      }

      // Clear the stored name after successful registration
      sessionStorage.removeItem("pendingFullName");

      setCurrentStep(3);
    } catch (error) {
      console.error("Failed to submit profile:", error);
      alert("Gagal menyimpan profil. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 1: Role Selection
  if (currentStep === 1) {
    return (
      <>
        <NavbarOnboarding />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl p-12">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Apa peran Anda?
              </h1>
              <p className="text-gray-600">
                Pilih peran yang sesuai dengan tujuan Anda di EventHub.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
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
        <div className="min-h-screen bg-gray-50 p-6 mt-20">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Lengkapi Profil Eventmu
            </h1>

            <div className="grid grid-cols-3 gap-8">
              {/* Form Section */}
              <div className="col-span-2 space-y-6 p-6 bg-white rounded-[8px] shadow-sm border-1 border-[#C3C5D9]">
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
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jenis Organisasi
                  </label>
                  <select
                    name="organizationType"
                    value={organizerData.organizationType}
                    onChange={handleOrganizerChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  >
                    <option value="">Pilih jenis</option>
                    <option value="UNIVERSITY">Universitas</option>
                    <option value="COMMUNITY">Komunitas</option>
                    <option value="CORPORATE">Korporat</option>
                    <option value="NGO">NGO</option>
                    <option value="OTHER">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kota Domisili
                  </label>
                  <select
                    name="city"
                    value={organizerData.city}
                    onChange={handleOrganizerChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  >
                    <option value="">Pilih kota</option>
                    <option value="Jakarta">Jakarta</option>
                    <option value="Surabaya">Surabaya</option>
                    <option value="Bandung">Bandung</option>
                    <option value="Yogyakarta">Yogyakarta</option>
                    <option value="Medan">Medan</option>
                  </select>
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
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor WhatsApp / Telepon
                  </label>
                  <div className="flex">
                    <span className="bg-gray-100 border border-gray-300 rounded-l-lg px-4 py-2 text-gray-600">
                      +62
                    </span>
                    <Input
                      type="text"
                      name="phoneNumber"
                      placeholder="812-3456-7890"
                      value={organizerData.phoneNumber}
                      onChange={handleOrganizerChange}
                      className="flex-1 rounded-l-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi Singkat Organisasi
                  </label>
                  <textarea
                    name="description"
                    placeholder="Ceritakan sedikit tentang visi atau fokus acara organisasi Anda..."
                    value={organizerData.description}
                    onChange={handleOrganizerChange}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>
              </div>

              {/* Preview Section */}
              <div>
                <Card className="p-6 sticky top-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">
                    PREVIEW PROFIL EO
                  </h3>
                  <div className="bg-gray-200 rounded-lg h-32 mb-4 flex items-center justify-center">
                    <span className="text-gray-500">Banner Preview</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {organizerData.organizationName || "Nama Organisasi Anda"}
                  </h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>📍 {organizerData.city || "Kota belum diisi"}</p>
                    <p>
                      🏢{" "}
                      {organizerData.organizationType || "Tipe belum dipilih"}
                    </p>
                  </div>
                </Card>
              </div>
            </div>
            <div className="flex gap-4 justify-between w-full mt-10 pt-6 border-t border-[#C3C5D9]">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
                className="px-8"
              >
                ← Kembali
              </Button>
              <Button
                onClick={handleSubmitProfile}
                className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-8"
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
        <div className="min-h-screen bg-gray-50 p-6 mt-20">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Lengkapi Profil Perusahaanmu
            </h1>

            <div className="grid grid-cols-3 gap-8">
              {/* Form Section */}
              <div className="col-span-2 space-y-6 p-6 bg-white rounded-[8px] shadow-sm border-1 border-[#C3C5D9]">
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
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industri
                  </label>
                  <select
                    name="industry"
                    value={sponsorData.industry}
                    onChange={handleSponsorChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  >
                    <option value="">Pilih industri</option>
                    <option value="Teknologi">Teknologi</option>
                    <option value="Finance">Finance</option>
                    <option value="Retail">Retail</option>
                    <option value="Manufaktur">Manufaktur</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kota Domisili
                  </label>
                  <select
                    name="city"
                    value={sponsorData.city}
                    onChange={handleSponsorChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  >
                    <option value="">Pilih kota</option>
                    <option value="Jakarta">Jakarta</option>
                    <option value="Surabaya">Surabaya</option>
                    <option value="Bandung">Bandung</option>
                    <option value="Yogyakarta">Yogyakarta</option>
                    <option value="Medan">Medan</option>
                  </select>
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
                    className="w-full"
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
                    className="w-full"
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
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Audiens Sponsorship
                  </label>
                  <textarea
                    name="targetAudience"
                    placeholder="Contoh: Developer profesional dan calon developer muda yang tertarik dengan AI dan teknologi modern"
                    value={sponsorData.targetAudience}
                    onChange={handleSponsorChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  />
                </div>
              </div>

              {/* Preview Section */}
              <div>
                <Card className="p-6 sticky top-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">
                    PRATINJAU PROFIL
                  </h3>
                  <div className="bg-gray-200 rounded-lg h-32 mb-4 flex items-center justify-center">
                    <span className="text-gray-500">Banner Preview</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {sponsorData.companyName || "Nama Perusahaan Anda"}
                  </h4>
                  <p className="text-xs text-gray-600 mb-1">
                    📍 {sponsorData.industry || "Industri belum dipilih"}
                  </p>
                  <p className="text-xs text-gray-600 mb-3">
                    🏙️ {sponsorData.city || "Kota belum diisi"}
                  </p>
                  {sponsorData.targetAudience && (
                    <div className="text-xs text-gray-600">
                      <p className="font-semibold mb-1">TARGET AUDIENS</p>
                      <p className="text-gray-500">
                        {sponsorData.targetAudience}
                      </p>
                    </div>
                  )}
                </Card>
              </div>
            </div>
            <div className="flex gap-4 justify-between w-full mt-10 pt-6 border-t border-[#C3C5D9]">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
                className="px-8"
              >
                ← Kembali
              </Button>
              <Button
                onClick={handleSubmitProfile}
                className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-8"
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

  // Step 3: Review/Confirmation (data already saved, just show summary)
  if (currentStep === 3) {
    return (
      <>
        <NavbarOnboarding />
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              Review Profil Anda
            </h1>

            <Card className="p-8 mb-8">
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
                      {sponsorData.targetAudience || "Tidak ada"}
                    </p>
                  </div>
                </div>
              )}
            </Card>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(2)}
                className="px-8"
              >
                ← Kembali Edit
              </Button>
              <Button
                onClick={() => setCurrentStep(4)}
                className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-8"
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
          <div className="w-full max-w-md p-12 text-center  ">
            <div className="mb-6 flex justify-center">
              <BadgeCheck size={58} className="text-[#003EC7]" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Profil Berhasil Disimpan!
            </h1>
            <p className="text-gray-600 mb-8">
              Akun Anda sudah siap. Selamat datang di EventHub untuk
              memaksimalkan kemampuan strategi dan mengalami acara dengan
              efisien.
            </p>

            <div className="flex gap-4">
              <Button variant="outline" className="flex-1">
                Lihat Panduan
              </Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                Buka Dashboard
              </Button>
            </div>
          </div>
          <div className="mb-8 flex items-center max-w-lg gap-3 pt-12 border-t border-gray-300">
            <div className="bg-white p-4 rounded-lg text-left text-sm">
              <p className="font-semibold text-blue-900 mb-1">
                🤖 AI DISCOVERY
              </p>
              <p className="text-blue-700 text-xs">
                Temukan partner event yang paling relevan dengan algoritma
                cerdas kami
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg text-left text-sm">
              <p className="font-semibold text-blue-900 mb-1">
                📊 REAL-TIME TRACKING
              </p>
              <p className="text-blue-700 text-xs">
                Pantau progres sponsorship dan metrik performance event secara
                real-time
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return null;
}
