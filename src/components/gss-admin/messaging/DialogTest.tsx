import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ComposeMessageDialog } from './ComposeMessageDialog';

export function DialogTest() {
  const [open, setOpen] = useState(false);
  const [renderCount, setRenderCount] = useState(0);

  React.useEffect(() => {
    setRenderCount(prev => prev + 1);
  });

  console.log('DialogTest render count:', renderCount);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Dialog Test Component</h2>
      <p>Render count: {renderCount}</p>
      <p>Dialog state: {open ? 'OPEN' : 'CLOSED'}</p>
      
      <Button 
        onClick={() => {
          console.log('Button clicked, setting open to true');
          setOpen(true);
        }}
      >
        Open Dialog
      </Button>

      <ComposeMessageDialog
        open={open}
        onOpenChange={(newOpen) => {
          console.log('onOpenChange called with:', newOpen);
          setOpen(newOpen);
        }}
        onMessageSent={() => {
          console.log('Message sent!');
          setOpen(false);
        }}
        templates={[]}
      />
    </div>
  );
}
