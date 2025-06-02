import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Copy, Key, Download, CheckCircle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

interface LicenseKey {
  id: number;
  key: string;
  userCount: number;
  status: string;
  createdAt: string;
}

export default function LicenseSuccessPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [generatedKey, setGeneratedKey] = useState<LicenseKey | null>(null);

  const generateKey = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/user/license-keys");
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedKey(data);
      queryClient.invalidateQueries({ queryKey: ["/api/user/license-keys"] });
      toast({
        title: "License Key Generated",
        description: "Your QualityBytes license key has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate license key. Please try again.",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "License key copied to clipboard.",
    });
  };

  const downloadDocumentation = () => {
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
   LICENSE_KEY=${generatedKey?.key || 'YOUR_LICENSE_KEY_HERE'}
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

Your license key supports up to ${generatedKey?.userCount || 'N'} concurrent users.

On startup, the app validates your license key. Successful activation shows:
\`\`\`
[INFO] License validated for key: ${generatedKey?.key || 'XXXX-XXXX-XXXX'}
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
- **License Key**: ${generatedKey?.key || 'Not yet generated'}

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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-4">
      <div className="max-w-4xl mx-auto pt-20">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Purchase Successful!
          </h1>
          <p className="text-lg text-slate-600">
            Your QualityBytes subscription is now active. Generate your license key below to get started.
          </p>
        </div>

        {/* License Key Generation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Key className="h-5 w-5 text-primary" />
              License Key Generation
            </CardTitle>
            <CardDescription>
              Generate your unique license key to activate QualityBytes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!generatedKey ? (
              <div className="text-center py-8">
                <Button
                  onClick={() => generateKey.mutate()}
                  disabled={generateKey.isPending}
                  size="lg"
                  className="mb-4"
                >
                  {generateKey.isPending ? "Generating..." : "Generate License Key"}
                </Button>
                <p className="text-sm text-slate-600">
                  Click to generate your unique license key for QualityBytes
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Your License Key:</span>
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <code className="text-lg font-mono bg-white px-3 py-2 rounded border flex-1">
                      {generatedKey.key}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(generatedKey.key)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Licensed for {generatedKey.userCount} concurrent users
                  </p>
                </div>

                <div className="flex space-x-4">
                  <Button onClick={downloadDocumentation} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download Setup Guide
                  </Button>
                  <Button asChild variant="outline" className="flex-1">
                    <Link href="/dashboard">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Go to Dashboard
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Setup Instructions */}
        {generatedKey && (
          <Card>
            <CardHeader>
              <CardTitle>Quick Setup Instructions</CardTitle>
              <CardDescription>
                Follow these steps to get QualityBytes running
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Download the setup guide</h4>
                    <p className="text-sm text-slate-600">
                      Click "Download Setup Guide" above for complete installation instructions
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Clone the repository</h4>
                    <code className="block text-sm bg-slate-100 p-2 rounded mt-1">
                      git clone https://github.com/samosalabs/qualitybytes.git
                    </code>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Configure your license</h4>
                    <p className="text-sm text-slate-600 mb-1">Create a .env file with your license key:</p>
                    <code className="block text-sm bg-slate-100 p-2 rounded">
                      LICENSE_KEY={generatedKey.key}
                    </code>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium">Start the application</h4>
                    <code className="block text-sm bg-slate-100 p-2 rounded mt-1">
                      docker-compose up -d
                    </code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}