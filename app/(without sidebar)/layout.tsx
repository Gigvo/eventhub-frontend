import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EventHub",
  description: "Connecting Organizers with Global Sponsors",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
