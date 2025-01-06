import "../styles/marks.css";
import DownloadMarks from "../components/Marks/DownloadMarks";
import UploadMarks from "../components/Marks/UploadMarks";
import { useState } from "react";
import { fetchStudents, fetchSubjects } from "../apis/api";
import { useRecoilValue } from "recoil";
import axios from 'axios';
import { standardList } from "../store/store";

interface Subject {
  id: number;
  name: string;
}
interface Student {
  id: number;
  fullName: string;
  rollNo: number;
}

const Marks: React.FC = () => {
  const [selectedStandard, setSelectedStandard] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [exam, setExam] = useState<string>("");
  const [marks, setMarks] = useState<{ [studentId: number]: { [subjectId: number]: number } }>({});
  const standards = useRecoilValue(standardList);
  const [subjectTotals, setSubjectTotals] = useState<{ [subjectId: number]: number }>({});

  // Fetch subjects based on selected standard
  const fetchSubjectsList = async (standard: string) => {
    try {
      const response = await fetchSubjects(standard);
      setSubjects(response.data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  // Fetch students based on selected standard
  const fetchStudentsList = async (standard: string) => {
    try {
      const response = await fetchStudents(standard);
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  // Handle standard change
  const handleStandardChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedStandard(value);

    if (value) {
      await fetchSubjectsList(value);
      await fetchStudentsList(value);
    } else {
      setStudents([]);
      setSubjects([]);
    }
  };

  // Handle exam type change
  const handleExamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setExam(e.target.value);
  };

  // Handle marks input change
  const handleMarksChange = (studentId: number, subjectId: number, value: number) => {
    setMarks((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subjectId]: value,
      },
    }));
  };

  // Submit data to backend
  const handleSubmit = async (studentId: number) => {
    try {
      await Promise.all(
        subjects.map(async (subject) => {
          const obtainedMarks = marks[studentId]?.[subject.id] || 0;
          const totalMarks = 100; 
          const percentage = calculatePercentage(studentId);

          const payload = {
            studentId,
            subjectId: subject.id,
            subjectName: subject.name,
            examinationType: exam,
            obtainedMarks,
            totalMarks,
            percentage,
          };

          await axios.post('http://localhost:5000/api/marks', payload); // Backend endpoint for saving marks
        })
      );
      alert('Marks submitted successfully!');
    } catch (error) {
      console.error("Error submitting marks:", error);
      alert('Error submitting marks.');
    }
  };

  const handleTotalMarksChange = (subjectId: number, value: number) => {
    setSubjectTotals((prev) => ({
      ...prev,
      [subjectId]: value,
    }));
  };

  // Calculate percentage for a student
  const calculatePercentage = (studentId: number) => {
    const totalMarks = Object.values(subjectTotals).reduce((acc, total) => acc + total, 0);
    const obtainedMarks = Object.values(marks[studentId] || {}).reduce((acc, mark) => acc + mark, 0);
    return totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 100) : 0;
  };

  return (
    <div className="global-container">
      <div className="import_export">
        <div className="innerbox">
          <h2>Download Marks Data</h2>
          <DownloadMarks />
        </div>
        <div className="innerbox">
          <h2>Upload Marks Data</h2>
          <UploadMarks />
        </div>
      </div>

      <div className="global-container">
        <h2>Marks Control</h2>
        <label htmlFor="standard">Select Standard:</label>
        <select
          id="standard"
          name="standard"
          value={selectedStandard}
          onChange={handleStandardChange}
        >
          <option value="">Select standard</option>
          {standards.map((standard: string) => (
            <option key={standard} value={standard}>
              {standard}
            </option>
          ))}
        </select>

        <div>
          <label>Examination Type:</label>
          <select
            name="examinationType"
            required
            value={exam}
            onChange={handleExamChange}
          >
            <option value="">Select Examination Type</option>
            <option value="UnitTest">Unit Test 1</option>
            <option value="MidTerm">Mid Term</option>
            <option value="Final">Final Exam</option>
          </select>
        </div>

        <table className="AttendanceTable">
          <thead>
            {selectedStandard && exam && (
              <tr>
                <th>Roll No</th>
                <th>Full Name</th>
                {subjects.map((subject) => (
                <th key={subject.id}>
                  {subject.name}
                  <label>Total Marks</label>
                  <input
                    type="number"
                    value={subjectTotals[subject.id] || ""}
                    onChange={(e) =>
                      handleTotalMarksChange(subject.id, Number(e.target.value))
                    }
                  />
                </th>
              ))}

                <th>Submit</th>
                <th>Percentage (%)</th>
              </tr>
            )}
          </thead>
          <tbody>
            {exam &&
              students.map((student) => (
                <tr key={student.id}>
                  <td>{student.rollNo}</td>
                  <td>{student.fullName}</td>
                  {subjects.map((subject) => (
                    <td key={subject.id}>
                      <input
                        type="number"
                        value={marks[student.id]?.[subject.id] || ""}
                        onChange={(e) =>
                          handleMarksChange(
                            student.id,
                            subject.id,
                            Number(e.target.value)
                          )
                        }
                      />
                    </td>
                  ))}
                  <td>
                    <input
                      type="submit"
                      value="Submit"
                      onClick={() => handleSubmit(student.id)}
                    />
                  </td>
                  <td>{calculatePercentage(student.id)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Marks;
