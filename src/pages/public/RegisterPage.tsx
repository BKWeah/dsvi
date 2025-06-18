import React, { useState, useRef, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  GraduationCap, CreditCard, Smartphone, Building, 
  ArrowRight, CheckCircle, FileText, DollarSign
} from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    schoolName: '',
    contactName: '',
    contactEmail: '',
    phone: '',
    address: '',
    county: '',
    schoolType: '',
    studentCount: '',
    yearEstablished: '', // Added Year Established
    website: '',
    preferredPackage: 'standard',
    paymentMethod: 'mobile_money',
    message: '',
    permitFile: null as File | null // Added for file upload
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const heroRef = useRef<HTMLElement>(null); // Create a ref for Navigation

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to the top of the page on mount
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateReceiptNumber = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `DSVI-${timestamp}-${random}`;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const receiptNumber = generateReceiptNumber();
  const packagePrices = {
    'standard': 100,
    'advanced1': 200,
    'advanced2': 350
  };
      
      let permitUrl: string | null = null;
      if (formData.permitFile) {
        const file = formData.permitFile;
        const fileExt = file.name.split('.').pop();
        const fileName = `${formData.schoolName.replace(/\s+/g, '_').toLowerCase()}-${Date.now()}.${fileExt}`;
        const filePath = `permits/${fileName}`; // Assuming 'permits' bucket

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('school-permits') // Use a dedicated bucket for school permits
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('Error uploading permit file:', uploadError);
          toast({
            title: "Upload Error",
            description: "Failed to upload permit. Please try again.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
        permitUrl = supabase.storage.from('school-permits').getPublicUrl(filePath).data.publicUrl;
      }

      const { data, error } = await supabase
        .from('school_requests')
        .insert({
          school_name: formData.schoolName,
          contact_name: formData.contactName,
          contact_email: formData.contactEmail,
          phone: formData.phone,
          address: formData.address,
          school_type: formData.schoolType,
          student_count: formData.studentCount === '' ? null : formData.studentCount,
          year_established: formData.yearEstablished === '' ? null : parseInt(formData.yearEstablished),
          website: formData.website,
          message: formData.message,
          preferred_package: formData.preferredPackage,
          payment_method: formData.paymentMethod,
          receipt_number: receiptNumber,
          amount_paid: packagePrices[formData.preferredPackage as keyof typeof packagePrices],
          payment_status: 'pending',
          permit_url: permitUrl // Added permit_url
        })
        .select()
        .single();

      if (error) throw error;

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Registration Successful!",
        description: `Receipt #${receiptNumber} - We'll contact you within 48 hours.`,
      });

      // Redirect to thank you page with receipt info
      window.location.href = `/thank-you?receipt=${receiptNumber}&school=${encodeURIComponent(formData.schoolName)}`;
      
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: "Error",
        description: "Failed to submit registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const counties = [
    "Bomi", "Bong", "Gbarpolu", "Grand Bassa", "Grand Cape Mount", 
    "Grand Gedeh", "Grand Kru", "Lofa", "Margibi", "Maryland", 
    "Montserrado", "Nimba", "River Cess", "River Gee", "Sinoe"
  ];

  const packageInfo = {
    standard: { name: "Standard Package", price: "$100/year" },
    advanced1: { name: "Prime Essentials Package", price: "$200/year" },
    advanced2: { name: "Prime Elite Package", price: "$350/year" }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation 
        onLoginClick={() => window.location.href = '/login'}
        heroRef={heroRef} // Pass the heroRef
      />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-green-600 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-6 bg-white/20 text-white border-white/30">
                <GraduationCap className="h-4 w-4 mr-2" />
                School Registration
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Register Your
                <span className="text-yellow-300"> School Today</span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100">
                Complete the form below and get your professional website within 48 hours
              </p>
            </div>
          </div>
        </section>

        {/* Registration Form */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="border-none shadow-xl">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-bold">
                    School Registration Form
                  </CardTitle>
                  <p className="text-gray-600">
                    Fill out all required fields to get started with DSVI
                  </p>
                </CardHeader>
                
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* School Information */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Building className="h-5 w-5 text-blue-600" />
                        School Information
                      </h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="schoolName">School Name *</Label>
                          <Input
                            id="schoolName"
                            value={formData.schoolName}
                            onChange={(e) => handleInputChange('schoolName', e.target.value)}
                            placeholder="Enter your school's full name"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="schoolType">School Type *</Label>
                          <Select value={formData.schoolType} onValueChange={(value) => handleInputChange('schoolType', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select school type" />
                            </SelectTrigger>
                            <SelectContent>
                              <div className="px-2 py-1 text-sm font-semibold text-gray-900 bg-gray-100">Public Schools</div>
                              <SelectItem value="public-daycare">Day Care (Public)</SelectItem>
                              <SelectItem value="public-nursery">Nursery (Public)</SelectItem>
                              <SelectItem value="public-kindergarten">Kindergarten (Public)</SelectItem>
                              <SelectItem value="public-elementary">Elementary / Primary School (Public)</SelectItem>
                              <SelectItem value="public-junior-high">Junior High School (Public)</SelectItem>
                              <SelectItem value="public-senior-high">Senior High School (Public)</SelectItem>
                              <SelectItem value="public-vocational">Vocational / Technical School (Public)</SelectItem>
                              <SelectItem value="public-college">College (Public)</SelectItem>
                              <SelectItem value="public-polytechnic">Polytechnic (Public)</SelectItem>
                              <SelectItem value="public-university">University (Public)</SelectItem>
                              
                              <div className="px-2 py-1 text-sm font-semibold text-gray-900 bg-gray-100 mt-2">Private Schools</div>
                              <SelectItem value="private-daycare">Day Care (Private)</SelectItem>
                              <SelectItem value="private-nursery">Nursery (Private)</SelectItem>
                              <SelectItem value="private-kindergarten">Kindergarten (Private)</SelectItem>
                              <SelectItem value="private-elementary">Elementary / Primary School (Private)</SelectItem>
                              <SelectItem value="private-junior-high">Junior High School (Private)</SelectItem>
                              <SelectItem value="private-senior-high">Senior High School (Private)</SelectItem>
                              <SelectItem value="private-vocational">Vocational / Technical School (Private)</SelectItem>
                              <SelectItem value="private-college">College (Private)</SelectItem>
                              <SelectItem value="private-polytechnic">Polytechnic (Private)</SelectItem>
                              <SelectItem value="private-university">University (Private)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="county">County *</Label>
                          <Select value={formData.county} onValueChange={(value) => handleInputChange('county', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select county" />
                            </SelectTrigger>
                            <SelectContent>
                              {counties.map(county => (
                                <SelectItem key={county} value={county.toLowerCase()}>{county}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="studentCount">Number of Students</Label>
                          <Input
                            id="studentCount"
                            type="number"
                            value={formData.studentCount}
                            onChange={(e) => handleInputChange('studentCount', e.target.value)}
                            placeholder="Approximate student count"
                          />
                        </div>
                        <div>
                          <Label htmlFor="yearEstablished">Year Established *</Label>
                          <Input
                            id="yearEstablished"
                            type="number"
                            value={formData.yearEstablished}
                            onChange={(e) => handleInputChange('yearEstablished', e.target.value)}
                            placeholder="e.g., 1990"
                            min="1800"
                            max={new Date().getFullYear()}
                            required
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <Label htmlFor="address">School Address *</Label>
                        <Textarea
                          id="address"
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          placeholder="Enter complete school address"
                          required
                        />
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-green-600" />
                        Contact Information
                      </h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="contactName">Contact Person Name *</Label>
                          <Input
                            id="contactName"
                            value={formData.contactName}
                            onChange={(e) => handleInputChange('contactName', e.target.value)}
                            placeholder="Principal/Administrator name"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="contactEmail">Email Address *</Label>
                          <Input
                            id="contactEmail"
                            type="email"
                            value={formData.contactEmail}
                            onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                            placeholder="school@example.com"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder="+231-XXX-XXXX"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="website">Current Website (if any)</Label>
                          <Input
                            id="website"
                            value={formData.website}
                            onChange={(e) => handleInputChange('website', e.target.value)}
                            placeholder="https://yourschool.com"
                          />
                        </div>
                        <div className="col-span-1 md:col-span-2">
                          <Label htmlFor="permitFile" className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            Permit to Operate or Accreditation Certificate *
                          </Label>
                          <Input
                            id="permitFile"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null;
                              setFormData(prev => ({
                                ...prev,
                                permitFile: file
                              }));
                            }}
                            required
                            className="mt-2"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Upload your school's official permit or accreditation document (PDF, JPG, PNG)
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Package Selection */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-purple-600" />
                        Package Selection
                      </h3>
                      <RadioGroup 
                        value={formData.preferredPackage} 
                        onValueChange={(value) => handleInputChange('preferredPackage', value)}
                        className="space-y-4"
                      >
                        {Object.entries(packageInfo).map(([key, info]) => (
                          <div key={key} className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                            <RadioGroupItem value={key} id={key} />
                            <Label htmlFor={key} className="flex-1 cursor-pointer">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{info.name}</span>
                                <span className="text-blue-600 font-bold">{info.price}</span>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Payment Method */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-orange-600" />
                        Payment Method
                      </h3>
                      <RadioGroup 
                        value={formData.paymentMethod} 
                        onValueChange={(value) => handleInputChange('paymentMethod', value)}
                        className="space-y-4"
                      >
                        <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value="mobile_money" id="mobile_money" />
                          <Label htmlFor="mobile_money" className="flex-1 cursor-pointer">
                            <div className="flex items-center gap-3">
                              <Smartphone className="h-5 w-5 text-green-600" />
                              <span>Mobile Money (Orange Money, MTN MoMo)</span>
                            </div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value="debit_credit" id="debit_credit" />
                          <Label htmlFor="debit_credit" className="flex-1 cursor-pointer">
                            <div className="flex items-center gap-3">
                              <CreditCard className="h-5 w-5 text-blue-600" />
                              <span>Debit/Credit Card</span>
                            </div>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                          <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                          <Label htmlFor="bank_transfer" className="flex-1 cursor-pointer">
                            <div className="flex items-center gap-3">
                              <Building className="h-5 w-5 text-purple-600" />
                              <span>Bank Transfer</span>
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Additional Message */}
                    <div>
                      <Label htmlFor="message">Additional Message (Optional)</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        placeholder="Any specific requirements or questions..."
                        rows={4}
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="text-center pt-6">
                      <Button 
                        type="submit" 
                        size="lg" 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-12"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Processing Registration...
                          </>
                        ) : (
                          <>
                            Register School & Pay
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </>
                        )}
                      </Button>
                      <p className="text-sm text-gray-600 mt-4">
                        By registering, you agree to our terms of service and privacy policy
                      </p>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
