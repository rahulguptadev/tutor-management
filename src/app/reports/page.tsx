"use client"

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";

const TABS = [
  { label: "Students", value: "students" },
  { label: "Teachers", value: "teachers" },
  { label: "Classes", value: "classes" },
  { label: "Attendance", value: "attendance" },
];

const STATUS_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const DATE_OPTIONS = [
  { label: "All Time", value: "all" },
  { label: "Last 7 Days", value: "7d" },
  { label: "1 Month", value: "1m" },
  { label: "3 Months", value: "3m" },
];

function toCSV(rows: any[], headers: string[]) {
  const csvRows = [headers.join(",")];
  for (const row of rows) {
    csvRows.push(headers.map((h: string) => JSON.stringify(row[h] ?? "")).join(","));
  }
  return csvRows.join("\n");
}

export default function ReportsPage() {
  const [tab, setTab] = useState("students");
  const [status, setStatus] = useState("all");
  const [dateRange, setDateRange] = useState("all");
  const [search, setSearch] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch(`/api/reports/${tab}?status=${status}&dateRange=${dateRange}&search=${encodeURIComponent(search)}`)
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(setData)
      .catch(() => setError("Failed to load data"))
      .finally(() => setLoading(false));
  }, [tab, status, dateRange, search]);

  const handleExport = () => {
    let headers: string[] = [];
    let rows: any[] = [];
    if (tab === "students") {
      headers = ["name", "email", "grade"];
      rows = data.map((s: any) => ({
        name: s.user?.name,
        email: s.user?.email,
        grade: s.grade ? `${s.grade.name} (${s.grade.curriculum})` : '-',
      }));
    } else if (tab === "teachers") {
      headers = ["name", "email", "phone", "subjects"];
      rows = data.map((t: any) => ({
        name: t.user?.name,
        email: t.user?.email,
        phone: t.phoneNumber || '-',
        subjects: (t.subjects ?? []).map((ts: any) => ts.subject?.name).join("; ") ?? "",
      }));
    } else if (tab === "classes") {
      headers = ["class", "teacher", "student", "status"];
      rows = data.map((c: any) => ({
        class: c.subject?.name,
        teacher: c.teacher?.user?.name,
        student: c.student?.user?.name,
        status: c.status,
      }));
    } else if (tab === "attendance") {
      headers = ["date", "student", "teacher", "status"];
      rows = data.map((a: any) => ({
        date: a.startTime?.slice(0, 10),
        student: a.student?.user?.name,
        teacher: a.teacher?.user?.name,
        status: a.status === "COMPLETED" ? "Present" : "Absent",
      }));
    }
    const csv = toCSV(rows, headers);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tab}-report.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderFilters = () => (
    <div className="flex flex-wrap gap-4 items-end mb-6">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
        <select
          className="border rounded px-2 py-1"
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Date Range</label>
        <select
          className="border rounded px-2 py-1"
          value={dateRange}
          onChange={e => setDateRange(e.target.value)}
        >
          {DATE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
        <input
          type="text"
          className="border rounded px-2 py-1"
          placeholder="Search by name, email, etc."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <button
        className="ml-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        onClick={e => { e.preventDefault(); handleExport(); }}
        disabled={loading || data.length === 0}
      >
        Export
      </button>
    </div>
  );

  const renderTable = () => {
    if (loading) return <div className="py-8 text-center text-gray-500">Loading...</div>;
    if (error) return <div className="py-8 text-center text-red-500">{error}</div>;
    if (!data.length) return <div className="py-8 text-center text-gray-400">No data found.</div>;
    if (tab === "students") {
      return (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2 text-left w-16">S.No</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Grade</th>
              </tr>
            </thead>
            <tbody>
              {data.map((s: any, idx: number) => (
                <tr key={s.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-2 font-mono text-xs text-gray-500">{idx + 1}</td>
                  <td className="px-4 py-2">{s.user?.name}</td>
                  <td className="px-4 py-2">{s.user?.email}</td>
                  <td className="px-4 py-2">{s.grade ? `${s.grade.name} (${s.grade.curriculum})` : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else if (tab === "teachers") {
      return (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2 text-left w-16">S.No</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Phone</th>
                <th className="px-4 py-2 text-left">Subjects</th>
              </tr>
            </thead>
            <tbody>
              {data.map((t: any, idx: number) => (
                <tr key={t.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-2 font-mono text-xs text-gray-500">{idx + 1}</td>
                  <td className="px-4 py-2">{t.user?.name}</td>
                  <td className="px-4 py-2">{t.user?.email}</td>
                  <td className="px-4 py-2">{t.phoneNumber || '-'}</td>
                  <td className="px-4 py-2">{(t.subjects ?? []).map((ts: any) => ts.subject?.name).join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else if (tab === "classes") {
      return (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2 text-left w-16">S.No</th>
                <th className="px-4 py-2 text-left">Class</th>
                <th className="px-4 py-2 text-left">Teacher</th>
                <th className="px-4 py-2 text-left">Student</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((c: any, idx: number) => (
                <tr key={c.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-2 font-mono text-xs text-gray-500">{idx + 1}</td>
                  <td className="px-4 py-2">{c.subject?.name}</td>
                  <td className="px-4 py-2">{c.teacher?.user?.name}</td>
                  <td className="px-4 py-2">{c.student?.user?.name}</td>
                  <td className="px-4 py-2">{c.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else if (tab === "attendance") {
      return (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2 text-left w-16">S.No</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Student</th>
                <th className="px-4 py-2 text-left">Teacher</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((a: any, idx: number) => (
                <tr key={a.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-2 font-mono text-xs text-gray-500">{idx + 1}</td>
                  <td className="px-4 py-2">{a.startTime?.slice(0, 10)}</td>
                  <td className="px-4 py-2">{a.student?.user?.name}</td>
                  <td className="px-4 py-2">{a.teacher?.user?.name}</td>
                  <td className="px-4 py-2">{a.status === "COMPLETED" ? "Present" : "Absent"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    return null;
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto w-full">
        <h1 className="text-2xl font-bold mb-6">Reports</h1>
        <div className="flex space-x-4 mb-6">
          {TABS.map((t) => (
            <button
              key={t.value}
              className={`px-4 py-2 rounded-t font-medium border-b-2 transition-colors ${
                tab === t.value
                  ? "border-blue-600 text-blue-700 bg-white"
                  : "border-transparent text-gray-500 bg-gray-100 hover:text-blue-700"
              }`}
              onClick={() => setTab(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>
        {renderFilters()}
        {renderTable()}
      </div>
    </DashboardLayout>
  );
} 