import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import type { SubscriptionPlan, Subscription } from "@shared/schema";

interface SubscriptionPlansProps {
  plans: SubscriptionPlan[];
  currentSubscription?: Subscription & { plan: SubscriptionPlan };
  onPlanSelect: (planId: number) => void;
  isLoading?: boolean;
  showPricing?: boolean;
  className?: string;
}

export function SubscriptionPlans({
  plans,
  currentSubscription,
  onPlanSelect,
  isLoading = false,
  showPricing = true,
  className = "",
}: SubscriptionPlansProps) {
  if (isLoading) {
    return (
      <div className={`grid gap-8 lg:grid-cols-3 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-slate-200 rounded w-1/2"></div>
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              {showPricing && <div className="h-8 bg-slate-200 rounded w-1/3"></div>}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-4 bg-slate-200 rounded"></div>
                ))}
              </div>
              <div className="h-10 bg-slate-200 rounded mt-6"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid gap-8 lg:grid-cols-3 ${className}`}>
      {plans.map((plan, index) => {
        const isCurrentPlan = currentSubscription?.plan.id === plan.id;
        const isPopular = index === 1; // Team plan is most popular
        
        return (
          <Card 
            key={plan.id} 
            className={`relative ${
              isPopular && !isCurrentPlan ? 'border-2 border-primary shadow-lg' : ''
            } ${
              isCurrentPlan ? 'border-emerald-500 bg-emerald-50/50' : ''
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
              <CardTitle className="text-2xl font-bold text-slate-900">{plan.name}</CardTitle>
              <CardDescription className="text-slate-600">{plan.description}</CardDescription>
              {showPricing && (
                <div className="mt-6">
                  <span className="text-4xl font-bold text-slate-900">${plan.price}</span>
                  <span className="text-slate-600">/month</span>
                </div>
              )}
            </CardHeader>
            
            <CardContent>
              <ul className="space-y-4">
                {plan.features?.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className="h-5 w-5 text-emerald-500 mr-3 flex-shrink-0" />
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className={`w-full mt-8 ${
                  isCurrentPlan 
                    ? 'bg-emerald-600 hover:bg-emerald-700' 
                    : isPopular 
                    ? 'bg-primary hover:bg-primary/90' 
                    : 'bg-primary hover:bg-primary/90'
                }`}
                onClick={() => onPlanSelect(plan.id)}
                disabled={isCurrentPlan}
                variant={isCurrentPlan ? "outline" : "default"}
              >
                {isCurrentPlan 
                  ? "Current Plan" 
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
  );
}
