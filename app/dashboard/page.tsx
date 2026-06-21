"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { usePatientData } from "@/app/dashboard/patients/hooks";
import type { Patient } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Search,
  RefreshCw,
  Plus,
  Users,
  AlertCircle,
  AlertTriangle,
  Clock,
  Activity,
  TrendingUp,
  ArrowUpRight,
  Phone,
  MessageSquare,
  FileText,
  ChevronRight,
  BarChart3,
  Heart,
  Thermometer,
  Zap,
} from "lucide-react";

/** Shape the triage board cards expect (derived from a real Supabase patient). */
interface TriageCard {
  id: string;
  name: string;
  gestational_week: number;
  risk_level: "critical" | "warning";
  avatarUrl: string;
  alert: { category: string; message: string };
  metrics: { label: string; value: string }[];
  lastUpdate: string;
}

function toTriageCard(p: Patient): TriageCard {
  const isCritical = p.risk_level === "critical";
  return {
    id: p.id,
    name: p.full_name || p.name || "—",
    gestational_week: p.gestational_week,
    risk_level: isCritical ? "critical" : "warning",
    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(p.id)}`,
    alert: {
      category: isCritical ? "Critical risk detected" : "Needs monitoring",
      message:
        p.medical_history?.notes ||
        "Review the latest check-in for this patient.",
    },
    metrics: [
      { label: "Week", value: `${p.gestational_week}` },
      { label: "Trimester", value: `${p.trimester ?? "—"}` },
    ],
    lastUpdate: "recent",
  };
}

type FilterType = "all" | "critical" | "warning";

interface DashboardState {
  searchQuery: string;
  filterType: FilterType;
}

export default function DashboardPage() {
  const router = useRouter();

  const [state, setState] = useState<DashboardState>({
    searchQuery: "",
    filterType: "all",
  });

  const [currentTime, setCurrentTime] = useState(new Date());

  // Real patient data from Supabase (with realtime updates), mapped to the
  // triage board card shape and split into critical / warning lists.
  const { patients: realPatients, loading, refreshing, refresh } =
    usePatientData();

  const criticalPatients = useMemo(
    () =>
      realPatients
        .filter((p) => p.risk_level === "critical")
        .map(toTriageCard),
    [realPatients],
  );

  const warningPatients = useMemo(
    () =>
      realPatients.filter((p) => p.risk_level === "high").map(toTriageCard),
    [realPatients],
  );

  const allPatients = useMemo(
    () => [...criticalPatients, ...warningPatients],
    [criticalPatients, warningPatients],
  );

  const filteredPatients = useMemo(() => {
    let patients = allPatients;

    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      patients = patients.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.id.toLowerCase().includes(query),
      );
    }

    if (state.filterType !== "all") {
      patients = patients.filter((p) => p.risk_level === state.filterType);
    }

    return patients;
  }, [allPatients, state.searchQuery, state.filterType]);

  const handleRefresh = () => {
    refresh();
  };

  const getPatientInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getUrgencyColor = (lastUpdate: string) => {
    const minutes = parseInt(lastUpdate);
    if (lastUpdate.includes("m") && minutes <= 5) return "text-red-600";
    if (lastUpdate.includes("m") && minutes <= 30) return "text-amber-600";
    return "text-slate-500";
  };

  const handleQuickAction = (
    e: React.MouseEvent,
    action: string,
    patientId: string,
  ) => {
    e.stopPropagation();
    console.log(`${action} patient:`, patientId);
    // TODO: Implement actual action handlers
  };

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/50 to-white">
      <div className="container mx-auto px-6 py-6 max-w-[1600px]">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-slate-900">
                Triage Dashboard
              </h1>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100 rounded-full">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-green-700">Live</span>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              {formattedTime} • {filteredPatients.length} active patients •{" "}
              {
                criticalPatients.filter((p) => filteredPatients.includes(p))
                  .length
              }{" "}
              critical
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="default"
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              size="default"
              onClick={() => router.push("/dashboard/patients/new")}
              className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Add Patient
            </Button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-slate-200 bg-white shadow-sm hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Total Patients
                </CardTitle>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-bold text-slate-900">
                    {allPatients.length}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-green-600 font-medium">+12%</span>
                    <span>vs last month</span>
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-slate-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-red-200/60 bg-gradient-to-br from-white to-red-50/40 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Critical Cases
                </CardTitle>
                <div className="p-2 bg-red-100 rounded-lg ring-2 ring-red-200/50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-bold text-red-600">
                    {criticalPatients.length}
                  </div>
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    <span className="font-medium">Immediate action</span>
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-red-600">
                    {
                      criticalPatients.filter((p) =>
                        p.lastUpdate.includes("m"),
                      ).length
                    }
                  </div>
                  <div className="text-xs text-red-600/70">recent</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200/60 bg-gradient-to-br from-white to-amber-50/40 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Warning Cases
                </CardTitle>
                <div className="p-2 bg-amber-100 rounded-lg ring-2 ring-amber-200/50">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-bold text-amber-600">
                    {warningPatients.length}
                  </div>
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span className="font-medium">Monitor closely</span>
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-amber-600">
                    24h
                  </div>
                  <div className="text-xs text-amber-600/70">avg response</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200/60 bg-gradient-to-br from-white to-green-50/40 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Response Rate
                </CardTitle>
                <div className="p-2 bg-green-100 rounded-lg ring-2 ring-green-200/50">
                  <Activity className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl font-bold text-green-600">98%</div>
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" />
                    <span className="font-medium">+5%</span>
                    <span className="text-slate-500">this week</span>
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-green-600">
                    8min
                  </div>
                  <div className="text-xs text-green-600/70">avg time</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Search */}
        <Card className="mb-6 border-slate-200 shadow-sm bg-white">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="relative flex-1 max-w-lg w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search patients by name, ID, or condition..."
                  value={state.searchQuery}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      searchQuery: e.target.value,
                    }))
                  }
                  className="pl-10 h-11 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <Tabs
                value={state.filterType}
                onValueChange={(value) =>
                  setState((prev) => ({
                    ...prev,
                    filterType: value as FilterType,
                  }))
                }
                className="w-full lg:w-auto"
              >
                <TabsList className="grid w-full lg:w-auto grid-cols-3 h-11">
                  <TabsTrigger
                    value="all"
                    className="gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                  >
                    <Users className="h-3.5 w-3.5" />
                    All ({allPatients.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="critical"
                    className="gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white"
                  >
                    <AlertCircle className="h-3.5 w-3.5" />
                    Critical ({criticalPatients.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="warning"
                    className="gap-2 data-[state=active]:bg-amber-600 data-[state=active]:text-white"
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Warning ({warningPatients.length})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Patient Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border-slate-200 shadow-sm bg-white">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className="h-14 w-14 rounded-full bg-slate-200 animate-pulse" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-4 w-2/3 rounded bg-slate-200 animate-pulse" />
                      <div className="h-3 w-1/2 rounded bg-slate-100 animate-pulse" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="h-16 rounded-lg bg-slate-100 animate-pulse" />
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-10 rounded-lg bg-slate-100 animate-pulse" />
                    <div className="h-10 rounded-lg bg-slate-100 animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPatients.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredPatients.map((patient) => (
              <Card
                key={patient.id}
                className={`group relative overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer ${
                  patient.risk_level === "critical"
                    ? "border-red-300 hover:border-red-400 bg-gradient-to-br from-white to-red-50/20"
                    : "border-amber-200 hover:border-amber-300 bg-gradient-to-br from-white to-amber-50/20"
                }`}
                onClick={() => router.push(`/dashboard/patients/${patient.id}`)}
              >
                {/* Priority Stripe */}
                <div
                  className={`absolute top-0 left-0 w-1 h-full ${
                    patient.risk_level === "critical"
                      ? "bg-red-600"
                      : "bg-amber-500"
                  }`}
                />

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="relative flex-shrink-0">
                        <Avatar
                          className={`h-14 w-14 ring-2 ring-offset-2 ring-offset-white shadow-md transition-all group-hover:ring-4 group-hover:shadow-lg ${
                            patient.risk_level === "critical"
                              ? "ring-red-400 group-hover:ring-red-500"
                              : "ring-amber-400 group-hover:ring-amber-500"
                          }`}
                        >
                          <AvatarImage
                            src={patient.avatarUrl}
                            alt={patient.name}
                            className="object-cover"
                            loading="lazy"
                          />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold text-base">
                            {getPatientInitials(patient.name)}
                          </AvatarFallback>
                        </Avatar>
                        {patient.risk_level === "critical" && (
                          <div className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center animate-pulse shadow-lg ring-2 ring-white">
                            <Zap className="h-3 w-3 text-white" />
                          </div>
                        )}
                        {patient.risk_level === "warning" && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center shadow-md ring-2 ring-white">
                            <AlertTriangle className="h-2.5 w-2.5 text-white" />
                          </div>
                        )}
                        {/* Online Status Indicator */}
                        <div className="absolute -bottom-0.5 -left-0.5 w-3.5 h-3.5 bg-green-500 rounded-full ring-2 ring-white shadow-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-semibold text-slate-900 mb-1 truncate">
                          {patient.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardDescription className="text-xs">
                            {patient.id}
                          </CardDescription>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-600 flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            Week {patient.gestational_week}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={
                        patient.risk_level === "critical"
                          ? "destructive"
                          : "default"
                      }
                      className={`flex-shrink-0 ${
                        patient.risk_level === "warning"
                          ? "bg-amber-500 text-white hover:bg-amber-600 border-0"
                          : "border-0"
                      } shadow-sm font-semibold text-[10px] uppercase tracking-wide`}
                    >
                      {patient.risk_level === "critical" ? (
                        <AlertCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <AlertTriangle className="h-3 w-3 mr-1" />
                      )}
                      {patient.risk_level === "critical"
                        ? "critical"
                        : "warning"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Alert Box */}
                  <div
                    className={`rounded-lg p-3 ${
                      patient.risk_level === "critical"
                        ? "bg-red-50 border border-red-200"
                        : "bg-amber-50 border border-amber-200"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 mt-0.5">
                        {patient.risk_level === "critical" ? (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-xs font-semibold mb-1 ${
                            patient.risk_level === "critical"
                              ? "text-red-700"
                              : "text-amber-700"
                          }`}
                        >
                          {patient.alert.category}
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {patient.alert.message}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  {patient.metrics && patient.metrics.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {patient.metrics.map((metric, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-xs bg-white border border-slate-200 rounded-lg p-2"
                        >
                          <div className="flex-shrink-0">
                            {metric.label.includes("Heart") ? (
                              <Heart className="h-3.5 w-3.5 text-red-500" />
                            ) : metric.label.includes("Pain") ? (
                              <Thermometer className="h-3.5 w-3.5 text-amber-500" />
                            ) : (
                              <Activity className="h-3.5 w-3.5 text-blue-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] text-slate-500 uppercase tracking-wide">
                              {metric.label}
                            </div>
                            <div className="font-semibold text-slate-900 truncate">
                              {metric.value}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                    <div className="flex items-center gap-1.5">
                      <Clock
                        className={`h-3.5 w-3.5 ${getUrgencyColor(patient.lastUpdate)}`}
                      />
                      <span
                        className={`text-xs font-medium ${getUrgencyColor(patient.lastUpdate)}`}
                      >
                        {patient.lastUpdate}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                        onClick={(e) =>
                          handleQuickAction(e, "call", patient.id)
                        }
                        title="Call patient"
                      >
                        <Phone className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                        onClick={(e) =>
                          handleQuickAction(e, "message", patient.id)
                        }
                        title="Send message"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/patients/${patient.id}`);
                        }}
                        title="View chart"
                      >
                        <FileText className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs font-medium hover:bg-blue-50 hover:text-blue-600 gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboard/patients/${patient.id}`);
                        }}
                      >
                        View
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardContent className="py-20">
              <div className="flex flex-col items-center justify-center text-center">
                <div className="relative mb-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 flex items-center justify-center shadow-inner">
                    <Search className="h-10 w-10 text-slate-400" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shadow-md ring-4 ring-white">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  No patients found
                </h3>
                <p className="text-sm text-slate-600 mb-6 max-w-md leading-relaxed">
                  We couldn&apos;t find any patients matching your criteria. Try
                  adjusting your search or filter settings.
                </p>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setState({
                        searchQuery: "",
                        filterType: "all",
                      })
                    }
                    className="gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Clear filters
                  </Button>
                  <Button
                    onClick={() => router.push("/dashboard/patients/new")}
                    className="gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    Add new patient
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
