"use client";
import { AdminTitle } from "@/components/admin/bits";
import { AccessCell, PublishedBadge, ResourceManager, accessFields } from "@/components/admin/ResourceManager";

const CATS = ["DSA", "SQL", "DBMS", "Operating Systems", "Computer Networks", "Java", "Python", "Aptitude", "Reasoning", "Interview Preparation"].map((c) => ({ value: c, label: c }));
export default function Page() {
  return (<>
    <AdminTitle title="Notes" sub="Upload PDFs or images, or write formatted notes. Users read them in the protected viewer — files are never exposed for download." />
    <ResourceManager<any> title="Notes" endpoint="/admin/notes" publishable
      columns={[{ key: "title", label: "Title" }, { key: "category", label: "Category" }, { key: "access", label: "Access", render: (r) => <AccessCell r={r} /> }, { key: "published", label: "Status", render: (r) => <PublishedBadge r={r} /> }]}
      fields={[{ name: "title", label: "Title", required: true }, { name: "category", label: "Category", type: "select", options: CATS, required: true, half: true }, { name: "externalUrl", label: "External URL (optional)", type: "url", half: true },
        { name: "description", label: "Description", type: "textarea" }, { name: "file", label: "PDF or images", type: "file", accept: "application/pdf,image/*", multiple: true, hint: "Upload one PDF, or several images in page order" },
        { name: "html", label: "Formatted content (optional)", type: "html" }, { name: "preview", label: "Preview image", type: "file", accept: "image/*" }, ...accessFields, { name: "published", label: "Published", type: "switch" }]} />
  </>);
}
