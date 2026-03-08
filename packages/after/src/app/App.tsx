import React from 'react';
import { Header } from '@/widgets/header';
import { ManagementPanel } from '@/widgets/management-panel';
import '@/styles/components.css';

export const App: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-background transition-colors">
      <Header />
      <main className="w-full max-w-[1200px] mx-auto p-6">
        <ManagementPanel />
      </main>
    </div>
  );
};
