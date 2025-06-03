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
  Download,
} from "lucide-react";
import { Link } from "wouter";
import type { Subscription, LicenseKey } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: subscription, isLoading: subscriptionLoading } = useQuery<Subscription>({
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

  const managePlanMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/create-portal-session");
      return response.json();
    },
    onSuccess: (data) => {
      if (data.error === 'portal_not_configured') {
        // Fallback to subscribe page if portal not configured
        toast({
          title: "Billing Portal Unavailable",
          description: "Redirecting to subscription management...",
        });
        window.location.href = data.fallbackUrl;
      } else {
        // Redirect to Stripe Customer Portal
        window.location.href = data.url;
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to open billing portal. Please try again.",
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

  const downloadDocumentation = (licenseKey?: string) => {
    const documentation = `# QualityBytes - Self-Hosted Docker Application

Welcome to QualityBytes! This guide will help you install and configure your self-hosted application.

## Prerequisites

* **Docker Engine**: version 20.10 or higher
* **Docker Compose**: version 1.29 or higher  
* **Linux / macOS / Windows**: any OS supporting Docker
* **Internet Access**: to pull images

## Installation

1. **Clone or Download** the repository:
   \`\`\`bash
   git clone https://github.com/samosalabs/qualitybytes.git
   cd qualitybytes
   \`\`\`

2. **Create a .env file**:
   \`\`\`dotenv
   LICENSE_KEY=${licenseKey || 'YOUR_LICENSE_KEY_HERE'}
   APP_PORT=80
   \`\`\`

## Configuration

| Variable      | Description                       | Default           |
| ------------- | --------------------------------- | ----------------- |
| \`LICENSE_KEY\` | Your purchased license key       | *Required*        |
| \`APP_PORT\`    | Port the app listens on          | \`80\`            |
| \`DB_URL\`      | External database URL (optional) | *Built-in SQLite* |

## Docker Compose Example

\`\`\`yaml
version: '3.8'
services:
  qualitybytes:
    image: samosalabs/qualitybytes:latest
    container_name: qualitybytes-app
    ports:
      - "\${APP_PORT:-80}:80"
    env_file:
      - .env
    restart: unless-stopped
    volumes:
      - data:/app/data

volumes:
  data:
\`\`\`

## License Activation

${subscription ? `Your license key supports up to ${subscription.userCount} concurrent users.` : 'Your license key will determine the number of concurrent users allowed.'}

On startup, the app validates your license key. Successful activation shows:
\`\`\`
[INFO] License validated for key: ${licenseKey ? licenseKey.substring(0, 12) + '...' : 'XXXX-XXXX-XXXX'}
[INFO] QualityBytes started on port 80
\`\`\`

## Running the Application

\`\`\`bash
# Start the application
docker-compose up -d

# View logs
docker-compose logs -f qualitybytes

# Stop the application  
docker-compose down
\`\`\`

## Updating

\`\`\`bash
# Pull latest version
docker-compose pull qualitybytes

# Restart with new version
docker-compose up -d
\`\`\`

## Troubleshooting

| Issue                       | Solution                                          |
| --------------------------- | ------------------------------------------------- |
| Container exits immediately | Check LICENSE_KEY in .env for typos             |
| Port conflict               | Change APP_PORT in .env to different port       |
| License validation fails    | Verify internet connectivity to license server   |

## Support

For technical support, contact us at:
- **Email**: info@samosalabs.com
- **License Key**: ${licenseKey || 'Not yet generated'}

---

Thank you for choosing QualityBytes from SamosaLabs!
`;

    const blob = new Blob([documentation], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qualitybytes-setup-guide.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded",
      description: "Setup guide downloaded successfully!",
    });
  };

  const handleLogout = async () => {
    try {
      // Call the logout API to invalidate the token on the server
      await apiRequest("POST", "/api/auth/logout");
    } catch (error) {
      // Continue with logout even if API call fails
    }
    
    // Clear the token from localStorage
    localStorage.removeItem('auth_token');
    
    // Invalidate all queries to clear cached user data
    queryClient.clear();
    
    // Redirect to landing page
    window.location.href = "/";
  };

  const getUsagePercentage = () => {
    return 0; // No longer needed in per-user pricing model
  };

  const canCreateNewKey = () => {
    if (!subscription || !licenseKeys) return false;
    return licenseKeys.length === 0; // Only one license key per subscription
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
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => managePlanMutation.mutate()}
                      disabled={managePlanMutation.isPending}
                    >
                      {managePlanMutation.isPending ? "Opening..." : "Manage Plan"}
                    </Button>
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
                        <h3 className="text-xl font-bold text-slate-900">QualityBytes License</h3>
                        <p className="text-slate-600">Per-user licensing for {subscription.userCount} users</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-slate-900">${subscription.totalPrice}</div>
                        <div className="text-slate-600">total cost</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-700">User Capacity</span>
                        <span className="font-medium">
                          {subscription.userCount} users licensed
                        </span>
                      </div>
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
                    <Link href="/purchase">
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
                  <div className="flex space-x-2">
                    {licenseKeys && licenseKeys.length > 0 && (
                      <Button 
                        onClick={() => downloadDocumentation(licenseKeys[0]?.key)}
                        variant="outline"
                        size="sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Setup Guide
                      </Button>
                    )}
                    <Button 
                      onClick={() => createKeyMutation.mutate()}
                      disabled={!canCreateNewKey() || createKeyMutation.isPending}
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Generate New Key
                    </Button>
                  </div>
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
