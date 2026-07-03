import { NextRequest, NextResponse } from "next/server";
import { getTranslation } from "@/lib/content";

// Returns the translated path for the current detail page, if one exists.
// Used by the Header language switch so the globe button works on every page:
// detail pages (recipes/journal/knowledge) navigate to their translated slug,
// other pages fall back to a cookie + refresh.
export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get("path") || "";
  const match = path.match(/^\/(recipes|journal|knowledge)\/([^/]+)$/);
  if (!match) {
    return NextResponse.json({ translatedPath: null });
  }
  const [, , slug] = match;
  const translation = getTranslation(decodeURIComponent(slug));
  if (!translation) {
    return NextResponse.json({ translatedPath: null });
  }
  const prefix =
    translation.type === "journal"
      ? "journal"
      : translation.type === "knowledge"
        ? "knowledge"
        : "recipes";
  return NextResponse.json({ translatedPath: `/${prefix}/${translation.slug}` });
}
