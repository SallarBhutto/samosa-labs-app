import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  CreditCard, 
  Key, 
  DollarSign,
  Shield,
  Search,
  MoreHorizontal,
  Ban,
  RotateCcw,
  TrendingUp,
} from "lucide-react";
import { Link } from "wouter";
import type { User, Subscription, SubscriptionPlan, LicenseKey } from "@shared/schema";

interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalLicenseKeys: number;
  monthlyRevenue: number;
}

interface UserWithSubscription extends User {
  subscription?: Subscription & { plan: SubscriptionPlan };
}

interface LicenseKeyWithDetails extends LicenseKey {
  user: User;
  subscription: Subscription & { plan: SubscriptionPlan };
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userSearch, setUserSearch] = useState("");
  const [licenseFilter, setLicenseFilter] = useState("all");

  // Redirect if not admin
  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-slate-900">Access Denied</h1>
            <p className="mt-2 text-sm text-slate-600">Administrator privileges required</p>
            <Link href="/">
              <Button className="mt-4">Return to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: users, isLoading: usersLoading } = useQuery<UserWithSubscription[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: licenseKeys, isLoading: keysLoading } = useQuery<LicenseKeyWithDetails[]>({
    queryKey: ["/api/admin/license-keys"],
  });

  const revokeKeyMutation = useMutation({
    mutationFn: (keyId: number) => apiRequest("DELETE", `/api/admin/license-keys/${keyId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/license-keys"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Success",
        description: "License key revoked successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to revoke license key",
        variant: "destructive",
      });
    },
  });

  const handleLogout = async () => {
    try {
      // Call logout endpoint
      await apiRequest("POST", "/api/auth/logout");
      
      // Clear token from localStorage
      localStorage.removeItem("token");
      
      // Invalidate all queries
      queryClient.clear();
      
      // Redirect to landing page
      window.location.href = "/";
    } catch (error) {
      // Even if logout fails, clear local state
      localStorage.removeItem("token");
      queryClient.clear();
      window.location.href = "/";
    }
  };

  const filteredUsers = users?.filter(user => 
    user.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(userSearch.toLowerCase())
  ) || [];

  const filteredLicenseKeys = licenseKeys?.filter(key => {
    if (licenseFilter === "all") return true;
    return key.status === licenseFilter;
  }) || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/">
                <h1 className="text-xl font-bold text-slate-900 cursor-pointer">QualityBytes</h1>
              </Link>
              <div className="hidden sm:flex sm:space-x-8">
                <Link href="/admin" className="border-primary text-slate-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Admin
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Admin Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-slate-600">Manage users, subscriptions, and licenses</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                <Shield className="h-4 w-4 mr-2" />
                Admin Access
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid gap-6 mb-8 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Total Users</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {statsLoading ? "..." : stats?.totalUsers?.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-emerald-100">
                  <CreditCard className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Active Subscriptions</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {statsLoading ? "..." : stats?.activeSubscriptions?.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-amber-100">
                  <Key className="h-6 w-6 text-amber-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">License Keys</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {statsLoading ? "..." : stats?.totalLicenseKeys?.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-100">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {statsLoading ? "..." : formatCurrency(stats?.monthlyRevenue || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Users Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Users</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      placeholder="Search users..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-10 w-48"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3 p-4 animate-pulse">
                      <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.profileImageUrl || undefined} alt={user.email || ""} />
                          <AvatarFallback>
                            {user.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {user.firstName && user.lastName 
                              ? `${user.firstName} ${user.lastName}` 
                              : user.email
                            }
                          </p>
                          <p className="text-sm text-slate-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {user.subscription ? (
                          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                            {user.subscription.plan.name}
                          </Badge>
                        ) : (
                          <Badge variant="outline">No Plan</Badge>
                        )}
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* License Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>License Activity</CardTitle>
                <Select value={licenseFilter} onValueChange={setLicenseFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="revoked">Revoked</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {keysLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="p-4 border border-slate-200 rounded-lg animate-pulse">
                      <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredLicenseKeys.map((key) => (
                    <div key={key.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                      <div className="flex items-center justify-between mb-2">
                        <code className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">
                          {key.key}
                        </code>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            className={
                              key.status === 'active' 
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
                                : key.status === 'revoked'
                                ? 'bg-red-100 text-red-800 hover:bg-red-100'
                                : 'bg-amber-100 text-amber-800 hover:bg-amber-100'
                            }
                          >
                            {key.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => revokeKeyMutation.mutate(key.id)}
                            disabled={key.status !== 'active' || revokeKeyMutation.isPending}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-slate-600">
                        <span>{key.user.email}</span>
                        <span>{key.lastUsed ? new Date(key.lastUsed).toLocaleDateString() : 'Never used'}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Plan: {key.subscription.plan.name} • Usage: {key.usageCount || 0} times
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart Placeholder */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Revenue Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <p className="text-slate-600">Revenue chart would be implemented here</p>
                <p className="text-sm text-slate-500">Integration with Chart.js or similar library</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
