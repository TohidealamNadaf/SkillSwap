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
    this.expenses = new Map();
    this.approvals = new Map();
    this.teams = new Map();
    this.teamMembers = new Map();
    this.currentUserId = 1;
    this.currentExpenseId = 1;
    this.currentApprovalId = 1;
    this.currentTeamId = 1;
    this.currentTeamMemberId = 1;

    // Initialize with sample users
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const manager: User = {
      id: this.currentUserId++,
      username: "manager",
      email: "manager@company.com",
      password: "password123",
      firstName: "John",
      lastName: "Manager",
      role: "manager",
      department: "Real Estate",
      profilePicture: null,
      createdAt: new Date(),
    };

    const agent: User = {
      id: this.currentUserId++,
      username: "agent",
      email: "agent@company.com",
      password: "password123",
      firstName: "Sarah",
      lastName: "Agent",
      role: "agent",
      department: "Real Estate",
      profilePicture: null,
      createdAt: new Date(),
    };

    this.users.set(manager.id, manager);
    this.users.set(agent.id, agent);

    // Create a sample team
    const team: Team = {
      id: this.currentTeamId++,
      name: "Sales Team",
      managerId: manager.id,
      createdAt: new Date(),
    };
    this.teams.set(team.id, team);

    // Add agent to team
    const teamMember: TeamMember = {
      id: this.currentTeamMemberId++,
      teamId: team.id,
      userId: agent.id,
      createdAt: new Date(),
    };
    this.teamMembers.set(teamMember.id, teamMember);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.currentUserId++,
      username: insertUser.username,
      email: insertUser.email,
      password: insertUser.password,
      firstName: insertUser.firstName,
      lastName: insertUser.lastName,
      role: insertUser.role || "agent",
      department: insertUser.department || null,
      profilePicture: insertUser.profilePicture || null,
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

  // Expense methods
  async getExpense(id: number): Promise<Expense | undefined> {
    return this.expenses.get(id);
  }

  async getExpensesByUser(userId: number): Promise<Expense[]> {
    return Array.from(this.expenses.values()).filter(expense => expense.userId === userId);
  }

  async getExpensesByStatus(status: string): Promise<Expense[]> {
    return Array.from(this.expenses.values()).filter(expense => expense.status === status);
  }

  async getExpensesByTeam(teamId: number): Promise<Expense[]> {
    const teamMemberIds = Array.from(this.teamMembers.values())
      .filter(tm => tm.teamId === teamId)
      .map(tm => tm.userId);
    
    return Array.from(this.expenses.values())
      .filter(expense => teamMemberIds.includes(expense.userId));
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const expense: Expense = {
      id: this.currentExpenseId++,
      userId: insertExpense.userId,
      title: insertExpense.title,
      description: insertExpense.description || null,
      amount: insertExpense.amount,
      category: insertExpense.category,
      receiptUrl: insertExpense.receiptUrl || null,
      status: insertExpense.status || "pending",
      approvedBy: null,
      approvedAt: null,
      submittedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.expenses.set(expense.id, expense);
    return expense;
  }

  async updateExpense(id: number, updates: Partial<Expense>): Promise<Expense | undefined> {
    const expense = this.expenses.get(id);
    if (!expense) return undefined;
    
    const updatedExpense = { 
      ...expense, 
      ...updates, 
      updatedAt: new Date(),
    };
    this.expenses.set(id, updatedExpense);
    return updatedExpense;
  }

  async deleteExpense(id: number): Promise<boolean> {
    return this.expenses.delete(id);
  }

  // Approval methods
  async getApproval(id: number): Promise<Approval | undefined> {
    return this.approvals.get(id);
  }

  async getApprovalsByExpense(expenseId: number): Promise<Approval[]> {
    return Array.from(this.approvals.values()).filter(approval => approval.expenseId === expenseId);
  }

  async getApprovalsByApprover(approverId: number): Promise<Approval[]> {
    return Array.from(this.approvals.values()).filter(approval => approval.approverId === approverId);
  }

  async createApproval(insertApproval: InsertApproval): Promise<Approval> {
    const approval: Approval = {
      id: this.currentApprovalId++,
      expenseId: insertApproval.expenseId,
      approverId: insertApproval.approverId,
      status: insertApproval.status,
      comments: insertApproval.comments || null,
      createdAt: new Date(),
    };
    this.approvals.set(approval.id, approval);
    return approval;
  }

  async updateApproval(id: number, updates: Partial<Approval>): Promise<Approval | undefined> {
    const approval = this.approvals.get(id);
    if (!approval) return undefined;
    
    const updatedApproval = { ...approval, ...updates };
    this.approvals.set(id, updatedApproval);
    return updatedApproval;
  }

  // Team methods
  async getTeam(id: number): Promise<Team | undefined> {
    return this.teams.get(id);
  }

  async getTeamsByManager(managerId: number): Promise<Team[]> {
    return Array.from(this.teams.values()).filter(team => team.managerId === managerId);
  }

  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const team: Team = {
      ...insertTeam,
      id: this.currentTeamId++,
      createdAt: new Date(),
    };
    this.teams.set(team.id, team);
    return team;
  }

  async getTeamMembers(teamId: number): Promise<User[]> {
    const memberIds = Array.from(this.teamMembers.values())
      .filter(tm => tm.teamId === teamId)
      .map(tm => tm.userId);
    
    return Array.from(this.users.values())
      .filter(user => memberIds.includes(user.id));
  }

  async addTeamMember(insertTeamMember: InsertTeamMember): Promise<TeamMember> {
    const teamMember: TeamMember = {
      ...insertTeamMember,
      id: this.currentTeamMemberId++,
      createdAt: new Date(),
    };
    this.teamMembers.set(teamMember.id, teamMember);
    return teamMember;
  }

  async removeTeamMember(teamId: number, userId: number): Promise<boolean> {
    const teamMember = Array.from(this.teamMembers.values())
      .find(tm => tm.teamId === teamId && tm.userId === userId);
    
    if (!teamMember) return false;
    return this.teamMembers.delete(teamMember.id);
  }
}

export const storage = new MemStorage();
