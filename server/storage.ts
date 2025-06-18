import { 
  users, skills, matches, sessions, messages, exchanges,
  type User, type InsertUser, type Skill, type InsertSkill, 
  type Match, type InsertMatch, type Session, type InsertSession,
  type Message, type InsertMessage, type Exchange, type InsertExchange
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  
  // Skill methods
  getSkill(id: number): Promise<Skill | undefined>;
  getSkillsByUser(userId: number): Promise<Skill[]>;
  getSkillsByType(type: string): Promise<Skill[]>;
  createSkill(skill: InsertSkill): Promise<Skill>;
  updateSkill(id: number, updates: Partial<Skill>): Promise<Skill | undefined>;
  deleteSkill(id: number): Promise<boolean>;
  
  // Match methods
  getMatch(id: number): Promise<Match | undefined>;
  getMatchesByUser(userId: number): Promise<Match[]>;
  getMatchesByStatus(status: string): Promise<Match[]>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatch(id: number, updates: Partial<Match>): Promise<Match | undefined>;
  
  // Session methods
  getSession(id: number): Promise<Session | undefined>;
  getSessionsByMatch(matchId: number): Promise<Session[]>;
  getSessionsByUser(userId: number): Promise<Session[]>;
  createSession(session: InsertSession): Promise<Session>;
  updateSession(id: number, updates: Partial<Session>): Promise<Session | undefined>;
  
  // Message methods
  getMessage(id: number): Promise<Message | undefined>;
  getMessagesByMatch(matchId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Exchange methods
  getExchange(id: number): Promise<Exchange | undefined>;
  getExchangesByUser(userId: number): Promise<Exchange[]>;
  createExchange(exchange: InsertExchange): Promise<Exchange>;
  updateExchange(id: number, updates: Partial<Exchange>): Promise<Exchange | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private skills: Map<number, Skill>;
  private matches: Map<number, Match>;
  private sessions: Map<number, Session>;
  private messages: Map<number, Message>;
  private exchanges: Map<number, Exchange>;
  private currentUserId: number;
  private currentSkillId: number;
  private currentMatchId: number;
  private currentSessionId: number;
  private currentMessageId: number;
  private currentExchangeId: number;

  constructor() {
    this.users = new Map();
    this.skills = new Map();
    this.matches = new Map();
    this.sessions = new Map();
    this.messages = new Map();
    this.exchanges = new Map();
    this.currentUserId = 1;
    this.currentSkillId = 1;
    this.currentMatchId = 1;
    this.currentSessionId = 1;
    this.currentMessageId = 1;
    this.currentExchangeId = 1;

    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample users
    const john: User = {
      id: this.currentUserId++,
      email: "john@example.com",
      password: "password123",
      name: "John Smith",
      bio: "Software developer passionate about teaching programming and learning design",
      profilePicture: null,
      location: "San Francisco, CA",
      createdAt: new Date(),
    };

    const sarah: User = {
      id: this.currentUserId++,
      email: "sarah@example.com",
      password: "password123", 
      name: "Sarah Johnson",
      bio: "UI/UX designer looking to expand my technical skills",
      profilePicture: null,
      location: "New York, NY",
      createdAt: new Date(),
    };

    this.users.set(john.id, john);
    this.users.set(sarah.id, sarah);

    // Sample skills
    const programmingSkill: Skill = {
      id: this.currentSkillId++,
      userId: john.id,
      name: "JavaScript Programming",
      type: "teach",
      level: "advanced",
      description: "Full-stack JavaScript development with React and Node.js",
      createdAt: new Date(),
    };

    const designSkill: Skill = {
      id: this.currentSkillId++,
      userId: sarah.id,
      name: "UI/UX Design",
      type: "teach",
      level: "intermediate",
      description: "User interface and user experience design principles",
      createdAt: new Date(),
    };

    const learnProgramming: Skill = {
      id: this.currentSkillId++,
      userId: sarah.id,
      name: "JavaScript Programming",
      type: "learn",
      level: "beginner",
      description: "Want to learn web development fundamentals",
      createdAt: new Date(),
    };

    this.skills.set(programmingSkill.id, programmingSkill);
    this.skills.set(designSkill.id, designSkill);
    this.skills.set(learnProgramming.id, learnProgramming);

    // Sample match
    const match: Match = {
      id: this.currentMatchId++,
      teacherId: john.id,
      learnerId: sarah.id,
      skillId: programmingSkill.id,
      status: "accepted",
      createdAt: new Date(),
    };

    this.matches.set(match.id, match);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.currentUserId++,
      email: insertUser.email,
      password: insertUser.password,
      name: insertUser.name,
      bio: insertUser.bio || null,
      profilePicture: insertUser.profilePicture || null,
      location: insertUser.location || null,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Skill methods
  async getSkill(id: number): Promise<Skill | undefined> {
    return this.skills.get(id);
  }

  async getSkillsByUser(userId: number): Promise<Skill[]> {
    return Array.from(this.skills.values()).filter(skill => skill.userId === userId);
  }

  async getSkillsByType(type: string): Promise<Skill[]> {
    return Array.from(this.skills.values()).filter(skill => skill.type === type);
  }

  async createSkill(insertSkill: InsertSkill): Promise<Skill> {
    const skill: Skill = {
      id: this.currentSkillId++,
      userId: insertSkill.userId,
      name: insertSkill.name,
      type: insertSkill.type,
      level: insertSkill.level,
      description: insertSkill.description || null,
      createdAt: new Date(),
    };
    this.skills.set(skill.id, skill);
    return skill;
  }

  async updateSkill(id: number, updates: Partial<Skill>): Promise<Skill | undefined> {
    const skill = this.skills.get(id);
    if (!skill) return undefined;
    
    const updatedSkill = { ...skill, ...updates };
    this.skills.set(id, updatedSkill);
    return updatedSkill;
  }

  async deleteSkill(id: number): Promise<boolean> {
    return this.skills.delete(id);
  }

  // Match methods
  async getMatch(id: number): Promise<Match | undefined> {
    return this.matches.get(id);
  }

  async getMatchesByUser(userId: number): Promise<Match[]> {
    return Array.from(this.matches.values()).filter(
      match => match.teacherId === userId || match.learnerId === userId
    );
  }

  async getMatchesByStatus(status: string): Promise<Match[]> {
    return Array.from(this.matches.values()).filter(match => match.status === status);
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const match: Match = {
      id: this.currentMatchId++,
      teacherId: insertMatch.teacherId,
      learnerId: insertMatch.learnerId,
      skillId: insertMatch.skillId,
      status: insertMatch.status || "pending",
      createdAt: new Date(),
    };
    this.matches.set(match.id, match);
    return match;
  }

  async updateMatch(id: number, updates: Partial<Match>): Promise<Match | undefined> {
    const match = this.matches.get(id);
    if (!match) return undefined;
    
    const updatedMatch = { ...match, ...updates };
    this.matches.set(id, updatedMatch);
    return updatedMatch;
  }

  // Session methods
  async getSession(id: number): Promise<Session | undefined> {
    return this.sessions.get(id);
  }

  async getSessionsByMatch(matchId: number): Promise<Session[]> {
    return Array.from(this.sessions.values()).filter(session => session.matchId === matchId);
  }

  async getSessionsByUser(userId: number): Promise<Session[]> {
    const userMatches = await this.getMatchesByUser(userId);
    const matchIds = userMatches.map(match => match.id);
    return Array.from(this.sessions.values()).filter(session => 
      matchIds.includes(session.matchId)
    );
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const session: Session = {
      id: this.currentSessionId++,
      matchId: insertSession.matchId,
      scheduledAt: insertSession.scheduledAt,
      duration: insertSession.duration,
      status: insertSession.status || "scheduled",
      notes: insertSession.notes || null,
      createdAt: new Date(),
    };
    this.sessions.set(session.id, session);
    return session;
  }

  async updateSession(id: number, updates: Partial<Session>): Promise<Session | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates };
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }

  // Message methods
  async getMessage(id: number): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async getMessagesByMatch(matchId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.matchId === matchId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const message: Message = {
      id: this.currentMessageId++,
      matchId: insertMessage.matchId,
      senderId: insertMessage.senderId,
      content: insertMessage.content,
      createdAt: new Date(),
    };
    this.messages.set(message.id, message);
    return message;
  }

  // Exchange methods
  async getExchange(id: number): Promise<Exchange | undefined> {
    return this.exchanges.get(id);
  }

  async getExchangesByUser(userId: number): Promise<Exchange[]> {
    return Array.from(this.exchanges.values()).filter(
      exchange => exchange.userId === userId || exchange.partnerId === userId
    );
  }

  async createExchange(insertExchange: InsertExchange): Promise<Exchange> {
    const exchange: Exchange = {
      id: this.currentExchangeId++,
      userId: insertExchange.userId,
      partnerId: insertExchange.partnerId,
      hoursGiven: insertExchange.hoursGiven || "0",
      hoursReceived: insertExchange.hoursReceived || "0",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.exchanges.set(exchange.id, exchange);
    return exchange;
  }

  async updateExchange(id: number, updates: Partial<Exchange>): Promise<Exchange | undefined> {
    const exchange = this.exchanges.get(id);
    if (!exchange) return undefined;
    
    const updatedExchange = { 
      ...exchange, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.exchanges.set(id, updatedExchange);
    return updatedExchange;
  }
}

export const storage = new MemStorage();