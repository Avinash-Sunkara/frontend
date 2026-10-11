import type { MetadataRoute } from "next";
import { BRAND } from "@/config/brand";
export default function manifest(): MetadataRoute.Manifest {
  return { name: BRAND.name, short_name: BRAND.name, start_url: "/dashboard", display: "standalone", background_color: "#090a0c", theme_color: "#090a0c", icons: [{ src: "/icon.png", sizes: "768x768", type: "image/png" }] };
}
