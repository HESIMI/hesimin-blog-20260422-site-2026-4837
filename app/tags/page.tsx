import { TagWallBoard } from "@/components/tags/tag-wall-board";
import { getAllTags } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function TagsPage() {
  let initialTags = [] as Awaited<ReturnType<typeof getAllTags>>;

  try {
    initialTags = await getAllTags();
  } catch (error) {
    console.error("[/tags] failed to load tags:", error);
  }

  return <TagWallBoard initialTags={initialTags} />;
}
