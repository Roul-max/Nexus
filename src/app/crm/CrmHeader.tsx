'use client';

import React from 'react';
import { CrmNav } from './CrmNav';

export function CrmHeader() {
  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <h1 className="text-lg font-semibold leading-6 text-gray-900">CRM Dashboard</h1>
        <CrmNav />
      </div>
    </header>
  );
}