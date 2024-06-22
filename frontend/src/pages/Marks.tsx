import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import axios from 'axios';

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
    standard: '',
    studentName: '',
    examinationType: '',
    marks: [],
  });

  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [standards, setStandards] = useState<Standard[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchStandards = async () => {
      try {
        const response = await axios.get('http://localhost:5000/getstandards');
        setStandards(response.data.standards);
      } catch (error) {
        console.error('Error fetching standards:', error);
      }
    };

    const fetchSubjects = async () => {
      try {
        const response = await axios.get('http://localhost:5000/getsubjects');
        setSubjects(response.data);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };

    fetchStandards();
    fetchSubjects();
  }, []);

  const handleStandardChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const standard = e.target.value;
    setFormData((prevFormData) => ({
      ...prevFormData,
      standard,
      studentName: '', // reset studentName when standard changes
      marks: [], // reset marks when standard changes
    }));

    try {
      const response = await axios.get('http://localhost:5000/getattendancelist', {
        params: { standard },
      });
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleStudentChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const studentName = e.target.value;
    setFormData((prevFormData) => ({
      ...prevFormData,
      studentName,
      marks: subjects.map(subject => ({
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

  const handleMarksChange = (subjectId: number, field: 'obtainedMarks' | 'totalMarks', value: number) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      marks: prevFormData.marks.map(mark =>
        mark.subjectId === subjectId ? { ...mark, [field]: value } : mark
      ),
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/add', formData);
      console.log('Marks added:', response.data);
      setSuccessMessage('Marks added successfully!');

      // Optionally reset form
      setFormData({
        standard: '',
        studentName: '',
        examinationType: '',
        marks: [],
      });
      setStudents([]);
    } catch (error) {
      console.error('Error adding marks:', error);
      setSuccessMessage('Failed to add marks.');
    }
  };

  return (
    <div>
      <h1>Add Marks</h1>
      {successMessage && (
        <div className="alert">
          {successMessage}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Standard:</label>
          <select name="standard" value={formData.standard} onChange={handleStandardChange} required>
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
          <select name="studentName" value={formData.studentName} onChange={handleStudentChange} required>
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
          <select name="examinationType" value={formData.examinationType} onChange={handleChange} required>
            <option value="">Select Examination Type</option>
            <option value="UnitTest">Unit Test</option>
            <option value="MidTerm">Mid Term</option>
            <option value="Final">Final</option>
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
                      value={formData.marks.find(mark => mark.subjectId === subject.id)?.obtainedMarks || 0}
                      onChange={(e) => handleMarksChange(subject.id, 'obtainedMarks', parseFloat(e.target.value))}
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={formData.marks.find(mark => mark.subjectId === subject.id)?.totalMarks || 0}
                      onChange={(e) => handleMarksChange(subject.id, 'totalMarks', parseFloat(e.target.value))}
                      required
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <button type="submit">Add Marks</button>
      </form>
    </div>
  );
};

export default Marks;
