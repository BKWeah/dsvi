import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MobileForm, MobileInput, MobileTextarea } from '@/components/mobile/MobileForm';
import { Navigation } from '@/pages/public/components/Navigation'; // Import Navigation
import { teamMembers, departments } from '@/data/teamData'; // Import teamMembers and departments
import { 
  GraduationCap, 
  Users, 
  Globe, 
  Shield, 
  BarChart3, 
  CheckCircle, 
  ArrowRight,
  School,
  Star,
  Menu,
  X,
  MapPin,
  Phone,
  Mail,
  Linkedin, // Added import
  Github // Added import
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

export default function ResponsiveIndex() {
  const { user, role, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState<SchoolRequest>({
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

  const heroRef = useRef<HTMLElement>(null); // Ref for the hero section

  useEffect(() => {
    // This useEffect is for the hero section intersection observer,
    // which was previously in Navigation. It's moved here as Navigation no longer takes heroRef.
    const observer = new IntersectionObserver(
      ([entry]) => {
        // You can use this state for any logic dependent on hero section visibility
        // For example, changing navigation bar style
        // setIsOverHero(entry.isIntersecting); // If you re-introduce this state
      },
      {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.1, // Trigger when 10% of the hero section is visible
      }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => {
      if (heroRef.current) {
        observer.unobserve(heroRef.current);
      }
    };
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('school_requests').insert([
        {
          school_name: formData.schoolName,
          contact_email: formData.contactEmail,
          contact_name: formData.contactName,
          phone: formData.phone,
          address: formData.address,
          school_type: formData.schoolType,
          student_count: formData.studentCount,
          website: formData.website,
          message: formData.message,
        }
      ]);

      if (error) {
        throw error;
      }

      toast({
        title: "Request Submitted!",
        description: "Your school request has been successfully submitted. We will get back to you soon.",
        variant: "default",
      });
      setIsDialogOpen(false);
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
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "There was an error submitting your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation /> {/* Navigation component without props */}
      
      <main className="pt-20">
        {/* Hero Section */}
        <section ref={heroRef} id="home" className="relative py-20 md:py-32 bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 text-white overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-pattern-squares opacity-10"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-800 to-green-800 opacity-20"></div>
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-6 bg-white/20 text-white border-white/30">
                Empowering Liberian Education
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Digital School Visibility Initiative: <span className="text-yellow-300">Transforming Education</span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8">
                Connecting schools, students, and parents through innovative digital platforms.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg">
                  <Link to="/register">
                    Onboard Your School
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10 shadow-lg">
                  <Link to="/about">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto text-center">
              <Badge className="mb-4 bg-blue-100 text-blue-600">About Us</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                Our Mission to Revolutionize Education
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-12">
                DSVI is dedicated to bridging the digital divide in Liberian education. We provide schools with the tools and platforms needed to enhance their visibility, streamline operations, and improve communication with students and parents. Our goal is to foster a more connected and efficient educational ecosystem across the nation.
              </p>
              <div className="grid md:grid-cols-3 gap-8">
                <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <GraduationCap className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">Digital Empowerment</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-600">Equipping schools with modern digital tools for enhanced learning and administration.</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-green-600" />
                    </div>
                    <CardTitle className="text-xl">Community Connection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Fostering stronger ties between schools, students, and parents for collaborative growth.</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Globe className="h-8 w-8 text-yellow-600" />
                    </div>
                    <CardTitle className="text-xl">National Impact</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Driving widespread educational transformation across all regions of Liberia.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <Badge className="mb-4 bg-green-100 text-green-600">Our Features</Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Comprehensive Solutions for Modern Schools
                </h2>
                <p className="text-lg text-gray-700">
                  From seamless communication to robust administration, we've got you covered.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <Shield className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl">Secure School Profiles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Create and manage a secure, comprehensive online profile for your institution.</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                      <BarChart3 className="h-6 w-6 text-purple-600" />
                    </div>
                    <CardTitle className="text-xl">Performance Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Gain insights into student engagement and school performance with intuitive dashboards.</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle className="h-6 w-6 text-orange-600" />
                    </div>
                    <CardTitle className="text-xl">Streamlined Admissions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Simplify the application process for prospective students and parents.</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                      <School className="h-6 w-6 text-red-600" />
                    </div>
                    <CardTitle className="text-xl">Virtual Campus Tours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Offer immersive virtual tours to showcase your school's facilities and environment.</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                      <Star className="h-6 w-6 text-teal-600" />
                    </div>
                    <CardTitle className="text-xl">Student & Parent Portals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Dedicated portals for easy access to grades, assignments, and school announcements.</p>
                  </CardContent>
                </Card>
                <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                      <Mail className="h-6 w-6 text-indigo-600" />
                    </div>
                    <CardTitle className="text-xl">Integrated Messaging</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Seamless communication tools for teachers, students, and parents within the platform.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section (Added to Landing Page) */}
        <section id="team" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <Badge className="mb-4 bg-blue-100 text-blue-600">Our Team</Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Meet Our Dedicated Team
                </h2>
                <p className="text-lg text-gray-700">
                  The passionate individuals driving DSVI's mission forward.
                </p>
              </div>

              {departments.map((department, deptIndex) => (
                <div key={department.name} className={`${deptIndex > 0 ? 'mt-20' : ''}`}>
                  <div className="text-center mb-12">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">
                      {department.name}
                    </h3>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {teamMembers
                      .filter(member => member.department === department.name)
                      .map((member, index) => (
                        <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow">
                          <CardHeader className="text-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Users className="h-12 w-12 text-blue-600" />
                            </div>
                            <CardTitle className="text-xl">{member.name}</CardTitle>
                            <p className="text-blue-600 font-medium">{member.role}</p>
                          </CardHeader>
                          <CardContent className="text-center">
                            <p className="text-gray-600 mb-4">{member.description}</p>
                            <div className="flex justify-center gap-3">
                              <Button variant="outline" size="sm" className="p-2">
                                <Mail className="h-4 w-4" />
                              </Button>
                              {member.linkedin && (
                                <Button variant="outline" size="sm" className="p-2">
                                  <Linkedin className="h-4 w-4" />
                                </Button>
                              )}
                              {member.github && (
                                <Button variant="outline" size="sm" className="p-2">
                                  <Github className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Transform Your School?
              </h2>
              <p className="text-xl mb-8 text-blue-100">
                Join the Digital School Visibility Initiative and empower your institution for the future.
              </p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 shadow-lg">
                    Request School Onboarding
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] p-6">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">School Onboarding Request</DialogTitle>
                    <DialogDescription className="text-gray-600">
                      Fill out the form below to request onboarding for your school.
                    </DialogDescription>
                  </DialogHeader>
                  <MobileForm onSubmit={handleSubmit} className="space-y-4" title="School Onboarding Form">
                    <MobileInput
                      label="School Name"
                      name="schoolName"
                      value={formData.schoolName}
                      onChange={handleInputChange}
                      placeholder="e.g., Monrovia High School"
                      required
                    />
                    <MobileInput
                      label="Contact Person Name"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleInputChange}
                      placeholder="e.g., John Doe"
                      required
                    />
                    <MobileInput
                      label="Contact Email"
                      name="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      placeholder="e.g., info@monroviahigh.edu"
                      required
                    />
                    <MobileInput
                      label="Phone Number"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="e.g., +231 770 123 456"
                    />
                    <MobileInput
                      label="School Address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="e.g., 123 Main St, Monrovia"
                    />
                    <div>
                      <label htmlFor="schoolType" className="block text-sm font-medium text-gray-700 mb-1">School Type</label>
                      <select
                        id="schoolType"
                        name="schoolType"
                        value={formData.schoolType}
                        onChange={handleInputChange}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                      >
                        <option value="">Select Type</option>
                        <option value="Primary">Primary</option>
                        <option value="Secondary">Secondary</option>
                        <option value="Vocational">Vocational</option>
                        <option value="University">University</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <MobileInput
                      label="Number of Students"
                      name="studentCount"
                      value={formData.studentCount}
                      onChange={handleInputChange}
                      placeholder="e.g., 500"
                      type="number"
                    />
                    <MobileInput
                      label="School Website (Optional)"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="e.g., www.monroviahigh.edu"
                    />
                    <MobileTextarea
                      label="Additional Message (Optional)"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Any specific requirements or questions?"
                      rows={3}
                    />
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                      {isSubmitting ? 'Submitting...' : 'Submit Request'}
                    </Button>
                  </MobileForm>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </section>

        {/* Footer Section */}
        <footer className="bg-gray-800 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">DSVI</h3>
                <p className="text-gray-400">Digital School Visibility Initiative</p>
                <p className="text-gray-400 mt-2">Empowering Liberian Education Digitally.</p>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                  <li><Link to="/team" className="text-gray-400 hover:text-white transition-colors">Our Team</Link></li>
                  <li><Link to="/packages" className="text-gray-400 hover:text-white transition-colors">Packages</Link></li>
                  <li><Link to="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
                  <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">Contact Us</h3>
                <p className="text-gray-400 flex items-center mb-2">
                  <MapPin className="h-5 w-5 mr-2 text-gray-500" />
                  Monrovia, Liberia
                </p>
                <p className="text-gray-400 flex items-center mb-2">
                  <Phone className="h-5 w-5 mr-2 text-gray-500" />
                  +231 770 000 000
                </p>
                <p className="text-gray-400 flex items-center">
                  <Mail className="h-5 w-5 mr-2 text-gray-500" />
                  info@libdsvi.com
                </p>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-500">
              &copy; {new Date().getFullYear()} DSVI. All rights reserved.
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
