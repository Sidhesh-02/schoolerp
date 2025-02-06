import "../styles/marks.css";
import DownloadMarks from "../components/Marks/DownloadMarks";
import UploadMarks from "../components/Marks/UploadMarks";
import { useEffect, useState } from "react";
import { fetchStudents, fetchSubjects } from "../apis/api";
import { useRecoilValue } from "recoil";
import axios from "axios";
import { address, handleInstitutionName, sessionYear, standardList } from "../store/store";
import 'jspdf-autotable';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Subject {
  id: number;
  name: string;
}
interface Student {
  id: number;
  fullName: string;
  rollNo: number;
}
interface MarksIn {
  
  studentId: number;
  subjectId: number;
  subjectName: string;
  examinationType: string;
  obtainedMarks: number;
  totalMarks: number;
  percentage: number;
}
interface MarkTotal{
  id:number,
  subjectId: number;
  examinationType:string,
  totalMarks:string
}

const Marks: React.FC = () => {
  const [selectedStandard, setSelectedStandard] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [exam, setExam] = useState<string>("");
  const [marks, setMarks] = useState<{ [studentId: number]: { [subjectId: number]: number } }>({});
  const standards = useRecoilValue(standardList);
  const [subjectTotals, setSubjectTotals] = useState<{ [subjectId: number]: number }>({});
  const [fetchedMarks, setFetchedMarks] = useState<MarksIn[]>([]);
  const [editMode, setEditMode] = useState<{ [studentId: number]: boolean }>({});
  const [totalFetchedMarks,setFetchedTotalMarks] = useState<MarkTotal[]>([])
  const [isEditingTotalMarks, setIsEditingTotalMarks] = useState(false);
  const InstitueName = useRecoilValue(handleInstitutionName);
  const InstitueAddress = useRecoilValue(address);
  const session = useRecoilValue(sessionYear);

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/getMarks",{params: { examinationType: exam }});
        console.log(response.data)
        setFetchedMarks(response.data);
      } catch (error) {
        console.error("Error fetching marks:", error);
      }
    };
    fetchMarks();
  }, [exam]);

  useEffect(()=>{
    const fetchTotalMarks = async () =>{
      const response = await axios.get("http://localhost:5000/getTotalMarks",{params: { examinationType: exam }});
      setFetchedTotalMarks(response.data);
    } 

    fetchTotalMarks()
  },[exam])

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

  const fetchSubjectsList = async (standard: string) => {
    try {
      const response = await fetchSubjects(standard);
      setSubjects(response.data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const fetchStudentsList = async (standard: string) => {
    try {
      const response = await fetchStudents(standard);
      setStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleExamChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setExam(e.target.value);
  };

  const handleMarksChange = (studentId: number, subjectId: number, value: number) => {
    // Get total marks from state or fetched data
    const totalMarks =
      subjectTotals[subjectId] ??
      Number(totalFetchedMarks.find((mark) => mark.subjectId === subjectId)?.totalMarks || 0);
  
    // Validation: Obtained marks should not exceed total marks
    if (value > totalMarks) {
      alert("Obtained marks cannot be greater than total marks!");
      return;
    }
  
    setMarks((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subjectId]: value,
      },
    }));
  };
  

  const handleTotalMarksChange = (subjectId: number, value: number) => {
    setSubjectTotals((prev) => ({
      ...prev,
      [subjectId]: value,
    }));
  };

  const calculatePercentage = (studentId: number) => {
    let totalMarks = 0;
    let obtainedMarks = 0;
  
    subjects.forEach((subject) => {
      // Get total marks: if edited, take from state; otherwise, from DB
      const subjectTotal =
        subjectTotals[subject.id] ??
        Number(totalFetchedMarks.find((mark) => mark.subjectId === subject.id)?.totalMarks || 0);
  
      totalMarks += subjectTotal;
  
      // Get obtained marks: if edited, take from state; otherwise, from DB
      const storedMark = fetchedMarks.find((mark) => mark.studentId === studentId && mark.subjectId === subject.id)?.obtainedMarks || 0;
      const enteredMark = marks[studentId]?.[subject.id] ?? storedMark; // Prefer entered mark if available
  
      obtainedMarks += enteredMark;
    });
  
    return totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 100) : 0;
  };
  
  

  const handleSubmit = async (studentId: number) => {
    try {
      const newMarks: MarksIn[] = await Promise.all(
        subjects.map(async (subject) => {
          const obtainedMarks = marks[studentId]?.[subject.id] || 0;
          const totalMarks =
            subjectTotals[subject.id] ??
            Number(totalFetchedMarks.find((mark) => mark.subjectId === subject.id)?.totalMarks || 0);
          const percentage = calculatePercentage(studentId);
  
          // Validation: Percentage should not exceed 100%
          if (percentage > 100) {
            alert("Percentage cannot exceed 100%! Please check the marks entered.");
            return Promise.reject("Invalid percentage");
          }
  
          const payload = {
            studentId,
            subjectId: subject.id,
            subjectName: subject.name,
            examinationType: exam,
            obtainedMarks,
            totalMarks,
            percentage,
          };
  
          await axios.post("http://localhost:5000/api/marks", payload);
          return { id: Date.now(), ...payload };
        })
      );
  
      setFetchedMarks((prev) => [...prev, ...newMarks]);
      alert("Marks submitted successfully!");
    } catch (error) {
      console.error("Error submitting marks:", error);
      alert("Error submitting marks.");
    }
  };
  

  const handleEdit = (studentId: number) => {
    setEditMode((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const handleSave = async (studentId: number) => {
    try {
      const updatedMarks: MarksIn[] = await Promise.all(
        subjects.map(async (subject) => {
          const obtainedMarks = marks[studentId]?.[subject.id] || 0;
          const totalMarks =
            subjectTotals[subject.id] ??
            Number(totalFetchedMarks.find((mark) => mark.subjectId === subject.id)?.totalMarks || 0);
          const percentage = calculatePercentage(studentId);
  
          // Validation: Percentage should not exceed 100%
          if (percentage > 100) {
            alert("Percentage cannot exceed 100%! Please check the marks entered.");
            return Promise.reject("Invalid percentage");
          }
  
          const payload = {
            studentId,
            subjectId: subject.id,
            subjectName: subject.name,
            examinationType: exam,
            obtainedMarks,
            totalMarks,
            percentage,
          };
  
          await axios.post(`http://localhost:5000/api/updateMarks`, payload);
          return payload;
        })
      );
  
      setFetchedMarks((prev) =>
        prev.map((mark) =>
          updatedMarks.find((updated) => updated.studentId === mark.studentId && updated.subjectId === mark.subjectId)
            ? { ...mark, ...updatedMarks.find((updated) => updated.studentId === mark.studentId && updated.subjectId === mark.subjectId) }
            : mark
        )
      );
  
      alert("Marks updated successfully!");
      setEditMode((prev) => ({
        ...prev,
        [studentId]: false,
      }));
    } catch (error) {
      console.error("Error updating marks:", error);
      alert("Error updating marks.");
    }
  };
  


  const toggleEditTotalMarks = async () => {
    if (isEditingTotalMarks) {
      try {
        await Promise.all(
          Object.entries(subjectTotals).map(async ([subjectId, totalMarks]) => {
            if (!totalMarks) return;
  
            const payload = {
              subjectId: Number(subjectId),
              examinationType: exam,
              totalMarks: totalMarks.toString(),
            };
  
            await axios.post("http://localhost:5000/api/totalMarks", payload);
          })
        );
  
        // Update state instantly
        setFetchedTotalMarks((prev) =>
          prev.map((mark) =>
            subjectTotals[mark.subjectId] !== undefined
              ? { ...mark, totalMarks: subjectTotals[mark.subjectId]?.toString() || mark.totalMarks }
              : mark
          )
        );
  
        alert("Total Marks Updated Successfully!");
      } catch (error) {
        console.error("Error updating total marks:", error);
        alert("Error updating total marks.");
      }
    }
    setIsEditingTotalMarks((prev) => !prev);
  };
  
  const handleDownload = (student: Student) => {
    const marksForStudent = fetchedMarks.filter((mark) => mark.studentId === student.id);
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth(); 
    const pageHeight = doc.internal.pageSize.getHeight(); // Get page height

    // Draw border (rect: x, y, width, height)
    doc.rect(5, 5, pageWidth - 10, pageHeight - 10); // 5px padding from all sides

    // Center align Institute Name
    const textWidth = doc.getTextWidth(InstitueName); 
    const xPosition = (pageWidth - textWidth) / 2;

    doc.setFontSize(16);
    doc.text(InstitueName, xPosition, 20);
    doc.setFontSize(12);
    doc.text(InstitueAddress, pageWidth / 2, 30, { align: "center" });
    doc.setFontSize(10);
    doc.text(`REPORT CARD FOR ACADEMIC YEAR ${session} `, pageWidth / 2, 40, { align: "center" });

    doc.setFontSize(12);
    doc.text(`Name: ${student.fullName}`, 20, 50);
    doc.text(`Roll No: ${student.rollNo}`, 20, 60);
  
    const marksData = marksForStudent.map((mark) => [
      mark.subjectName,
      mark.obtainedMarks,
      totalFetchedMarks.find((t) => t.subjectId === mark.subjectId)?.totalMarks || "N/A",
    ]);
  
    autoTable(doc, {
      startY: 70,
      head: [["Subject", "Obtained Marks", "Total Marks"]],
      body: marksData,
    });
  
    const totalObtained = marksForStudent.reduce((sum, mark) => sum + mark.obtainedMarks, 0);
    const totalMarks = totalFetchedMarks.reduce((sum, mark) => sum + Number(mark.totalMarks), 0);
    const percentage = totalMarks > 0 ? ((totalObtained / totalMarks) * 100).toFixed(2) : "0";
  
    // Display total marks and percentage below the table
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    doc.text(`Total Marks: ${totalObtained} / ${totalMarks}`, 20, doc.lastAutoTable.finalY + 10);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    doc.text(`Percentage: ${percentage}%`, 20, doc.lastAutoTable.finalY + 20);
  
    doc.save(`${student.fullName}_Marksheet.pdf`);
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

      <h2>Marks Control</h2>
      <label htmlFor="standard">Select Standard:</label>
      <select id="standard" name="standard" value={selectedStandard} onChange={handleStandardChange}>
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
          {isEditingTotalMarks ? (
            <input
              type="number"
              value={subjectTotals[subject.id] || ""}
              onChange={(e) => handleTotalMarksChange(subject.id, Number(e.target.value))}
            />
          ) : (
            totalFetchedMarks.find((mark) => mark.subjectId === subject.id)?.totalMarks
          )}
        </th>
      ))}
      <th>
        Action
        <button onClick={toggleEditTotalMarks}>
          {isEditingTotalMarks ? "Save" : "Edit"}
        </button>
      </th>
      <th>Percentage (%)</th>
      <th>Download Marksheet</th>
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
                    {editMode[student.id] ? (
                      <input
                        type="number"
                        value={marks[student.id]?.[subject.id] || ""}
                        onChange={(e) => handleMarksChange(student.id, subject.id, Number(e.target.value))}
                      />
                    ) : (
                      // Check if the student has marks; if not, show input field for first-time entry
                      fetchedMarks.find((mark) => mark.studentId === student.id && mark.subjectId === subject.id)
                        ? fetchedMarks.find((mark) => mark.studentId === student.id && mark.subjectId === subject.id)
                            ?.obtainedMarks || "N/A"
                        : (
                            <input
                              type="number"
                              value={marks[student.id]?.[subject.id] || ""}
                              onChange={(e) => handleMarksChange(student.id, subject.id, Number(e.target.value))}
                            />
                        )
                    )}
                  </td>
                ))}
                <td>
                  {fetchedMarks.some((mark) => mark.studentId === student.id) ? (
                    <button onClick={() => (editMode[student.id] ? handleSave(student.id) : handleEdit(student.id))}>
                      {editMode[student.id] ? "Save" : "Edit"}
                    </button>
                  ) : (
                    <button onClick={() => handleSubmit(student.id)}>Submit</button>
                  )}
                </td>
                <td>{calculatePercentage(student.id) + "%"}</td>
                <td>
                <button onClick={() => handleDownload(student)}>Download</button>
</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default Marks;
