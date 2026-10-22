import { pgTable, text, jsonb } from "drizzle-orm/pg-core";

export const foodCategories = pgTable("food_categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const foodItems = pgTable("food_items", {
  id: text("id").primaryKey(),
  categoryId: text("category_id").notNull().references(() => foodCategories.id),
  name: text("name").notNull(),
  image: text("image").notNull(),
  description: text("description").notNull().default(""),
  options: jsonb("options").$type<Record<string, string>[]>().notNull(),
});
