import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen flex">
      <Sidebar />
      <div className="flex flex-col flex-1 ml-64">
        <Navbar />
        {children}
      </div>
    </div>
  );
}
