"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface Action {
  label: string;
  icon: string;
  onClick: () => void;
  variant?: "default" | "secondary" | "destructive" | "outline" | "ghost";
  loading?: boolean;
  ariaLabel?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: Action[];
  metadata?: {
    label: string;
    value: string | number;
    icon?: string;
  }[];
  variant?: "default" | "compact";
}

export default function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  metadata,
  variant = "default",
}: PageHeaderProps) {
  const isCompact = variant === "compact";

  return (
    <header className={`${isCompact ? "mb-4" : "mb-6"}`}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb className="mb-3">
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="contents">
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {crumb.href ? (
                    <BreadcrumbLink asChild>
                      <Link href={crumb.href}>{crumb.label}</Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      {/* Main Header Content */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex-1">
          <h1
            className={`font-bold tracking-tight ${isCompact ? "text-2xl" : "text-3xl"}`}
          >
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground mt-2 text-base">
              {description}
            </p>
          )}

          {/* Metadata */}
          {metadata && metadata.length > 0 && (
            <div className="flex flex-wrap items-center gap-4 mt-3">
              {metadata.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 text-sm bg-muted/50 px-3 py-1.5 rounded-md"
                >
                  {item.icon && (
                    <span
                      className="material-symbols-outlined text-[16px] text-muted-foreground"
                      aria-hidden="true"
                    >
                      {item.icon}
                    </span>
                  )}
                  <span className="text-muted-foreground">{item.label}:</span>
                  <span className="font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        {actions && actions.length > 0 && (
          <div className="flex gap-2" role="toolbar" aria-label="Page actions">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "default"}
                onClick={action.onClick}
                disabled={action.loading}
                aria-label={action.ariaLabel || action.label}
                className="gap-2"
              >
                {action.loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span
                    className="material-symbols-outlined text-[18px]"
                    aria-hidden="true"
                  >
                    {action.icon}
                  </span>
                )}
                <span className="hidden sm:inline">{action.label}</span>
              </Button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
