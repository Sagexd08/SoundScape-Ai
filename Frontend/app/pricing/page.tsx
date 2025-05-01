"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Navbar from "@/components/navbar"
import { cn } from "@/lib/utils"
import VibrantBackgroundLayout from "@/components/layouts/VibrantBackgroundLayout"
import CheckoutModal from "@/components/payment/CheckoutModal"

export default function PricingPage() {
  const [annual, setAnnual] = useState(true)
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<{
    name: string;
    price: number;
  } | null>(null)

  const handlePlanSelect = (planName: string, price: number) => {
    setSelectedPlan({
      name: planName,
      price: price
    })
    setCheckoutModalOpen(true)
  }

  const plans = [
    {
      name: "Free",
      description: "Basic features for personal use",
      price: { monthly: 0, annual: 0 },
      features: [
        "Basic environment scanning",
        "5 preset audio environments",
        "Standard audio quality",
        "Mobile app access",
      ],
      cta: "Get Started",
      popular: false,
      delay: 0,
    },
    {
      name: "Premium",
      description: "Advanced features for enthusiasts",
      price: { monthly: 9.99, annual: 7.99 },
      features: [
        "Advanced environment scanning",
        "Unlimited custom environments",
        "High-definition audio (24-bit)",
        "Mood-based customization",
        "Interactive narration",
        "Priority support",
      ],
      cta: "Start Free Trial",
      popular: true,
      delay: 1,
    },
    {
      name: "Professional",
      description: "Complete solution for professionals",
      price: { monthly: 19.99, annual: 16.99 },
      features: [
        "All Premium features",
        "Spatial audio with head tracking",
        "Multi-environment blending",
        "Collaborative soundscapes",
        "API access",
        "Dedicated support",
        "White-label option",
      ],
      cta: "Contact Sales",
      popular: false,
      delay: 2,
    },
  ]

  return (
    <VibrantBackgroundLayout variant="purple">
      <Navbar />

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 relative">
          <div className="absolute inset-0 bg-gradient-radial from-indigo-900/20 to-transparent" />
          <div className="max-w-6xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400">
                Simple, Transparent Pricing
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Choose the perfect plan for your needs. All plans include core SoundScape features.
              </p>
            </motion.div>

            <div className="flex justify-center items-center mb-12">
              <span className={cn("mr-3 transition-colors", !annual ? "text-white" : "text-gray-400")}>Monthly</span>
              <Switch checked={annual} onCheckedChange={setAnnual} className="data-[state=checked]:bg-indigo-600" />
              <span className={cn("ml-3 transition-colors", annual ? "text-white" : "text-gray-400")}>
                Annual <span className="text-indigo-400 text-sm">(Save 20%)</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: plan.delay * 0.1 }}
                  className={cn(
                    "relative rounded-xl overflow-hidden backdrop-blur-sm",
                    "bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-800/50",
                    plan.popular ? "border-indigo-500/50 shadow-lg shadow-indigo-900/20" : "",
                  )}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center text-sm font-medium py-1">
                      Most Popular
                    </div>
                  )}

                  <div className={cn("p-8", plan.popular ? "pt-12" : "")}>
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <p className="text-gray-400 mb-6">{plan.description}</p>

                    <div className="mb-6">
                      <span className="text-4xl font-bold">${annual ? plan.price.annual : plan.price.monthly}</span>
                      {plan.price.monthly > 0 && <span className="text-gray-400 ml-2">/ month</span>}
                    </div>

                    <Button
                      className={cn(
                        "w-full mb-8",
                        plan.popular
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                          : "bg-gray-800 hover:bg-gray-700",
                      )}
                      onClick={() => {
                        if (plan.price.monthly > 0) {
                          handlePlanSelect(
                            plan.name,
                            annual ? plan.price.annual : plan.price.monthly
                          )
                        } else {
                          // For free plan, redirect to signup
                          window.location.href = "/register"
                        }
                      }}
                    >
                      {plan.cta}
                    </Button>

                    <div className="space-y-4">
                      {plan.features.map((feature, i) => (
                        <div key={i} className="flex items-start">
                          <Check className="h-5 w-5 text-indigo-400 mr-3 mt-0.5" />
                          <span className="text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 px-4 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-indigo-950/10 to-black -z-10" />
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Frequently Asked <span className="text-indigo-400">Questions</span>
              </h2>
              <p className="text-lg text-gray-300 max-w-3xl mx-auto">
                Everything you need to know about SoundScape pricing and plans
              </p>
            </motion.div>

            <div className="space-y-6">
              {[
                {
                  question: "Can I switch between plans?",
                  answer:
                    "Yes, you can upgrade or downgrade your plan at any time. If you upgrade, the new features will be available immediately. If you downgrade, the changes will take effect at the end of your current billing cycle.",
                },
                {
                  question: "Is there a free trial available?",
                  answer:
                    "Yes, we offer a 14-day free trial of our Premium plan. No credit card is required to start your trial, and you can cancel anytime before the trial ends.",
                },
                {
                  question: "What payment methods do you accept?",
                  answer:
                    "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and Apple Pay. For annual Professional plans, we also offer invoice payment options.",
                },
                {
                  question: "Can I use SoundScape offline?",
                  answer:
                    "Yes, the Premium and Professional plans allow you to download custom environments for offline use. The free plan requires an internet connection for all features.",
                },
                {
                  question: "Is there a refund policy?",
                  answer:
                    "We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied with SoundScape, contact our support team within 30 days of your purchase for a full refund.",
                },
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800/50"
                >
                  <h3 className="text-xl font-semibold mb-3 flex items-center">
                    {faq.question}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 ml-2 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-80">Click to expand</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </h3>
                  <p className="text-gray-400">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Enterprise Section */}
        <section className="py-20 px-4 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/10 to-black -z-10" />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center relative overflow-hidden bg-gradient-to-br from-indigo-900/30 to-purple-900/30 p-12 rounded-2xl border border-indigo-800/30"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600" />
            <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-indigo-600/20 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-purple-600/20 blur-3xl" />

            <h2 className="text-3xl md:text-4xl font-bold mb-6 relative z-10">Need a Custom Solution?</h2>
            <p className="text-xl text-gray-300 mb-8 relative z-10">
              SoundScape Enterprise offers tailored solutions for businesses with custom requirements, dedicated support,
              and volume discounts.
            </p>
            <div className="flex flex-wrap gap-4 justify-center relative z-10">
              <Button
                size="lg"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-900/30 transition-all duration-300 hover:scale-105"
              >
                Contact Sales
              </Button>
              <Button size="lg" variant="outline" className="border-indigo-600 text-indigo-400 hover:bg-indigo-950/50">
                Enterprise Features
              </Button>
            </div>
          </motion.div>
        </section>

        {/* Checkout Modal */}
        {selectedPlan && (
          <CheckoutModal
            isOpen={checkoutModalOpen}
            onClose={() => setCheckoutModalOpen(false)}
            planName={selectedPlan.name}
            amount={selectedPlan.price}
            isAnnual={annual}
          />
        )}
    </VibrantBackgroundLayout>
  )
}
