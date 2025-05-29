import React from 'react';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, HelpCircle } from 'lucide-react';

export default function FAQPage() {
  const faqs = [
    {
      question: "How much does a DSVI website cost?",
      answer: "Our Standard Package starts at $100/year, with Advanced packages at $150 and $200 per year. All packages include hosting, SSL certificate, and support."
    },
    {
      question: "How long does it take to create our website?",
      answer: "From registration to launch, your website will be ready within 48 hours. The review and approval process typically takes 2-4 hours."
    },
    {
      question: "Do we need technical skills to manage our website?",
      answer: "No technical skills required! We provide comprehensive training and an intuitive content management system that anyone can use."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept Mobile Money (Orange Money, MTN MoMo), Debit/Credit Cards, and Bank Transfers for your convenience."
    },
    {
      question: "Is ongoing support included?",
      answer: "Yes! All packages include email support, with Advanced packages offering priority support and phone assistance."
    },
    {
      question: "Can we update our website content ourselves?",
      answer: "Absolutely! We provide training and access to an easy-to-use admin panel where you can update content, add news, and manage your site."
    },
    {
      question: "Do you work with all types of schools?",
      answer: "Yes, we work with elementary schools, high schools, combined schools, private schools, and vocational institutions across all 15 counties of Liberia."
    },
    {
      question: "What happens if we need changes after launch?",
      answer: "We offer ongoing support for updates and changes. Basic content updates are included, and we can discuss any major modifications needed."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation 
        onRegisterClick={() => window.location.href = '/register'}
        onLoginClick={() => window.location.href = '/login'}
      />
      
      <main className="pt-20">
        <section className="py-20 bg-gradient-to-br from-blue-600 to-green-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30">
              <HelpCircle className="h-4 w-4 mr-2" />
              Frequently Asked Questions
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Got
              <span className="text-yellow-300"> Questions?</span>
            </h1>
            <p className="text-xl">Find answers to common questions about DSVI services</p>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border border-gray-200 rounded-lg px-6">
                  <AccordionTrigger className="text-left font-semibold">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Still Have Questions?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Our team is here to help you get started
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link to="/contact">
                  Contact Us
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/register">Register Your School</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}