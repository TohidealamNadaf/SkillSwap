import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  bio: text("bio"),
  profilePicture: text("profile_picture"),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // "teach" or "learn"
  level: text("level").notNull(), // "beginner", "intermediate", "advanced"
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").notNull(),
  learnerId: integer("learner_id").notNull(),
  skillId: integer("skill_id").notNull(),
  status: text("status").notNull().default("pending"), // "pending", "accepted", "declined", "completed"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  duration: integer("duration").notNull(), // minutes
  status: text("status").notNull().default("scheduled"), // "scheduled", "completed", "cancelled"
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull(),
  senderId: integer("sender_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const exchanges = pgTable("exchanges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  partnerId: integer("partner_id").notNull(),
  hoursGiven: decimal("hours_given", { precision: 5, scale: 2 }).notNull().default("0"),
  hoursReceived: decimal("hours_received", { precision: 5, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertSkillSchema = createInsertSchema(skills).omit({
  id: true,
  createdAt: true,
});

export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
  createdAt: true,
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertExchangeSchema = createInsertSchema(exchanges).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Skill = typeof skills.$inferSelect;
export type InsertSkill = z.infer<typeof insertSkillSchema>;
export type Match = typeof matches.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Exchange = typeof exchanges.$inferSelect;
export type InsertExchange = z.infer<typeof insertExchangeSchema>;
