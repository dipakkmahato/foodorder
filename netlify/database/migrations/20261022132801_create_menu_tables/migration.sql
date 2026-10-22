CREATE TABLE "food_categories" (
	"id" text PRIMARY KEY,
	"name" text NOT NULL UNIQUE
);
--> statement-breakpoint
CREATE TABLE "food_items" (
	"id" text PRIMARY KEY,
	"category_id" text NOT NULL,
	"name" text NOT NULL,
	"image" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"options" jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "food_items" ADD CONSTRAINT "food_items_category_id_food_categories_id_fkey" FOREIGN KEY ("category_id") REFERENCES "food_categories"("id");