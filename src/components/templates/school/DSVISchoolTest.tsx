import React from 'react';
import { School } from '@/lib/types';

interface DSVISchoolTestProps {
  school?: School;
  currentPage?: string;
}

export default function DSVISchoolTest({ 
  school, 
  currentPage = 'home' 
}: DSVISchoolTestProps) {
  
  // Simple test data if no school provided
  const testSchool: School = school || {
    id: 'test-school',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    name: 'Test School',
    slug: 'test-school',
    logo_url: null,
    admin_user_id: null,
    theme_settings: null,
    custom_css: null,
    theme_version: 1,
    contact_info: {
      address: '123 Test Street, Lagos, Nigeria',
      phone: '+234 123 456 7890',
      email: 'info@testschool.edu.ng'
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-blue-600">{testSchool.name}</h1>
          <nav className="mt-4">
            <div className="flex space-x-4">
              <a href="#" className="text-gray-700 hover:text-blue-600">Home</a>
              <a href="#" className="text-gray-700 hover:text-blue-600">About</a>
              <a href="#" className="text-gray-700 hover:text-blue-600">Contact</a>
            </div>
          </nav>
        </div>
      </header>

      {/* Simple Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to {testSchool.name}
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Testing the DSVI School Template - Current Page: {currentPage}
          </p>
          
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold mb-4">Template Test</h3>
            <p className="text-gray-700">
              If you can see this, the basic template structure is working. 
              We can now debug any issues with the full template.
            </p>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Contact Info:</strong><br />
                Address: {testSchool.contact_info?.address}<br />
                Phone: {testSchool.contact_info?.phone}<br />
                Email: {testSchool.contact_info?.email}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 {testSchool.name}. All rights reserved.</p>
          <p className="mt-2 text-gray-400">Built with ❤️ by DSVI</p>
        </div>
      </footer>
    </div>
  );
}
