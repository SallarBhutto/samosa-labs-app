import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { SubscriptionPlan } from "@shared/schema";

export default function LandingPage() {
  const { data: plans, isLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/subscription-plans"],
  });

  const handleSignIn = () => {
    window.location.href = "/api/login";
  };

  const handleGetStarted = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-slate-900">QualityBytes</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={handleSignIn} className="bg-primary hover:bg-primary/90">
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">
              Professional License Management
              <span className="text-primary"> Made Simple</span>
            </h1>
            <p className="mt-4 text-xl text-slate-600 max-w-3xl mx-auto">
              Secure subscription management for QualityBytes with flexible plans, team collaboration, and enterprise-grade license validation.
            </p>
            <div className="mt-8">
              <Button onClick={handleGetStarted} size="lg" className="bg-primary hover:bg-primary/90 px-8 py-3">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900">Choose Your Plan</h2>
            <p className="mt-4 text-lg text-slate-600">Select the perfect subscription for your needs</p>
          </div>

          {isLoading ? (
            <div className="mt-12 grid gap-8 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-slate-200 rounded w-1/2"></div>
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-8 bg-slate-200 rounded w-1/3"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[...Array(4)].map((_, j) => (
                        <div key={j} className="h-4 bg-slate-200 rounded"></div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="mt-12 grid gap-8 lg:grid-cols-3">
              {plans?.map((plan, index) => (
                <Card 
                  key={plan.id} 
                  className={`relative ${index === 1 ? 'border-2 border-primary shadow-lg' : ''}`}
                >
                  {index === 1 && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-6">
                      <span className="text-4xl font-bold text-slate-900">${plan.price}</span>
                      <span className="text-slate-600">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {plan.features?.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center">
                          <Check className="h-5 w-5 text-emerald-500 mr-3" />
                          <span className="text-slate-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full mt-8 bg-primary hover:bg-primary/90" 
                      onClick={handleGetStarted}
                    >
                      {plan.name === "Enterprise" ? "Contact Sales" : `Start ${plan.name} Plan`}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
