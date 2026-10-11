"use client";
import { AdminTitle, TabbedAdmin } from "@/components/admin/bits";
import { PublishedBadge, ResourceManager } from "@/components/admin/ResourceManager";

const BASE = "/admin/aptitude";
export default function Page() {
  return (
    <>
      <AdminTitle title="Aptitude content" sub="Category → Pattern → Topic → Notes & practice questions." />
      <TabbedAdmin tabs={[
        { id: "categories", label: "Categories", node: <ResourceManager<any> title="Categories" endpoint={`${BASE}/categories`} orderable
          columns={[{ key: "title", label: "Title" }, { key: "topicCount", label: "Topics" }] }
          fields={[{ name: "title", label: "Title", required: true, half: true }, { name: "slug", label: "Slug", half: true }, { name: "order", label: "Order number", type: "number", half: true }]} /> },
        { id: "topics", label: "Topics & notes", node: <ResourceManager<any> title="Topics" endpoint={`${BASE}/topics`} publishable orderable
          columns={[{ key: "title", label: "Title" }, { key: "categoryTitle", label: "Category" }, { key: "published", label: "Status", render: (r) => <PublishedBadge r={r} /> }]}
          fields={[{ name: "categoryId", label: "Category", required: true, optionsEndpoint: `${BASE}/categories`, half: true }, { name: "title", label: "Title", required: true, half: true }, { name: "html", label: "Notes content (HTML)", type: "html", required: true }, { name: "order", label: "Order number", type: "number", half: true }, { name: "published", label: "Published", type: "switch" }]} /> },
        { id: "questions", label: "Practice questions", node: <ResourceManager<any> title="Questions" endpoint={`${BASE}/questions`}
          columns={[{ key: "prompt", label: "Question", render: (r) => <span className="line-clamp-1 max-w-md">{String(r.prompt).replace(/<[^>]+>/g, "")}</span> }, { key: "topicTitle", label: "Topic" }]}
          fields={[{ name: "topicId", label: "Topic", required: true, optionsEndpoint: `${BASE}/topics`, half: true }, { name: "prompt", label: "Question", type: "html", required: true }, { name: "options", label: "Options", type: "tags", hint: "Comma separated" }, { name: "answerIndex", label: "Correct option number (0 = first)", type: "number", half: true }, { name: "explanation", label: "Explanation", type: "html" }] } /> },
      ]} />
    </>
  );
}
