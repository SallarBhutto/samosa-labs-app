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
            Professional Quality Assurance Software
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            SamosaLabs presents QualityBytes - Advanced quality assurance tools for modern development teams. 
            Purchase licenses with simple per-user pricing at $5/user/month.
          </p>
          <Button asChild size="lg" className="text-lg px-8 py-3">
            <Link href="/register">Get Started</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Choose QualityBytes?</h2>
            <p className="text-xl text-slate-600">Enterprise-grade quality assurance from SamosaLabs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Advanced Quality Control</h3>
              <p className="text-slate-600">
                Comprehensive testing and validation tools to ensure your software meets the highest standards.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
              <p className="text-slate-600">
                Built for teams with seamless collaboration features and user management capabilities.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary/10 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Integration</h3>
              <p className="text-slate-600">
                Seamlessly integrate QualityBytes into your existing development workflow.
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
                    <span>Full access to QualityBytes software</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Advanced testing and validation tools</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Team collaboration features</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Priority customer support</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span>Regular software updates</span>
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
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">SamosaLabs</h3>
              <p className="text-slate-400 mb-4 max-w-md">
                Leading provider of enterprise-grade quality assurance solutions. 
                Empowering development teams with cutting-edge testing and validation tools.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li>QualityBytes Software</li>
                <li>Testing Tools</li>
                <li>Team Management</li>
                <li>API Integration</li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a href="mailto:info@samosalabs.com" className="hover:text-white transition-colors">
                    info@samosalabs.com
                  </a>
                </li>
                <li>Customer Support</li>
                <li>Sales Inquiries</li>
                <li>Technical Support</li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-800 mt-12 pt-8 text-center">
            <p className="text-slate-400">
              © 2024 SamosaLabs. All rights reserved. | Professional Quality Assurance Solutions
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}