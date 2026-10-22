import type { Config } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { getDb } from "../../db/index.js";
import { foodCategories, foodItems } from "../../db/schema.js";

export default async (request: Request) => {
  if (request.method !== "GET" && request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, {
      status: 405, headers: { Allow: "GET, POST" },
    });
  }

  try {
    const db = getDb();
    const items = await db.select({
      _id: foodItems.id,
      CategoryName: foodCategories.name,
      name: foodItems.name,
      img: foodItems.image,
      description: foodItems.description,
      options: foodItems.options,
    }).from(foodItems)
      .innerJoin(foodCategories, eq(foodItems.categoryId, foodCategories.id))
      .orderBy(foodItems.name);
    const categories = await db.select({
      _id: foodCategories.id,
      CategoryName: foodCategories.name,
    }).from(foodCategories).orderBy(foodCategories.name);

    return Response.json([items, categories], {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    console.error("Food menu database query failed");
    return Response.json({ error: "Menu temporarily unavailable. Please try again." }, {
      status: 503, headers: { "Cache-Control": "no-store" },
    });
  }
};

export const config: Config = { path: "/api/foodData" };
