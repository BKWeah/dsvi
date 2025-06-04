import React from 'react';
import DSVISchoolRenderer from './school/DSVISchoolRenderer';
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
  // Use the new DSVI School Template
  return (
    <DSVISchoolRenderer 
      school={school}
      pageContent={pageContent}
      currentPage={currentPage}
    />
  );
}
