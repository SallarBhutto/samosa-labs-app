import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Check, ArrowLeft, CreditCard } from "lucide-react";
import { Link } from "wouter";
import type { SubscriptionPlan, Subscription } from "@shared/schema";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface SubscribeFormProps {
  planId: number;
  onSuccess: () => void;
}

function SubscribeForm({ planId, onSuccess }: SubscribeFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Your subscription has been activated!",
      });
      // Redirect to dashboard on success
      window.location.href = '/dashboard';
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button type="submit" disabled={!stripe || isProcessing} className="w-full">
        {isProcessing ? "Processing..." : "Subscribe Now"}
      </Button>
    </form>
  );
}

export default function SubscribePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [clientSecret, setClientSecret] = useState("");

  const { data: plans, isLoading: plansLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ["/api/subscription-plans"],
  });

  const { data: currentSubscription } = useQuery<Subscription & { plan: SubscriptionPlan }>({
    queryKey: ["/api/user/subscription"],
  });

  const createSubscriptionMutation = useMutation({
    mutationFn: (planId: number) => 
      apiRequest("POST", "/api/create-subscription", { planId }),
    onSuccess: async (response) => {
      const data = await response.json();
      setClientSecret(data.clientSecret);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create subscription",
        variant: "destructive",
      });
    },
  });

  const handlePlanSelect = (planId: number) => {
    setSelectedPlan(planId);
    createSubscriptionMutation.mutate(planId);
  };

  const handlePaymentSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/user/subscription"] });
    queryClient.invalidateQueries({ queryKey: ["/api/user/license-keys"] });
    setSelectedPlan(null);
    setClientSecret("");
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <CreditCard className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-slate-900">Authentication Required</h1>
            <p className="mt-2 text-sm text-slate-600">Please sign in to subscribe to a plan</p>
            <Button className="mt-4" onClick={() => window.location.href = "/api/login"}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                <Link href="/" className="border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Dashboard
                </Link>
                <span className="border-primary text-slate-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Subscribe
                </span>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {currentSubscription && (
          <Card className="mb-8 border-emerald-200 bg-emerald-50">
            <CardHeader>
              <CardTitle className="text-emerald-900">Current Subscription</CardTitle>
              <CardDescription className="text-emerald-700">
                You currently have an active {currentSubscription.plan.name} subscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">${currentSubscription.plan.price}/month</p>
                  <p className="text-sm text-emerald-600">
                    Next billing: {currentSubscription.currentPeriodEnd ? new Date(currentSubscription.currentPeriodEnd).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Form */}
        {selectedPlan && clientSecret && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Complete Your Subscription</CardTitle>
              <CardDescription>
                Enter your payment details to activate your {plans?.find(p => p.id === selectedPlan)?.name} subscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <SubscribeForm planId={selectedPlan} onSuccess={handlePaymentSuccess} />
              </Elements>
            </CardContent>
          </Card>
        )}

        {/* Subscription Plans */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            {currentSubscription ? "Upgrade Your Plan" : "Choose Your Plan"}
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            {currentSubscription 
              ? "Upgrade to access more features and license keys"
              : "Select the perfect subscription for your needs"
            }
          </p>
        </div>

        {plansLoading ? (
          <div className="grid gap-8 lg:grid-cols-3">
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
          <div className="grid gap-8 lg:grid-cols-3">
            {plans?.map((plan, index) => {
              const isCurrentPlan = currentSubscription?.plan.id === plan.id;
              const isPopular = index === 1;
              
              return (
                <Card 
                  key={plan.id} 
                  className={`relative ${
                    isPopular ? 'border-2 border-primary shadow-lg' : ''
                  } ${
                    isCurrentPlan ? 'border-emerald-500 bg-emerald-50' : ''
                  }`}
                >
                  {isPopular && !isCurrentPlan && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                    </div>
                  )}
                  {isCurrentPlan && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-emerald-500 text-white">Current Plan</Badge>
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
                      className="w-full mt-8" 
                      onClick={() => handlePlanSelect(plan.id)}
                      disabled={
                        isCurrentPlan || 
                        createSubscriptionMutation.isPending || 
                        (selectedPlan === plan.id && createSubscriptionMutation.isPending)
                      }
                      variant={isCurrentPlan ? "outline" : "default"}
                    >
                      {isCurrentPlan 
                        ? "Current Plan" 
                        : createSubscriptionMutation.isPending && selectedPlan === plan.id
                        ? "Setting up..."
                        : plan.name === "Enterprise" 
                        ? "Contact Sales" 
                        : `${currentSubscription ? "Upgrade to" : "Start"} ${plan.name}`
                      }
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Additional Information */}
        <div className="mt-12 text-center">
          <p className="text-sm text-slate-600">
            All plans include a 30-day money-back guarantee. Cancel anytime.
          </p>
          <p className="text-sm text-slate-600 mt-2">
            Need help choosing? <Button variant="link" className="p-0 h-auto">Contact our sales team</Button>
          </p>
        </div>
      </div>
    </div>
  );
}
