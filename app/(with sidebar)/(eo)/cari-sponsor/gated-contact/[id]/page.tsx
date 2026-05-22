import GatedContactDetail from "@/components/cari-sponsor/gated-contact";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function GatedContactPage({ params }: PageProps) {
  const { id } = await params;
  return <GatedContactDetail offerId={id} />;
}
