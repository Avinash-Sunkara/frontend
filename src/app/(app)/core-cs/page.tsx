import { ContentBrowser } from "@/components/features/ContentBrowser";
export const metadata = { title: "Core CS" };
export default function Page() { return <ContentBrowser base="/core-cs" searchPlaceholder="Search topics — e.g. polymorphism, JOIN, deadlock…" withPractice />; }
