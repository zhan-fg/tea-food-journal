import type { MetadataRoute } from "next";
import { getAllContent } from "@/lib/content";
import { listAllTags, listAllIngredients, listAllEquipment, listAllCategories } from "@/lib/utils";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tea-food-journal.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const all = getAllContent();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/search`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
  ];

  const contentRoutes: MetadataRoute.Sitemap = all.map((item) => {
    const typePath =
      item.type === "journal"
        ? "journal"
        : item.type === "knowledge"
          ? "knowledge"
          : "recipes";
    return {
      url: `${BASE_URL}/${typePath}/${item.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: item.type === "recipe" ? 0.8 : 0.6,
    };
  });

  const tagRoutes = listAllTags(all).map((tag) => ({
    url: `${BASE_URL}/tags/${encodeURIComponent(tag)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.4,
  }));

  const ingredientRoutes = listAllIngredients(all).map((ing) => ({
    url: `${BASE_URL}/ingredients/${encodeURIComponent(ing)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  const equipmentRoutes = listAllEquipment(all).map((equip) => ({
    url: `${BASE_URL}/equipment/${encodeURIComponent(equip)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.4,
  }));

  const categoryRoutes = listAllCategories(all).map((cat) => ({
    url: `${BASE_URL}/categories/${encodeURIComponent(cat)}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...contentRoutes, ...tagRoutes, ...ingredientRoutes, ...equipmentRoutes, ...categoryRoutes];
}
