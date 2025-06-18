import React from 'react';

interface SimpleWrapperProps {
  children: React.ReactNode;
}

export const SimpleWrapper: React.FC<SimpleWrapperProps> = ({ children }) => {
  return <>{children}</>;
};
