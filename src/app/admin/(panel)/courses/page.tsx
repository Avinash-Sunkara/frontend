"use client";
import { AdminTitle } from "@/components/admin/bits";
import { PublishedBadge, ResourceManager } from "@/components/admin/ResourceManager";

export default function Page() {
  return (<>
    <AdminTitle title="Courses" sub="Shown in the Courses section of the landing page once published. The button links to wherever you take enrolments (a form, WhatsApp, a payment page); with no link it sends visitors to sign-up." />
    <ResourceManager<any> title="Courses" endpoint="/admin/courses" publishable orderable
      columns={[{ key: "title", label: "Title" }, { key: "level", label: "Level" }, { key: "priceLabel", label: "Price" }, { key: "published", label: "Status", render: (r) => <PublishedBadge r={r} /> }]}
      fields={[{ name: "title", label: "Title", required: true }, { name: "description", label: "Description", type: "textarea", required: true },
        { name: "level", label: "Level", half: true, hint: "e.g. Beginner" }, { name: "duration", label: "Duration", half: true, hint: "e.g. 8 weeks" },
        { name: "priceLabel", label: "Price text", half: true, hint: "e.g. ₹4,999 or Free" }, { name: "ctaLabel", label: "Button label", half: true, hint: "e.g. Enrol now" },
        { name: "ctaUrl", label: "Button link", type: "url", hint: "Must start with https://" },
        { name: "highlights", label: "Highlights", type: "textarea", hint: "One per line, up to 8" },
        { name: "thumbnail", label: "Thumbnail image", type: "file", accept: "image/*" }, { name: "published", label: "Published", type: "switch" }]} />
  </>);
}
