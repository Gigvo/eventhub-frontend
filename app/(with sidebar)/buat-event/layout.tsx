"use client";
import React from "react";
import { usePathname } from "next/navigation";

export default function BuatEventLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const steps = [
    { number: 1, title: "Info Dasar", path: "/buat-event/info-dasar" },
    {
      number: 2,
      title: "Detail Event & Audiens",
      path: "/buat-event/detail-event-audiens",
    },
    {
      number: 3,
      title: "Paket Sponsorship",
      path: "/buat-event/paket-sponsorship",
    },
  ];

  const currentStep = steps.find((step) => pathname === step.path)?.number || 1;

  return (
    <div className="min-h-screen">
      {/* Stepper */}
      <div className="bg-white py-6">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              {/* Step */}
              <div className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition ${
                    step.number === currentStep
                      ? "bg-blue-600 text-white"
                      : step.number < currentStep
                        ? "bg-green-600 text-white"
                        : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {step.number < currentStep ? "✓" : step.number}
                </div>
                <p className="mt-2 text-sm font-medium text-gray-700">
                  {step.title}
                </p>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-4 transition ${
                    step.number < currentStep ? "bg-green-600" : "bg-gray-300"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-8">{children}</div>
    </div>
  );
}
