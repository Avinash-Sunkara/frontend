import { ContentBrowser } from "@/components/features/ContentBrowser";
export const metadata = { title: "Aptitude" };
export default function Page() { return <ContentBrowser base="/aptitude" searchPlaceholder="Search aptitude topics — e.g. percentage, probability…" withPractice />; }
