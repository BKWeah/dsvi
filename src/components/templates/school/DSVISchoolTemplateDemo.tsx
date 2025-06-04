import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DSVISchoolRenderer from './DSVISchoolRenderer';
import { sampleSchoolData } from './utils/sampleData';
import { Eye, Code, Palette, Layout } from 'lucide-react';

export default function DSVISchoolTemplateDemo() {
  const [currentPage, setCurrentPage] = useState('home');
  const [showCode, setShowCode] = useState(false);

  const pages = [
    { id: 'home', label: 'Homepage', icon: <Layout className="h-4 w-4" /> },
    { id: 'about', label: 'About Us', icon: <Layout className="h-4 w-4" /> },
    { id: 'academics', label: 'Academics', icon: <Layout className="h-4 w-4" /> },
    { id: 'admissions', label: 'Admissions', icon: <Layout className="h-4 w-4" /> },
    { id: 'faculty', label: 'Faculty', icon: <Layout className="h-4 w-4" /> },
    { id: 'contact', label: 'Contact', icon: <Layout className="h-4 w-4" /> }
  ];

  const features = [
    {
      title: 'Responsive Design',
      description: 'Beautiful on all devices - mobile, tablet, desktop',
      icon: <Layout className="h-5 w-5" />
    },
    {
      title: 'ShadcnUI Components', 
      description: 'Modern, accessible UI components',
      icon: <Palette className="h-5 w-5" />
    },
    {
      title: 'TypeScript Ready',
      description: 'Type-safe development experience',
      icon: <Code className="h-5 w-5" />
    },
    {
      title: 'Theme Customization',
      description: 'Easy to customize colors, fonts, and layout',
      icon: <Palette className="h-5 w-5" />
    }
  ];

  if (showCode) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">DSVI School Template</h1>
              <p className="text-gray-600">Implementation Code</p>
            </div>
            <Button onClick={() => setShowCode(false)} variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              View Demo
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Basic Implementation</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`import { DSVISchoolRenderer } from '@/components/templates/school';
import { sampleSchoolData } from '@/components/templates/school/utils/sampleData';

function SchoolWebsite() {
  return (
    <DSVISchoolRenderer 
      school={sampleSchoolData}
      currentPage="home"
    />
  );
}`}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Demo Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">DSVI School Template Demo</h1>
              <p className="text-gray-600">Beautiful, responsive school website template</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => setShowCode(true)} variant="outline">
                <Code className="h-4 w-4 mr-2" />
                View Code
              </Button>
              <Badge variant="secondary">v1.0</Badge>
            </div>
          </div>
          
          {/* Page Navigation */}
          <div className="mt-6">
            <div className="flex flex-wrap gap-2">
              {pages.map((page) => (
                <Button
                  key={page.id}
                  variant={currentPage === page.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(page.id)}
                  className="flex items-center gap-2"
                >
                  {page.icon}
                  {page.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Template Features</h2>
            <p className="text-blue-100 text-lg">Everything you need for a professional school website</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="bg-white/10 border-white/20 text-white">
                <CardContent className="p-6 text-center">
                  <div className="bg-white/20 p-3 rounded-full w-fit mx-auto mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-blue-100">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Template Preview */}
      <div className="bg-white">
        <DSVISchoolRenderer 
          school={sampleSchoolData}
          currentPage={currentPage}
        />
      </div>
    </div>
  );
}