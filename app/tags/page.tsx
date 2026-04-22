import { TagWallBoard } from "@/components/tags/tag-wall-board";
import { getAllTags } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function TagsPage() {
  const initialTags = await getAllTags();
  return <TagWallBoard initialTags={initialTags} />;
}
