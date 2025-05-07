import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").notNull().default("bg-blue-500"),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const taskCompletions = pgTable("task_completions", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id).notNull(),
  date: text("date").notNull(), // ISO string format of date YYYY-MM-DD
  completed: boolean("completed").notNull().default(false),
});

// Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  name: true,
  description: true,
  color: true,
  userId: true,
});

export const insertTaskCompletionSchema = createInsertSchema(taskCompletions).pick({
  taskId: true,
  date: true,
  completed: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type InsertTaskCompletion = z.infer<typeof insertTaskCompletionSchema>;
export type TaskCompletion = typeof taskCompletions.$inferSelect;

// Extended types for the frontend
export type TaskWithStats = Task & {
  completions: TaskCompletion[];
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
};
