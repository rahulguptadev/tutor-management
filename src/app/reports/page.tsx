"use client"

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";

const TABS = [
  { label: "Students", value: "students" },
  { label: "Teachers", value: "teachers" },
  { label: "Classes", value: "classes" },
  { label: "Attendance", value: "attendance" },
];

const DATE_OPTIONS = [
  { label: "All Time", value: "all" },
  { label: "Last 7 Days", value: "7d" },
  { label: "1 Month", value: "1m" },
  { label: "3 Months", value: "3m" },
];

// Available fields for students
const STUDENT_FIELDS = [
  { key: 'name', label: 'Name', default: true },
  { key: 'email', label: 'Email', default: false },
  { key: 'grade', label: 'Grade', default: true },
  { key: 'subjects', label: 'Subjects', default: true },
  { key: 'phoneNumber', label: 'Phone Number', default: true },
  { key: 'school', label: 'School', default: true },
  { key: 'fatherName', label: 'Father Name', default: false },
  { key: 'fatherContact', label: 'Father Contact', default: false },
  { key: 'motherName', label: 'Mother Name', default: false },
  { key: 'motherContact', label: 'Mother Contact', default: false },
  { key: 'status', label: 'Status', default: true },
];

// Available fields for teachers
const TEACHER_FIELDS = [
  { key: 'name', label: 'Name', default: true },
  { key: 'email', label: 'Email', default: true },
  { key: 'phoneNumber', label: 'Phone Number', default: true },
  { key: 'subjects', label: 'Subjects', default: true },
  { key: 'education', label: 'Education', default: true },
  { key: 'qualification', label: 'Qualification', default: true },
  { key: 'bio', label: 'Bio', default: true },
  { key: 'status', label: 'Status', default: true },
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
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Field selection state
  const [selectedFields, setSelectedFields] = useState<{[key: string]: boolean}>({});
  const [showFieldSelector, setShowFieldSelector] = useState(false);

  // Initialize selected fields based on tab
  useEffect(() => {
    const fields = tab === "students" ? STUDENT_FIELDS : TEACHER_FIELDS;
    const initialFields: {[key: string]: boolean} = {};
    fields.forEach(field => {
      initialFields[field.key] = field.default;
    });
    setSelectedFields(initialFields);
  }, [tab]);

  // Fetch grades and subjects for filters
  useEffect(() => {
    if (tab === "students" || tab === "teachers") {
      Promise.all([
        fetch('/api/grades').then(res => res.ok ? res.json() : []),
        fetch('/api/subjects').then(res => res.ok ? res.json() : [])
      ]).then(([gradesData, subjectsData]) => {
        setGrades(gradesData);
        setSubjects(subjectsData);
      }).catch(() => {
        setGrades([]);
        setSubjects([]);
      });
    }
  }, [tab]);

  useEffect(() => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({
      status,
      dateRange,
      search: search,
      ...(grade && { grade }),
      ...(subject && { subject }),
    });
    
    fetch(`/api/reports/${tab}?${params}`)
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then(setData)
      .catch(() => setError("Failed to load data"))
      .finally(() => setLoading(false));
  }, [tab, status, dateRange, search, grade, subject]);

  const handleFieldToggle = (fieldKey: string) => {
    setSelectedFields(prev => ({
      ...prev,
      [fieldKey]: !prev[fieldKey]
    }));
  };

  const handleExport = () => {
    const fields = tab === "students" ? STUDENT_FIELDS : TEACHER_FIELDS;
    const activeFields = fields.filter(field => selectedFields[field.key]);
    
    let headers: string[] = [];
    let rows: any[] = [];
    
    if (tab === "students") {
      headers = activeFields.map(field => field.label);
      rows = data.map((s: any) => {
        const row: any = {};
        activeFields.forEach(field => {
          switch (field.key) {
            case 'name':
              row[field.label] = s.user?.name;
              break;
            case 'email':
              row[field.label] = s.user?.email;
              break;
            case 'grade':
              row[field.label] = s.grade ? `${s.grade.name} (${s.grade.curriculum})` : '-';
              break;
            case 'subjects':
              row[field.label] = s.enrolledSubjects?.map((es: any) => es.subject?.name).join("; ") || '-';
              break;
            case 'phoneNumber':
              row[field.label] = s.mobileNumber || '-';
              break;
            case 'school':
              row[field.label] = s.school || '-';
              break;
            case 'fatherName':
              row[field.label] = s.fatherName || '-';
              break;
            case 'fatherContact':
              row[field.label] = s.fatherContact || '-';
              break;
            case 'motherName':
              row[field.label] = s.motherName || '-';
              break;
            case 'motherContact':
              row[field.label] = s.motherContact || '-';
              break;
            case 'status':
              row[field.label] = s.isActive ? 'Enrolled' : 'Not Enrolled';
              break;
          }
        });
        return row;
      });
    } else if (tab === "teachers") {
      headers = activeFields.map(field => field.label);
      rows = data.map((t: any) => {
        const row: any = {};
        activeFields.forEach(field => {
          switch (field.key) {
            case 'name':
              row[field.label] = t.user?.name;
              break;
            case 'email':
              row[field.label] = t.user?.email;
              break;
            case 'phoneNumber':
              row[field.label] = t.phoneNumber || '-';
              break;
            case 'subjects':
              row[field.label] = (t.subjects ?? []).map((ts: any) => ts.subject?.name).join("; ") ?? "";
              break;
            case 'education':
              row[field.label] = t.education || '-';
              break;
            case 'qualification':
              row[field.label] = t.qualification || '-';
              break;
            case 'bio':
              row[field.label] = t.bio || '-';
              break;
            case 'status':
              row[field.label] = t.isActive ? 'Active' : 'Inactive';
              break;
          }
        });
        return row;
      });
    } else if (tab === "classes") {
      headers = ["class", "teacher", "students", "status"];
      rows = data.map((c: any) => ({
        class: c.subject?.name,
        teacher: c.teacher?.user?.name,
        students: c.students?.map((cs: any) => cs.student?.user?.name).join("; ") || '-',
        status: c.status,
      }));
    } else if (tab === "attendance") {
      headers = ["date", "students", "teacher", "status"];
      rows = data.map((a: any) => ({
        date: a.startTime?.slice(0, 10),
        students: a.students?.map((cs: any) => cs.student?.user?.name).join("; ") || '-',
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

  const renderFieldSelector = () => {
    if (tab !== "students" && tab !== "teachers") return null;
    
    const fields = tab === "students" ? STUDENT_FIELDS : TEACHER_FIELDS;
    
    return (
      <div className="mb-4">
        <button
          onClick={() => setShowFieldSelector(!showFieldSelector)}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          {showFieldSelector ? 'Hide' : 'Show'} Field Selector
        </button>
        
        {showFieldSelector && (
          <div className="mt-2 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Select Fields to Display:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {fields.map(field => (
                <label key={field.key} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedFields[field.key] || false}
                    onChange={() => handleFieldToggle(field.key)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{field.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    );
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
          <option value="all">All</option>
          <option value="active">{tab === "students" ? "Enrolled" : "Active"}</option>
          <option value="inactive">{tab === "students" ? "Not Enrolled" : "Inactive"}</option>
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
      {tab === "students" && (
        <>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Grade</label>
            <select
              className="border rounded px-2 py-1"
              value={grade}
              onChange={e => setGrade(e.target.value)}
            >
              <option value="">All Grades</option>
              {grades.map((g: any) => (
                <option key={g.id} value={g.id}>{g.name} ({g.curriculum})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Subject</label>
            <select
              className="border rounded px-2 py-1"
              value={subject}
              onChange={e => setSubject(e.target.value)}
            >
              <option value="">All Subjects</option>
              {subjects.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </>
      )}
      {tab === "teachers" && (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Subject</label>
          <select
            className="border rounded px-2 py-1"
            value={subject}
            onChange={e => setSubject(e.target.value)}
          >
            <option value="">All Subjects</option>
            {subjects.map((s: any) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      )}
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
      const fields = STUDENT_FIELDS.filter(field => selectedFields[field.key]);
      
      return (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2 text-left w-16">S.No</th>
                {fields.map(field => (
                  <th key={field.key} className="px-4 py-2 text-left">{field.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((s: any, idx: number) => (
                <tr key={s.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-2 font-mono text-xs text-gray-500">{idx + 1}</td>
                  {fields.map(field => {
                    switch (field.key) {
                      case 'name':
                        return <td key={field.key} className="px-4 py-2 font-medium">{s.user?.name}</td>;
                      case 'email':
                        return <td key={field.key} className="px-4 py-2">{s.user?.email}</td>;
                      case 'grade':
                        return <td key={field.key} className="px-4 py-2">{s.grade ? `${s.grade.name} (${s.grade.curriculum})` : '-'}</td>;
                      case 'subjects':
                        return (
                          <td key={field.key} className="px-4 py-2">
                            {s.enrolledSubjects?.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {s.enrolledSubjects.map((es: any, index: number) => (
                                  <span
                                    key={es.subject?.name ?? index}
                                    className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full"
                                  >
                                    {es.subject?.name ?? 'Unknown'}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400">No subjects</span>
                            )}
                          </td>
                        );
                      case 'phoneNumber':
                        return <td key={field.key} className="px-4 py-2">{s.mobileNumber || '-'}</td>;
                      case 'school':
                        return <td key={field.key} className="px-4 py-2">{s.school || '-'}</td>;
                      case 'fatherName':
                        return <td key={field.key} className="px-4 py-2">{s.fatherName || '-'}</td>;
                      case 'fatherContact':
                        return <td key={field.key} className="px-4 py-2">{s.fatherContact || '-'}</td>;
                      case 'motherName':
                        return <td key={field.key} className="px-4 py-2">{s.motherName || '-'}</td>;
                      case 'motherContact':
                        return <td key={field.key} className="px-4 py-2">{s.motherContact || '-'}</td>;
                      case 'status':
                        return (
                          <td key={field.key} className="px-4 py-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              s.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {s.isActive ? 'Enrolled' : 'Not Enrolled'}
                            </span>
                          </td>
                        );
                      default:
                        return <td key={field.key} className="px-4 py-2">-</td>;
                    }
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else if (tab === "teachers") {
      const fields = TEACHER_FIELDS.filter(field => selectedFields[field.key]);
      
      return (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2 text-left w-16">S.No</th>
                {fields.map(field => (
                  <th key={field.key} className="px-4 py-2 text-left">{field.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((t: any, idx: number) => (
                <tr key={t.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-2 font-mono text-xs text-gray-500">{idx + 1}</td>
                  {fields.map(field => {
                    switch (field.key) {
                      case 'name':
                        return <td key={field.key} className="px-4 py-2 font-medium">{t.user?.name}</td>;
                      case 'email':
                        return <td key={field.key} className="px-4 py-2">{t.user?.email}</td>;
                      case 'phoneNumber':
                        return <td key={field.key} className="px-4 py-2">{t.phoneNumber || '-'}</td>;
                      case 'subjects':
                        return (
                          <td key={field.key} className="px-4 py-2">
                            {t.subjects?.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {t.subjects.map((ts: any, index: number) => (
                                  <span
                                    key={ts.subject?.name ?? index}
                                    className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                                  >
                                    {ts.subject?.name ?? 'Unknown'}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400">No subjects</span>
                            )}
                          </td>
                        );
                      case 'education':
                        return <td key={field.key} className="px-4 py-2 max-w-xs truncate" title={t.education || ''}>{t.education || '-'}</td>;
                      case 'qualification':
                        return <td key={field.key} className="px-4 py-2 max-w-xs truncate" title={t.qualification || ''}>{t.qualification || '-'}</td>;
                      case 'bio':
                        return <td key={field.key} className="px-4 py-2 max-w-xs truncate" title={t.bio || ''}>{t.bio || '-'}</td>;
                      case 'status':
                        return (
                          <td key={field.key} className="px-4 py-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              t.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {t.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        );
                      default:
                        return <td key={field.key} className="px-4 py-2">-</td>;
                    }
                  })}
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
                <th className="px-4 py-2 text-left">Students</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((c: any, idx: number) => (
                <tr key={c.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-2 font-mono text-xs text-gray-500">{idx + 1}</td>
                  <td className="px-4 py-2">{c.subject?.name}</td>
                  <td className="px-4 py-2">{c.teacher?.user?.name}</td>
                  <td className="px-4 py-2">{c.students?.map((cs: any) => cs.student?.user?.name).join(", ") || '-'}</td>
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
                <th className="px-4 py-2 text-left">Students</th>
                <th className="px-4 py-2 text-left">Teacher</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((a: any, idx: number) => (
                <tr key={a.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-2 font-mono text-xs text-gray-500">{idx + 1}</td>
                  <td className="px-4 py-2">{a.startTime?.slice(0, 10)}</td>
                  <td className="px-4 py-2">{a.students?.map((cs: any) => cs.student?.user?.name).join(", ") || '-'}</td>
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
        {renderFieldSelector()}
        {renderFilters()}
        {renderTable()}
      </div>
    </DashboardLayout>
  );
} 