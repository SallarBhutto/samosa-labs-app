import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  CreditCard, 
  Key, 
  Copy, 
  Trash2, 
  Plus,
  ExternalLink,
  Settings,
} from "lucide-react";
import { Link } from "wouter";
import type { Subscription, SubscriptionPlan, LicenseKey } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: subscription, isLoading: subscriptionLoading } = useQuery<Subscription & { plan: SubscriptionPlan }>({
    queryKey: ["/api/user/subscription"],
  });

  const { data: licenseKeys, isLoading: keysLoading } = useQuery<LicenseKey[]>({
    queryKey: ["/api/user/license-keys"],
  });

  const createKeyMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/user/license-keys"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/license-keys"] });
      toast({
        title: "Success",
        description: "New license key generated successfully!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate license key",
        variant: "destructive",
      });
    },
  });

  const revokeKeyMutation = useMutation({
    mutationFn: (keyId: number) => apiRequest("DELETE", `/api/user/license-keys/${keyId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user/license-keys"] });
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "License key copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const getUsagePercentage = () => {
    if (!subscription || !licenseKeys) return 0;
    if (subscription.plan.maxLicenses === -1) return 0; // unlimited
    return (licenseKeys.length / subscription.plan.maxLicenses) * 100;
  };

  const canCreateNewKey = () => {
    if (!subscription || !licenseKeys) return false;
    return subscription.plan.maxLicenses === -1 || licenseKeys.length < subscription.plan.maxLicenses;
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
                <Link href="/" className="border-primary text-slate-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Dashboard
                </Link>
                {user?.isAdmin && (
                  <Link href="/admin" className="border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                    Admin
                  </Link>
                )}
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

      {/* Dashboard Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-slate-600">{user?.email}</p>
            </div>
            <div className="flex items-center space-x-4">
              {subscription && (
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></div>
                  Active Subscription
                </Badge>
              )}
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Current Plan Card */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Current Subscription</CardTitle>
                  {subscription && (
                    <Link href="/subscribe">
                      <Button variant="outline" size="sm">
                        Manage Plan
                      </Button>
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {subscriptionLoading ? (
                  <div className="space-y-4">
                    <div className="h-20 bg-slate-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-slate-200 rounded animate-pulse"></div>
                  </div>
                ) : subscription ? (
                  <div className="border border-slate-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{subscription.plan.name} Plan</h3>
                        <p className="text-slate-600">{subscription.plan.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-slate-900">${subscription.plan.price}</div>
                        <div className="text-slate-600">per month</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-700">License Keys Used</span>
                        <span className="font-medium">
                          {licenseKeys?.length || 0} of {subscription.plan.maxLicenses === -1 ? '∞' : subscription.plan.maxLicenses}
                        </span>
                      </div>
                      {subscription.plan.maxLicenses !== -1 && (
                        <Progress value={getUsagePercentage()} className="w-full" />
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Next billing date</span>
                        <span className="font-medium">
                          {subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CreditCard className="mx-auto h-12 w-12 text-slate-400" />
                    <h3 className="mt-4 text-lg font-medium text-slate-900">No active subscription</h3>
                    <p className="mt-2 text-sm text-slate-600">Subscribe to a plan to start using QualityBytes</p>
                    <Link href="/subscribe">
                      <Button className="mt-4">
                        Choose a Plan
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* License Keys */}
            <Card className="mt-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Key className="h-5 w-5 mr-2" />
                    License Keys
                  </CardTitle>
                  <Button 
                    onClick={() => createKeyMutation.mutate()}
                    disabled={!canCreateNewKey() || createKeyMutation.isPending}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Generate New Key
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {keysLoading ? (
                  <div className="space-y-4">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="h-16 bg-slate-200 rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : licenseKeys && licenseKeys.length > 0 ? (
                  <div className="space-y-4">
                    {licenseKeys.map((key) => (
                      <div key={key.id} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <code className="bg-slate-100 px-3 py-1 rounded text-sm font-mono">{key.key}</code>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => copyToClipboard(key.key)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="mt-2 flex items-center space-x-4 text-sm text-slate-600">
                              <span>Created: {new Date(key.createdAt!).toLocaleDateString()}</span>
                              <span>Last Used: {key.lastUsed ? new Date(key.lastUsed).toLocaleString() : 'Never'}</span>
                              <span>Usage: {key.usageCount || 0} times</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge className={key.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}>
                              {key.status}
                            </Badge>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => revokeKeyMutation.mutate(key.id)}
                              disabled={revokeKeyMutation.isPending}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Key className="mx-auto h-12 w-12 text-slate-400" />
                    <h3 className="mt-4 text-lg font-medium text-slate-900">No license keys</h3>
                    <p className="mt-2 text-sm text-slate-600">Generate your first license key to get started</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="ghost" className="w-full justify-start">
                  <CreditCard className="h-4 w-4 mr-3" />
                  Update Payment Method
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <ExternalLink className="h-4 w-4 mr-3" />
                  API Documentation
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-3" />
                  Account Settings
                </Button>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={user?.profileImageUrl || undefined} alt={user?.email || ""} />
                    <AvatarFallback>
                      {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-slate-900">
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}` 
                        : user?.email
                      }
                    </p>
                    <p className="text-sm text-slate-600">{user?.email}</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Member since</span>
                    <span className="font-medium">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Account Type</span>
                    <span className="font-medium">
                      {user?.isAdmin ? 'Administrator' : 'Standard User'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
