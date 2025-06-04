import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

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

interface RegistrationFormProps {
  onSubmit: (formData: SchoolRequest) => Promise<void>;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="schoolName">School Name *</Label>
          <Input
            id="schoolName"
            name="schoolName"
            value={formData.schoolName}
            onChange={handleInputChange}
            required
            className="mt-1"
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
            className="mt-1"
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
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="mt-1"
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
          className="mt-1"
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
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
          >
            <option value="">Select type</option>
            <option value="private">Private School</option>
            <option value="public">Public School</option>
            <option value="vocational">Vocational School</option>
            <option value="college">College</option>
            <option value="university">University</option>
            <option value="polytechnic">Polytechnic</option>
          </select>
        </div>
        <div>
          <Label htmlFor="studentCount">Number of Students</Label>
          <select
            id="studentCount"
            name="studentCount"
            value={formData.studentCount}
            onChange={handleInputChange}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
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
          className="mt-1"
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
          rows={4}
          className="mt-1"
        />
      </div>

      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-lg py-3" 
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Register Your School'}
      </Button>
    </form>
  );
};
