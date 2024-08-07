/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { fetchStandards, fetchSubjects, fetchStudents, addMarks, searchMarks } from "../utils/api";
import "../styles/marks.css";
import PerformanceChart from "../components/Marks/PerformanceChart";
import BarChart from "../components/Marks/BarChart";

interface FormData {
  standard: string;
  studentName: string;
  examinationType: string;
  marks: {
    subjectId: number;
    subjectName: string;
    obtainedMarks: number;
    totalMarks: number;
  }[];
}

interface Student {
  id: number;
  fullName: string;
}

interface Subject {
  id: number;
  name: string;
}

interface Standard {
  standard: string;
}

const Marks: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    standard: "",
    studentName: "",
    examinationType: "",
    marks: [],
  });

  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [standards, setStandards] = useState<Standard[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [search, setSearch] = useState<any>();
  const [rollNo, setRollNo] = useState<number>(0);
  const [std, setStd] = useState<string>('');
  const [exam, setExam] = useState<string>();
  const [totalPercentage, setTotalPercentage] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const standardsResponse = await fetchStandards();
        setStandards(standardsResponse.data.standards);

        const subjectsResponse = await fetchSubjects();
        setSubjects(subjectsResponse.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleStandardChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const standard = e.target.value;
    setFormData((prevFormData) => ({
      ...prevFormData,
      standard,
      studentName: "",
      marks: [],
    }));

    try {
      const response = await fetchStudents(standard);
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleStudentChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const studentName = e.target.value;
    setFormData((prevFormData) => ({
      ...prevFormData,
      studentName,
      marks: subjects.map((subject) => ({
        subjectId: subject.id,
        subjectName: subject.name,
        obtainedMarks: 0,
        totalMarks: 0,
      })),
    }));
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleMarksChange = (subjectId: number, field: "obtainedMarks" | "totalMarks", value: number) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      marks: prevFormData.marks.map((mark) =>
        mark.subjectId === subjectId ? { ...mark, [field]: value } : mark
      ),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      await addMarks(formData);
      setSuccessMessage("Marks added successfully!");

      setFormData({
        standard: "",
        studentName: "",
        examinationType: "",
        marks: [],
      });
      setStudents([]);
    } catch (error) {
      console.error("Error adding marks:", error);
      setSuccessMessage("Failed to add marks.");
    }
  };

  const calculatePercentage = () => {
    let marks = 0;
    let totalMarks = 0;
    search.marks.forEach((e: any) => {
      if (exam === e.examinationType) {
        marks += e.obtainedMarks;
        totalMarks += e.totalMarks;
      }
    });
    const percentage = (marks / totalMarks) * 100;
    setTotalPercentage(percentage);
  };

  useEffect(() => {
    if (search && search.marks.length > 0) {
      calculatePercentage();
    }
  }, [search, exam]);

  const submitChange = async () => {
    try {
      const response = await searchMarks(rollNo, std);
      setSearch(JSON.parse(response.data).result);
    } catch (error) {
      console.error("Error searching marks:", error);
    }
  };

  return (
    <div className="global-container">
      <h2>Add Marks</h2>
      {successMessage && <div className="alert">{successMessage}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Standard:</label>
          <select
            name="standard"
            value={formData.standard}
            onChange={handleStandardChange}
            required
          >
            <option value="">Select Standard</option>
            {standards.map((standard, index) => (
              <option key={index} value={standard}>
                {standard}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Student Name:</label>
          <select
            name="studentName"
            value={formData.studentName}
            onChange={handleStudentChange}
            required
          >
            <option value="">Select Student</option>
            {students.map((student) => (
              <option key={student.id} value={student.fullName}>
                {student.fullName}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Examination Type:</label>
          <select
            name="examinationType"
            value={formData.examinationType}
            onChange={handleChange}
            required
          >
            <option value="">Select Examination Type</option>
            <option value="UnitTest">Unit Test 1</option>
            <option value="MidTerm">Unit Test 2</option>
            <option value="Final">Final Exam</option>
          </select>
        </div>
        {formData.studentName && (
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Obtained Marks</th>
                <th>Total Marks</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject) => (
                <tr key={subject.id}>
                  <td>{subject.name}</td>
                  <td>
                    <input
                      type="number"
                      value={
                        formData.marks.find(
                          (mark) => mark.subjectId === subject.id
                        )?.obtainedMarks || 0
                      }
                      onChange={(e) =>
                        handleMarksChange(
                          subject.id,
                          "obtainedMarks",
                          parseFloat(e.target.value)
                        )
                      }
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={
                        formData.marks.find(
                          (mark) => mark.subjectId === subject.id
                        )?.totalMarks || 0
                      }
                      onChange={(e) =>
                        handleMarksChange(
                          subject.id,
                          "totalMarks",
                          parseFloat(e.target.value)
                        )
                      }
                      required
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <button className="CustomButton" type="submit">Add Marks</button>
      </form>
      
        <br />
        <br />
        

      <h2>Search Student Marks</h2>

      <label>Roll No</label>
      <input
        type="number"
        placeholder="Roll no."
        onChange={(e) => setRollNo(Number(e.target.value))}
      />

      <label>Standard</label>
      <select
        name="standard"
        onChange={(e) => setStd(e.target.value)}
        required
      >
        <option value="">Select Standard</option>
        {standards.map((standard, index) => (
          <option key={index} value={standard}>
            {standard}
          </option>
        ))}
      </select>

      <label>Exam Type</label>
      <select
        name=""
        onChange={(e) => setExam(e.target.value)}
        required
      >
        <option value="">Select Examination Type</option>
        <option value="UnitTest">Unit Test</option>
        <option value="MidTerm">Mid Term</option>
        <option value="Final">Final</option>
      </select>
      <button onClick={submitChange} type="button">Search</button>
      <div>
        {search != null ? (
          <div>
            <h3>Marks:</h3>
            <p>{search.fullName}</p>
            <table>
              <thead>
                <tr>
                  <th>Subject ID</th>
                  <th>Subject Name</th>
                  <th>Obtained Marks</th>
                  <th>Total Marks</th>
                </tr>
              </thead>
              <tbody>
                {search.marks.map((e: any) => (
                  exam === e.examinationType ? (
                    <tr key={e.subjectId}>
                      <td>{e.subjectId}</td>
                      <td>{e.subjectName}</td>
                      <td>{e.obtainedMarks}</td>
                      <td>{e.totalMarks}</td>
                    </tr>
                  ) : null
                ))}
              </tbody>
            </table>
            <br />
            <h3>Total Percentage - {totalPercentage}%</h3>

            {search.marks.length > 0 && (
              <>
                <PerformanceChart marks={search.marks} examType={exam} /> <br /><br />
                <BarChart marks={search.marks} examType={exam} />
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Marks;
