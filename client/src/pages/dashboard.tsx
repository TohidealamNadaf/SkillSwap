import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  BookOpen, 
  Users, 
  MessageCircle, 
  TrendingUp,
  GraduationCap,
  Clock,
  CheckCircle,
  Plus
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

interface DashboardStats {
  totalSkills: number;
  teachingSkills: number;
  learningSkills: number;
  activeMatches: number;
  completedMatches: number;
  pendingMatches: number;
}

export default function Dashboard() {
  const { user } = useAuth();

  const { data: skills = [], isLoading: skillsLoading } = useQuery({
    queryKey: ["/api/skills", { userId: user?.id }],
    enabled: !!user?.id,
  });

  const { data: matches = [], isLoading: matchesLoading } = useQuery({
    queryKey: ["/api/matches", { userId: user?.id }],
    enabled: !!user?.id,
  });

  const { data: suggestions = [], isLoading: suggestionsLoading } = useQuery({
    queryKey: ["/api/matches/suggestions", user?.id],
    enabled: !!user?.id,
  });

  const stats: DashboardStats = {
    totalSkills: skills.length,
    teachingSkills: skills.filter((skill: any) => skill.type === "teach").length,
    learningSkills: skills.filter((skill: any) => skill.type === "learn").length,
    activeMatches: matches.filter((match: any) => match.status === "accepted").length,
    completedMatches: matches.filter((match: any) => match.status === "completed").length,
    pendingMatches: matches.filter((match: any) => match.status === "pending").length,
  };

  const isLoading = skillsLoading || matchesLoading || suggestionsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Ready to share knowledge and learn new skills? Here's your activity overview.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/skills">
          <Card className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Add New Skill</CardTitle>
              <Plus className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Share what you can teach or want to learn
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/matches">
          <Card className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Find Matches</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Connect with teachers and learners
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/messages">
          <Card className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageCircle className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Chat with your learning partners
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Skills</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSkills}</div>
            <p className="text-xs text-muted-foreground">
              {stats.teachingSkills} teaching, {stats.learningSkills} learning
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Matches</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeMatches}</div>
            <p className="text-xs text-muted-foreground">
              Currently learning or teaching
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingMatches}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting response
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedMatches}</div>
            <p className="text-xs text-muted-foreground">
              Successful exchanges
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <GraduationCap className="w-5 h-5 mr-2" />
              Your Skills
            </CardTitle>
            <CardDescription>
              Skills you can teach and want to learn
            </CardDescription>
          </CardHeader>
          <CardContent>
            {skills.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No skills added yet</p>
                <Link href="/skills">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Skill
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {skills.slice(0, 4).map((skill: any) => (
                  <div key={skill.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{skill.name}</p>
                      <p className="text-sm text-gray-600 capitalize">{skill.level}</p>
                    </div>
                    <Badge variant={skill.type === "teach" ? "default" : "secondary"}>
                      {skill.type === "teach" ? "Teaching" : "Learning"}
                    </Badge>
                  </div>
                ))}
                {skills.length > 4 && (
                  <Link href="/skills">
                    <Button variant="outline" className="w-full">
                      View All Skills ({skills.length})
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Suggested Matches */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Suggested Matches
            </CardTitle>
            <CardDescription>
              Teachers who can help you learn
            </CardDescription>
          </CardHeader>
          <CardContent>
            {suggestions.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">
                  {skills.filter((s: any) => s.type === "learn").length === 0 
                    ? "Add learning skills to get suggestions"
                    : "No matching teachers found"}
                </p>
                <Link href="/skills">
                  <Button variant="outline">
                    {skills.filter((s: any) => s.type === "learn").length === 0 ? "Add Learning Skills" : "Browse Skills"}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {suggestions.slice(0, 3).map((suggestion: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={suggestion.teacher.profilePicture} />
                        <AvatarFallback>
                          {suggestion.teacher.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{suggestion.teacher.name}</p>
                        <p className="text-xs text-gray-600">{suggestion.skill.name}</p>
                      </div>
                    </div>
                    <Badge className="text-xs">
                      {suggestion.skill.level}
                    </Badge>
                  </div>
                ))}
                <Link href="/matches">
                  <Button variant="outline" className="w-full">
                    View All Suggestions ({suggestions.length})
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}