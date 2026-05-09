"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function BuatEventPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/buat-event/info-dasar");
  }, [router]);

  return null;
}
