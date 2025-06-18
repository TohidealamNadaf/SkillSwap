import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertSkillSchema, insertMatchSchema, 
  insertSessionSchema, insertMessageSchema, insertExchangeSchema 
} from "@shared/schema";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(email);
      
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
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const user = await storage.updateUser(id, updates);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Skill routes
  app.get("/api/skills", async (req, res) => {
    try {
      const { userId, type } = req.query;
      
      let skills;
      if (userId) {
        skills = await storage.getSkillsByUser(parseInt(userId as string));
      } else if (type) {
        skills = await storage.getSkillsByType(type as string);
      } else {
        // Get all skills - for matching purposes
        const users = await storage.getAllUsers();
        const allSkills = await Promise.all(
          users.map(user => storage.getSkillsByUser(user.id))
        );
        skills = allSkills.flat();
      }
      
      res.json(skills);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch skills" });
    }
  });

  app.post("/api/skills", async (req, res) => {
    try {
      const skillData = insertSkillSchema.parse(req.body);
      const skill = await storage.createSkill(skillData);
      res.status(201).json(skill);
    } catch (error) {
      res.status(400).json({ message: "Invalid skill data" });
    }
  });

  app.put("/api/skills/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const skill = await storage.updateSkill(id, updates);
      if (!skill) {
        return res.status(404).json({ message: "Skill not found" });
      }

      res.json(skill);
    } catch (error) {
      res.status(500).json({ message: "Failed to update skill" });
    }
  });

  app.delete("/api/skills/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteSkill(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Skill not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete skill" });
    }
  });

  // Match routes
  app.get("/api/matches", async (req, res) => {
    try {
      const { userId, status } = req.query;
      
      let matches;
      if (userId) {
        matches = await storage.getMatchesByUser(parseInt(userId as string));
      } else if (status) {
        matches = await storage.getMatchesByStatus(status as string);
      } else {
        matches = await storage.getMatchesByStatus("pending");
      }
      
      res.json(matches);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });

  app.post("/api/matches", async (req, res) => {
    try {
      const matchData = insertMatchSchema.parse(req.body);
      const match = await storage.createMatch(matchData);
      res.status(201).json(match);
    } catch (error) {
      res.status(400).json({ message: "Invalid match data" });
    }
  });

  app.put("/api/matches/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const match = await storage.updateMatch(id, updates);
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }

      res.json(match);
    } catch (error) {
      res.status(500).json({ message: "Failed to update match" });
    }
  });

  // Session routes
  app.get("/api/sessions", async (req, res) => {
    try {
      const { userId, matchId } = req.query;
      
      let sessions;
      if (userId) {
        sessions = await storage.getSessionsByUser(parseInt(userId as string));
      } else if (matchId) {
        sessions = await storage.getSessionsByMatch(parseInt(matchId as string));
      } else {
        sessions = [];
      }
      
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  app.post("/api/sessions", async (req, res) => {
    try {
      const sessionData = insertSessionSchema.parse(req.body);
      const session = await storage.createSession(sessionData);
      res.status(201).json(session);
    } catch (error) {
      res.status(400).json({ message: "Invalid session data" });
    }
  });

  app.put("/api/sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const session = await storage.updateSession(id, updates);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to update session" });
    }
  });

  // Message routes
  app.get("/api/messages/:matchId", async (req, res) => {
    try {
      const matchId = parseInt(req.params.matchId);
      const messages = await storage.getMessagesByMatch(matchId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ message: "Invalid message data" });
    }
  });

  // Exchange routes
  app.get("/api/exchanges/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const exchanges = await storage.getExchangesByUser(userId);
      res.json(exchanges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exchanges" });
    }
  });

  app.post("/api/exchanges", async (req, res) => {
    try {
      const exchangeData = insertExchangeSchema.parse(req.body);
      const exchange = await storage.createExchange(exchangeData);
      res.status(201).json(exchange);
    } catch (error) {
      res.status(400).json({ message: "Invalid exchange data" });
    }
  });

  app.put("/api/exchanges/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const exchange = await storage.updateExchange(id, updates);
      if (!exchange) {
        return res.status(404).json({ message: "Exchange not found" });
      }

      res.json(exchange);
    } catch (error) {
      res.status(500).json({ message: "Failed to update exchange" });
    }
  });

  // Matching algorithm endpoint
  app.get("/api/matches/suggestions/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      // Get user's learning skills
      const userSkills = await storage.getSkillsByUser(userId);
      const learningSkills = userSkills.filter(skill => skill.type === "learn");
      
      if (learningSkills.length === 0) {
        return res.json([]);
      }
      
      // Find teachers for these skills
      const suggestions = [];
      for (const learningSkill of learningSkills) {
        // Find users who teach this skill
        const allUsers = await storage.getAllUsers();
        for (const user of allUsers) {
          if (user.id === userId) continue;
          
          const teacherSkills = await storage.getSkillsByUser(user.id);
          const matchingTeachSkill = teacherSkills.find(
            skill => skill.type === "teach" && 
                    skill.name.toLowerCase() === learningSkill.name.toLowerCase()
          );
          
          if (matchingTeachSkill) {
            // Check if match already exists
            const existingMatches = await storage.getMatchesByUser(userId);
            const alreadyMatched = existingMatches.some(
              match => (match.teacherId === user.id && match.learnerId === userId) ||
                      (match.teacherId === userId && match.learnerId === user.id)
            );
            
            if (!alreadyMatched) {
              suggestions.push({
                teacher: user,
                learner: { id: userId },
                skill: matchingTeachSkill,
                learningSkill: learningSkill
              });
            }
          }
        }
      }
      
      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate suggestions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}