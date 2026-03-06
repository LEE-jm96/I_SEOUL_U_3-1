import React from 'react';
import { cn } from '@/lib/utils';

export const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background shadow-sm">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1976d2] text-white text-xl font-bold">
            L
          </div>
          <div>
            <h1 className="text-lg font-bold leading-none text-foreground">
              Hanghae Company
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Design System Migration Project
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-semibold text-foreground">Demo User</div>
            <div className="text-xs text-muted-foreground">demo@example.com</div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e3f2fd] text-[#1976d2] font-semibold text-base">
            DU
          </div>
        </div>
      </div>
    </header>
  );
};
