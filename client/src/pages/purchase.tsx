import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Minus, Plus, Users, Shield, Zap, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { BillingPlanSelector } from "@/components/billing-plan-selector";


// if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
//   throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
// }

const stripePromise = loadStripe("pk_test_51I1EurFdciK24uWbyhVuNH3KliQdkEiPY0xW2pDYww0a77IHm5GR0UXYUEo4qet0THYLfdqqLYeF5d4VcEK45DIO00RkdCbm4x");


interface PaymentFormProps {
  userCount: number;
  totalPrice: number;
  onSuccess: () => void;
}

function PaymentForm({ userCount, totalPrice, onSuccess }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
      console.error("Stripe key missing");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) return;
    
    setIsProcessing(true);
    
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast({
          title: "Payment Successful!",
          description: `Your QualityBytes license for ${userCount} users is now active.`,
        });
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Payment Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? "Processing..." : `Pay $${totalPrice.toFixed(2)}`}
      </Button>
    </form>
  );
}

export default function PurchasePage() {
  const [userCount, setUserCount] = useState(1);
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("month");
  const [clientSecret, setClientSecret] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const { toast } = useToast();
  
  const pricePerUser = 5.00;
  const monthlyPrice = userCount * pricePerUser;
  const totalPrice = billingInterval === "year" 
    ? Math.round(monthlyPrice * 12 * 0.9) // 10% discount for yearly
    : monthlyPrice;

  const createSubscription = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/create-subscription", {
        userCount,
        billingInterval
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setShowPayment(true);
      } else {
        // No payment needed, subscription is already active
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        queryClient.invalidateQueries({ queryKey: ["/api/user/subscription"] });
        toast({
          title: "Success!",
          description: "Your subscription has been activated.",
        });
        // Redirect to license success page
        window.location.href = '/license-success';
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to initialize payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handlePurchase = () => {
    createSubscription.mutate();
  };

  const handlePaymentSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    queryClient.invalidateQueries({ queryKey: ["/api/user/subscription"] });
    toast({
      title: "Payment Successful!",
      description: "Your subscription has been activated.",
    });
    // Redirect to license success page
    window.location.href = '/license-success';
  };

  if (showPayment && clientSecret) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
        <div className="max-w-md mx-auto pt-20">
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Purchase</CardTitle>
              <CardDescription>
                {userCount} user license for QualityBytes - ${totalPrice.toFixed(2)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm 
                  userCount={userCount}
                  totalPrice={totalPrice}
                  onSuccess={handlePaymentSuccess}
                />
              </Elements>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
      <div className="max-w-4xl mx-auto pt-20">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Purchase QualityBytes License
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Simple per-user pricing at $5 per user. Scale your team with our powerful quality assurance tools.
          </p>
        </div>

        {/* Billing Plan Selector */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-center mb-6">Choose Your Billing Plan</h2>
          <BillingPlanSelector
            userCount={userCount}
            selectedPlan={billingInterval}
            onPlanSelect={setBillingInterval}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* User Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Select Number of Users
              </CardTitle>
              <CardDescription>
                Choose how many team members will use QualityBytes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="userCount">Number of Users</Label>
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setUserCount(Math.max(1, userCount - 1))}
                    disabled={userCount <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    id="userCount"
                    type="number"
                    min="1"
                    max="1000"
                    value={userCount}
                    onChange={(e) => setUserCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setUserCount(userCount + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center text-sm mb-2">
                  <span>{userCount} users × $5.00</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center font-semibold text-lg border-t pt-2">
                  <span>Total Monthly</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <Button 
                onClick={handlePurchase}
                disabled={createSubscription.isPending}
                className="w-full"
                size="lg"
              >
                {createSubscription.isPending ? "Setting up..." : "Purchase License"}
              </Button>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                What's Included
              </CardTitle>
              <CardDescription>
                Everything you need for quality assurance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">One License Key</h3>
                    <p className="text-sm text-muted-foreground">
                      Single license key covers all your selected users
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">User Management</h3>
                    <p className="text-sm text-muted-foreground">
                      Track and manage usage across your team
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">24/7 Support</h3>
                    <p className="text-sm text-muted-foreground">
                      Get help when you need it from our support team
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium">Regular Updates</h3>
                    <p className="text-sm text-muted-foreground">
                      Stay up to date with the latest features and improvements
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}