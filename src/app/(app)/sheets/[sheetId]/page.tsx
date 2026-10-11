import { redirect } from "next/navigation";
export default async function Page({ params }: { params: Promise<{ sheetId: string }> }) {
  const { sheetId } = await params;
  redirect(`/sheets?sheet=${encodeURIComponent(sheetId)}`);
}
