"use client";

// ============================================================================
// IMPORTS
// ============================================================================

// React & Next.js
import { useState, useEffect, useMemo, useCallback, memo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Icons
import {
  Bell,
  Plus,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Command,
  RefreshCw,
  Clock,
  X,
} from "lucide-react";

// Types
import type { DashboardStats } from "@/types";

// UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "critical" | "warning";
  read: boolean;
  patientId?: string;
}

interface DashboardHeaderProps {
  stats: DashboardStats;
  notifications?: Notification[];
  onRefresh?: () => Promise<void>;
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
  onDismissNotification?: (notificationId: string) => void;
  onOpenCommandPalette?: () => void;
  enableNotificationSound?: boolean;
  autoRefreshInterval?: number; // in seconds, 0 = disabled
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const playNotificationSound = () => {
  try {
    const audio = new Audio("/sounds/notification.mp3");
    audio.volume = 0.3;
    audio.play().catch(() => {
      // Silently fail if audio can't play (e.g., blocked by browser)
    });
  } catch {
    // Silent fail
  }
};

// ============================================================================
// COMPONENT
// ============================================================================

function DashboardHeaderComponent({ 
  stats,
  notifications = [],
  onRefresh,
  onMarkAsRead,
  onMarkAllAsRead,
  onDismissNotification,
  onOpenCommandPalette,
  enableNotificationSound = false,
  autoRefreshInterval = 0,
}: DashboardHeaderProps) {
  // --------------------------------------------------------------------------
  // STATE
  // --------------------------------------------------------------------------
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [previousUnreadCount, setPreviousUnreadCount] = useState(0);

  // --------------------------------------------------------------------------
  // COMPUTED VALUES
  // --------------------------------------------------------------------------
  const clinicalAlerts = useMemo(() => notifications, [notifications]);
  
  const unreadCount = useMemo(
    () => clinicalAlerts.filter((n) => !n.read).length,
    [clinicalAlerts]
  );
  
  const criticalAlertsCount = useMemo(
    () => clinicalAlerts.filter((n) => n.type === "critical" && !n.read).length,
    [clinicalAlerts]
  );

  // --------------------------------------------------------------------------
  // EFFECTS
  // --------------------------------------------------------------------------
  
  // Play notification sound when new alerts arrive
  useEffect(() => {
    if (enableNotificationSound && unreadCount > previousUnreadCount && previousUnreadCount !== 0) {
      playNotificationSound();
    }
    setPreviousUnreadCount(unreadCount);
  }, [unreadCount, previousUnreadCount, enableNotificationSound]);

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefreshInterval > 0 && onRefresh && !isRefreshing) {
      const interval = setInterval(async () => {
        if (!isRefreshing) {
          setIsRefreshing(true);
          try {
            await onRefresh();
          } catch (error) {
            console.error("Failed to refresh data:", error);
          } finally {
            setIsRefreshing(false);
          }
        }
      }, autoRefreshInterval * 1000);

      return () => clearInterval(interval);
    }
  }, [autoRefreshInterval, onRefresh, isRefreshing]);

  // Close popover on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showNotifications) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showNotifications]);

  // --------------------------------------------------------------------------
  // EVENT HANDLERS
  // --------------------------------------------------------------------------
  
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        // Fallback: reload the page
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to refresh data:", error);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, onRefresh]);

  const handleNotificationClick = useCallback((notification: Notification) => {
    // Mark as read when clicked
    if (!notification.read && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
    
    if (notification.patientId) {
      setShowNotifications(false);
      router.push(`/dashboard/patients/${notification.patientId}`);
    }
  }, [onMarkAsRead, router]);

  const handleDismiss = useCallback((e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    if (onDismissNotification) {
      onDismissNotification(notificationId);
    }
  }, [onDismissNotification]);

  const handleQuickSearch = useCallback(() => {
    if (onOpenCommandPalette) {
      onOpenCommandPalette();
    } else {
      // Fallback to synthetic event
      const event = new KeyboardEvent("keydown", {
        key: "k",
        metaKey: true,
        bubbles: true,
      });
      document.dispatchEvent(event);
    }
  }, [onOpenCommandPalette]);

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------
  
  return (
    <TooltipProvider>
      <header
        className="h-14 px-4 lg:px-6 flex items-center gap-3 sm:gap-4 lg:gap-6 bg-white border-b border-slate-200 shrink-0"
        role="banner"
      >
        {/* ====================================================================
            LEFT SECTION: Search Bar
        ==================================================================== */}
        <div className="flex-1 max-w-md mr-auto">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleQuickSearch}
                className="w-full h-9 px-3 flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all hover:shadow-sm group"
              >
                <Command className="h-4 w-4 text-slate-400 group-hover:text-slate-600" aria-hidden="true" />
                <span className="text-sm text-slate-500 group-hover:text-slate-700">Search patients...</span>
                <kbd className="ml-auto px-2 h-5 text-[10px] font-medium bg-white border border-slate-200 rounded text-slate-600 shadow-sm">
                  ⌘K
                </kbd>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Quick search (⌘K)</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* ====================================================================
            RIGHT SECTION: Actions & Indicators
        ==================================================================== */}
        <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
          
          {/* Critical Alert Indicator */}
          {stats.critical > 0 && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => router.push("/dashboard?filter=critical")}
                    className="hidden sm:flex items-center gap-2 h-9 px-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all hover:shadow-sm"
                    aria-label={`${stats.critical} critical patients`}
                  >
                    <AlertCircle className="h-4 w-4 text-red-600" aria-hidden="true" />
                    <span className="text-sm font-semibold text-red-700">{stats.critical}</span>
                    <span className="hidden md:inline text-xs font-medium text-red-600">Critical</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View {stats.critical} critical patient{stats.critical !== 1 ? 's' : ''}</p>
                </TooltipContent>
              </Tooltip>
              {/* Divider */}
              <div className="hidden md:block h-6 w-px bg-slate-200" />
            </>
          )}

          {/* Refresh Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="h-9 w-9 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
                aria-label="Refresh data"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                  aria-hidden="true"
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isRefreshing ? "Refreshing..." : "Refresh data"}</p>
            </TooltipContent>
          </Tooltip>

          {/* Add Patient Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                asChild 
                size="sm" 
                className="h-9 gap-1.5 px-3 sm:px-4 font-medium shadow-sm hover:shadow-md transition-shadow"
              >
                <Link href="/dashboard/patients/new">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Add Patient</span>
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add new patient</p>
            </TooltipContent>
          </Tooltip>

          {/* Divider */}
          <div className="hidden sm:block h-6 w-px bg-slate-200" />

          {/* Notifications Bell */}
          {renderNotifications()}
        </div>
      </header>
    </TooltipProvider>
  );

  // --------------------------------------------------------------------------
  // SUB-RENDER: Notifications Popover
  // --------------------------------------------------------------------------
  
  function renderNotifications() {
    return (
      <Popover open={showNotifications} onOpenChange={setShowNotifications}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="relative h-9 w-9 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
                aria-label={`${unreadCount} unread notifications`}
              >
                <Bell className="h-4 w-4" aria-hidden="true" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-5 min-w-4.5 px-1 flex items-center justify-center text-[9px] font-bold bg-red-600 text-white rounded-full border border-white animate-in fade-in zoom-in duration-200">
                    {unreadCount}
                  </span>
                )}
                {criticalAlertsCount > 0 && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-red-600 rounded-full border border-white animate-pulse" />
                )}
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {unreadCount === 0 
                ? "No new notifications" 
                : `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              }
            </p>
          </TooltipContent>
        </Tooltip>

        <PopoverContent
          className="w-80 p-0 bg-white border border-slate-200 shadow-xl"
          align="end"
          sideOffset={8}
        >
          {renderNotificationHeader()}
          {renderNotificationList()}
        </PopoverContent>
      </Popover>
    );
  }

  // --------------------------------------------------------------------------
  // SUB-RENDER: Notification Header
  // --------------------------------------------------------------------------
  
  function renderNotificationHeader() {
    return (
      <div className="px-3 py-2.5 border-b border-slate-200 bg-slate-50/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-slate-900 opacity-100">
              Alerts
            </h3>
            {unreadCount > 0 && (
              <Badge className="h-5 px-1.5 text-[10px] font-bold bg-red-600 text-white hover:bg-red-700 animate-in fade-in slide-in-from-left-1 duration-200">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && onMarkAllAsRead && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onMarkAllAsRead}
                    className="h-6 px-2 text-xs text-slate-700 hover:text-slate-900 font-medium"
                  >
                    Mark all read
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Mark all as read</p>
                </TooltipContent>
              </Tooltip>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-slate-700 hover:text-slate-900 font-medium"
              asChild
            >
              <Link href="/dashboard/notifications">View all</Link>
            </Button>
          </div>
        </div>
        {/* Keyboard hint */}
        <p className="text-[10px] text-slate-600 mt-1.5 font-medium">
          Press <kbd className="px-1.5 py-0.5 bg-slate-200/80 rounded text-[9px] text-slate-700 font-semibold border border-slate-300/50">Esc</kbd> to close
        </p>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // SUB-RENDER: Notification List
  // --------------------------------------------------------------------------
  
  function renderNotificationList() {
    return (
      <ScrollArea className="max-h-80 bg-white">
        {clinicalAlerts.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="divide-y divide-slate-100 bg-white">
            {clinicalAlerts.map((alert, index) => renderNotificationItem(alert, index))}
          </div>
        )}
      </ScrollArea>
    );
  }

  // --------------------------------------------------------------------------
  // SUB-RENDER: Empty State
  // --------------------------------------------------------------------------
  
  function renderEmptyState() {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-white">
        <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-3">
          <CheckCircle2
            className="h-6 w-6 text-emerald-600"
            aria-hidden="true"
          />
        </div>
        <h4 className="font-semibold text-sm text-slate-900 mb-1 opacity-100">
          All Clear
        </h4>
        <p className="text-xs text-slate-600 max-w-60 opacity-100">
          No critical alerts at this time
        </p>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // SUB-RENDER: Notification Item
  // --------------------------------------------------------------------------
  
  function renderNotificationItem(alert: Notification, index: number) {
    return (
      <div
        key={alert.id}
        className="relative group animate-in fade-in slide-in-from-top-2 duration-200"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <button
          onClick={() => handleNotificationClick(alert)}
          className="w-full p-3 text-left hover:bg-slate-50 transition-all focus:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-inset"
          tabIndex={0}
        >
          <div className="flex gap-2.5">
            {/* Icon */}
            <div className="shrink-0 mt-0.5">
              {alert.type === "critical" ? (
                <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center ring-1 ring-red-200">
                  <AlertCircle
                    className="h-3.5 w-3.5 text-red-600"
                    aria-hidden="true"
                  />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center ring-1 ring-amber-200">
                  <AlertTriangle
                    className="h-3.5 w-3.5 text-amber-600"
                    aria-hidden="true"
                  />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-6">
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="font-semibold text-xs text-slate-900 opacity-100">
                  {alert.title}
                </span>
                {!alert.read && (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0 mt-1 animate-pulse"
                    aria-label="Unread"
                  />
                )}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed mb-1.5 opacity-100">
                {alert.message}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-slate-600 font-medium">
                <Clock className="h-2.5 w-2.5" aria-hidden="true" />
                <span>{alert.time}</span>
              </div>
            </div>
          </div>
        </button>
        
        {/* Dismiss Button */}
        {onDismissNotification && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={(e) => handleDismiss(e, alert.id)}
                className="absolute top-2 right-2 p-1 rounded hover:bg-slate-200 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
                aria-label="Dismiss notification"
                tabIndex={0}
              >
                <X className="h-3 w-3 text-slate-500" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Dismiss</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    );
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

// Memoize component for better performance
export default memo(DashboardHeaderComponent);
