import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { DollarSign, TrendingUp, Calendar, Download, Filter, Users } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";

const COLORS = ['#2563eb', '#7c3aed', '#059669', '#dc2626', '#ea580c', '#0891b2'];

export default function Reports() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState("30");
  const [selectedTeam, setSelectedTeam] = useState("all");

  const { data: expenses = [], isLoading: expensesLoading } = useQuery({
    queryKey: ["/api/expenses"],
    queryFn: () => fetch("/api/expenses").then(res => res.json()),
    enabled: user?.role === "manager" || user?.role === "admin",
  });

  const { data: userExpenses = [], isLoading: userExpensesLoading } = useQuery({
    queryKey: ["/api/expenses", { userId: user?.id }],
    queryFn: () => fetch(`/api/expenses?userId=${user?.id}`).then(res => res.json()),
  });

  const { data: teams = [] } = useQuery({
    queryKey: ["/api/teams"],
    queryFn: () => fetch("/api/teams").then(res => res.json()),
    enabled: user?.role === "manager" || user?.role === "admin",
  });

  const dataToAnalyze = user?.role === "manager" || user?.role === "admin" ? expenses : userExpenses;
  const isLoading = user?.role === "manager" || user?.role === "admin" ? expensesLoading : userExpensesLoading;

  // Filter expenses by date range
  const filterByDateRange = (expenses: any[]) => {
    const days = parseInt(dateRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return expenses.filter(expense => 
      new Date(expense.createdAt) >= cutoffDate
    );
  };

  const filteredExpenses = filterByDateRange(dataToAnalyze);

  // Calculate summary statistics
  const totalExpenses = filteredExpenses.length;
  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  const approvedExpenses = filteredExpenses.filter(e => e.status === "approved").length;
  const approvedAmount = filteredExpenses
    .filter(e => e.status === "approved")
    .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
  const averageExpense = totalExpenses > 0 ? totalAmount / totalExpenses : 0;

  // Expenses by category
  const categoryData = filteredExpenses.reduce((acc, expense) => {
    const category = expense.category;
    const categoryLabel = {
      travel: "Travel",
      meals: "Meals & Entertainment",
      marketing: "Marketing",
      office_supplies: "Office Supplies",
      client_entertainment: "Client Entertainment",
      other: "Other"
    }[category] || category;

    if (!acc[categoryLabel]) {
      acc[categoryLabel] = { name: categoryLabel, value: 0, count: 0 };
    }
    acc[categoryLabel].value += parseFloat(expense.amount);
    acc[categoryLabel].count += 1;
    return acc;
  }, {} as Record<string, { name: string; value: number; count: number }>);

  const categoryChartData = Object.values(categoryData);

  // Monthly trend data
  const monthlyData = filteredExpenses.reduce((acc, expense) => {
    const date = new Date(expense.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

    if (!acc[monthKey]) {
      acc[monthKey] = { month: monthName, amount: 0, count: 0 };
    }
    acc[monthKey].amount += parseFloat(expense.amount);
    acc[monthKey].count += 1;
    return acc;
  }, {} as Record<string, { month: string; amount: number; count: number }>);

  const monthlyChartData = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));

  // Status distribution
  const statusData = [
    { name: "Pending", value: filteredExpenses.filter(e => e.status === "pending").length, color: "#eab308" },
    { name: "Submitted", value: filteredExpenses.filter(e => e.status === "submitted").length, color: "#3b82f6" },
    { name: "Approved", value: filteredExpenses.filter(e => e.status === "approved").length, color: "#10b981" },
    { name: "Rejected", value: filteredExpenses.filter(e => e.status === "rejected").length, color: "#ef4444" },
  ].filter(item => item.value > 0);

  const handleExport = () => {
    // In a real application, this would generate and download a report
    const csvContent = [
      ["Date", "Title", "Category", "Amount", "Status"],
      ...filteredExpenses.map(expense => [
        new Date(expense.createdAt).toLocaleDateString(),
        expense.title,
        expense.category,
        expense.amount,
        expense.status
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expense-report-${dateRange}days.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Expense Reports</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Analytics and insights for your expense data
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {totalExpenses} expense{totalExpenses === 1 ? '' : 's'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Amount</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${approvedAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {approvedExpenses} approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Expense</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averageExpense.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              per expense
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approval Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalExpenses > 0 ? Math.round((approvedExpenses / totalExpenses) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              of all expenses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="status">Status</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Spending Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Amount']} />
                    <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expense Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Expenses by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={categoryChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Amount']} />
                    <Bar dataKey="value" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryChartData.map((category, index) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${category.value.toFixed(2)}</div>
                        <div className="text-sm text-gray-500">{category.count} expense{category.count === 1 ? '' : 's'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Spending Trends Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Amount']} />
                  <Bar dataKey="amount" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statusData.map((status) => (
                    <div key={status.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: status.color }}
                        />
                        <span className="font-medium">{status.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="outline"
                          style={{ borderColor: status.color, color: status.color }}
                        >
                          {status.value}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Processing Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Approval Rate</span>
                      <span>{totalExpenses > 0 ? Math.round((approvedExpenses / totalExpenses) * 100) : 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${totalExpenses > 0 ? (approvedExpenses / totalExpenses) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Processed Expenses</span>
                      <span>{Math.round(((approvedExpenses + filteredExpenses.filter(e => e.status === "rejected").length) / totalExpenses) * 100) || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${totalExpenses > 0 ? ((approvedExpenses + filteredExpenses.filter(e => e.status === "rejected").length) / totalExpenses) * 100 : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
