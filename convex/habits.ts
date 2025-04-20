import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    targetDaysPerWeek: v.number(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    
    return await ctx.db.insert("habits", {
      userId,
      name: args.name,
      description: args.description,
      targetDaysPerWeek: args.targetDaysPerWeek,
      color: args.color,
      editMode: false,
    });
  },
});

export const list = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    
    return await ctx.db
      .query("habits")
      .withIndex("by_user", q => q.eq("userId", userId))
      .collect();
  },
});

export const toggleEditMode = mutation({
  args: {
    habitId: v.id("habits"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const habit = await ctx.db.get(args.habitId);
    if (!habit || habit.userId !== userId) throw new Error("Habit not found");

    await ctx.db.patch(args.habitId, {
      editMode: !habit.editMode,
    });
  },
});

export const update = mutation({
  args: {
    habitId: v.id("habits"),
    name: v.string(),
    description: v.optional(v.string()),
    targetDaysPerWeek: v.number(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const habit = await ctx.db.get(args.habitId);
    if (!habit || habit.userId !== userId) throw new Error("Habit not found");

    await ctx.db.patch(args.habitId, {
      name: args.name,
      description: args.description,
      targetDaysPerWeek: args.targetDaysPerWeek,
      color: args.color,
    });
  },
});

export const toggleCompletion = mutation({
  args: {
    habitId: v.id("habits"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const habit = await ctx.db.get(args.habitId);
    if (!habit || habit.userId !== userId) throw new Error("Habit not found");

    // Only allow toggling if in edit mode or if it's today's date
    const today = new Date().toISOString().split('T')[0];
    if (!habit.editMode && args.date !== today) {
      throw new Error("Cannot modify past dates unless in edit mode");
    }

    const existing = await ctx.db
      .query("completions")
      .withIndex("by_user_and_date", q => 
        q.eq("userId", userId).eq("date", args.date)
      )
      .filter(q => q.eq(q.field("habitId"), args.habitId))
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
    } else {
      await ctx.db.insert("completions", {
        habitId: args.habitId,
        userId,
        date: args.date,
      });
    }
  },
});

export const getCompletions = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("completions")
      .withIndex("by_user_and_date", q => 
        q.eq("userId", userId)
        .gte("date", args.startDate)
        .lte("date", args.endDate)
      )
      .collect();
  },
});
