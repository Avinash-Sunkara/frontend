"use client";
import { AdminTitle, TabbedAdmin } from "@/components/admin/bits";
import { AccessCell, PublishedBadge, ResourceManager, accessFields } from "@/components/admin/ResourceManager";

export default function Page() {
  return (<>
    <AdminTitle title="Roadmaps" sub="Roadmap → Sections → Topics → Subtopics → Resources. Pick a parent node to nest; attach any number of resources per node." />
    <TabbedAdmin tabs={[
      { id: "roadmaps", label: "Roadmaps", node: <ResourceManager<any> title="Roadmaps" endpoint="/admin/roadmaps" publishable orderable
        columns={[{ key: "title", label: "Title" }, { key: "sectionCount", label: "Sections" }, { key: "access", label: "Access", render: (r) => <AccessCell r={r} /> }, { key: "published", label: "Status", render: (r) => <PublishedBadge r={r} /> }]}
        fields={[{ name: "title", label: "Title", required: true, half: true }, { name: "icon", label: "Icon (emoji)", half: true }, { name: "description", label: "Description", type: "textarea" }, ...accessFields, { name: "published", label: "Published", type: "switch" }]} /> },
      { id: "nodes", label: "Sections & topics", node: <ResourceManager<any> title="Nodes" endpoint="/admin/roadmaps/nodes" orderable
        columns={[{ key: "title", label: "Title" }, { key: "roadmapTitle", label: "Roadmap" }, { key: "parentTitle", label: "Parent" }, { key: "level", label: "Level" }]}
        fields={[{ name: "roadmapId", label: "Roadmap", required: true, optionsEndpoint: "/admin/roadmaps", half: true }, { name: "parentId", label: "Parent section (blank = top-level section)", optionsEndpoint: "/admin/roadmaps/nodes", half: true },
          { name: "title", label: "Title", required: true, half: true }, { name: "icon", label: "Icon", half: true }, { name: "order", label: "Order number", type: "number", half: true }]} /> },
      { id: "resources", label: "Resources", node: <ResourceManager<any> title="Resources" endpoint="/admin/roadmaps/resources" orderable
        columns={[{ key: "title", label: "Title" }, { key: "type", label: "Type" }, { key: "nodeTitle", label: "Node" }]}
        fields={[{ name: "nodeId", label: "Topic (a node that has a parent section)", required: true, optionsEndpoint: "/admin/roadmaps/nodes", half: true },
          { name: "type", label: "Type", type: "select", required: true, half: true, options: [{ value: "link", label: "Link" }, { value: "video", label: "YouTube video" }, { value: "pdf", label: "PDF" }, { value: "image", label: "Image" }, { value: "text", label: "Text" }] },
          { name: "title", label: "Title", required: true }, { name: "url", label: "URL", type: "url", showIf: (v) => v.type === "link" || v.type === "video" },
          { name: "content", label: "Content (HTML)", type: "html", showIf: (v) => v.type === "text" },
          { name: "file", label: "File", type: "file", accept: "application/pdf,image/*", showIf: (v) => v.type === "pdf" || v.type === "image" },
          { name: "order", label: "Order number", type: "number", half: true }]} /> },
    ]} />
  </>);
}
