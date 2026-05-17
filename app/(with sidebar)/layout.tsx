import SidebarSwitcher from "@/components/sidebar-switcher";
import Navbar from "@/components/navbar";
import OnboardingGuard from "@/components/onboarding-guard";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen flex">
      <OnboardingGuard />
      <SidebarSwitcher />
      <div className="flex flex-col flex-1 ml-64">
        <Navbar />
        {children}
      </div>
    </div>
  );
}
