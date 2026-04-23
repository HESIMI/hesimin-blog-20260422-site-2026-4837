import { TagWallBoard } from "@/components/tags/tag-wall-board";
import { getAllTags } from "@/lib/db";
import { DEFAULT_TAG_NAMES } from "@/lib/default-tags";

export const dynamic = "force-dynamic";

export default async function TagsPage() {
  let initialTags = [] as Awaited<ReturnType<typeof getAllTags>>;

  try {
    initialTags = await getAllTags();
  } catch (error) {
    console.error("[/tags] failed to load tags:", error);
  }

  if (initialTags.length === 0) {
    initialTags = DEFAULT_TAG_NAMES.map((name, index) => ({
      id: index + 1,
      name,
      count: 0,
      isDefault: true,
      createdAt: "",
      updatedAt: "",
    }));
  }

  return <TagWallBoard initialTags={initialTags} />;
}
