import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, X, MessageCircle, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

interface User {
  id: number;
  name: string;
  email: string;
  bio?: string;
  location?: string;
  profilePicture?: string;
}

interface Skill {
  id: number;
  name: string;
  level: string;
  description?: string;
}

interface Match {
  id: number;
  teacherId: number;
  learnerId: number;
  skillId: number;
  status: "pending" | "accepted" | "declined" | "completed";
  createdAt: string;
}

interface MatchSuggestion {
  teacher: User;
  learner: { id: number };
  skill: Skill;
  learningSkill: Skill;
}

export default function Matches() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: myMatches = [], isLoading: matchesLoading } = useQuery({
    queryKey: ["/api/matches", { userId: user?.id }],
    enabled: !!user?.id,
  });

  const { data: suggestions = [], isLoading: suggestionsLoading } = useQuery({
    queryKey: ["/api/matches/suggestions", user?.id],
    enabled: !!user?.id,
  });

  const createMatchMutation = useMutation({
    mutationFn: async (suggestion: MatchSuggestion) => {
      const response = await apiRequest("POST", "/api/matches", {
        teacherId: suggestion.teacher.id,
        learnerId: suggestion.learner.id,
        skillId: suggestion.skill.id,
        status: "pending",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
      queryClient.invalidateQueries({ queryKey: ["/api/matches/suggestions"] });
      toast({
        title: "Match Request Sent",
        description: "Your learning request has been sent to the teacher!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send match request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMatchMutation = useMutation({
    mutationFn: async ({ matchId, status }: { matchId: number; status: string }) => {
      const response = await apiRequest("PUT", `/api/matches/${matchId}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/matches"] });
      toast({
        title: "Match Updated",
        description: "Match status has been updated successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update match. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendRequest = (suggestion: MatchSuggestion) => {
    createMatchMutation.mutate(suggestion);
  };

  const handleAcceptMatch = (matchId: number) => {
    updateMatchMutation.mutate({ matchId, status: "accepted" });
  };

  const handleDeclineMatch = (matchId: number) => {
    updateMatchMutation.mutate({ matchId, status: "declined" });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "accepted": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "declined": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "completed": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const pendingMatches = myMatches.filter((match: Match) => match.status === "pending");
  const activeMatches = myMatches.filter((match: Match) => match.status === "accepted");
  const completedMatches = myMatches.filter((match: Match) => match.status === "completed");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Skill Matches</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Connect with teachers and learners to exchange knowledge
        </p>
      </div>

      <Tabs defaultValue="suggestions" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="suggestions">
            Suggestions ({suggestions.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({pendingMatches.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active ({activeMatches.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedMatches.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="suggestions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Suggested Matches</h2>
            <Badge variant="outline">
              {suggestions.length} available
            </Badge>
          </div>
          {suggestionsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : suggestions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-center">
                  No suggestions available.<br />
                  Add more learning skills to find potential teachers!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {suggestions.map((suggestion: MatchSuggestion, index: number) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={suggestion.teacher.profilePicture} />
                          <AvatarFallback>
                            {suggestion.teacher.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{suggestion.teacher.name}</CardTitle>
                          <CardDescription>
                            Can teach: <strong>{suggestion.skill.name}</strong>
                          </CardDescription>
                          {suggestion.teacher.location && (
                            <p className="text-sm text-gray-500 mt-1">
                              📍 {suggestion.teacher.location}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        {suggestion.skill.level}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {suggestion.teacher.bio && (
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {suggestion.teacher.bio}
                      </p>
                    )}
                    {suggestion.skill.description && (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <strong>About their teaching:</strong> {suggestion.skill.description}
                        </p>
                      </div>
                    )}
                    <div className="flex justify-end">
                      <Button 
                        onClick={() => handleSendRequest(suggestion)}
                        disabled={createMatchMutation.isPending}
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        Send Learning Request
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <h2 className="text-xl font-semibold">Pending Matches</h2>
          {matchesLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : pendingMatches.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-center">
                  No pending matches.<br />
                  Send learning requests to connect with teachers!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingMatches.map((match: Match) => (
                <Card key={match.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Match Request</CardTitle>
                      <Badge className={getStatusColor(match.status)}>
                        {match.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {match.teacherId === user?.id 
                        ? "Someone wants to learn from you" 
                        : "Waiting for teacher response"}
                    </p>
                    {match.teacherId === user?.id && (
                      <div className="flex space-x-2">
                        <Button 
                          onClick={() => handleAcceptMatch(match.id)}
                          disabled={updateMatchMutation.isPending}
                        >
                          <Heart className="w-4 h-4 mr-2" />
                          Accept
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => handleDeclineMatch(match.id)}
                          disabled={updateMatchMutation.isPending}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Decline
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <h2 className="text-xl font-semibold">Active Matches</h2>
          {activeMatches.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageCircle className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-center">
                  No active matches yet.<br />
                  Accept match requests to start learning exchanges!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {activeMatches.map((match: Match) => (
                <Card key={match.id} className="border-l-4 border-l-green-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Active Learning Exchange</CardTitle>
                      <Badge className={getStatusColor(match.status)}>
                        {match.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {match.teacherId === user?.id 
                        ? "You are teaching in this exchange" 
                        : "You are learning in this exchange"}
                    </p>
                    <div className="flex space-x-2">
                      <Link href="/messages">
                        <Button>
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Send Message
                        </Button>
                      </Link>
                      <Button variant="outline">
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule Session
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <h2 className="text-xl font-semibold">Completed Matches</h2>
          {completedMatches.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-center">
                  No completed matches yet.<br />
                  Complete your learning exchanges to build your skill history!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {completedMatches.map((match: Match) => (
                <Card key={match.id} className="border-l-4 border-l-gray-400">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Completed Exchange</CardTitle>
                      <Badge className={getStatusColor(match.status)}>
                        {match.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300">
                      Successfully completed skill exchange
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}