'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Home, ChevronRight } from 'lucide-react';
import Link from 'next/link';

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
    <div style={{ marginBottom: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Breadcrumbs */}
      {(breadcrumbs.length > 0) && (
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Link href="/dashboard" style={{ color: 'var(--muted-foreground)', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <Home size={14} />
          </Link>
          {breadcrumbs.map((item, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight size={12} style={{ color: 'var(--muted-foreground)', opacity: 0.5 }} />
              {item.href ? (
                <Link href={item.href} style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted-foreground)', textDecoration: 'none' }}>
                  {item.label}
                </Link>
              ) : (
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--foreground)' }}>{item.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Main row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          {backHref && (
            <button
              onClick={() => backHref === 'back' ? router.back() : router.push(backHref)}
              title="Quay lại"
              style={{
                marginTop: 4,
                padding: '8px',
                borderRadius: 10,
                border: '1px solid var(--border)',
                background: 'var(--card)',
                color: 'var(--muted-foreground)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
                flexShrink: 0,
              }}
            >
              <ChevronLeft size={18} />
            </button>
          )}
          <div>
            <h1 style={{
              fontSize: 26,
              fontWeight: 900,
              color: 'var(--foreground)',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              margin: 0,
            }}>
              {title}
            </h1>
            {description && (
              <p style={{ fontSize: 13, color: 'var(--muted-foreground)', marginTop: 5 }}>
                {description}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
