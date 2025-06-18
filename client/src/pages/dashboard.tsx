import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, DollarSign, Clock, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { ExpenseCard } from "@/components/expense-card";
import { useState } from "react";
import { ExpenseForm } from "@/components/expense-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface DashboardStats {
  totalExpenses: number;
  pendingExpenses: number;
  approvedExpenses: number;
  rejectedExpenses: number;
  totalAmount: number;
  pendingAmount: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  const { data: expenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: ["/api/expenses", { userId: user?.id }],
    queryFn: () => fetch(`/api/expenses?userId=${user?.id}`).then(res => res.json()),
  });

  const { data: allExpenses = [], isLoading: allExpensesLoading } = useQuery({
    queryKey: ["/api/expenses"],
    queryFn: () => fetch("/api/expenses").then(res => res.json()),
    enabled: user?.role === "manager" || user?.role === "admin",
  });

  // Calculate dashboard stats
  const stats: DashboardStats = {
    totalExpenses: expenses.length,
    pendingExpenses: expenses.filter((e: any) => e.status === "pending").length,
    approvedExpenses: expenses.filter((e: any) => e.status === "approved").length,
    rejectedExpenses: expenses.filter((e: any) => e.status === "rejected").length,
    totalAmount: expenses.reduce((sum: number, e: any) => sum + parseFloat(e.amount), 0),
    pendingAmount: expenses.filter((e: any) => e.status === "pending" || e.status === "submitted")
      .reduce((sum: number, e: any) => sum + parseFloat(e.amount), 0),
  };

  const recentExpenses = expenses
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const pendingApprovals = user?.role === "manager" 
    ? allExpenses.filter((e: any) => e.status === "submitted").length 
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Here's what's happening with your expenses
          </p>
        </div>
        
        <Dialog open={showExpenseForm} onOpenChange={setShowExpenseForm}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>New Expense</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Expense</DialogTitle>
            </DialogHeader>
            <ExpenseForm 
              onSuccess={() => setShowExpenseForm(false)}
              onCancel={() => setShowExpenseForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalExpenses} expenses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.pendingAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingExpenses} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedExpenses}</div>
            <p className="text-xs text-muted-foreground">
              expenses approved
            </p>
          </CardContent>
        </Card>

        {user?.role === "manager" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingApprovals}</div>
              <p className="text-xs text-muted-foreground">
                awaiting approval
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Expenses
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expensesLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : recentExpenses.length > 0 ? (
              <div className="space-y-4">
                {recentExpenses.map((expense: any) => (
                  <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium">{expense.title}</h4>
                        <Badge className={`status-badge ${
                          expense.status === "pending" ? "status-pending" :
                          expense.status === "submitted" ? "status-submitted" :
                          expense.status === "approved" ? "status-approved" :
                          "status-rejected"
                        }`}>
                          {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(expense.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${parseFloat(expense.amount).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No expenses yet</h3>
                <p className="mt-1 text-sm text-gray-500">Get started by creating your first expense.</p>
                <div className="mt-6">
                  <Button onClick={() => setShowExpenseForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Expense
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              <Button 
                variant="outline" 
                className="justify-start h-auto p-4"
                onClick={() => setShowExpenseForm(true)}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Plus className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Create Expense</div>
                    <div className="text-sm text-muted-foreground">Add a new expense report</div>
                  </div>
                </div>
              </Button>

              {user?.role === "manager" && (
                <Button 
                  variant="outline" 
                  className="justify-start h-auto p-4"
                  onClick={() => window.location.href = "/approvals"}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 rounded-full">
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Review Approvals</div>
                      <div className="text-sm text-muted-foreground">
                        {pendingApprovals} expenses awaiting approval
                      </div>
                    </div>
                  </div>
                </Button>
              )}

              <Button 
                variant="outline" 
                className="justify-start h-auto p-4"
                onClick={() => window.location.href = "/reports"}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">View Reports</div>
                    <div className="text-sm text-muted-foreground">Analyze your expense data</div>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
