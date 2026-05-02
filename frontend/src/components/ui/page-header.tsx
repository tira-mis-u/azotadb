'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Home, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  backHref?: string;
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  breadcrumbs = [],
  backHref,
  actions
}: PageHeaderProps) {
  const router = useRouter();

  return (
    <div className="mb-8 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 px-1">
          <Link 
            href="/dashboard" 
            className="text-muted-foreground hover:text-primary transition-colors flex items-center"
          >
            <Home size={14} />
          </Link>
          {breadcrumbs.map((item, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight size={12} className="text-muted-foreground opacity-50" />
              {item.href ? (
                <Link 
                  href={item.href} 
                  className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors tracking-tight"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-xs font-black text-foreground uppercase tracking-widest">
                  {item.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Main row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          {backHref && (
            <button
              onClick={() => backHref === 'back' ? router.back() : router.push(backHref)}
              title="Quay lại"
              className="mt-1 p-2 rounded-xl border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary hover:bg-accent transition-all duration-200 shadow-xs flex-shrink-0"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <div className="space-y-1">
            <h1 className="text-3xl font-black text-foreground tracking-tighter leading-none">
              {title}
            </h1>
            {description && (
              <p className="text-sm font-medium text-muted-foreground max-w-2xl leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-3 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
