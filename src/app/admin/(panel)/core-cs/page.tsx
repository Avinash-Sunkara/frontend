"use client";
import { AdminTitle, TabbedAdmin } from "@/components/admin/bits";
import { PublishedBadge, ResourceManager } from "@/components/admin/ResourceManager";

const BASE = "/admin/core-cs";
export default function Page() {
  return (
    <>
      <AdminTitle title="Core CS content" sub="Category → Pattern → Topic → Notes & practice questions." />
      <TabbedAdmin tabs={[
        { id: "categories", label: "Categories", node: <ResourceManager<any> title="Categories" endpoint={`${BASE}/categories`} orderable
          columns={[{ key: "title", label: "Title" }, { key: "topicCount", label: "Topics" }] }
          fields={[{ name: "title", label: "Title", required: true, half: true }, { name: "slug", label: "Slug", half: true }, { name: "order", label: "Order number", type: "number", half: true }]} /> },
        { id: "patterns", label: "Patterns", node: <ResourceManager<any> title="Patterns" endpoint={`${BASE}/patterns`} orderable
          columns={[{ key: "title", label: "Title" }, { key: "categoryTitle", label: "Category" }, { key: "topicCount", label: "Topics" }]}
          fields={[{ name: "categoryId", label: "Category", required: true, optionsEndpoint: `${BASE}/categories`, half: true }, { name: "title", label: "Title", required: true, half: true }, { name: "order", label: "Order number", type: "number", half: true }]} /> },
        { id: "topics", label: "Topics & notes", node: <ResourceManager<any> title="Topics" endpoint={`${BASE}/topics`} publishable orderable
          columns={[{ key: "title", label: "Title" }, { key: "patternTitle", label: "Pattern" }, { key: "published", label: "Status", render: (r) => <PublishedBadge r={r} /> }]}
          fields={[{ name: "patternId", label: "Pattern", required: true, optionsEndpoint: `${BASE}/patterns`, half: true }, { name: "title", label: "Title", required: true, half: true }, { name: "summary", label: "Summary", type: "textarea" }, { name: "html", label: "Notes content (HTML)", type: "html", required: true }, { name: "order", label: "Order number", type: "number", half: true }, { name: "published", label: "Published", type: "switch" }]} /> },
        { id: "questions", label: "Practice questions", node: <ResourceManager<any> title="Questions" endpoint={`${BASE}/questions`} publishable orderable createDefaults={{ published: true }}
          columns={[{ key: "prompt", label: "Question", render: (r) => <span className="line-clamp-1 max-w-md">{String(r.prompt).replace(/<[^>]+>/g, "")}</span> }, { key: "topicTitle", label: "Topic" }, { key: "published", label: "Status", render: (r) => <PublishedBadge r={r} /> }]}
          fields={[{ name: "topicId", label: "Topic", required: true, optionsEndpoint: `${BASE}/topics`, half: true }, { name: "prompt", label: "Question", type: "html", required: true, hint: "Paste multiline code directly; it displays in a numbered code block." }, { name: "options", label: "Answer choices", type: "tags", required: true, hint: "Comma separated; enter 2–8 choices" }, { name: "answerIndex", label: "Correct choice (0 = first)", type: "number", required: true, half: true }, { name: "explanation", label: "Answer explanation", type: "html", hint: "Paste multiline code directly; it displays in a numbered code block." }, { name: "order", label: "Order number", type: "number", half: true }, { name: "published", label: "Published", type: "switch" }]} /> },
      ]} />
    </>
  );
}
