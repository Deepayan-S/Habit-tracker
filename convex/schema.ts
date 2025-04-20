import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const applicationTables = {
  habits: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    targetDaysPerWeek: v.number(),
    color: v.optional(v.string()), // Make optional for migration
    editMode: v.optional(v.boolean()), // Make optional for migration
  }).index("by_user", ["userId"]),
  
  completions: defineTable({
    habitId: v.id("habits"),
    userId: v.id("users"),
    date: v.string(), // YYYY-MM-DD format
  })
    .index("by_habit", ["habitId"])
    .index("by_user_and_date", ["userId", "date"])
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
