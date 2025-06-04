import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle,
  Clock,
  DollarSign,
  Users,
  Settings,
  Shield,
  Plus,
  Minus
} from 'lucide-react';

export const FAQSection: React.FC = () => {
  const [openFAQ, setOpenFAQ] = React.useState<number | null>(0);

  const faqs = [
    {
      question: "How much does it cost?",
      answer: "Our Prime Essentials Package starts at $200, which includes professional website design, 6 pages, mobile optimization, and basic support. We also offer Prime Elite Package starting at $350 with additional features like student portals and advanced analytics.",
      icon: DollarSign
    },
    {
      question: "How long does setup take?",
      answer: "Most schools are live within 48 hours of payment completion. Our streamlined process includes content submission, website development, review & approval, training, and launch - all completed in under 2 days.",
      icon: Clock
    },
    {
      question: "Do I need technical knowledge?",
      answer: "Not at all! Our content management system is designed specifically for educators, not developers. If you can use email, you can manage your school's website. We also provide comprehensive training and ongoing support.",
      icon: Users
    },
    {
      question: "What kind of support do you provide?",
      answer: "We offer 24/7 technical support, comprehensive training sessions, video tutorials, and dedicated account management. Our education specialists understand the unique needs of schools and are always ready to help.",
      icon: Shield
    },
    {
      question: "Can we customize our website?",
      answer: "Absolutely! Every school gets a unique design that reflects their identity. You can customize colors, upload your logo, add your school's branding, and organize content to match your specific needs and requirements.",
      icon: Settings
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept Mobile Money (Orange Money, MTN Money), Debit/Credit Cards (Visa, MasterCard), and Bank Transfers. All payments are secure and you'll receive an instant digital receipt upon completion.",
      icon: DollarSign
    },
    {
      question: "What happens after I register?",
      answer: "After registration and payment, you'll receive a digital receipt and onboarding instructions. Our team will contact you within 24 hours to begin the content submission process and guide you through each step.",
      icon: Clock
    },
    {
      question: "Is my data secure?",
      answer: "Yes! We use enterprise-grade security with SSL certificates, automatic backups, and 99.9% uptime guarantee. Your school's data is protected with the highest security standards and regular backups ensure nothing is ever lost.",
      icon: Shield
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <Badge className="mb-6 bg-purple-100 text-purple-800 hover:bg-purple-200 px-6 py-2 text-lg">
              <HelpCircle className="mr-2 h-5 w-5" />
              Got Questions?
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Everything you need to know about DSVI and our services. Can't find what you're looking for? Contact our support team.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const IconComponent = faq.icon;
              const isOpen = openFAQ === index;
              
              return (
                <Card 
                  key={index}
                  className="border-none shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => setOpenFAQ(isOpen ? null : index)}
                >
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between p-6 bg-white rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <IconComponent className="h-6 w-6 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {faq.question}
                        </h3>
                      </div>
                      <div className="flex-shrink-0">
                        {isOpen ? (
                          <Minus className="h-6 w-6 text-gray-400" />
                        ) : (
                          <Plus className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                    </div>
                    {isOpen && (
                      <div className="px-6 pb-6">
                        <div className="pl-16">
                          <p className="text-gray-600 leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
