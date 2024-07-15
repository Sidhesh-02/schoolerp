/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import "../styles/marks.css";
import PerformanceChart from "../components/PerformanceChart";
import BarChart from "../components/BarChart";

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

  useEffect(() => {
    const fetchStandards = async () => {
      try {
        const response = await axios.get("http://localhost:5000/getstandards");
        setStandards(response.data.standards);
      } catch (error) {
        console.error("Error fetching standards:", error);
      }
    };

    const fetchSubjects = async () => {
      try {
        const response = await axios.get("http://localhost:5000/getsubjects");
        setSubjects(response.data);
      } catch (error) {
        console.error("Error fetching subjects:", error);
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
      studentName: "", // reset studentName when standard changes
      marks: [], // reset marks when standard changes
    }));

    try {
      const response = await axios.get(
        "http://localhost:5000/getattendancelist",
        {
          params: { standard },
        }
      );
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

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleMarksChange = (
    subjectId: number,
    field: "obtainedMarks" | "totalMarks",
    value: number
  ) => {
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
      const response = await axios.post("http://localhost:5000/add", formData);
      console.log("Marks added:", response.data);
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

  const [rollNo, setRollNo] = useState<number>(0);
  const [std,setStd] = useState<string>('');
  const [search , setSearch] = useState<any>();
  const [Exam,setExam] = useState<string>();
  const [TotalPercentage, setTotalPercentage] = useState<number>(0);
  

  const calculation  = ()=>{
    let marks:number = 0;
    let tmarks:number = 0;
    search.marks.forEach((e  :any ) => {
      if(Exam === e.examinationType){
        marks = marks + e.obtainedMarks;
        tmarks = tmarks + e.totalMarks;
      }
    })
    const finalmarks : number = (marks/tmarks)*100;
    setTotalPercentage(finalmarks);
    
  }
  useEffect(() => {
    if (search && search.marks.length > 0) {
      calculation();
    }
  }, [search, Exam]);

  const submitChange = async()=>{
    console.log(std)
    try{
      const res = await axios.get("http://localhost:5000/marks/search", {
        params:{
          rollNo: rollNo,
          standard : std
        }
      })
      console.log("result: ",JSON.parse(res.data).results);
      setSearch(JSON.parse(res.data).result)
      console.log("search : ",search);

    }catch(error){
        console.log(error)
    }
      
  }


  return (
    <div className="global-container">
      <h1>Add Marks</h1>
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

      <br></br>
      <hr></hr>
      <h1>Search student Marks </h1>
      <input type="number" placeholder="Roll no." onChange={(e)=>{setRollNo(Number(e.target.value))}}/>
      <select
          name="standard"
          onChange={(e) =>{setStd(e.target.value)}}
          required
        >
          <option value="">Select Standard</option>
          {standards.map((standard, index) => (
            <option key={index} value={standard}>
              {standard}
            </option>
          ))}
      </select>
      <select
            name=""
            onChange={(e) =>(setExam(e.target.value))}
            required
          >
            <option value="">Select Examination Type</option>
            <option value="UnitTest">Unit Test</option>
            <option value="MidTerm">Mid Term</option>
            <option value="Final">Final</option>
      </select>
      <button onClick={submitChange} type="submit">Search</button>
      <div>
          {search != null? 
            <div>
              <h3>Marks : </h3>
              <p>{search.fullName}</p>
              <table>
                <thead>
                  <tr>
                    <th>subjectId</th>
                    <th>subjectName</th>
                    <th>obtainedMarks</th>
                    <th>totalMarks</th>
                  </tr>
                </thead>
                
              {search.marks.map((e : any)=>{
                  return(
                    Exam === e.examinationType ? (
                      <tbody>
                      <tr>
                        <td>{e.subjectId}</td>
                        <td>{e.subjectName}</td>
                        <td>{e.obtainedMarks}</td>
                        <td>{e.totalMarks}</td>
                      </tr>
                    </tbody> ) :  (<></>)

                  )
              })}
              </table>
              <br></br>
              <h3>Total Percentage - {TotalPercentage}%</h3>
              
              {search.marks.length > 0 && (
                <>
                  <PerformanceChart marks={search.marks} examType={Exam} /> <br/><br/>
                  <BarChart marks={search.marks} examType={Exam} />
                </>
                
              )}

            </div>
            
          
          :<></>}
      </div>

    </div>
  );
};

export default Marks;
