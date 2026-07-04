import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
});

export const projectSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(255),
  description: z.string().optional(),
  status: z.enum(["active", "completed", "archived"]).default("active"),
  teamId: z.string().uuid().optional(),
  organizationId: z.string().uuid(),
});

export const taskSchema = z.object({
  title: z.string().min(2).max(255),
  description: z.string().optional(),
  status: z.enum(["todo", "in-progress", "review", "done"]).default("todo"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  projectId: z.string().uuid(),
  assigneeId: z.string().uuid().optional(),
  reporterId: z.string().uuid(),
  points: z.number().int().min(0).optional(),
});

export const leadSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  status: z.enum(["new", "contacted", "qualified", "lost", "converted"]).default("new"),
  organizationId: z.string().uuid(),
});
