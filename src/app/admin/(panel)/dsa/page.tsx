"use client";
import { AdminTitle, TabbedAdmin } from "@/components/admin/bits";
import { AccessCell, PublishedBadge, ResourceManager, selectedOnlyFields } from "@/components/admin/ResourceManager";
import { Badge } from "@/components/ui/kit";

const diff = [{ value: "Easy", label: "Easy" }, { value: "Medium", label: "Medium" }, { value: "Hard", label: "Hard" }];
export default function Page() {
  return (
    <>
      <AdminTitle title="DSA content" sub="Sheet → Topic → Subtopic → Problem. Problems link to the official LeetCode URL you provide — nothing is scraped." />
      <TabbedAdmin tabs={[
        { id: "sheets", label: "Sheets", node: <ResourceManager<any> title="Sheets" endpoint="/admin/dsa/sheets" publishable orderable
          columns={[{ key: "title", label: "Title" }, { key: "topicCount", label: "Topics" }, { key: "problemCount", label: "Problems" }, { key: "published", label: "Status", render: (r) => <PublishedBadge r={r} /> }]}
          fields={[{ name: "title", label: "Title", required: true }, { name: "slug", label: "Slug", half: true }, { name: "order", label: "Order number", type: "number", half: true }, { name: "description", label: "Description", type: "textarea" }, { name: "published", label: "Published", type: "switch" }]} /> },
        { id: "topics", label: "Topics", node: <ResourceManager<any> title="Topics" endpoint="/admin/dsa/topics" orderable
          columns={[{ key: "title", label: "Title" }, { key: "sheetTitle", label: "Sheet" }, { key: "problemCount", label: "Problems" }] }
          fields={[{ name: "sheetId", label: "Sheet", required: true, optionsEndpoint: "/admin/dsa/sheets", half: true }, { name: "title", label: "Title", required: true, half: true }, { name: "description", label: "Description (shown under topic)", type: "textarea" }, { name: "order", label: "Order number", type: "number", half: true }]} /> },
        { id: "subtopics", label: "Subtopics", node: <ResourceManager<any> title="Subtopics" endpoint="/admin/dsa/subtopics" orderable
          columns={[{ key: "title", label: "Title" }, { key: "topicTitle", label: "Topic" }, { key: "problemCount", label: "Problems" }]}
          fields={[{ name: "topicId", label: "Topic", required: true, optionsEndpoint: "/admin/dsa/topics", half: true }, { name: "title", label: "Title", required: true, half: true }, { name: "description", label: "When to use it", type: "textarea", hint: "Shown as the cue under the subtopic" }, { name: "tip", label: "Tip", type: "textarea" }, { name: "order", label: "Order number", type: "number", half: true }]} /> },
        { id: "problems", label: "Problems", node: <ResourceManager<any> title="Problems" endpoint="/admin/dsa/problems" publishable orderable
          columns={[{ key: "number", label: "#", className: "w-12" }, { key: "title", label: "Title" }, { key: "difficulty", label: "Difficulty", render: (r) => <Badge tone={r.difficulty === "Easy" ? "easy" : r.difficulty === "Medium" ? "medium" : "hard"}>{r.difficulty}</Badge> }, { key: "topicTitle", label: "Topic" }, { key: "access", label: "Access", render: (r) => <AccessCell r={r} /> }, { key: "published", label: "Status", render: (r) => <PublishedBadge r={r} /> }]}
          fields={[
            { name: "title", label: "Title", required: true }, { name: "difficulty", label: "Difficulty", type: "select", options: diff, required: true, half: true }, { name: "order", label: "Order number", type: "number", half: true },
            { name: "topicId", label: "Topic", optionsEndpoint: "/admin/dsa/topics", required: true, half: true }, { name: "subtopicId", label: "Subtopic", optionsEndpoint: "/admin/dsa/subtopics", half: true },
            { name: "pattern", label: "Pattern", half: true }, { name: "tags", label: "Tags", type: "tags", half: true },
            { name: "leetcodeUrl", label: "LeetCode URL", type: "url", half: true, hint: "Exact official URL, e.g. https://leetcode.com/problems/valid-palindrome/" }, { name: "gfgUrl", label: "GeeksforGeeks URL", type: "url", half: true }, { name: "youtubeUrl", label: "YouTube URL", type: "url", half: true },
            { name: "companyIds", label: "Companies", type: "multiselect", optionsEndpoint: "/admin/companies", optionLabel: "name" },
            { name: "description", label: "Description", type: "html" }, { name: "quickNotes", label: "Quick revision notes", type: "html" }, { name: "adminNotes", label: "Admin notes (private)", type: "textarea" },
            { name: "hints", label: "Hints", type: "tags", hint: "Comma separated, in reveal order" },
            { name: "images", label: "Images", type: "file", accept: "image/*", multiple: true },
            ...selectedOnlyFields, { name: "published", label: "Published", type: "switch" }]} /> },
        { id: "companies", label: "Companies", node: <ResourceManager<any> title="Companies" endpoint="/admin/companies" orderable={false}
          columns={[{ key: "name", label: "Name" }, { key: "logoUrl", label: "Logo", render: (r) => r.logoUrl ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={r.logoUrl} alt="" className="h-7 w-7 rounded-full bg-white object-contain p-0.5" /> : "—" }]}
          fields={[{ name: "name", label: "Company name", required: true }, { name: "logo", label: "Logo (official asset)", type: "file", accept: "image/*" }]} /> },
      ]} />
    </>
  );
}
