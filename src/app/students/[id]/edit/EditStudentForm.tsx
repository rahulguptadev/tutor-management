"use client";
import { useState } from "react";

interface EnrolledSubjectRow {
  subjectId: string;
  sessions: string;
  fee: string;
}

export default function EditStudentForm({ student, allSubjects, allGrades }: { student: any; allSubjects: any[]; allGrades: any[] }) {
  const [enrolledSubjects, setEnrolledSubjects] = useState<EnrolledSubjectRow[]>(
    student.enrolledSubjects.length > 0
      ? student.enrolledSubjects.map((es: any) => ({
          subjectId: es.subjectId,
          sessions: es.sessions.toString(),
          fee: es.fee.toString(),
        }))
      : [{ subjectId: '', sessions: '', fee: '' }]
  );

  const handleEnrolledSubjectChange = (idx: number, field: string, value: string) => {
    setEnrolledSubjects((prev: EnrolledSubjectRow[]) => prev.map((row: EnrolledSubjectRow, i: number) => i === idx ? { ...row, [field]: value } : row))
  }
  const handleAddRow = () => {
    setEnrolledSubjects((prev: EnrolledSubjectRow[]) => [...prev, { subjectId: '', sessions: '', fee: '' }])
  }
  const handleRemoveRow = (idx: number) => {
    setEnrolledSubjects((prev: EnrolledSubjectRow[]) => prev.filter((_: EnrolledSubjectRow, i: number) => i !== idx))
  }

  return (
    <form
      className="bg-white rounded shadow p-6"
      action={`/api/students/${student.id}/edit`}
      method="POST"
      onSubmit={e => {
        // Serialize enrolledSubjects as JSON in hidden input
        const input = document.getElementById('enrolledSubjectsInput') as HTMLInputElement
        if (input) input.value = JSON.stringify(enrolledSubjects.filter(row => row.subjectId && row.sessions && row.fee))
      }}
    >
      {/* Student Basic Information */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Student Information</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            name="name"
            defaultValue={student.user.name}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            defaultValue={student.user.email}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grade</label>
            <select
              name="gradeId"
              defaultValue={student.grade?.id || ''}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Select a grade</option>
              {allGrades.map((grade: any) => (
                <option key={grade.id} value={grade.id}>
                  {grade.name} ({grade.curriculum})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
            <input
              type="text"
              name="school"
              defaultValue={student.school || ''}
              placeholder="School name"
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
          <input
            type="tel"
            name="mobileNumber"
            defaultValue={student.mobileNumber || ''}
            placeholder="+1234567890"
            className="w-full px-3 py-2 border rounded"
          />
        </div>
      </div>
      {/* Parent Information */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Parent Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name</label>
            <input
              type="text"
              name="fatherName"
              defaultValue={student.fatherName || ''}
              placeholder="Father's full name"
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Father's Contact</label>
            <input
              type="tel"
              name="fatherContact"
              defaultValue={student.fatherContact || ''}
              placeholder="+1234567890"
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Name</label>
            <input
              type="text"
              name="motherName"
              defaultValue={student.motherName || ''}
              placeholder="Mother's full name"
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Contact</label>
            <input
              type="tel"
              name="motherContact"
              defaultValue={student.motherContact || ''}
              placeholder="+1234567890"
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>
      </div>
      {/* Enrolled Subjects with Sessions and Fee */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Enrolled Subjects</h3>
        <div className="space-y-2 border border-gray-200 rounded-md p-3">
          {enrolledSubjects.map((row: EnrolledSubjectRow, idx: number) => (
            <div key={idx} className="flex gap-2 items-center">
              <select
                className="rounded border-gray-300 px-2 py-1"
                value={row.subjectId}
                onChange={e => handleEnrolledSubjectChange(idx, 'subjectId', e.target.value)}
                required
                name={undefined}
              >
                <option value="">Select subject</option>
                {allSubjects.map((subject: { id: string; name: string }) => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                placeholder="Sessions"
                className="rounded border-gray-300 px-2 py-1 w-24"
                value={row.sessions}
                onChange={e => handleEnrolledSubjectChange(idx, 'sessions', e.target.value)}
                required
                name={undefined}
              />
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Fee"
                className="rounded border-gray-300 px-2 py-1 w-24"
                value={row.fee}
                onChange={e => handleEnrolledSubjectChange(idx, 'fee', e.target.value)}
                required
                name={undefined}
              />
              {enrolledSubjects.length > 1 && (
                <button type="button" onClick={() => handleRemoveRow(idx)} className="text-red-500 px-2">Remove</button>
              )}
            </div>
          ))}
          <button type="button" onClick={handleAddRow} className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded">Add More</button>
        </div>
        <input type="hidden" id="enrolledSubjectsInput" name="enrolledSubjects" />
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Save Changes
      </button>
    </form>
  );
} 