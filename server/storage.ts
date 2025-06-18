import { users, expenses, approvals, teams, teamMembers, type User, type InsertUser, type Expense, type InsertExpense, type Approval, type InsertApproval, type Team, type InsertTeam, type TeamMember, type InsertTeamMember } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // Expense methods
  getExpense(id: number): Promise<Expense | undefined>;
  getExpensesByUser(userId: number): Promise<Expense[]>;
  getExpensesByStatus(status: string): Promise<Expense[]>;
  getExpensesByTeam(teamId: number): Promise<Expense[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: number, updates: Partial<Expense>): Promise<Expense | undefined>;
  deleteExpense(id: number): Promise<boolean>;
  
  // Approval methods
  getApproval(id: number): Promise<Approval | undefined>;
  getApprovalsByExpense(expenseId: number): Promise<Approval[]>;
  getApprovalsByApprover(approverId: number): Promise<Approval[]>;
  createApproval(approval: InsertApproval): Promise<Approval>;
  updateApproval(id: number, updates: Partial<Approval>): Promise<Approval | undefined>;
  
  // Team methods
  getTeam(id: number): Promise<Team | undefined>;
  getTeamsByManager(managerId: number): Promise<Team[]>;
  createTeam(team: InsertTeam): Promise<Team>;
  getTeamMembers(teamId: number): Promise<User[]>;
  addTeamMember(teamMember: InsertTeamMember): Promise<TeamMember>;
  removeTeamMember(teamId: number, userId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private expenses: Map<number, Expense>;
  private approvals: Map<number, Approval>;
  private teams: Map<number, Team>;
  private teamMembers: Map<number, TeamMember>;
  private currentUserId: number;
  private currentExpenseId: number;
  private currentApprovalId: number;
  private currentTeamId: number;
  private currentTeamMemberId: number;

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
      ...insertUser,
      id: this.currentUserId++,
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
      ...insertExpense,
      id: this.currentExpenseId++,
      createdAt: new Date(),
      updatedAt: new Date(),
      approvedBy: null,
      approvedAt: null,
      submittedAt: null,
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
      ...insertApproval,
      id: this.currentApprovalId++,
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
