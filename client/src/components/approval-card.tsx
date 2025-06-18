import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, User, Receipt } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export interface ExpenseWithUser {
  id: number;
  title: string;
  description?: string;
  amount: string;
  category: string;
  status: string;
  receiptUrl?: string;
  createdAt: string;
  submittedAt?: string;
  userId: number;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface ApprovalCardProps {
  expense: ExpenseWithUser;
}

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

export function ApprovalCard({ expense }: ApprovalCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [comments, setComments] = useState("");
  const [showComments, setShowComments] = useState(false);

  const approvalMutation = useMutation({
    mutationFn: async ({ status, comments }: { status: "approved" | "rejected"; comments?: string }) => {
      return apiRequest("POST", "/api/approvals", {
        expenseId: expense.id,
        approverId: user!.id,
        status,
        comments,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/approvals"] });
      toast({
        title: "Success",
        description: `Expense ${variables.status === "approved" ? "approved" : "rejected"}`,
      });
      setComments("");
      setShowComments(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process approval",
        variant: "destructive",
      });
    },
  });

  const handleApprove = () => {
    approvalMutation.mutate({ status: "approved", comments });
  };

  const handleReject = () => {
    if (!comments.trim() && !confirm("Are you sure you want to reject without comments?")) {
      setShowComments(true);
      return;
    }
    approvalMutation.mutate({ status: "rejected", comments });
  };

  return (
    <Card className="expense-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="font-semibold text-lg">{expense.title}</h3>
            <Badge className="status-badge status-submitted">
              Pending Approval
            </Badge>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <User className="h-4 w-4" />
            <span>{expense.user ? `${expense.user.firstName} ${expense.user.lastName}` : "Unknown User"}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">
              ${parseFloat(expense.amount).toFixed(2)}
            </span>
            <Badge variant="outline" className="category-badge">
              {getCategoryLabel(expense.category)}
            </Badge>
          </div>
          
          {expense.description && (
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Description:</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {expense.description}
              </p>
            </div>
          )}
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Created: {new Date(expense.createdAt).toLocaleDateString()}</span>
            {expense.submittedAt && (
              <span>Submitted: {new Date(expense.submittedAt).toLocaleDateString()}</span>
            )}
            {expense.receiptUrl && (
              <Button variant="ghost" size="sm" className="text-xs">
                <Receipt className="h-3 w-3 mr-1" />
                View Receipt
              </Button>
            )}
          </div>

          {showComments && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Comments (optional)</label>
              <Textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Add your comments..."
                rows={3}
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowComments(!showComments)}
            >
              {showComments ? "Hide Comments" : "Add Comments"}
            </Button>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReject}
                disabled={approvalMutation.isPending}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-1" />
                Reject
              </Button>
              <Button
                size="sm"
                onClick={handleApprove}
                disabled={approvalMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-1" />
                Approve
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
