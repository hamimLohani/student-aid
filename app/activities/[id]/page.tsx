import ActivityDetailClient from "./ActivityClient";

export async function generateStaticParams() {
  return [];
}

export default function ActivityPage() {
  return <ActivityDetailClient />;
}
