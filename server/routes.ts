import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertExpenseSchema, insertApprovalSchema } from "@shared/schema";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(409).json({ message: "Email already exists" });
      }

      const user = await storage.createUser(userData);
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const user = await storage.getUser(id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // Expense routes
  app.get("/api/expenses", async (req, res) => {
    const { userId, status, teamId } = req.query;
    
    let expenses;
    if (userId) {
      expenses = await storage.getExpensesByUser(parseInt(userId as string));
    } else if (status) {
      expenses = await storage.getExpensesByStatus(status as string);
    } else if (teamId) {
      expenses = await storage.getExpensesByTeam(parseInt(teamId as string));
    } else {
      // Return all expenses - in production you'd want pagination
      expenses = Array.from((storage as any).expenses.values());
    }
    
    res.json(expenses);
  });

  app.get("/api/expenses/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const expense = await storage.getExpense(id);
    
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json(expense);
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      const expenseData = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(expenseData);
      res.status(201).json(expense);
    } catch (error) {
      res.status(400).json({ message: "Invalid expense data" });
    }
  });

  app.put("/api/expenses/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const expense = await storage.updateExpense(id, req.body);
    
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json(expense);
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteExpense(id);
    
    if (!deleted) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(204).send();
  });

  app.post("/api/expenses/:id/submit", async (req, res) => {
    const id = parseInt(req.params.id);
    const expense = await storage.updateExpense(id, {
      status: "submitted",
      submittedAt: new Date(),
    });
    
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json(expense);
  });

  // Approval routes
  app.get("/api/approvals", async (req, res) => {
    const { approverId, expenseId } = req.query;
    
    let approvals;
    if (approverId) {
      approvals = await storage.getApprovalsByApprover(parseInt(approverId as string));
    } else if (expenseId) {
      approvals = await storage.getApprovalsByExpense(parseInt(expenseId as string));
    } else {
      approvals = Array.from((storage as any).approvals.values());
    }
    
    res.json(approvals);
  });

  app.post("/api/approvals", async (req, res) => {
    try {
      const approvalData = insertApprovalSchema.parse(req.body);
      const approval = await storage.createApproval(approvalData);
      
      // Update expense status based on approval
      if (approval.status === "approved") {
        await storage.updateExpense(approval.expenseId, {
          status: "approved",
          approvedBy: approval.approverId,
          approvedAt: new Date(),
        });
      } else if (approval.status === "rejected") {
        await storage.updateExpense(approval.expenseId, {
          status: "rejected",
        });
      }
      
      res.status(201).json(approval);
    } catch (error) {
      res.status(400).json({ message: "Invalid approval data" });
    }
  });

  app.put("/api/approvals/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const approval = await storage.updateApproval(id, req.body);
    
    if (!approval) {
      return res.status(404).json({ message: "Approval not found" });
    }

    // Update expense status based on approval
    if (approval.status === "approved") {
      await storage.updateExpense(approval.expenseId, {
        status: "approved",
        approvedBy: approval.approverId,
        approvedAt: new Date(),
      });
    } else if (approval.status === "rejected") {
      await storage.updateExpense(approval.expenseId, {
        status: "rejected",
      });
    }

    res.json(approval);
  });

  // Team routes
  app.get("/api/teams", async (req, res) => {
    const { managerId } = req.query;
    
    let teams;
    if (managerId) {
      teams = await storage.getTeamsByManager(parseInt(managerId as string));
    } else {
      teams = Array.from((storage as any).teams.values());
    }
    
    res.json(teams);
  });

  app.get("/api/teams/:id/members", async (req, res) => {
    const teamId = parseInt(req.params.id);
    const members = await storage.getTeamMembers(teamId);
    
    // Remove passwords from response
    const membersWithoutPasswords = members.map(({ password: _, ...member }) => member);
    res.json(membersWithoutPasswords);
  });

  const httpServer = createServer(app);
  return httpServer;
}
