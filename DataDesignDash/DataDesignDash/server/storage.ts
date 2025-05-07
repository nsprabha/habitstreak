import { 
  users, type User, type InsertUser,
  tasks, type Task, type InsertTask,
  taskCompletions, type TaskCompletion, type InsertTaskCompletion
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Task methods
  getTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Task completion methods
  getTaskCompletions(taskId: number): Promise<TaskCompletion[]>;
  getTaskCompletionByDate(taskId: number, date: string): Promise<TaskCompletion | undefined>;
  createOrUpdateTaskCompletion(completion: InsertTaskCompletion): Promise<TaskCompletion>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Task methods
  async getTasks(): Promise<Task[]> {
    return await db.select().from(tasks);
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values({
        ...insertTask,
        createdAt: new Date()
      })
      .returning();
    return task;
  }

  async updateTask(id: number, updatedTask: Partial<InsertTask>): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set(updatedTask)
      .where(eq(tasks.id, id))
      .returning();
    return task || undefined;
  }

  async deleteTask(id: number): Promise<boolean> {
    // Delete all completions for this task first
    await db
      .delete(taskCompletions)
      .where(eq(taskCompletions.taskId, id));
    
    // Then delete the task
    const [deletedTask] = await db
      .delete(tasks)
      .where(eq(tasks.id, id))
      .returning();
    
    return !!deletedTask;
  }

  // Task completion methods
  async getTaskCompletions(taskId: number): Promise<TaskCompletion[]> {
    return await db
      .select()
      .from(taskCompletions)
      .where(eq(taskCompletions.taskId, taskId));
  }

  async getTaskCompletionByDate(taskId: number, date: string): Promise<TaskCompletion | undefined> {
    const [completion] = await db
      .select()
      .from(taskCompletions)
      .where(
        and(
          eq(taskCompletions.taskId, taskId),
          eq(taskCompletions.date, date)
        )
      );
    return completion || undefined;
  }

  async createOrUpdateTaskCompletion(insertCompletion: InsertTaskCompletion): Promise<TaskCompletion> {
    // First check if there's already a completion for this task on this date
    const existingCompletion = await this.getTaskCompletionByDate(
      insertCompletion.taskId, 
      insertCompletion.date
    );

    if (existingCompletion) {
      // Update existing completion
      const [updated] = await db
        .update(taskCompletions)
        .set({ completed: insertCompletion.completed })
        .where(eq(taskCompletions.id, existingCompletion.id))
        .returning();
      return updated;
    } else {
      // Create new completion
      const [completion] = await db
        .insert(taskCompletions)
        .values(insertCompletion)
        .returning();
      return completion;
    }
  }

  // Initialize demo data if needed
  async initializeDemoData(): Promise<void> {
    const existingTasks = await this.getTasks();
    
    // Only add demo tasks if the database is empty
    if (existingTasks.length === 0) {
      await this.createTask({
        name: "Daily Exercise",
        description: "Do at least 30 minutes of exercise",
        color: "bg-blue-500"
      });
      
      await this.createTask({
        name: "Read a Book",
        description: "Read at least 20 pages",
        color: "bg-purple-500"
      });
      
      await this.createTask({
        name: "Practice Coding",
        description: "Work on a programming project",
        color: "bg-green-500"
      });
    }
  }
}

export const storage = new DatabaseStorage();
