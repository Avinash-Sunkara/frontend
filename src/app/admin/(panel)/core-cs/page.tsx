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
      ]} />
    </>
  );
}
