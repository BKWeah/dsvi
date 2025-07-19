import React from 'react';
import GSSSchoolRenderer from './school/GSSSchoolRenderer';
import { School, PageContent } from '@/lib/types';

interface SchoolPageRendererProps {
  school: School;
  pageContent?: PageContent;
  currentPage?: string;
}

export default function SchoolPageRenderer({ 
  school, 
  pageContent, 
  currentPage = 'home' 
}: SchoolPageRendererProps) {
  // Use the new GSS School Template
  return (
    <GSSSchoolRenderer 
      school={school}
      pageContent={pageContent}
      currentPage={currentPage}
    />
  );
}
