import MemberProfileClient from "./MemberClient";

export async function generateStaticParams() {
  return [];
}

export default function MemberPage() {
  return <MemberProfileClient />;
}
