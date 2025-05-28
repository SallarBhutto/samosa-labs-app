import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Plus, 
  Mail, 
  Trash2,
  Crown,
  User,
  Send,
} from "lucide-react";
import type { TeamMember, User as UserType } from "@shared/schema";

interface TeamMemberWithUser extends TeamMember {
  user: UserType;
}

interface TeamMembersProps {
  subscriptionId: number;
  maxMembers?: number;
  isOwner?: boolean;
  className?: string;
}

export function TeamMembers({
  subscriptionId,
  maxMembers = -1,
  isOwner = false,
  className = "",
}: TeamMembersProps) {
  const { toast } = useToast();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  const { data: teamMembers, isLoading } = useQuery<TeamMemberWithUser[]>({
    queryKey: ["/api/team-members", subscriptionId],
    enabled: !!subscriptionId,
  });

  const inviteMemberMutation = useMutation({
    mutationFn: (email: string) => 
      apiRequest("POST", `/api/team-members/${subscriptionId}/invite`, { email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team-members", subscriptionId] });
      setIsInviteOpen(false);
      setInviteEmail("");
      toast({
        title: "Invitation Sent",
        description: "Team member invitation has been sent successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive",
      });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => 
      apiRequest("DELETE", `/api/team-members/${subscriptionId}/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team-members", subscriptionId] });
      toast({
        title: "Success",
        description: "Team member removed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove team member",
        variant: "destructive",
      });
    },
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    
    inviteMemberMutation.mutate(inviteEmail.trim());
  };

  const handleRemoveMember = (userId: string, memberName: string) => {
    if (window.confirm(`Are you sure you want to remove ${memberName} from the team?`)) {
      removeMemberMutation.mutate(userId);
    }
  };

  const canAddMembers = () => {
    if (!isOwner) return false;
    if (maxMembers === -1) return true;
    return (teamMembers?.length || 0) < maxMembers;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-amber-500" />;
      default:
        return <User className="h-4 w-4 text-slate-500" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Owner</Badge>;
      default:
        return <Badge variant="outline">Member</Badge>;
    }
  };

  const getInitials = (user: UserType) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
    }
    return user.email?.charAt(0).toUpperCase() || 'U';
  };

  const getDisplayName = (user: UserType) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email || 'Unknown User';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Team Members
            </CardTitle>
            <CardDescription>
              {maxMembers === -1 
                ? `${teamMembers?.length || 0} members` 
                : `${teamMembers?.length || 0} of ${maxMembers} members`
              }
            </CardDescription>
          </div>
          
          {canAddMembers() && (
            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Invite
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleInvite}>
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>
                      Send an invitation to join your team. They'll receive an email with instructions.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="colleague@company.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsInviteOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={inviteMemberMutation.isPending}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {inviteMemberMutation.isPending ? "Sending..." : "Send Invitation"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 animate-pulse">
                <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
                <div className="w-16 h-6 bg-slate-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : teamMembers && teamMembers.length > 0 ? (
          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div 
                key={member.id} 
                className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={member.user.profileImageUrl || undefined} 
                      alt={getDisplayName(member.user)} 
                    />
                    <AvatarFallback>
                      {getInitials(member.user)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(member.role)}
                      <p className="text-sm font-medium text-slate-900">
                        {getDisplayName(member.user)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-3 w-3 text-slate-400" />
                      <p className="text-xs text-slate-500">{member.user.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {getRoleBadge(member.role)}
                  
                  {isOwner && member.role !== 'owner' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(member.userId, getDisplayName(member.user))}
                      disabled={removeMemberMutation.isPending}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-4 text-lg font-medium text-slate-900">No team members</h3>
            <p className="mt-2 text-sm text-slate-600">
              {canAddMembers() 
                ? "Start by inviting your first team member" 
                : "Team members will appear here once invited"
              }
            </p>
            {canAddMembers() && (
              <Button 
                className="mt-4" 
                onClick={() => setIsInviteOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Invite Team Member
              </Button>
            )}
          </div>
        )}
        
        {!canAddMembers() && maxMembers !== -1 && (teamMembers?.length || 0) >= maxMembers && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              You've reached the maximum number of team members for your current plan. 
              Upgrade to add more members.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
