import { pgTable, text, serial, timestamp, varchar, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const qaResponses = pgTable("qa_responses", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: varchar("category", { length: 50 }).notNull()
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 100 }).notNull(),
  content: text("content").notNull(),
  priority: varchar("priority", { length: 20 }).notNull(),
  date: timestamp("date").notNull()
});

export const questionAnalytics = pgTable("question_analytics", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  count: integer("count").notNull().default(1),
  lastAsked: timestamp("last_asked").notNull().defaultNow()
});

export const insertQASchema = createInsertSchema(qaResponses);
export const insertNotificationSchema = createInsertSchema(notifications);
export const insertQuestionAnalyticsSchema = createInsertSchema(questionAnalytics);

export type InsertQA = z.infer<typeof insertQASchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type InsertQuestionAnalytics = z.infer<typeof insertQuestionAnalyticsSchema>;
export type QAResponse = typeof qaResponses.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type QuestionAnalytics = typeof questionAnalytics.$inferSelect;