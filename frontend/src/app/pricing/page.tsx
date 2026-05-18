"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";

export default function Pricing() {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      description: "Perfect to try out the magic of AI colorization.",
      features: [
        "Up to 5 images per day",
        "Standard resolution",
        "Base model only",
        "Community support",
      ],
      buttonText: "Get Started",
      popular: false,
    },
    {
      name: "Pro",
      price: "$9",
      period: "/month",
      description: "For enthusiasts wanting full quality and features.",
      features: [
        "Unlimited images",
        "High-res output (High-Res Trick)",
        "All models (Base, Landscape, Portrait)",
        "Priority processing",
      ],
      buttonText: "Subscribe Now",
      popular: true,
    },
    {
      name: "Studio",
      price: "$29",
      period: "/month",
      description: "For professionals and agencies bulk processing.",
      features: [
        "Everything in Pro",
        "API access",
        "Batch processing tools",
        "Dedicated support",
      ],
      buttonText: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <div className="relative w-full min-h-screen py-20 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-muted-foreground">
            Choose the plan that fits your needs. Upgrade or cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`relative p-8 rounded-3xl flex flex-col ${
                plan.popular
                  ? "bg-primary/10 border-2 border-primary"
                  : "bg-card border border-border/50"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground min-h-[48px]">{plan.description}</p>
              </div>
              
              <div className="mb-8 flex items-baseline text-5xl font-extrabold">
                {plan.price}
                {plan.period && <span className="text-xl text-muted-foreground font-medium ml-1">{plan.period}</span>}
              </div>

              <ul className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="h-5 w-5 text-primary shrink-0 mr-3" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/dashboard"
                className={`block w-full py-4 text-center rounded-xl font-bold transition-all ${
                  plan.popular
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {plan.buttonText}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
