import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import ClassDropdown from '../components/ClassDropdown';

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
      }).catch((error) => {
        console.error('Failed to fetch students:', error);
      });
    }
  }, [selectedClass]);

  const handleStatusChange = (rollNo: number, status: string) => {
    setAttendanceRecords(prevRecords => {
      const existingRecordIndex = prevRecords.findIndex(record => record.rollNo === rollNo);
      if (existingRecordIndex !== -1) {
        prevRecords[existingRecordIndex] = { rollNo, status };
        return [...prevRecords];
      }
      return [...prevRecords, { rollNo, status }];
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
    <div>
      <h1>Attendance</h1>
      <ClassDropdown onSelect={(classId) => setSelectedClass(classId)} />
      <DatePicker selected={selectedDate} onChange={(date) => setSelectedDate(date)} />
      <ul>
        {students.map((student) => (
          <li key={student.id}>
            {student.name} (Roll No: {student.rollNo})
            <select onChange={(e) => handleStatusChange(student.rollNo, e.target.value)}>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
            </select>
          </li>
        ))}
      </ul>
      <button onClick={handleSubmit}>Submit Attendance</button>
      <button onClick={handleDownload}>Download Attendance</button>
    </div>
  );
};

export default Attendance;
