import { z } from "zod";

// Schema for creating a task
export const createTaskSchema = z.object({
  title: z.string().nonempty("Title is required!"),
  description: z.string().nonempty("Description is required!"),
  dueDate: z.string().optional(), // You can change this to z.date() if you parse dates
  priority: z.string().optional(),
  status: z.string().optional(),
});

// Schema for updating a task
export const updateTaskSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.string().optional(),
  status: z.string().optional(),
  completed: z.boolean().optional(),
});

// Schema for task id parameter (for get, delete, update)
export const taskIdParamSchema = z.object({
  id: z.string().nonempty("Task id is required"),
});
