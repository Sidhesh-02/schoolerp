import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import ClassDropdown from '../components/ClassDropdown';
import '../styles/Attendance.css'; 

interface Student {
  id: number;
  name: string;
  rollNo: number;
}

interface AttendanceRecord {
  rollNo: number;
  status: string;
}

const Attendance: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    if (selectedClass) {
      axios.get(`http://localhost:5000/students/${selectedClass}`).then((response) => {
        setStudents(response.data);
        // Initialize attendance records with all students marked as present
        const initialRecords = response.data.map((student: Student) => ({
          rollNo: student.rollNo,
          status: 'present'
        }));
        setAttendanceRecords(initialRecords);
      }).catch((error) => {
        console.error('Failed to fetch students:', error);
      });
    }
  }, [selectedClass]);

  const handleStatusChange = (rollNo: number) => {
    setAttendanceRecords(prevRecords => {
      const updatedRecords = prevRecords.map(record =>
        record.rollNo === rollNo ? { ...record, status: 'absent' } : record
      );
      return updatedRecords;
    });
  };

  const handleSubmit = () => {
    if (selectedDate && attendanceRecords.length > 0) {
      axios.post('http://localhost:5000/attendance', {
        date: selectedDate.toISOString(),
        records: attendanceRecords
      }).then(() => {
        alert('Attendance recorded successfully');
      }).catch((error) => {
        console.error('Failed to record attendance:', error);
      });
    }
  };

  const handleDownload = () => {
    if (selectedClass) {
      window.open(`http://localhost:5000/attendance/download/${selectedClass}`);
    }
  };

  return (
    <div className="attendance-container">
      <h1>Attendance</h1>
      <ClassDropdown onSelect={(classId) => setSelectedClass(classId)} />
      <DatePicker selected={selectedDate} onChange={(date) => setSelectedDate(date)} />
      {students.length > 0 && (
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Roll No</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td>{student.name}</td>
                <td>{student.rollNo}</td>
                <td>
                  <input
                    type="checkbox"
                    onChange={() => handleStatusChange(student.rollNo)}
                  /> Absent
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className='attendance-button'>
        <button onClick={handleSubmit} className="submit-button">Submit Attendance</button>
        <button onClick={handleDownload} className="download-button">Download Attendance</button>
      </div>
    </div>
  );
};

export default Attendance;
