/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import DownloadAttendance from "../components/DownloadAttendance";
import "../styles/attendance.css";

interface Student {
  id: number;
  fullName: string;
  gender: string;
  dateOfBirth: string;
  rollNo: number;
  standard: string;
  adhaarCardNo: bigint;
  scholarshipApplied: boolean;
  address: string;
}

interface Subject {
  id: number;
  name: string;
}

const Attendance: React.FC = () => {
  const [standards, setStandards] = useState<string[]>([]);
  const [selectedStandard, setSelectedStandard] = useState<string>("");
  const [attendanceDate, setAttendanceDate] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [absentStudents, setAbsentStudents] = useState<number[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  useEffect(() => {
    fetchStandards();
    fetchSubjects();
  }, []);

  const fetchStandards = async () => {
    try {
      const response = await fetch("http://localhost:5000/getstandards");
      if (response.ok) {
        const data = await response.json();
        setStandards(data.standards);
      } else {
        console.error("Failed to fetch standards");
      }
    } catch (error) {
      console.error("Error fetching standards:", error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch("http://localhost:5000/getsubjects");
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
      } else {
        console.error("Failed to fetch subjects");
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchStudents = async (standard: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/getattendancelist?standard=${standard}`
      );
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      } else {
        console.error("Failed to fetch students");
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleStandardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedStandard(value);
    if (value) {
      fetchStudents(value);
    } else {
      setStudents([]);
    }
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubject(e.target.value);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAttendanceDate(e.target.value);
  };

  const handleCheckboxChange = (rollNo: number) => {
    const updatedAbsentStudents = [...absentStudents];
    const index = updatedAbsentStudents.indexOf(rollNo);
    if (index === -1) {
      updatedAbsentStudents.push(rollNo);
    } else {
      updatedAbsentStudents.splice(index, 1);
    }
    setAbsentStudents(updatedAbsentStudents);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = {
      standard: selectedStandard,
      date: attendanceDate,
      absentStudents: absentStudents,
      subjectId: selectedSubject,
    };

    try {
      const response = await fetch("http://localhost:5000/submitattendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("Attendance recorded successfully");
      } else {
        throw new Error("Failed to record attendance");
      }
    } catch (error) {
      console.error("Error recording attendance:", error);
      alert("Failed to record attendance");
    }
  };

  return (
    <div>
      <h1>Attendance System</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="standard">Select Standard:</label>
        <select
          id="standard"
          name="standard"
          value={selectedStandard}
          onChange={handleStandardChange}
        >
          <option value="" disabled>
            Select standard
          </option>
          {standards.map((standard) => (
            <option key={standard} value={standard}>
              {standard}
            </option>
          ))}
        </select>

        <label htmlFor="attendance-date">Select Date:</label>
        <input
          type="date"
          id="attendance-date"
          name="attendance-date"
          value={attendanceDate}
          onChange={handleDateChange}
        />

        <label htmlFor="subject">Select Subject:</label>
        <select
          id="subject"
          name="subject"
          value={selectedSubject || ""}
          onChange={handleSubjectChange}
        >
          <option value="">Global Attendance</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>

        <div>
          <h4>Mark Absent Students:</h4>
          {students.map((student) => (
            <div className="AttendanceList" key={student.id}>
              <input
                type="checkbox"
                id={`student-${student.rollNo}`}
                name={`absentStudents`}
                checked={absentStudents.includes(student.rollNo)}
                onChange={() => handleCheckboxChange(student.rollNo)}
              />
              <label htmlFor={`student-${student.rollNo}`}>
                {student.fullName} (Roll No: {student.rollNo})
              </label>
            </div>
          ))}
        </div>

        <button className="CustomButton" type="submit">
          Submit Attendance
        </button>
      </form>

      <DownloadAttendance />
    </div>
  );
};

export default Attendance;
