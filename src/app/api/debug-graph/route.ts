import { NextResponse } from "next/server";
import { getAllContent, getKnowledgeGraph, getByEquipment, getByTag } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function GET() {
  const all = getAllContent();
  const graph = getKnowledgeGraph();

  const testEquipment = "养生壶";
  const testTag = "暖身";

  const eqResult = getByEquipment(testEquipment);
  const tagResult = getByTag(testTag);

  return NextResponse.json({
    equipmentKeys: [...graph.equipmentIndex.keys()],
    testEquipment,
    eqResultCount: eqResult.length,
    eqResultSlugs: eqResult.map((c) => c.slug),
    tagKeys: [...graph.tagIndex.keys()],
    testTag,
    tagResultCount: tagResult.length,
    tagResultSlugs: tagResult.map((c) => c.slug),
  });
}
