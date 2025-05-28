import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Copy, 
  Trash2, 
  Eye, 
  EyeOff,
  Calendar,
  Activity,
  Hash,
} from "lucide-react";
import type { LicenseKey } from "@shared/schema";

interface LicenseKeyCardProps {
  licenseKey: LicenseKey;
  onRevoke: (keyId: number) => void;
  onCopy?: (key: string) => void;
  isRevoking?: boolean;
  showActions?: boolean;
  variant?: "default" | "compact";
  className?: string;
}

export function LicenseKeyCard({
  licenseKey,
  onRevoke,
  onCopy,
  isRevoking = false,
  showActions = true,
  variant = "default",
  className = "",
}: LicenseKeyCardProps) {
  const { toast } = useToast();
  const [isKeyVisible, setIsKeyVisible] = useState(false);

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(licenseKey.key);
      toast({
        title: "Copied!",
        description: "License key copied to clipboard",
      });
      onCopy?.(licenseKey.key);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleRevoke = () => {
    if (window.confirm("Are you sure you want to revoke this license key? This action cannot be undone.")) {
      onRevoke(licenseKey.id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100';
      case 'revoked':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'expired':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
      default:
        return 'bg-slate-100 text-slate-800 hover:bg-slate-100';
    }
  };

  const maskedKey = licenseKey.key.replace(/(.{8})(.*)(.{4})/, '$1****$3');

  if (variant === "compact") {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <code className="bg-slate-100 px-2 py-1 rounded text-sm font-mono truncate">
                  {isKeyVisible ? licenseKey.key : maskedKey}
                </code>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsKeyVisible(!isKeyVisible)}
                >
                  {isKeyVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Created {new Date(licenseKey.createdAt!).toLocaleDateString()}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(licenseKey.status)}>
                {licenseKey.status}
              </Badge>
              {showActions && licenseKey.status === 'active' && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleCopyToClipboard}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border border-slate-200 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* License Key Display */}
            <div className="flex items-center space-x-3 mb-4">
              <code className="bg-slate-100 px-3 py-2 rounded-lg text-sm font-mono break-all">
                {isKeyVisible ? licenseKey.key : maskedKey}
              </code>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsKeyVisible(!isKeyVisible)}
                className="flex-shrink-0"
              >
                {isKeyVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              {showActions && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleCopyToClipboard}
                  className="flex-shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {/* Key Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2 text-slate-600">
                <Calendar className="h-4 w-4" />
                <span>Created: {new Date(licenseKey.createdAt!).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-slate-600">
                <Activity className="h-4 w-4" />
                <span>
                  Last Used: {licenseKey.lastUsed 
                    ? new Date(licenseKey.lastUsed).toLocaleString() 
                    : 'Never'
                  }
                </span>
              </div>
              
              <div className="flex items-center space-x-2 text-slate-600">
                <Hash className="h-4 w-4" />
                <span>Usage: {licenseKey.usageCount || 0} times</span>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center space-x-3 ml-4">
            <Badge className={getStatusColor(licenseKey.status)}>
              {licenseKey.status}
            </Badge>
            
            {showActions && licenseKey.status === 'active' && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleRevoke}
                disabled={isRevoking}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
