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
      <section className="py-20 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-medium text-indigo-600 mb-4 tracking-wide uppercase">Enterprise-Grade Test Management</p>
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            Streamline Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Testing Workflow</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            QualityBytes is a comprehensive test management platform that helps teams organize, 
            execute, and track testing activities with precision and efficiency.
          </p>
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg p-6 mb-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="text-2xl">🎉</span>
              <h3 className="text-xl font-bold">Start with a FREE 30-Day Trial</h3>
            </div>
            <p className="text-indigo-100 mb-3">
              Get full access to QualityBytes with 100 users included. No credit card required!
            </p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                ✓ Full feature access
              </span>
              <span className="flex items-center gap-1">
                ✓ 100 users included
              </span>
              <span className="flex items-center gap-1">
                ✓ Email support
              </span>
            </div>
          </div>
          <Button asChild size="lg" className="text-lg px-8 py-3">
            <Link href="/register">Start Free Trial</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything You Need for Test Management</h2>
            <p className="text-xl text-slate-600">From test case creation to defect tracking, QualityBytes provides all the tools your team needs to deliver quality software.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
              <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Check className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900">Test Case Management</h3>
              <p className="text-slate-600 text-sm">
                Create, organize, and manage test cases with hierarchical project structure and detailed tracking.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
              <div className="bg-green-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900">Test Execution</h3>
              <p className="text-slate-600 text-sm">
                Execute test runs efficiently with real-time progress tracking and comprehensive result recording.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
              <div className="bg-purple-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900">Defect Tracking</h3>
              <p className="text-slate-600 text-sm">
                Track and manage defects with detailed reporting, priority assignments, and resolution workflows.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
              <div className="bg-orange-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900">Analytics & Reports</h3>
              <p className="text-slate-600 text-sm">
                Generate comprehensive reports and analytics to gain insights into your testing performance.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
              <div className="bg-red-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900">Team Collaboration</h3>
              <p className="text-slate-600 text-sm">
                Enable seamless collaboration with role-based access, user management, and activity tracking.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
              <div className="bg-indigo-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Check className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-slate-900">Requirements Tracking</h3>
              <p className="text-slate-600 text-sm">
                Link test cases to requirements for complete traceability and coverage analysis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Simple Per-User Pricing</h2>
            <p className="text-xl text-slate-600">Start with a 30-day free trial, then pay only for what you need - $5 per user per month</p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="border-primary shadow-lg relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  🎉 30-Day Free Trial Available
                </span>
              </div>
              <CardHeader className="text-center pt-8">
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
                  <Link href="/register">Start Free Trial</Link>
                </Button>
                <p className="text-center text-sm text-slate-500 mt-4">
                  Start with 30-day free trial • 100 users included • No credit card required
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