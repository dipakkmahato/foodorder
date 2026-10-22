import type { Config } from "@netlify/functions";

export default async () => Response.json({
  success: true,
  message: "KhanaOrders menu API is running",
});

export const config: Config = { path: "/api/health", method: "GET" };
