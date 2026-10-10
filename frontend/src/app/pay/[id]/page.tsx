import { PayView } from "@/components/PayView";

export default async function PayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PayView idStr={id} />;
}
