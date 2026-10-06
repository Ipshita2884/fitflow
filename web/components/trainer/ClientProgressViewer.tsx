"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { 
  TrendingUp, Scale, Activity, Target, Download, Calendar, 
  ArrowLeft, Flame, Award, CheckCircle2, ChevronRight 
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  Tooltip, CartesianGrid, BarChart, Bar 
} from "recharts";

export function ClientProgressViewer({ 
  clientId, 
  client, 
  progress 
}: { 
  clientId: string; 
  client: any; 
  progress: any; 
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedMeasurement, setSelectedMeasurement] = useState<"waist" | "chest" | "hip">("waist");
  const [isExporting, setIsExporting] = useState(false);

  const overview = progress.overview || {};
  const weightPoints = progress.weight?.points || [];
  const bmiPoints = progress.bmi?.points || [];
  const bodyFatPoints = progress.bodyFat?.points || [];
  const measurementPoints = progress.measurements?.[selectedMeasurement] || [];
  const goals = progress.goals || [];

  const updateFilters = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null) params.delete(key);
      else params.set(key, value);
    });
    router.push(`?${params.toString()}`);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Simulate client-side CSV export download
      const csvRows = [
        ["Date", "Weight (kg)", "BMI"],
        ...weightPoints.map((p: any) => [p.date, p.value || "", ""])
      ];
      const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `progress-${client.fullName.replace(/\s+/g, "_")}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert("Failed to export progress report.");
    } finally {
      setIsExporting(false);
    }
  };

  const currentRange = searchParams.get("range") || "90d";
  const currentGroup = searchParams.get("groupBy") || "month";

  return (
    <div className="space-y-8">
      {/* Top Navigation & Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-ink-950/80 border border-slate-800 p-6 rounded-2xl">
        <div className="space-y-1">
          <Link 
            href={`/clients/${clientId}`}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-surface transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to {client.fullName}'s Profile
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-surface tracking-tight">Progress & Analytics</h1>
          <p className="text-xs text-slate-400">Historical performance trends, weight, BMI, and workout compliance.</p>
        </div>

        {/* Filter Controls & Export */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={currentGroup}
            onChange={(e) => updateFilters({ groupBy: e.target.value })}
            className="bg-ink-900 border border-slate-700/60 rounded-lg px-3 py-2 text-xs text-surface focus:outline-none focus:border-accent appearance-none min-w-[110px]"
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 bg-accent text-ink-950 font-bold px-4 py-2 rounded-lg text-xs hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 disabled:opacity-50 ml-auto md:ml-0"
          >
            <Download className="w-4 h-4" /> {isExporting ? "Exporting..." : "Export Report"}
          </button>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card glass className="p-6 border-slate-800">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Weight Trend</span>
            <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-surface">{overview.currentWeightKg || '-'} <span className="text-xs font-normal text-slate-500">kg</span></p>
          <p className={`text-xs font-semibold mt-2 ${overview.weightChange <= 0 ? 'text-positive' : 'text-warning'}`}>
            {overview.weightChange > 0 ? '+' : ''}{overview.weightChange || 0} kg overall change
          </p>
        </Card>

        <Card glass className="p-6 border-slate-800">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Current BMI</span>
            <div className="w-8 h-8 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-surface">{overview.currentBmi || '-'}</p>
          <p className="text-xs text-slate-500 mt-2 font-medium">Height: {client.heightCm ? `${client.heightCm} cm` : 'N/A'}</p>
        </Card>

        <Card glass className="p-6 border-slate-800">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Attendance Rate</span>
            <div className="w-8 h-8 rounded-lg bg-positive/10 text-positive flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-surface">{overview.attendanceRate || 100}%</p>
          <p className="text-xs text-positive mt-2 font-medium">Session Consistency</p>
        </Card>

        <Card glass className="p-6 border-slate-800">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Workout Compliance</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-surface">{overview.workoutComplianceRate || 100}%</p>
          <p className="text-xs text-slate-500 mt-2 font-medium">Routine Adherence</p>
        </Card>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weight Progress Line Chart */}
        <Card glass className="p-6 border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-surface flex items-center gap-2 border-b border-slate-800 pb-3">
            <Scale className="w-4 h-4 text-accent" /> Weight History (kg)
          </h3>
          {weightPoints.length === 0 ? (
            <div className="h-[250px] flex items-center justify-center text-slate-500 text-xs">
              No weight measurements logged in this period.
            </div>
          ) : (
            <div className="h-[260px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightPoints}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} domain={['dataMin - 2', 'dataMax + 2']} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#090d16", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }} 
                    itemStyle={{ color: "#f8fafc" }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4, fill: "#38bdf8" }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* BMI History Chart */}
        <Card glass className="p-6 border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-surface flex items-center gap-2 border-b border-slate-800 pb-3">
            <Target className="w-4 h-4 text-warning" /> BMI Progression
          </h3>
          {bmiPoints.length === 0 ? (
            <div className="h-[250px] flex items-center justify-center text-slate-500 text-xs">
              No BMI progression data available for this range.
            </div>
          ) : (
            <div className="h-[260px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bmiPoints}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#090d16", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }} 
                    itemStyle={{ color: "#f8fafc" }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: "#f59e0b" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Body Measurements & Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Body Measurements Chart */}
        <Card glass className="lg:col-span-2 p-6 border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-surface flex items-center gap-2">
              <Activity className="w-4 h-4 text-positive" /> Body Measurements Trend
            </h3>
            <div className="flex gap-2">
              {(["waist", "chest", "hip"] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setSelectedMeasurement(m)}
                  className={`px-3 py-1 rounded text-xs font-bold capitalize transition-all ${selectedMeasurement === m ? "bg-accent text-ink-950" : "bg-ink-900 text-slate-400 border border-slate-800"}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {measurementPoints.length === 0 ? (
            <div className="h-[220px] flex items-center justify-center text-slate-500 text-xs">
              No recorded {selectedMeasurement} measurements for this period.
            </div>
          ) : (
            <div className="h-[240px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={measurementPoints}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#090d16", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }} 
                    itemStyle={{ color: "#f8fafc" }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: "#10b981" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Active Goals Progress Cards */}
        <Card glass className="p-6 border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-surface flex items-center gap-2 border-b border-slate-800 pb-3">
            <Award className="w-4 h-4 text-purple-400" /> Goal Completion Progress
          </h3>

          {goals.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-xs">
              No active goals logged.
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((g: any) => (
                <div key={g.id} className="p-3 bg-ink-900 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-surface">{g.title}</span>
                    <span className="font-bold text-accent">{g.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-ink-950 rounded-full overflow-hidden border border-slate-800">
                    <div className="h-full bg-accent transition-all duration-1000" style={{ width: `${g.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
