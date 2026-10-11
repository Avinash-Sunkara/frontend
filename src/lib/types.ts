export type Access = "FREE" | "PRIVATE" | "PREMIUM";
export type Difficulty = "Easy" | "Medium" | "Hard";
export interface Page<T> { items: T[]; total: number; page: number; pageSize: number; nextPage?: number | null }

export interface User {
  id: string; fullName: string; username: string; email: string; avatarUrl?: string;
  role: "USER" | "ADMIN"; streak?: number; blocked?: boolean; createdAt?: string; lastActiveAt?: string; mustChangePassword?: boolean;
}
export interface Company { id: string; name: string; logoUrl?: string }
export interface Problem {
  id: string; number: number; title: string; slug?: string; difficulty: Difficulty;
  topic?: string; subtopic?: string; pattern?: string; companies: Company[]; description?: string; hints?: string[];
  leetcodeUrl?: string; gfgUrl?: string; youtubeUrl?: string; quickNotes?: string; tags?: string[]; images?: string[];
  access?: Access; locked?: boolean; price?: number;
  state?: { solved: boolean; bookmarked: boolean; revision: boolean; hintUsed: boolean; note?: string };
}
export interface Subtopic { id: string; title: string; description?: string; tip?: string; problemCount: number; solvedCount: number }
export interface Topic { id: string; title: string; description?: string; problemCount: number; solvedCount: number; subtopics?: Subtopic[] }
export interface Sheet { id: string; title: string; slug: string; description?: string; topicCount: number; problemCount: number; solvedCount: number }
export interface SheetsOverview {
  sheets: Sheet[]; totals: { sheets: number; topics: number; problems: number; solved: number };
  difficulty: Record<Difficulty, { solved: number; total: number }>;
}
export interface CoreCategory { id: string; slug: string; title: string; topicCount: number; icon?: string }
export interface CorePattern { id: string; title: string; topics: { id: string; title: string; slug: string; completed?: boolean }[] }
export interface Heading { id: string; text: string; level: number }
export interface ContentTopic {
  id: string; title: string; slug: string; patternTitle?: string; summary?: string;
  html: string; headings?: Heading[]; practiceCount?: number; completed?: boolean; locked?: boolean; access?: Access; price?: number;
}
export interface Question {
  id: string; prompt: string; options?: string[]; answerIndex?: number; explanation?: string;
  solved?: boolean; selected?: number;
}
export interface NoteItem {
  id: string; title: string; description?: string; category: string; previewUrl?: string;
  access: Access; price?: number; locked: boolean; pages?: number; updatedAt?: string;
}
export interface NoteViewer { id: string; title: string; pageCount: number; pageUrlTemplate?: string; watermark?: string; searchable?: boolean; kind: "pdf" | "images" | "html"; html?: string; pdfPath?: string }
export interface RoadmapNode {
  id: string; title: string; description?: string; icon?: string; completed?: boolean;
  resources?: { id: string; type: "link" | "video" | "pdf" | "image" | "text"; title: string; url?: string; content?: string }[];
  children?: RoadmapNode[];
}
export interface Roadmap { id: string; title: string; description?: string; icon?: string; sectionCount: number; completion: number; access: Access; locked: boolean; price?: number; sections?: RoadmapNode[] }
export interface CheatSheet { id: string; title: string; category: string; description?: string; previewUrl?: string; access: Access; locked: boolean; price?: number; html?: string; fileUrl?: string }
export interface Interview {
  id: string; company: string; role: string; level?: string; difficulty: Difficulty; rounds: number;
  status: "Selected" | "Rejected" | "Pending"; title: string; summary?: string; tags: string[];
  likes: number; comments: number; liked?: boolean; createdAt: string; author?: string; edited?: boolean;
  background?: string; roundDetails?: { title: string; body: string }[]; questions?: string[]; verdict?: string;
}
export interface Comment { id: string; author: string; body: string; createdAt: string; mine?: boolean }
type Rec = { solved: number; total: number };
export interface DashboardData {
  progress: { solved: number; total: number; easy: Rec; medium: Rec; hard: Rec };
  streak: { current: number; longest: number }; studyMinutes: number;
  counts: { bookmarks: number; revision: number; notes: number };
  today: string;
  contributions: { date: string; count: number }[]; contributionTotal: number;
  continueLearning: { title: string; href: string; progress: number; kind: string }[];
  todaysPlan: { id: string; title: string; href: string; done: boolean }[];
  recentlySolved: Problem[]; recommended: Problem[]; revisionDue: Problem[];
  latestNotes: NoteItem[]; newRoadmaps: Roadmap[]; latestInterviews: Interview[];
}
export interface SearchResults {
  problems: Problem[]; topics: { id: string; title: string; href: string }[]; companies: Company[];
  notes: NoteItem[]; roadmaps: Roadmap[]; cheatSheets: CheatSheet[]; interviews: Interview[];
}
export interface PopupNotification { id: string; title: string; message?: string; type: "info" | "success" | "warning"; durationMs?: number }
export interface PaymentInit { paymentUrl: string; orderId: string; provider?: string; reference?: string; checkout?: { provider: string; orderId: string; keyId: string; amount: number; currency: string } }
export interface PuzzleItem { id: string; title: string; slug: string; difficulty: Difficulty; pattern?: string; imageUrl?: string }
export interface Puzzle extends PuzzleItem { description: string; hints: string[]; solution?: string }
export interface PuzzlePattern { pattern: string; count: number }
export interface Course {
  id: string; title: string; description: string; thumbnailUrl?: string; level?: string; duration?: string; priceLabel?: string;
  highlights: string[]; ctaLabel?: string; ctaUrl?: string;
}
