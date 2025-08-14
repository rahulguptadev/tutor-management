"use client"

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";

const TABS = [
  { label: "Students", value: "students" },
  { label: "Teachers", value: "teachers" },
  { label: "Classes", value: "classes" },
  { label: "Attendance", value: "attendance" },
];

// Add attendance type options
const ATTENDANCE_TYPES = [
  { label: "All Attendance", value: "all" },
  { label: "Student Attendance", value: "student" },
  { label: "Teacher Attendance", value: "teacher" },
]

const DATE_OPTIONS = [
  { label: "All Time", value: "all" },
  { label: "Today", value: "today" },
  { label: "Tomorrow", value: "tomorrow" },
  { label: "Last 7 Days", value: "7d" },
  { label: "1 Month", value: "1m" },
  { label: "3 Months", value: "3m" },
  { label: "Custom Range", value: "custom" },
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

// Available fields for classes
const CLASS_FIELDS = [
  { key: 'subject', label: 'Subject', default: true },
  { key: 'teacher', label: 'Teacher', default: true },
  { key: 'students', label: 'Students', default: true },
  { key: 'startTime', label: 'Start Time', default: true },
  { key: 'endTime', label: 'End Time', default: true },
  { key: 'duration', label: 'Duration', default: true },
  { key: 'status', label: 'Status', default: true },
  { key: 'isRecurring', label: 'Recurring', default: false },
  { key: 'recurrence', label: 'Recurrence Pattern', default: false },
  { key: 'notes', label: 'Notes', default: false },
  { key: 'createdAt', label: 'Created Date', default: false },
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
  const [teacher, setTeacher] = useState("");
  const [student, setStudent] = useState("");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [attendanceType, setAttendanceType] = useState("all");
  const [data, setData] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Field selection state
  const [selectedFields, setSelectedFields] = useState<{[key: string]: boolean}>({});
  const [showFieldSelector, setShowFieldSelector] = useState(false);

  // Initialize selected fields based on tab
  useEffect(() => {
    let fields: typeof STUDENT_FIELDS | typeof TEACHER_FIELDS | typeof CLASS_FIELDS;
    if (tab === "students") {
      fields = STUDENT_FIELDS;
    } else if (tab === "teachers") {
      fields = TEACHER_FIELDS;
    } else if (tab === "classes") {
      fields = CLASS_FIELDS;
    } else {
      fields = [];
    }
    
    const initialFields: {[key: string]: boolean} = {};
    fields.forEach(field => {
      initialFields[field.key] = field.default;
    });
    setSelectedFields(initialFields);
  }, [tab]);

  // Fetch grades, subjects, teachers, and students for filters
  useEffect(() => {
    if (tab === "students" || tab === "teachers" || tab === "classes") {
      Promise.all([
        fetch('/api/grades').then(res => res.ok ? res.json() : []),
        fetch('/api/subjects').then(res => res.ok ? res.json() : []),
        fetch('/api/teachers').then(res => res.ok ? res.json() : []),
        fetch('/api/students').then(res => res.ok ? res.json() : [])
      ]).then(([gradesData, subjectsData, teachersData, studentsData]) => {
        setGrades(gradesData);
        setSubjects(subjectsData);
        setTeachers(teachersData);
        setStudents(studentsData);
      }).catch(() => {
        setGrades([]);
        setSubjects([]);
        setTeachers([]);
        setStudents([]);
      });
    }
  }, [tab]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (search) params.append("search", search)
        if (status !== "all") params.append("status", status)
        if (dateRange !== "all") params.append("dateRange", dateRange)
        if (grade) params.append("grade", grade)
        if (subject) params.append("subject", subject)
        if (teacher) params.append("teacher", teacher)
        if (student) params.append("student", student)
        if (dateRange === "custom") {
          if (customStartDate) params.append("customStartDate", customStartDate)
          if (customEndDate) params.append("customEndDate", customEndDate)
        }
        if (tab === "attendance" && attendanceType !== "all") {
          params.append("attendanceType", attendanceType)
        }

        const response = await fetch(`/api/reports/${tab}?${params}`)
        if (response.ok) {
          const result = await response.json()
          setData(result)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [tab, search, status, dateRange, grade, subject, teacher, student, customStartDate, customEndDate, attendanceType])

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
      const fields = CLASS_FIELDS.filter(field => selectedFields[field.key]);
      headers = activeFields.map(field => field.label);
      rows = data.map((c: any) => {
        const row: any = {};
        activeFields.forEach(field => {
          switch (field.key) {
            case 'subject':
              row[field.label] = c.subject?.name || '-';
              break;
            case 'teacher':
              row[field.label] = c.teacher?.user?.name || '-';
              break;
            case 'students':
              row[field.label] = c.students?.map((cs: any) => cs.student?.user?.name).join("; ") || '-';
              break;
            case 'startTime':
              row[field.label] = c.startTime ? new Date(c.startTime).toLocaleString() : '-';
              break;
            case 'endTime':
              row[field.label] = c.endTime ? new Date(c.endTime).toLocaleString() : '-';
              break;
            case 'duration':
              const duration = c.startTime && c.endTime ? 
                Math.round((new Date(c.endTime).getTime() - new Date(c.startTime).getTime()) / (1000 * 60)) : 0;
              row[field.label] = `${duration} minutes`;
              break;
            case 'status':
              row[field.label] = c.status || '-';
              break;
            case 'isRecurring':
              row[field.label] = c.isRecurring ? 'Yes' : 'No';
              break;
            case 'recurrence':
              row[field.label] = c.recurrence || '-';
              break;
            case 'notes':
              row[field.label] = c.notes || '-';
              break;
            case 'createdAt':
              row[field.label] = c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '-';
              break;
          }
        });
        return row;
      });
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
    if (tab !== "students" && tab !== "teachers" && tab !== "classes") return null;
    
    let fields;
    if (tab === "students") {
      fields = STUDENT_FIELDS;
    } else if (tab === "teachers") {
      fields = TEACHER_FIELDS;
    } else {
      fields = CLASS_FIELDS;
    }
    
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
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date Range
          </label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {DATE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {tab === "students" ? (
              <>
                <option value="all">All Students</option>
                <option value="active">Enrolled</option>
                <option value="inactive">Not Enrolled</option>
              </>
            ) : tab === "teachers" ? (
              <>
                <option value="all">All Teachers</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </>
            ) : tab === "attendance" ? (
              <>
                <option value="all">All Status</option>
                <option value="PRESENT">Present</option>
                <option value="ABSENT">Absent</option>
                <option value="LATE">Late</option>
                <option value="CANCELLED">Cancelled</option>
              </>
            ) : (
              <>
                <option value="all">All Status</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </>
            )}
          </select>
        </div>

        {tab === "students" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grade
            </label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Grades</option>
              {grades.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.curriculum})
                </option>
              ))}
            </select>
          </div>
        )}

        {(tab === "students" || tab === "teachers") && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {tab === "classes" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teacher
              </label>
              <select
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Teachers</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.user?.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student
              </label>
              <select
                value={student}
                onChange={(e) => setStudent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Students</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.user?.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {tab === "classes" && dateRange === "custom" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </>
        )}

        {tab === "attendance" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attendance Type
            </label>
            <select
              value={attendanceType}
              onChange={(e) => setAttendanceType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {ATTENDANCE_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={() => {
            setSearch("");
            setStatus("all");
            setDateRange("all");
            setGrade("");
            setSubject("");
            setTeacher("");
            setStudent("");
            setCustomStartDate("");
            setCustomEndDate("");
            setAttendanceType("all");
          }}
          className="text-gray-600 hover:text-gray-800 text-sm font-medium"
        >
          Reset Filters
        </button>
        
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={(e) => { e.preventDefault(); handleExport(); }}
          disabled={loading || data.length === 0}
        >
          Export
        </button>
      </div>
    </div>
  )

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
      const fields = CLASS_FIELDS.filter(field => selectedFields[field.key]);
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
              {data.map((c: any, idx: number) => (
                <tr key={c.id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-4 py-2 font-mono text-xs text-gray-500">{idx + 1}</td>
                  {fields.map(field => {
                    switch (field.key) {
                      case 'subject':
                        return <td key={field.key} className="px-4 py-2">{c.subject?.name || '-'}</td>;
                      case 'teacher':
                        return <td key={field.key} className="px-4 py-2">{c.teacher?.user?.name || '-'}</td>;
                      case 'students':
                        return (
                          <td key={field.key} className="px-4 py-2">
                            {c.students?.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {c.students.map((cs: any, index: number) => (
                                  <span
                                    key={cs.student?.user?.name ?? index}
                                    className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                                  >
                                    {cs.student?.user?.name ?? 'Unknown'}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400">No students</span>
                            )}
                          </td>
                        );
                      case 'startTime':
                        return <td key={field.key} className="px-4 py-2">{c.startTime ? new Date(c.startTime).toLocaleString() : '-'}</td>;
                      case 'endTime':
                        return <td key={field.key} className="px-4 py-2">{c.endTime ? new Date(c.endTime).toLocaleString() : '-'}</td>;
                      case 'duration':
                        const duration = c.startTime && c.endTime ? 
                          Math.round((new Date(c.endTime).getTime() - new Date(c.startTime).getTime()) / (1000 * 60)) : 0;
                        return <td key={field.key} className="px-4 py-2">{`${duration} minutes`}</td>;
                      case 'status':
                        return <td key={field.key} className="px-4 py-2">{c.status || '-'}</td>;
                      case 'isRecurring':
                        return <td key={field.key} className="px-4 py-2">{c.isRecurring ? 'Yes' : 'No'}</td>;
                      case 'recurrence':
                        return <td key={field.key} className="px-4 py-2">{c.recurrence || '-'}</td>;
                      case 'notes':
                        return <td key={field.key} className="px-4 py-2">{c.notes || '-'}</td>;
                      case 'createdAt':
                        return <td key={field.key} className="px-4 py-2">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '-'}</td>;
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
    } else if (tab === "attendance") {
      if (attendanceType === "student") {
        // Student attendance view
        return (
          <div className="overflow-x-auto bg-white rounded-xl shadow">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 text-left w-16">S.No</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Student</th>
                  <th className="px-4 py-2 text-left">Class</th>
                  <th className="px-4 py-2 text-left">Subject</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                {data.flatMap((att: any, idx: number) => 
                  att.studentAttendance?.map((sa: any, studentIdx: number) => (
                    <tr key={`${att.id}-${sa.id}`} className="hover:bg-blue-50 transition-colors">
                      <td className="px-4 py-2 font-mono text-xs text-gray-500">{idx * 100 + studentIdx + 1}</td>
                      <td className="px-4 py-2">{new Date(att.date).toLocaleDateString()}</td>
                      <td className="px-4 py-2 font-medium">{sa.student.user.name}</td>
                      <td className="px-4 py-2">{att.class?.subject?.name}</td>
                      <td className="px-4 py-2">{att.class?.subject?.name}</td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          sa.status === 'PRESENT' ? 'bg-green-100 text-green-800' :
                          sa.status === 'ABSENT' ? 'bg-red-100 text-red-800' :
                          sa.status === 'LATE' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {sa.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">{sa.notes || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        );
      } else if (attendanceType === "teacher") {
        // Teacher attendance view
        return (
          <div className="overflow-x-auto bg-white rounded-xl shadow">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 text-left w-16">S.No</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Teacher</th>
                  <th className="px-4 py-2 text-left">Class</th>
                  <th className="px-4 py-2 text-left">Subject</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Notes</th>
                </tr>
              </thead>
              <tbody>
                {data.map((att: any, idx: number) => (
                  <tr key={att.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-4 py-2 font-mono text-xs text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-2">{new Date(att.date).toLocaleDateString()}</td>
                    <td className="px-4 py-2 font-medium">{att.class?.teacher?.user?.name}</td>
                    <td className="px-4 py-2">{att.class?.subject?.name}</td>
                    <td className="px-4 py-2">{att.class?.subject?.name}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        att.teacherStatus === 'PRESENT' ? 'bg-green-100 text-green-800' :
                        att.teacherStatus === 'ABSENT' ? 'bg-red-100 text-red-800' :
                        att.teacherStatus === 'LATE' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {att.teacherStatus}
                      </span>
                    </td>
                    <td className="px-4 py-2">{att.teacherNotes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      } else {
        // All attendance view (default)
        return (
          <div className="overflow-x-auto bg-white rounded-xl shadow">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 text-left w-16">S.No</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Class</th>
                  <th className="px-4 py-2 text-left">Teacher</th>
                  <th className="px-4 py-2 text-left">Teacher Status</th>
                  <th className="px-4 py-2 text-left">Students Present</th>
                  <th className="px-4 py-2 text-left">Total Students</th>
                </tr>
              </thead>
              <tbody>
                {data.map((a: any, idx: number) => {
                  const presentStudents = a.studentAttendance?.filter((sa: any) => sa.status === 'PRESENT').length || 0;
                  const totalStudents = a.studentAttendance?.length || 0;
                  
                  return (
                    <tr key={a.id} className="hover:bg-blue-50 transition-colors">
                      <td className="px-4 py-2 font-mono text-xs text-gray-500">{idx + 1}</td>
                      <td className="px-4 py-2">{new Date(a.date).toLocaleDateString()}</td>
                      <td className="px-4 py-2">{a.class?.subject?.name}</td>
                      <td className="px-4 py-2">{a.class?.teacher?.user?.name}</td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          a.teacherStatus === 'PRESENT' ? 'bg-green-100 text-green-800' :
                          a.teacherStatus === 'ABSENT' ? 'bg-red-100 text-red-800' :
                          a.teacherStatus === 'LATE' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {a.teacherStatus}
                        </span>
                      </td>
                      <td className="px-4 py-2 font-medium text-green-600">{presentStudents}</td>
                      <td className="px-4 py-2">{totalStudents}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      }
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
        
        {/* Results Summary */}
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {loading ? (
                <span>Loading...</span>
              ) : (
                <span>
                  Showing <span className="font-semibold">{data.length}</span> results
                  {tab === "classes" && (
                    <>
                      {subject && ` for subject: ${subjects.find(s => s.id === subject)?.name}`}
                      {teacher && ` with teacher: ${teachers.find(t => t.id === teacher)?.user?.name}`}
                      {student && ` for student: ${students.find(s => s.id === student)?.user?.name}`}
                      {dateRange !== "all" && ` in ${DATE_OPTIONS.find(d => d.value === dateRange)?.label.toLowerCase()}`}
                    </>
                  )}
                </span>
              )}
            </div>
            {data.length > 0 && (
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>
        
        {renderTable()}
      </div>
    </DashboardLayout>
  );
} 