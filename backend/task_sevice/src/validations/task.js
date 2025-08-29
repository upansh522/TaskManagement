import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required!"),
  description: z.string().min(1, "Description is required!"),
  dueDate: z.string().optional(),
  priority: z.string().optional(),
  status: z.string().optional(),
});

export const taskIdParamSchema = z.object({
  id: z.string().min(1, "Task id is required"),
});


