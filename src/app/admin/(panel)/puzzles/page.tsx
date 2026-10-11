"use client";
import { AdminTitle } from "@/components/admin/bits";
import { PublishedBadge, ResourceManager } from "@/components/admin/ResourceManager";

export default function Page() {
  return (<>
    <AdminTitle title="Puzzles" sub="Free for everyone once published. Description and solution accept plain text or HTML." />
    <ResourceManager<any> title="Puzzles" endpoint="/admin/puzzles" publishable orderable
      columns={[{ key: "title", label: "Title" }, { key: "pattern", label: "Type" }, { key: "difficulty", label: "Difficulty" }, { key: "published", label: "Status", render: (r) => <PublishedBadge r={r} /> }]}
      fields={[{ name: "title", label: "Title", required: true }, { name: "description", label: "Puzzle", type: "html", required: true },
        { name: "difficulty", label: "Difficulty", type: "select", required: true, half: true, options: ["Easy", "Medium", "Hard"].map((d) => ({ value: d, label: d })) }, { name: "pattern", label: "Type", half: true, hint: "e.g. Probability" },
        { name: "hints", label: "Hints", type: "textarea", hint: "One per line, up to 10" }, { name: "solution", label: "Solution", type: "html" },
        { name: "image", label: "Image", type: "file", accept: "image/*" }, { name: "published", label: "Published", type: "switch" }]} />
  </>);
}
