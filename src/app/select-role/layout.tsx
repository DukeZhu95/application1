'use client';

import React from 'react';

export default function SelectRoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="min-h-screen bg-gray-50">{children}</main>;
}
