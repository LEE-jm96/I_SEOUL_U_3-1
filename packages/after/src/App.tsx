import React from 'react'
import { Header } from './components/ui/header'
import { ManagementPage } from './pages/ManagementPage'
import './styles/components.css'

export const App: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-[#f0f0f0]">
      <Header />
      <main className="w-full max-w-[1200px] mx-auto p-6">
        <ManagementPage />
      </main>
    </div>
  );
};
