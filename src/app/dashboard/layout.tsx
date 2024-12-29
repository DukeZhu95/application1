'use client';

import React from 'react';
import { RouteGuard } from '@/app/components/auth/route-guard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RouteGuard>{children}</RouteGuard>;
}
