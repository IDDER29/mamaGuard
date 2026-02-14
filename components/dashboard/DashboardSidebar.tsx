"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Clock,
  Heart,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  Users,
  Bell,
  Phone,
  FileText,
  Shield,
  Circle,
} from "lucide-react";
import type { Doctor } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DashboardSidebarProps {
  doctor: Doctor;
}

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
  priority?: "critical" | "warning";
}

export default function DashboardSidebar({ doctor }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState("");
  const shiftDuration = "2h 34m";

  // Update time every minute
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(
        new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    if (confirm("Are you sure you want to end your session?")) {
      router.push("/login");
    }
  };

  // Clinical Navigation - Task-focused
  const primaryNav: NavItem[] = [
    {
      href: "/dashboard",
      icon: LayoutDashboard,
      label: "Triage Board",
      badge: 3,
      priority: "critical",
    },
    {
      href: "/dashboard/patients",
      icon: Users,
      label: "All Patients",
    },
    {
      href: "/dashboard/analytics",
      icon: BarChart3,
      label: "Analytics",
    },
  ];

  const quickActions: NavItem[] = [
    {
      href: "/dashboard/messages",
      icon: MessageSquare,
      label: "Messages",
      badge: 5,
    },
    {
      href: "/dashboard/protocols",
      icon: FileText,
      label: "Protocols",
    },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <aside
      className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 h-screen"
      role="navigation"
      aria-label="Clinical navigation sidebar"
    >
      {/* ========== HEADER: Brand ========== */}
      <div className="h-16 flex items-center px-5 border-b border-slate-200 shrink-0">
        <Link
          href="/"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          aria-label="MamaGuard Home"
        >
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm">
            <Heart className="h-5 w-5 text-white" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-slate-900">
              MamaGuard
            </span>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">
              Clinical Portal
            </span>
          </div>
        </Link>
      </div>

      {/* ========== SHIFT INFO ========== */}
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <Clock className="h-4 w-4" aria-hidden="true" />
            <span className="font-medium">Active Session</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-900 font-mono font-semibold">
              {currentTime}
            </span>
            <Badge
              variant="outline"
              className="text-[9px] border-emerald-600/40 text-emerald-700 bg-emerald-50 font-semibold"
            >
              {shiftDuration}
            </Badge>
          </div>
        </div>
      </div>

      {/* ========== PRIMARY NAVIGATION ========== */}
      <nav
        className="flex-1 overflow-y-auto px-3 py-4 space-y-1"
        aria-label="Primary navigation"
      >
        <div className="space-y-0.5">
          {primaryNav.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                  active
                    ? "bg-primary text-white shadow-sm"
                    : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 ${
                    active
                      ? "text-white"
                      : "text-slate-500 group-hover:text-slate-700"
                  }`}
                  aria-hidden="true"
                />
                <span className="text-sm flex-1">{item.label}</span>

                {/* Priority Badge */}
                {item.badge && (
                  <Badge
                    variant={
                      item.priority === "critical" ? "destructive" : "secondary"
                    }
                    className={`h-5 min-w-5 px-1.5 text-[10px] font-bold ${
                      item.priority === "critical"
                        ? "bg-red-600 text-white shadow-sm"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>

        <Separator className="my-4 bg-slate-200" />

        {/* Quick Actions */}
        <div className="space-y-0.5">
          <div className="px-3 py-2 text-xs uppercase tracking-wider text-slate-500 font-semibold">
            Quick Access
          </div>
          {quickActions.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-slate-100 text-slate-900 font-medium"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <Badge
                    variant="secondary"
                    className="h-5 min-w-5 px-1.5 text-[10px] bg-slate-200 text-slate-700 font-semibold"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>

        <Separator className="my-4 bg-slate-200" />

        {/* Emergency Protocols */}
        <div className="px-3 py-3 rounded-lg bg-red-50 border border-red-200">
          <div className="flex items-center gap-2 mb-2 px-2">
            <Shield className="h-4 w-4 text-red-600" aria-hidden="true" />
            <span className="text-sm font-semibold text-red-900">
              Emergency Resources
            </span>
          </div>
          <Link
            href="/dashboard/emergency"
            className="flex items-center gap-2 px-2 py-2 text-sm text-red-700 hover:text-red-900 hover:bg-red-100 rounded transition-colors"
          >
            <Phone className="h-4 w-4" />
            Emergency Contacts
          </Link>
          <Link
            href="/dashboard/protocols"
            className="flex items-center gap-2 px-2 py-2 text-sm text-red-700 hover:text-red-900 hover:bg-red-100 rounded transition-colors"
          >
            <FileText className="h-4 w-4" />
            Clinical Protocols
          </Link>
        </div>
      </nav>

      {/* ========== DOCTOR PROFILE ========== */}
      <div className="border-t border-slate-200 bg-slate-50">
        <div className="p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-100 transition-colors group focus:outline-none focus:ring-2 focus:ring-primary/50"
                aria-label="User menu"
              >
                <div className="relative">
                  <Avatar className="h-11 w-11 ring-2 ring-slate-200">
                    <AvatarImage src={doctor.avatarUrl} alt={doctor.name} />
                    <AvatarFallback className="bg-primary text-white font-bold text-sm">
                      {doctor.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  {/* Online status indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white">
                    <Circle className="h-2 w-2 text-white fill-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold text-slate-900 truncate leading-tight">
                    {doctor.name}
                  </p>
                  <p className="text-[11px] text-slate-600 truncate">
                    {doctor.role}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Circle
                      className="h-2 w-2 text-emerald-500 fill-emerald-500"
                      aria-hidden="true"
                    />
                    <span className="text-[10px] text-emerald-700 font-medium">
                      On Duty
                    </span>
                  </div>
                </div>

                <Settings
                  className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-slate-600 transition-colors"
                  aria-hidden="true"
                />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="pb-3">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {doctor.name}
                    </p>
                    <Badge
                      variant="outline"
                      className="text-[9px] border-emerald-600/40 text-emerald-700 bg-emerald-50 font-semibold"
                    >
                      Active
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600">{doctor.role}</p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <Badge
                      variant="secondary"
                      className="text-[9px] bg-slate-100 text-slate-700 font-medium"
                    >
                      ID: {doctor.id}
                    </Badge>
                    <span>•</span>
                    <span>Session: {shiftDuration}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Profile & Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/schedule" className="cursor-pointer">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>My Schedule</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/dashboard/notifications"
                  className="cursor-pointer"
                >
                  <Bell className="mr-2 h-4 w-4" />
                  <span>Notifications</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-700 cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>End Session</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside>
  );
}
