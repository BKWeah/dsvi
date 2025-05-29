import React, { useEffect, useState } from 'react';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  CheckCircle, Clock, Phone, Mail, MessageCircle, 
  ArrowRight, Download, Calendar, Star 
} from 'lucide-react';

export default function ThankYouPage() {
  const [receiptNumber, setReceiptNumber] = useState('');
  const [schoolName, setSchoolName] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setReceiptNumber(urlParams.get('receipt') || '');
    setSchoolName(urlParams.get('school') || '');
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navigation 
        onRegisterClick={() => window.location.href = '/register'}
        onLoginClick={() => window.location.href = '/login'}
      />
      
      <main className="pt-20">
        {/* Success Section */}
        <section className="py-20 bg-gradient-to-br from-green-600 via-blue-600 to-green-600 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Thank You!
                <span className="text-yellow-300"> Registration Successful</span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100">
                {schoolName ? `${schoolName} has been successfully registered with DSVI` : 
                'Your school has been successfully registered with DSVI'}
              </p>
            </div>
          </div>
        </section>

        {/* Details Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="border-none shadow-xl mb-12">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold text-green-600">
                    Registration Confirmed
                  </CardTitle>
                  <p className="text-gray-600">
                    We have received your registration and will begin processing immediately
                  </p>
                </CardHeader>
                
                <CardContent className="p-8">
                  {receiptNumber && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-green-800 mb-2">Receipt Number</h3>
                          <p className="text-2xl font-mono text-green-600">{receiptNumber}</p>
                        </div>
                        <Button variant="outline" size="sm" className="border-green-600 text-green-600">
                          <Download className="h-4 w-4 mr-2" />
                          Download Receipt
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      What Happens Next?
                    </h2>
                    <p className="text-lg text-gray-600">
                      We will review your request and a team member will contact you shortly regarding the next steps.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <Card className="text-center border-none shadow-lg">
                      <CardContent className="p-6">
                        <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                        <h3 className="font-bold mb-2">Review Process</h3>
                        <p className="text-gray-600 text-sm">
                          Our team will review your submission within 2-4 hours
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="text-center border-none shadow-lg">
                      <CardContent className="p-6">
                        <Phone className="h-12 w-12 text-green-600 mx-auto mb-4" />
                        <h3 className="font-bold mb-2">Contact You</h3>
                        <p className="text-gray-600 text-sm">
                          A team member will call or email you within 24 hours
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="text-center border-none shadow-lg">
                      <CardContent className="p-6">
                        <Star className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                        <h3 className="font-bold mb-2">Website Launch</h3>
                        <p className="text-gray-600 text-sm">
                          Your professional website will be live within 48 hours
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card className="border-none shadow-lg bg-blue-50">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold text-center mb-6">Need Help? Contact Us</h3>
                  <div className="grid md:grid-cols-3 gap-6 text-center">
                    <div>
                      <Phone className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <p className="font-medium">Phone/WhatsApp</p>
                      <p className="text-blue-600">+231-XXX-XXXX</p>
                    </div>
                    <div>
                      <Mail className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="font-medium">Email</p>
                      <p className="text-green-600">support@libdsvi.com</p>
                    </div>
                    <div>
                      <MessageCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <p className="font-medium">Live Chat</p>
                      <p className="text-purple-600">Available 24/7</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* CTA Section */}
              <div className="text-center mt-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Want to Learn More About DSVI?
                </h3>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" variant="outline">
                    <Link to="/about">
                      About DSVI
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/how-it-works">View How It Works</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}