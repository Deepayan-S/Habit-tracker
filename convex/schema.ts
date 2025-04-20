import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  habits: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    targetDaysPerWeek: v.number(),
    color: v.optional(v.string()),
    editMode: v.optional(v.boolean()),
  })
    .index("by_user", ["userId"]),

  completions: defineTable({
    userId: v.id("users"),
    habitId: v.id("habits"),
    date: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_habit", ["habitId"])
    .index("by_habit_and_date", ["habitId", "date"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
