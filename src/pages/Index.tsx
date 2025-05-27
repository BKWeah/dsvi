import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EducationalIllustration } from '@/components/ui/EducationalIllustration';
import { 
  GraduationCap, 
  Users, 
  Globe, 
  Palette, 
  Shield, 
  BarChart3, 
  CheckCircle, 
  ArrowRight,
  School,
  BookOpen,
  Star,
  MessageSquare,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

interface SchoolRequest {
  schoolName: string;
  contactEmail: string;
  contactName: string;
  phone: string;
  address: string;
  schoolType: string;
  studentCount: string;
  website: string;
  message: string;
}

export default function Index() {
  const { user, role, logout } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);  const [formData, setFormData] = useState<SchoolRequest>({
    schoolName: '',
    contactEmail: '',
    contactName: '',
    phone: '',
    address: '',
    schoolType: '',
    studentCount: '',
    website: '',
    message: ''
  });

  const handleLogout = async () => {
    await logout();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('school_requests')
        .insert({
          school_name: formData.schoolName,
          contact_name: formData.contactName,
          contact_email: formData.contactEmail,
          phone: formData.phone,
          address: formData.address,
          school_type: formData.schoolType,
          student_count: formData.studentCount,
          website: formData.website,
          message: formData.message
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Request Submitted Successfully!",
        description: "We'll review your application and get back to you within 48 hours.",
      });

      setFormData({
        schoolName: '',
        contactEmail: '',
        contactName: '',
        phone: '',
        address: '',
        schoolType: '',
        studentCount: '',
        website: '',
        message: ''
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="container mx-auto px-4 py-12">
          <Card>
            <CardHeader>
              <CardTitle>Welcome back!</CardTitle>
              <CardDescription>
                You are logged in as: {user.email} ({role})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 flex-wrap">
                {role === 'DSVI_ADMIN' && (
                  <Button asChild>
                    <Link to="/dsvi-admin">DSVI Admin Panel</Link>
                  </Button>
                )}
                {role === 'SCHOOL_ADMIN' && (
                  <Button asChild>
                    <Link to="/school-admin">School Admin Panel</Link>
                  </Button>
                )}
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">DSVI</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>Request Access</Button>
              </DialogTrigger>              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Request School Access</DialogTitle>
                  <DialogDescription>
                    Tell us about your school and we'll set up your digital presence
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmitRequest} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="schoolName">School Name *</Label>
                      <Input
                        id="schoolName"
                        name="schoolName"
                        value={formData.schoolName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactName">Contact Person *</Label>
                      <Input
                        id="contactName"
                        name="contactName"
                        value={formData.contactName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contactEmail">Email Address *</Label>
                      <Input
                        id="contactEmail"
                        name="contactEmail"
                        type="email"
                        value={formData.contactEmail}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">School Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="schoolType">School Type</Label>
                      <select
                        id="schoolType"
                        name="schoolType"
                        value={formData.schoolType}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">Select type</option>
                        <option value="public">Public School</option>
                        <option value="private">Private School</option>
                        <option value="charter">Charter School</option>
                        <option value="vocational">Vocational School</option>
                        <option value="university">University</option>
                        <option value="college">College</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="studentCount">Number of Students</Label>
                      <select
                        id="studentCount"
                        name="studentCount"
                        value={formData.studentCount}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">Select range</option>
                        <option value="0-100">0-100</option>
                        <option value="101-500">101-500</option>
                        <option value="501-1000">501-1000</option>
                        <option value="1001-2500">1001-2500</option>
                        <option value="2500+">2500+</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="website">Current Website (if any)</Label>
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Additional Information</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tell us about your school's goals and any specific requirements..."
                      rows={3}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30">
              🎓 Empowering Educational Excellence
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Transform Your School's
              <span className="text-yellow-300"> Digital Presence</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Professional websites, seamless content management, and powerful tools to showcase your educational excellence
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                    Get Started Today
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-green-300/20 rounded-full blur-3xl"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything Your School Needs Online
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From beautiful websites to powerful content management, we provide the complete digital solution for educational institutions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Globe className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Professional Websites</CardTitle>
                <CardDescription>
                  Beautiful, responsive websites that showcase your school's unique identity and values
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Palette className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Easy Content Management</CardTitle>
                <CardDescription>
                  Intuitive tools that let you update content, add events, and manage information without technical expertise
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>Student & Parent Portal</CardTitle>
                <CardDescription>
                  Dedicated sections for admissions, academics, faculty information, and important announcements
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Shield className="h-12 w-12 text-red-600 mb-4" />
                <CardTitle>Secure & Reliable</CardTitle>
                <CardDescription>
                  Enterprise-grade security with automatic backups and 99.9% uptime guarantee
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-yellow-600 mb-4" />
                <CardTitle>Analytics & Insights</CardTitle>
                <CardDescription>
                  Track website performance, visitor engagement, and content effectiveness with detailed analytics
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <School className="h-12 w-12 text-indigo-600 mb-4" />
                <CardTitle>Mobile Optimized</CardTitle>
                <CardDescription>
                  Perfect display on all devices desktop, tablet, and mobile for maximum accessibility
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How DSVI Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get your school online in just three simple steps
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Submit Your Request</h3>
                <p className="text-gray-600">
                  Fill out our simple form with your school's information. Tell us about your needs and goals.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">2</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">We Build Your Site</h3>
                <p className="text-gray-600">
                  Our team creates your professional website and sets up your content management system within 48 hours.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">You're Live!</h3>
                <p className="text-gray-600">
                  Start managing your content immediately. We provide training and ongoing support for your team.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-12">
              Trusted by Educational Institutions Nationwide
            </h2>
            
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2">500+</div>
                <div className="text-blue-100">Schools Served</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2">99.9%</div>
                <div className="text-blue-100">Uptime Guarantee</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2">48hr</div>
                <div className="text-blue-100">Setup Time</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold mb-2">24/7</div>
                <div className="text-blue-100">Support Available</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Why Schools Choose DSVI
                </h2>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Quick Setup & Launch</h3>
                      <p className="text-gray-600">Get your school website live in just 48 hours with our streamlined onboarding process</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">No Technical Skills Required</h3>
                      <p className="text-gray-600">Our user-friendly interface means anyone can update content and manage the website</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Dedicated Support</h3>
                      <p className="text-gray-600">Our education specialists provide ongoing support and training for your team</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Cost-Effective Solution</h3>
                      <p className="text-gray-600">Professional results at a fraction of the cost of custom development</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-8">
                <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-2xl p-8">
                  <div className="text-center">
                    <EducationalIllustration type="school" className="w-full h-40 mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h3>
                    <p className="text-gray-600 mb-6">Join hundreds of schools already using DSVI to enhance their digital presence</p>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="lg" className="w-full">
                          Request Your School Website
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Educational Impact Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Empowering Educational Excellence
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how DSVI transforms the way schools connect with their communities
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <EducationalIllustration type="technology" className="w-full h-40 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Modern Technology</h3>
                <p className="text-gray-600">
                  Cutting-edge tools that make content management simple and accessible for all educators
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <EducationalIllustration type="collaboration" className="w-full h-40 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Community Connection</h3>
                <p className="text-gray-600">
                  Strengthen relationships between students, parents, teachers, and the broader community
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <EducationalIllustration type="growth" className="w-full h-40 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Measurable Results</h3>
                <p className="text-gray-600">
                  Track engagement and see real improvements in communication and enrollment
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Educators Say About DSVI
            </h2>
            <p className="text-xl text-gray-600">Trusted by educational institutions nationwide</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "DSVI transformed our online presence completely. Parents and students can now easily find all the information they need, and updating content is so simple!"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    MJ
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-gray-900">Maria Johnson</p>
                    <p className="text-sm text-gray-600">Principal, Lincoln Elementary</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "The support team is incredible. They helped us migrate all our content and trained our staff. Our enrollment inquiries have increased by 40%!"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    RC
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-gray-900">Robert Chen</p>
                    <p className="text-sm text-gray-600">IT Director, Riverside High</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4">
                  "As a small private school, we needed an affordable solution that didn't compromise on quality. DSVI delivered exactly what we needed!"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    SA
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-gray-900">Sarah Adams</p>
                    <p className="text-sm text-gray-600">Administrator, Oak Valley Academy</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600">
                Everything you need to know about DSVI
              </p>
            </div>

            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    How much does it cost?
                  </h3>
                  <p className="text-gray-600">
                    DSVI is completely free for public educational institutions. We're funded by educational grants and partnerships to ensure every school can have a professional online presence.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    How long does setup take?
                  </h3>
                  <p className="text-gray-600">
                    Most schools are live within 48 hours of approval. We handle all the technical setup, content migration, and initial training so you can focus on education.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Do I need technical knowledge?
                  </h3>
                  <p className="text-gray-600">
                    Not at all! Our content management system is designed for educators, not developers. If you can use email, you can manage your school's website.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    What kind of support do you provide?
                  </h3>
                  <p className="text-gray-600">
                    We offer comprehensive training, ongoing technical support, and dedicated account management. Our education specialists are here to help you succeed.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Can we customize our website?
                  </h3>
                  <p className="text-gray-600">
                    Absolutely! Every school gets a unique design that reflects their identity. You can customize colors, upload your logo, and organize content to match your needs.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your School's Digital Presence?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join the growing community of schools using DSVI to connect better with students, parents, and the community
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                  Get Started Now It's Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </DialogTrigger>
            </Dialog>
            <p className="text-sm text-blue-100">
              ✓ No setup fees ✓ 48-hour turnaround ✓ Dedicated support
            </p>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <GraduationCap className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold">DSVI</span>
              </div>
              <p className="text-gray-400 mb-4">
                Digital School Visibility Initiative Empowering educational institutions with modern digital solutions.
              </p>
              <div className="flex space-x-4">
                <MessageSquare className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
                <Mail className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
                <Phone className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer" />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Solutions</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-white cursor-pointer">School Websites</li>
                <li className="hover:text-white cursor-pointer">Content Management</li>
                <li className="hover:text-white cursor-pointer">Student Portal</li>
                <li className="hover:text-white cursor-pointer">Analytics</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-white cursor-pointer">Help Center</li>
                <li className="hover:text-white cursor-pointer">Documentation</li>
                <li className="hover:text-white cursor-pointer">Training</li>
                <li className="hover:text-white cursor-pointer">Contact Us</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>hello@dsvi.org</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>1-800-DSVI-HELP</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Education District, Gambia</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 mt-8 text-center text-gray-400">
            <p>&copy; 2024 Digital School Visibility Initiative. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}