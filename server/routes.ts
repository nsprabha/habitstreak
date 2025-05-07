import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertTaskSchema, 
  insertTaskCompletionSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for tasks
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      
      // Enhance tasks with statistics
      const tasksWithStats = await Promise.all(tasks.map(async (task) => {
        const completions = await storage.getTaskCompletions(task.id);
        
        // Calculate current streak
        let currentStreak = 0;
        const sortedCompletions = [...completions].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        // Get today's date
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];
        
        // Check if there's a completion for today
        const todayCompletion = sortedCompletions.find(c => c.date === todayStr);
        if (todayCompletion && todayCompletion.completed) {
          currentStreak = 1;
          
          // Check previous days
          const oneDayMs = 24 * 60 * 60 * 1000;
          let prevDate = new Date(today.getTime() - oneDayMs);
          
          while (true) {
            const dateStr = prevDate.toISOString().split('T')[0];
            const completion = sortedCompletions.find(c => c.date === dateStr);
            
            if (completion && completion.completed) {
              currentStreak++;
              prevDate = new Date(prevDate.getTime() - oneDayMs);
            } else {
              break;
            }
          }
        }
        
        // Calculate longest streak
        let longestStreak = 0;
        let tempStreak = 0;
        
        const datesSorted = sortedCompletions
          .filter(c => c.completed)
          .map(c => new Date(c.date))
          .sort((a, b) => a.getTime() - b.getTime());
        
        if (datesSorted.length > 0) {
          tempStreak = 1;
          longestStreak = 1;
          
          for (let i = 1; i < datesSorted.length; i++) {
            const prevDate = datesSorted[i - 1];
            const currDate = datesSorted[i];
            
            const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (24 * 60 * 60 * 1000));
            
            if (diffDays === 1) {
              tempStreak++;
              longestStreak = Math.max(longestStreak, tempStreak);
            } else {
              tempStreak = 1;
            }
          }
        }
        
        // Calculate completion rate (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentCompletions = completions.filter(c => 
          new Date(c.date) >= thirtyDaysAgo && new Date(c.date) <= today
        );
        
        // Count days with completions in last 30 days
        const completedDays = recentCompletions.filter(c => c.completed).length;
        const totalDaysTracked = recentCompletions.length;
        
        // Default to 0 if no days tracked
        const completionRate = totalDaysTracked > 0 
          ? Math.round((completedDays / totalDaysTracked) * 100) 
          : 0;
        
        return {
          ...task,
          completions,
          currentStreak,
          longestStreak,
          completionRate
        };
      }));
      
      res.json(tasksWithStats);
    } catch (error) {
      console.error("Error fetching tasks", error);
      res.status(500).json({ message: "Error fetching tasks" });
    }
  });

  app.get("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const task = await storage.getTask(id);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      const completions = await storage.getTaskCompletions(id);
      res.json({ ...task, completions });
    } catch (error) {
      console.error("Error fetching task", error);
      res.status(500).json({ message: "Error fetching task" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const validatedData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(validatedData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      console.error("Error creating task", error);
      res.status(500).json({ message: "Error creating task" });
    }
  });

  app.put("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertTaskSchema.partial().parse(req.body);
      
      const updatedTask = await storage.updateTask(id, validatedData);
      
      if (!updatedTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.json(updatedTask);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      console.error("Error updating task", error);
      res.status(500).json({ message: "Error updating task" });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTask(id);
      
      if (!success) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting task", error);
      res.status(500).json({ message: "Error deleting task" });
    }
  });

  // API routes for task completions
  app.post("/api/tasks/:taskId/completions", async (req, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      
      // Ensure task exists
      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Validate and create/update completion
      const completionData = { ...req.body, taskId };
      const validatedData = insertTaskCompletionSchema.parse(completionData);
      
      const completion = await storage.createOrUpdateTaskCompletion(validatedData);
      res.status(201).json(completion);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid completion data", errors: error.errors });
      }
      console.error("Error creating/updating completion", error);
      res.status(500).json({ message: "Error creating/updating completion" });
    }
  });

  app.get("/api/tasks/:taskId/completions", async (req, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      
      // Ensure task exists
      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      const completions = await storage.getTaskCompletions(taskId);
      res.json(completions);
    } catch (error) {
      console.error("Error fetching completions", error);
      res.status(500).json({ message: "Error fetching completions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
