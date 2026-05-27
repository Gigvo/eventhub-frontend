"use client";

import SidebarSwitcher from "@/components/sidebar-switcher";
import Navbar from "@/components/navbar";
import OnboardingGuard from "@/components/onboarding-guard";
import { SidebarProvider, useSidebar } from "@/components/sidebar-provider";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isOpen, isCollapsed, close } = useSidebar();

  return (
    <div className="min-h-screen flex relative overflow-x-hidden">
      <OnboardingGuard />

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={close}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden transition-opacity duration-300"
        />
      )}

      <SidebarSwitcher />

      <div className={`flex flex-col flex-1 min-h-screen transition-all duration-300 min-w-0 ${
        isCollapsed ? "md:pl-20" : "md:pl-64"
      }`}>
        <Navbar />
        <main className="flex-1 w-full min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
}
