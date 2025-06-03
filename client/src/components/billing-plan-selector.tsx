import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Mail, Phone } from "lucide-react";

interface BillingPlanSelectorProps {
  userCount: number;
  onPlanSelect: (billingInterval: "month" | "year") => void;
  selectedPlan?: "month" | "year";
}

export function BillingPlanSelector({ userCount, onPlanSelect, selectedPlan }: BillingPlanSelectorProps) {
  const monthlyPrice = userCount * 5;
  const yearlyPrice = Math.round(monthlyPrice * 12 * 0.9); // 10% discount
  const yearlyDiscount = (monthlyPrice * 12) - yearlyPrice;

  const plans = [
    {
      id: "month" as const,
      name: "Monthly",
      price: monthlyPrice,
      period: "month",
      description: "Pay monthly, cancel anytime",
      features: [
        "All core features",
        "Email support",
        "Regular updates"
      ]
    },
    {
      id: "year" as const,
      name: "Yearly",
      price: yearlyPrice,
      period: "year",
      description: "Save 10% with annual billing",
      discount: yearlyDiscount,
      popular: true,
      features: [
        "All core features",
        "Priority email support",
        "On-call support",
        "Regular updates",
        "Early access to new features"
      ]
    }
  ];

  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      {plans.map((plan) => (
        <Card 
          key={plan.id}
          className={`relative cursor-pointer transition-all hover:shadow-lg ${
            selectedPlan === plan.id 
              ? 'ring-2 ring-blue-500 shadow-lg' 
              : 'hover:shadow-md'
          }`}
          onClick={() => onPlanSelect(plan.id)}
        >
          {plan.popular && (
            <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
              Most Popular
            </Badge>
          )}
          
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
            
            <div className="mt-4">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl font-bold">${plan.price}</span>
                <span className="text-gray-500">/{plan.period}</span>
              </div>
              
              {plan.discount && (
                <div className="mt-2">
                  <span className="text-green-600 font-medium">
                    Save ${plan.discount}/year
                  </span>
                </div>
              )}
              
              <div className="text-sm text-gray-600 mt-2">
                For {userCount} user{userCount !== 1 ? 's' : ''}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <Button 
              className={`w-full mb-4 ${
                selectedPlan === plan.id 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : ''
              }`}
              variant={selectedPlan === plan.id ? "default" : "outline"}
            >
              {selectedPlan === plan.id ? 'Selected' : 'Select Plan'}
            </Button>
            
            <ul className="space-y-3">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm flex items-center gap-2">
                    {feature}
                    {feature.includes('email support') && <Mail className="h-3 w-3" />}
                    {feature.includes('On-call support') && <Phone className="h-3 w-3" />}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}