import React from 'react';
import { EmailTestComponent } from '@/components/dsvi-admin/messaging/EmailTestComponent';

export function EmailTestPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Email Testing & Diagnostics</h1>
      <EmailTestComponent />
    </div>
  );
}
