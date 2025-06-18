import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Send, Receipt } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export interface Expense {
  id: number;
  title: string;
  description?: string;
  amount: string;
  category: string;
  status: string;
  receiptUrl?: string;
  createdAt: string;
  submittedAt?: string;
  approvedAt?: string;
  userId: number;
}

interface ExpenseCardProps {
  expense: Expense;
  showActions?: boolean;
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case "pending":
      return "status-pending";
    case "submitted":
      return "status-submitted";
    case "approved":
      return "status-approved";
    case "rejected":
      return "status-rejected";
    default:
      return "status-pending";
  }
};

const getCategoryLabel = (category: string) => {
  const categoryMap: Record<string, string> = {
    travel: "Travel",
    meals: "Meals & Entertainment",
    marketing: "Marketing",
    office_supplies: "Office Supplies",
    client_entertainment: "Client Entertainment",
    other: "Other",
  };
  return categoryMap[category] || category;
};

export function ExpenseCard({ expense, showActions = true }: ExpenseCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const submitExpenseMutation = useMutation({
    mutationFn: async (expenseId: number) => {
      return apiRequest("POST", `/api/expenses/${expenseId}/submit`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({
        title: "Success",
        description: "Expense submitted for approval",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit expense",
        variant: "destructive",
      });
    },
  });

  const deleteExpenseMutation = useMutation({
    mutationFn: async (expenseId: number) => {
      return apiRequest("DELETE", `/api/expenses/${expenseId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      toast({
        title: "Success",
        description: "Expense deleted",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    submitExpenseMutation.mutate(expense.id);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this expense?")) {
      deleteExpenseMutation.mutate(expense.id);
    }
  };

  const canEdit = expense.status === "pending";
  const canSubmit = expense.status === "pending";
  const canDelete = expense.status === "pending" || expense.status === "rejected";

  return (
    <Card className="expense-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="font-semibold text-lg">{expense.title}</h3>
            <Badge className={`status-badge ${getStatusBadgeClass(expense.status)}`}>
              {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
            </Badge>
          </div>
          {showActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canEdit && (
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                {canSubmit && (
                  <DropdownMenuItem onClick={handleSubmit}>
                    <Send className="mr-2 h-4 w-4" />
                    Submit
                  </DropdownMenuItem>
                )}
                {expense.receiptUrl && (
                  <DropdownMenuItem>
                    <Receipt className="mr-2 h-4 w-4" />
                    View Receipt
                  </DropdownMenuItem>
                )}
                {canDelete && (
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">
              ${parseFloat(expense.amount).toFixed(2)}
            </span>
            <Badge variant="outline" className="category-badge">
              {getCategoryLabel(expense.category)}
            </Badge>
          </div>
          
          {expense.description && (
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {expense.description}
            </p>
          )}
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Created: {new Date(expense.createdAt).toLocaleDateString()}</span>
            {expense.submittedAt && (
              <span>Submitted: {new Date(expense.submittedAt).toLocaleDateString()}</span>
            )}
            {expense.approvedAt && (
              <span>Approved: {new Date(expense.approvedAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
