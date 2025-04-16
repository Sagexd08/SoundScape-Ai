"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Mail, MapPin, Phone, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import Navbar from "@/components/navbar"
import HeroBackground from "@/components/three/HeroBackground"

export default function ContactPage() {
  const [formSubmitted, setFormSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate form submission
    setTimeout(() => {
      setFormSubmitted(true)
    }, 1000)
  }

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      {/* Global background */}
      <div className="fixed inset-0 z-0">
        <HeroBackground />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10">
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
                Contact Us
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Have questions or feedback? We'd love to hear from you.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-20 px-4 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-indigo-950/10 to-black -z-10" />
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-bold mb-6">
                  Get in <span className="text-indigo-400">Touch</span>
                </h2>
                <p className="text-gray-300 mb-8">
                  Whether you have a question about features, pricing, or anything else, our team is ready to answer all
                  your questions.
                </p>

                <div className="space-y-6 mb-8">
                  <div className="flex items-start">
                    <div className="h-10 w-10 rounded-full bg-indigo-900/50 flex items-center justify-center mr-4">
                      <Mail className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Email</h3>
                      <p className="text-gray-400">info@soundscape.ai</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="h-10 w-10 rounded-full bg-indigo-900/50 flex items-center justify-center mr-4">
                      <Phone className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Phone</h3>
                      <p className="text-gray-400">+1 (555) 123-4567</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="h-10 w-10 rounded-full bg-indigo-900/50 flex items-center justify-center mr-4">
                      <MapPin className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Office</h3>
                      <p className="text-gray-400">
                        123 Innovation Way
                        <br />
                        San Francisco, CA 94107
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800/50">
                  <h3 className="font-semibold mb-4">Business Hours</h3>
                  <div className="space-y-2 text-gray-400">
                    <div className="flex justify-between">
                      <span>Monday - Friday:</span>
                      <span>9:00 AM - 6:00 PM PST</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday:</span>
                      <span>10:00 AM - 4:00 PM PST</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday:</span>
                      <span>Closed</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-gray-800/50"
              >
                {formSubmitted ? (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 rounded-full bg-indigo-900/50 flex items-center justify-center mx-auto mb-6">
                      <Send className="h-8 w-8 text-indigo-400" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Message Sent!</h3>
                    <p className="text-gray-300 mb-6">
                      Thank you for reaching out. We'll get back to you as soon as possible.
                    </p>
                    <Button onClick={() => setFormSubmitted(false)} className="bg-indigo-600 hover:bg-indigo-700">
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold mb-6">Send a Message</h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            placeholder="Your name"
                            required
                            className="bg-gray-900/50 border-gray-700 focus:border-indigo-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="Your email"
                            required
                            className="bg-gray-900/50 border-gray-700 focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>I'm interested in</Label>
                        <RadioGroup defaultValue="general">
                          <div className="flex flex-wrap gap-4">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="general" id="general" className="text-indigo-400" />
                              <Label htmlFor="general">General Inquiry</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="support" id="support" className="text-indigo-400" />
                              <Label htmlFor="support">Technical Support</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="sales" id="sales" className="text-indigo-400" />
                              <Label htmlFor="sales">Sales</Label>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          placeholder="How can we help you?"
                          rows={5}
                          required
                          className="bg-gray-900/50 border-gray-700 focus:border-indigo-500 resize-none"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                      >
                        Send Message
                        <Send className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                  </>
                )}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-20 px-4 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/10 to-black -z-10" />
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold mb-4">
                Find Us <span className="text-indigo-400">Here</span>
              </h2>
              <p className="text-gray-300 max-w-3xl mx-auto">
                Visit our office in the heart of San Francisco's tech district
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="relative h-96 rounded-xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-indigo-400 mx-auto mb-4" />
                  <p className="text-xl font-medium">Interactive Map</p>
                  <p className="text-gray-400">123 Innovation Way, San Francisco, CA 94107</p>
                </div>
              </div>
            </motion.div>
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
              <h2 className="text-3xl font-bold mb-4">
                Frequently Asked <span className="text-indigo-400">Questions</span>
              </h2>
              <p className="text-gray-300 max-w-3xl mx-auto">Quick answers to common questions</p>
            </motion.div>

            <div className="space-y-6">
              {[
                {
                  question: "How quickly can I expect a response?",
                  answer:
                    "We typically respond to all inquiries within 24 hours during business days. For urgent technical support, we aim to respond within 4 hours.",
                },
                {
                  question: "Do you offer demos for enterprise customers?",
                  answer:
                    "Yes, we offer personalized demos for enterprise customers. Please contact our sales team to schedule a demonstration tailored to your organization's needs.",
                },
                {
                  question: "Can I visit your office for a meeting?",
                  answer:
                    "We welcome visitors to our San Francisco office. Please contact us in advance to schedule a meeting so we can ensure the appropriate team members are available.",
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
                  <h3 className="text-xl font-semibold mb-3">{faq.question}</h3>
                  <p className="text-gray-400">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
