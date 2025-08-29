import asyncHandler from "express-async-handler";
import TaskModel from "../../models/tasks/TaskModel.js";

import {
  createTaskSchema,
  taskIdParamSchema,
} from "../../validations/task.js";

export const createTask = asyncHandler(async (req, res) => {
  const parsed = createTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: parsed.error.errors.map((err) => err.message).join(", ") });
  }
  const { title, description, dueDate, priority, status } = parsed.data;

  const task = new TaskModel({
    title,
    description,
    dueDate,
    priority,
    status,
    user: req.user._id,
  });

  await task.save();
  res.status(201).json(task);
});

export const getTasks = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  if (!userId) {
    return res.status(400).json({ message: "User not found!" });
  }
  const tasks = await TaskModel.find({ user: userId });
  res.status(200).json({
    length: tasks.length,
    tasks,
  });
});

export const getTask = asyncHandler(async (req, res) => {
  const paramParsed = taskIdParamSchema.safeParse(req.params);
  if (!paramParsed.success) {
    return res
      .status(400)
      .json({ message: paramParsed.error.errors.map((err) => err.message).join(", ") });
  }
  const { id } = paramParsed.data;
  const userId = req.user._id;

  const task = await TaskModel.findById(id);
  if (!task) {
    return res.status(404).json({ message: "Task not found!" });
  }
  if (!task.user.equals(userId)) {
    return res.status(401).json({ message: "Not authorized!" });
  }
  res.status(200).json(task);
});

export const updateTask = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;
  const { title, description, dueDate, priority, status, completed } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Please provide a task id" });
  }

  const task = await TaskModel.findById(id);

  if (!task) {
    return res.status(404).json({ message: "Task not found!" });
  }

  if (!task.user.equals(userId)) {
    return res.status(401).json({ message: "Not authorized!" });
  }

  // Update only provided fields
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (dueDate !== undefined) task.dueDate = dueDate;
  if (priority !== undefined) task.priority = priority;
  if (status !== undefined) task.status = status;
  if (completed !== undefined) task.completed = completed;

  const updatedTask = await task.save();
  res.status(200).json(updatedTask);
});

export const deleteTask = asyncHandler(async (req, res) => {
  const paramParsed = taskIdParamSchema.safeParse(req.params);
  if (!paramParsed.success) {
    return res
      .status(400)
      .json({ message: paramParsed.error.errors.map((err) => err.message).join(", ") });
  }
  const { id } = paramParsed.data;
  const userId = req.user._id;

  const task = await TaskModel.findById(id);
  if (!task) {
    return res.status(404).json({ message: "Task not found!" });
  }
  if (!task.user.equals(userId)) {
    return res.status(401).json({ message: "Not authorized!" });
  }
  await TaskModel.findByIdAndDelete(id);
  res.status(200).json({ message: "Task deleted successfully!" });
});

