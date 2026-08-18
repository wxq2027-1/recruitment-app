import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const applications = sqliteTable("applications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  gender: text("gender").notNull(),
  studentId: text("student_id").notNull().unique(),
  college: text("college").notNull(),
  majorClass: text("major_class").notNull(),
  politicalStatus: text("political_status").notNull().default("群众"),
  phone: text("phone").notNull(),
  wechat: text("wechat").notNull(),
  qq: text("qq").notNull().default(""),
  email: text("email").notNull().default(""),
  choice1: text("choice_1").notNull(),
  choice2: text("choice_2").notNull(),
  choice3: text("choice_3").notNull(),
  introduction: text("introduction").notNull(),
  experience: text("experience").notNull().default(""),
  expectation: text("expectation").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
