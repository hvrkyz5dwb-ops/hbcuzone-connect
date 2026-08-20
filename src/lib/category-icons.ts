// Champagne-gold category artwork for the PlugU marketplace tiles.
// Replaces emoji with brand-matched black + gold imagery.
import hair from "@/assets/cat/hair.jpg";
import nails from "@/assets/cat/nails.jpg";
import food from "@/assets/cat/food.jpg";
import clothing from "@/assets/cat/clothing.jpg";
import dorm from "@/assets/cat/dorm.jpg";
import photo from "@/assets/cat/photo.jpg";
import design from "@/assets/cat/design.jpg";
import music from "@/assets/cat/music.jpg";
import events from "@/assets/cat/events.jpg";
import tutoring from "@/assets/cat/tutoring.jpg";
import rides from "@/assets/cat/rides.jpg";
import type { CategoryKey } from "./categories";

export const CATEGORY_IMAGES: Record<CategoryKey, string> = {
  hair, nails, food, clothing, dorm, photo, design, music, events, tutoring, rides,
};

export function categoryImage(key: string): string | undefined {
  return CATEGORY_IMAGES[key as CategoryKey];
}
