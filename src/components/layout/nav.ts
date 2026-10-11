import { LayoutDashboard, ListChecks, Database, Calculator, Map, NotebookPen, FileText, MessagesSquare, Puzzle, RotateCcw, Bookmark, Activity, UserRound } from "lucide-react";
export const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/sheets", label: "DSA Sheets", icon: ListChecks },
  { href: "/core-cs", label: "Core CS", icon: Database },
  { href: "/aptitude", label: "Aptitude", icon: Calculator },
  { href: "/roadmaps", label: "Roadmaps", icon: Map },
  { href: "/puzzles", label: "Puzzles", icon: Puzzle },
  { href: "/notes", label: "Notes", icon: NotebookPen },
  { href: "/cheat-sheets", label: "Cheat Sheets", icon: FileText },
  { href: "/interviews", label: "Interview Experiences", icon: MessagesSquare },
  { href: "/revision", label: "Revision", icon: RotateCcw },
  { href: "/bookmarks", label: "Bookmarks", icon: Bookmark },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/profile", label: "Profile", icon: UserRound },
] as const;
