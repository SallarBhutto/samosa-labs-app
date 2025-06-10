import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Users, Shield, Zap } from "lucide-react";
import { Link } from "wouter";
import logoPath from "@assets/logo_1749567074319.png";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Navigation */}
      <nav className="bg-gray-900/80 backdrop-blur-md border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <img 
                src={logoPath} 
                alt="SamosaLabs" 
                className="h-8 w-auto filter invert"
              />
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">SamosaLabs</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button asChild variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white border-0">
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-cyan-500/10 to-purple-500/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-emerald-100 to-cyan-100 bg-clip-text text-transparent mb-6">
            Professional Quality Assurance Software
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            SamosaLabs presents QualityBytes - Advanced quality assurance tools for modern development teams. 
            Purchase licenses with simple per-user pricing at $5/user/month.
          </p>
          <div className="bg-gradient-to-r from-emerald-600/90 to-cyan-600/90 backdrop-blur-sm text-white rounded-xl p-6 mb-8 max-w-2xl mx-auto border border-emerald-400/20">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="text-2xl">🚀</span>
              <h3 className="text-xl font-bold">Start with a FREE 30-Day Trial</h3>
            </div>
            <p className="text-emerald-100 mb-3">
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
          <Button asChild size="lg" className="text-lg px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white border-0">
            <Link href="/register">Start Free Trial</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Why Choose QualityBytes?</h2>
            <p className="text-xl text-gray-300">Enterprise-grade quality assurance from SamosaLabs</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-emerald-500/50 transition-all">
              <div className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Advanced Quality Control</h3>
              <p className="text-gray-300">
                Comprehensive testing and validation tools to ensure your software meets the highest standards.
              </p>
            </div>

            <div className="text-center bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-cyan-500/50 transition-all">
              <div className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-cyan-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Team Collaboration</h3>
              <p className="text-gray-300">
                Built for teams with seamless collaboration features and user management capabilities.
              </p>
            </div>

            <div className="text-center bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all">
              <div className="bg-gradient-to-br from-purple-500/20 to-emerald-500/20 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Easy Integration</h3>
              <p className="text-gray-300">
                Seamlessly integrate QualityBytes into your existing development workflow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Simple Per-User Pricing</h2>
            <p className="text-xl text-gray-300">Start with a 30-day free trial, then pay only for what you need - $5 per user per month</p>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="bg-gray-800/70 backdrop-blur-sm border-emerald-500/50 shadow-2xl relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  🚀 30-Day Free Trial Available
                </span>
              </div>
              <CardHeader className="text-center pt-8">
                <CardTitle className="text-3xl flex items-center justify-center gap-3 text-white">
                  <Users className="h-8 w-8 text-emerald-400" />
                  QualityBytes License
                </CardTitle>
                <CardDescription className="text-lg text-gray-300">
                  Scale your team with our powerful quality assurance tools
                </CardDescription>
                <div className="mt-6">
                  <span className="text-5xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">$5</span>
                  <span className="text-gray-300 text-xl">/user/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-emerald-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-300">Full access to QualityBytes software</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-emerald-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-300">Advanced testing and validation tools</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-emerald-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-300">Team collaboration features</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-emerald-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-300">Priority customer support</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-emerald-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-300">Regular software updates</span>
                  </li>
                </ul>
                <Button asChild className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white border-0" size="lg">
                  <Link href="/register">Start Free Trial</Link>
                </Button>
                <p className="text-center text-sm text-gray-400 mt-4">
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