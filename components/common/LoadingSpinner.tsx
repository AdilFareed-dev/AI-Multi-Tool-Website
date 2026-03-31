
import React from 'react';

export const LoadingSpinner = ({ size = 'w-8 h-8' }: { size?: string }) => (
  <div className={`animate-spin rounded-full border-4 border-t-purple-500 border-gray-600 ${size}`} />
);
