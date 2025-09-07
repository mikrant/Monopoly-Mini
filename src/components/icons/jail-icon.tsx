
import React from 'react';

export const JailIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Bars */}
    <path d="M8 6V18" />
    <path d="M12 6V18" />
    <path d="M16 6V18" />
    <path d="M4 8H20" />
    <path d="M4 12H20" />
    <path d="M4 16H20" />

    {/* Person behind bars */}
    <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
    <path d="M10 16a2 2 0 114 0" />
  </svg>
);
