import { getAllContent } from "@/lib/content";
import { SearchPageClient } from "./SearchPageClient";

export const dynamic = "force-static";

export default function SearchPage() {
  const allContent = getAllContent();
  return <SearchPageClient allContent={allContent} />;
}
