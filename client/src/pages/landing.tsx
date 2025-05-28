import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Users, Shield, Zap } from "lucide-react";
import { Link } from "wouter";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-slate-900">SamosaLabs</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button asChild variant="outline">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            QualityBytes License Manager
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Professional license management for your QualityBytes software. 
            Simple per-user pricing with powerful validation and tracking.
          </p>
          <Button asChild size="lg" className="text-lg px-8 py-3">
            <Link href="/register">Start Your Free Trial</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Choose SamosaLabs?</h2>
            <p className="text-xl text-slate-600">Built by developers, for developers</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Licensing</h3>
              <p className="text-slate-600">
                Advanced license validation with user count tracking and real-time verification.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Team Management</h3>
              <p className="text-slate-600">
                Easily manage user access and track usage across your entire team.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Simple Integration</h3>
              <p className="text-slate-600">
                Easy API integration with comprehensive documentation and support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Simple Per-User Pricing</h2>
            <p className="text-xl text-slate-600">Pay only for what you need - $5 per user per month</p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="border-primary shadow-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-3xl flex items-center justify-center gap-3">
                  <Users className="h-8 w-8 text-primary" />
                  QualityBytes License
                </CardTitle>
                <CardDescription className="text-lg">
                  Scale your team with our powerful quality assurance tools
                </CardDescription>
                <div className="mt-6">
                  <span className="text-5xl font-bold text-primary">$5</span>
                  <span className="text-slate-600 text-xl">/user/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>One license key per subscription</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>User count tracking and validation</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>24/7 customer support</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Regular updates and improvements</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>API access for integration</span>
                  </li>
                </ul>
                <Button asChild className="w-full" size="lg">
                  <Link href="/register">Get Started Today</Link>
                </Button>
                <p className="text-center text-sm text-slate-500 mt-4">
                  Choose your user count during purchase
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">SamosaLabs</h3>
            <p className="text-slate-400">Professional software licensing solutions</p>
            <div className="mt-6 space-x-4">
              <Button asChild variant="outline" className="text-white border-white hover:bg-white hover:text-slate-900">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}