import asyncHandler from "express-async-handler";
import TaskModel from "../../models/tasks/TaskModel.js";

// Import Zod schemas
import {
  createTaskSchema,
  taskIdParamSchema,
} from "../../validations/task.js";

// create task
export const createTask = asyncHandler(async (req, res) => {
  const parsed = createTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: parsed.error.errors.map((err) => err.message).join(", ") });
  }
  const { title, description, dueDate, priority, status } = parsed.data;

  // Create new task with validated data
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

// get all tasks for the logged-in user
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

// get a single task by id
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

// update task
export const updateTask = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;

    const { id } = req.params;
    const { title, description, dueDate, priority, status, completed } =
      req.body;

    if (!id) {
      res.status(400).json({ message: "Please provide a task id" });
    }

    const task = await TaskModel.findById(id);

    if (!task) {
      res.status(404).json({ message: "Task not found!" });
    }

    // check if the user is the owner of the task
    if (!task.user.equals(userId)) {
      res.status(401).json({ message: "Not authorized!" });
    }

    // update the task with the new data if provided or keep the old data
    task.title = title || task.title;
    task.description = description || task.description;
    task.dueDate = dueDate || task.dueDate;
    task.priority = priority || task.priority;
    task.status = status || task.status;
    task.completed = completed || task.completed;

    await task.save();

    return res.status(200).json(task);
  } catch (error) {
    console.log("Error in updateTask: ", error.message);
    res.status(500).json({ message: error.message });
  }
});


// delete task
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

// delete all tasks for the logged-in user
export const deleteAllTasks = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const tasks = await TaskModel.find({ user: userId });
  if (!tasks || tasks.length === 0) {
    return res.status(404).json({ message: "No tasks found!" });
  }
  // No need to check ownership individually as these tasks belong to the user
  await TaskModel.deleteMany({ user: userId });
  res.status(200).json({ message: "All tasks deleted successfully!" });
});
