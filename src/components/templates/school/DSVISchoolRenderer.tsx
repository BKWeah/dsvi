import React from 'react';
import { School, PageContent } from '@/lib/types';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import AcademicsPage from './pages/AcademicsPage';
import AdmissionsPage from './pages/AdmissionsPage';
import FacultyPage from './pages/FacultyPage';
import ContactPage from './pages/ContactPage';

interface DSVISchoolRendererProps {
  school: School;
  pageContent?: PageContent;
  currentPage?: string;
}

export default function DSVISchoolRenderer({ 
  school, 
  pageContent, 
  currentPage = 'home' 
}: DSVISchoolRendererProps) {
  
  // Map page types to components
  const normalizedPage = currentPage === 'homepage' ? 'home' : 
                        currentPage === 'about-us' ? 'about' : 
                        currentPage;
  
  return (
    <div>
      {(normalizedPage === 'home' || normalizedPage === 'homepage') && <HomePage school={school} pageContent={pageContent} />}
      {(normalizedPage === 'about' || normalizedPage === 'about-us') && <AboutPage school={school} pageContent={pageContent} />}
      {normalizedPage === 'academics' && <AcademicsPage school={school} pageContent={pageContent} />}
      {normalizedPage === 'admissions' && <AdmissionsPage school={school} pageContent={pageContent} />}
      {normalizedPage === 'faculty' && <FacultyPage school={school} pageContent={pageContent} />}
      {normalizedPage === 'contact' && <ContactPage school={school} pageContent={pageContent} />}
    </div>
  );
}
