import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            We're hungry for better software tools
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            Samosa Labs builds powerful, intuitive tools for developer teams,
            marketing, finance, and operations. Starting with QualityBytes -
            test management that actually works.
          </p>
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg p-6 mb-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="text-2xl">🎉</span>
              <h3 className="text-xl font-bold">
                Start with a FREE 30-Day Trial
              </h3>
            </div>
            <p className="text-indigo-100 mb-3">
              Get full access to QualityBytes with 100 users included. No credit
              card required!
            </p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                ✓ Full feature access
              </span>
              <span className="flex items-center gap-1">
                ✓ 100 users included
              </span>
              <span className="flex items-center gap-1">✓ Email support</span>
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
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              QualityBytes: Enterprise Test Management
            </h2>
            <p className="text-xl text-slate-600">
              Our flagship product - comprehensive test management designed for
              developer teams who refuse to compromise on quality.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:grid-cols-2 xl:grid-cols-3">
            <div className="text-center">
              <div className="bg-indigo-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Test Case Management
              </h3>
              <p className="text-slate-600">
                Create and organize test cases with hierarchical project
                structure and complete requirement traceability.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Real-Time Test Execution
              </h3>
              <p className="text-slate-600">
                Execute test runs with live progress tracking and comprehensive
                Pass/Fail/Block status recording.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Smart Defect Tracking
              </h3>
              <p className="text-slate-600">
                Track defects with priority assignments, resolution workflows,
                and direct links to failed test cases.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Analytics & Insights
              </h3>
              <p className="text-slate-600">
                Visual dashboards with statistics and comprehensive reports that
                reveal testing performance patterns.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
              <p className="text-slate-600">
                Role-based access control, user management, and activity
                tracking across team members.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-cyan-100 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-cyan-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Integration</h3>
              <p className="text-slate-600">
                Seamlessly integrate QualityBytes into your existing development
                workflow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Simple Per-User Pricing
            </h2>
            <p className="text-xl text-slate-600">
              Start with a 30-day free trial, then pay only for what you need -
              $5 per user per month
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="border-indigo-200 shadow-lg relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  🎉 30-Day Free Trial Available
                </span>
              </div>
              <CardHeader className="text-center pt-8">
                <CardTitle className="text-3xl flex items-center justify-center gap-3">
                  <Users className="h-8 w-8 text-indigo-600" />
                  QualityBytes License
                </CardTitle>
                <CardDescription className="text-lg">
                  Scale your team with our powerful quality assurance tools
                </CardDescription>
                <div className="mt-6">
                  <span className="text-5xl font-bold text-indigo-600">$5</span>
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
                  Start with 30-day free trial • 100 users included • No credit
                  card required
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Testing Process?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join teams worldwide who trust QualityBytes to deliver quality
            software faster and more efficiently.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-white text-indigo-600 hover:bg-gray-50"
            >
              <Link href="/register">Get Started Now</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-indigo-600 bg-transparent"
            >
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Why We Built Samosa Labs Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Why We Built Samosa Labs
            </h2>
          </div>
          
          <div className="prose prose-lg max-w-none text-slate-700 space-y-6">
            <p>
              We're a team of builders who happen to love great food. But more importantly, we noticed that most enterprise software fails to deliver on its promises. It's overcomplicated, under-designed, and leaves teams feeling frustrated.
            </p>
            
            <p>
              So we started Samosa Labs to build something better. Technical tools for companies that are genuinely useful and enjoyable to use. Tools that make your teams more effective, not more overwhelmed.
            </p>
            
            <p>
              We started with QualityBytes because we needed to solve this problem for ourselves first. While building software for a large multinational company with mixed experience levels—over 50% junior developers—we needed test management that was powerful enough for enterprise needs yet intuitive enough for anyone to use effectively.
            </p>
            
            <p>
              QualityBytes is our first product, not our last. We're building technical tools for marketing teams who need better analytics, finance teams drowning in spreadsheets, and operations teams juggling too many disconnected systems.
            </p>
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
                Leading provider of enterprise-grade quality assurance
                solutions. Empowering development teams with cutting-edge
                testing and validation tools.
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
                  <a
                    href="mailto:info@samosalabs.com"
                    className="hover:text-white transition-colors"
                  >
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
              © 2024 SamosaLabs. All rights reserved. | Professional Quality
              Assurance Solutions
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
