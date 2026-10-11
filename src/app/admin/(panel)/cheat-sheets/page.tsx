"use client";
import { AdminTitle } from "@/components/admin/bits";
import { AccessCell, PublishedBadge, ResourceManager, accessFields } from "@/components/admin/ResourceManager";

const CATS = ["DSA", "Java", "SQL", "DBMS", "OS", "CN", "Aptitude", "Git & GitHub"].map((c) => ({ value: c, label: `${c} Cheat Sheet` }));
export default function Page() {
  return (<>
    <AdminTitle title="Cheat sheets" />
    <ResourceManager<any> title="Cheat sheets" endpoint="/admin/cheat-sheets" publishable
      columns={[{ key: "title", label: "Title" }, { key: "category", label: "Category" }, { key: "access", label: "Access", render: (r) => <AccessCell r={r} /> }, { key: "published", label: "Status", render: (r) => <PublishedBadge r={r} /> }]}
      fields={[{ name: "title", label: "Title", required: true }, { name: "category", label: "Category", type: "select", options: CATS, required: true }, { name: "description", label: "Description", type: "textarea" },
        { name: "file", label: "PDF or image", type: "file", accept: "application/pdf,image/*" }, { name: "html", label: "Or formatted content", type: "html" }, { name: "preview", label: "Preview image", type: "file", accept: "image/*" }, ...accessFields, { name: "published", label: "Published", type: "switch" }]} />
  </>);
}
