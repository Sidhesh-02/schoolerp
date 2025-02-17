import React, { useCallback, useEffect, useState } from "react";
import { createStudent, uploadPhoto } from "../apis/api";
import "../styles/student.css";
import UploadStudents from "../components/Student/AppendStudentExcel";
import StudentsInfoDownload from "../components/Student/RetriveStudentExcel";
import axios from "axios";
import { useRecoilValue } from "recoil";
import { installmentArr } from "../store/store";

interface Student {
  fullName: string;
  gender: string;
  dateOfBirth: string;
  rollNo: string;
  standard: string;
  adhaarCardNo: string;
  scholarshipApplied: boolean;
  photoUrl?: string;
  address: string;
  remark:string;
  category:string;
  caste:string,
  parents: Parent[];
  fees: Fee[];
}

interface Parent {
  studentId: number;
  fatherName: string;
  fatherOccupation: string;
  motherName: string;
  motherOccupation: string;
  fatherContact: string;
  motherContact: string;
  address: string;
}

interface Fee {
  installmentType: string;
  amount: number;
  amountDate: string;
  admissionDate: string;
}

const Student: React.FC = () => {
  
  const [student, setStudent] = useState<Student>({
    fullName: "",
    gender: "Male",
    dateOfBirth: "",
    rollNo: "",
    standard: "",
    adhaarCardNo: "",
    scholarshipApplied: false,
    address: "",
    photoUrl: "",
    category: "",
    caste:"",
    parents: [
      {
        fatherName: "",
        fatherOccupation: "",
        motherName: "",
        motherOccupation: "",
        fatherContact: "",
        motherContact: "",
        address: "",
        studentId: 0,
      },
    ],
    fees: [
      {
        installmentType: "",
        amount: 0,
        amountDate: "",
        admissionDate: "",
      },
    ],
    remark :""
  });
  const [standard,setStandard] = useState(["1st"]);
  const installmentArray = useRecoilValue(installmentArr);
  useEffect(()=>{
    async function fetchStandards (){
      try {
        const response = await axios.get("http://localhost:5000/standards");
        const standards = response.data?.standard || [];
        const standardArr = standards.map((ele: { std: string; id:number }) => ele.std);
        setStandard(standardArr);
      } catch (error) {
        console.error("Error fetching standards:", error);
        throw error;
      }
    }
    fetchStandards();
  },[])
  
  

  const handleSubmit = async () => {
    try {
      await createStudent(student);
      alert("Student created successfully");
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Failed to create student");
    }
  };

  const handleParentChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
      const { name, value } = e.target;
      const newParents = [...student.parents];
      newParents[index] = { ...newParents[index], [name]: value };
      setStudent((prev) => ({ ...prev, parents: newParents }));
    },
    [student]
  );
  

  const handleFeeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const { name, value } = e.target;
    const newFees = [...student.fees];
    newFees[index] = { ...newFees[index], [name]: value };
    setStudent((prev) => ({ ...prev, fees: newFees }));
  };

  const handleFeeChange2 = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, index: number) => {
    const { name, value } = e.target;
    const updatedFees = [...student.fees]; // Create a copy of the fees array
    
    // Update the fee object at the specified index with the new value
    updatedFees[index] = { ...updatedFees[index], [name]: value };
    
    // Set the updated fees back into the student state
    setStudent((prevState) => ({
      ...prevState,
      fees: updatedFees, // Update only the fees field
    }));
  };
  


  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const photoUrl = await uploadPhoto(file);
        setStudent((prev) => ({ ...prev, photoUrl }));
      } catch (error) {
        console.error("Error uploading image:", error);
        alert('Failed to upload image');
      }
    }
  };

  return (
    <div>
      <div className="global-container">
      <div className="import_export">
          <div className="innerbox"> 
               <StudentsInfoDownload />
          </div>
          <div className="innerbox">
              <UploadStudents/>
          </div>
        </div>
      
      </div>
      <div className="global-container">
        <h2>Create Student Profile</h2>
        <div>
          <label>Upload Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e)}
          />
        </div>
        <div>
          <label>Full Name</label>
          <input
            className="StudentInput"
            type="text"
            name="fullName"
            value={student.fullName}
            onChange={(e) => {
              setStudent((prev) => ({ ...prev, fullName: e.target.value }));
            }}
          />
        </div>
        <div>
          <label>Gender</label>
          <select
            name="gender"
            value={student.gender}
            onChange={(e) =>
              setStudent((prev) => ({ ...prev, gender: e.target.value }))
            }
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div>
          <label>Category</label>
          <input
            className="studentInput"
            type="text"
            name="category"
            value={student.category}
            onChange={(e) =>
              setStudent((prev) => ({ ...prev, category: e.target.value }))
            }
          />
        </div>
        <div>
          <label>Caste</label>
          <input
            className="studentInput"
            type="text"
            name="caste"
            value={student.caste}
            onChange={(e) =>
              setStudent((prev) => ({ ...prev, caste: e.target.value }))
            }
          />
        </div>
        <div>
          <label>Date of Birth</label>
          <input
            className="studentInput"
            type="date"
            name="dateOfBirth"
            value={student.dateOfBirth}
            onChange={(e) =>
              setStudent((prev) => ({ ...prev, dateOfBirth: e.target.value }))
            }
          />
        </div>
        <div>
          <label>Roll No</label>
          <input
            className="StudentInput"
            type="text"
            name="rollNo"
            value={student.rollNo}
            onChange={(e) =>
              setStudent((prev) => ({ ...prev, rollNo: e.target.value }))
            }
          />
        </div>
        <label>Standard</label>
        <select
          name="standard"
          value={student.standard}
          onChange={(e) =>
            setStudent((prev) => ({ ...prev, standard: e.target.value }))
          }
        >
          <option value="">Select standard</option>
          {standard.map((ele,key)=>(
            <option key={key}>{ele}</option>
          ))}
        </select>

        <div>
          <label>Adhaar Card No</label>
          <input
            className="StudentInput"
            type="text"
            name="adhaarCardNo"
            maxLength={12}
            value={student.adhaarCardNo}
            onChange={(e) =>
              setStudent((prev) => ({ ...prev, adhaarCardNo: e.target.value }))
            }
          />
        </div>
        <div>
          <label>Scholarship Applied</label>
          <input
            type="checkbox"
            name="scholarshipApplied"
            checked={student.scholarshipApplied}
            onChange={(e) =>
              setStudent((prev) => ({ ...prev, scholarshipApplied: e.target.checked }))
            }
          />
        </div>
        <div>  
          {student.scholarshipApplied && (
            <div>
              <label>Remark</label>
              <input
                type="text"
                name="remark"
                value={student.remark}
                onChange={(e) =>
                  setStudent((prev) => ({ ...prev, remark: e.target.value }))
                }
              />
            </div>
          )}
        </div>
        <div>
          <label>Address</label>
          <textarea
            name="address"
            value={student.address}
            onChange={(e) =>
              setStudent((prev) => ({ ...prev, address: e.target.value }))
            }
          ></textarea>
        </div>
        <div>
          <h3>Parents</h3>
          {student.parents.map((parent, index) => (
            <div key={index}>
              <label>Father Name</label>
              <input
                className="StudentInput"
                type="text"
                name="fatherName"
                value={parent.fatherName}
                onChange={(e) => handleParentChange(e, index)}
              />
              <label>Father Occupation</label>
              <input
                className="StudentInput"
                type="text"
                name="fatherOccupation"
                value={parent.fatherOccupation}
                onChange={(e) => handleParentChange(e, index)}
              />
              <label>Mother Name</label>
              <input
                className="StudentInput"
                type="text"
                name="motherName"
                value={parent.motherName}
                onChange={(e) => handleParentChange(e, index)}
              />
              <label>Mother Occupation</label>
              <input
                className="StudentInput"
                type="text"
                name="motherOccupation"
                value={parent.motherOccupation}
                onChange={(e) => handleParentChange(e, index)}
              />
              <label>Father Contact</label>
              <input
                className="StudentInput"
                type="number"
                name="fatherContact"
                value={parent.fatherContact}
                onChange={(e) => handleParentChange(e, index)}
                maxLength={10}
                minLength={10}
              />
              <label>Mother Contact</label>
              <input
                className="StudentInput"
                type="number"
                name="motherContact"
                value={parent.motherContact}
                onChange={(e) => handleParentChange(e, index)}
                maxLength={10}
                minLength={10}
              />
              <label>Address</label>
              <textarea
                className="StudentInput"
                name="address"
                value={parent.address}
                onChange={(e) => handleParentChange(e, index)}
              ></textarea>
            </div>
          ))}
        </div>
        <div>
          <h3>Fees</h3>
          {student.fees.map((fee, index) => (
            <div key={index}>
              <label>Installment Type</label>
              <select
                name="installmentType"
                value={fee.installmentType}
                onChange={(e) => handleFeeChange2(e, index)}
              >
                <option disabled>Select Type</option>
                <option value="">Select installment type</option>
                {installmentArray.map((ele,id)=>(
                  <option key={id} value={ele}>{ele}</option>
                ))}
              </select>

              <label>Amount</label>
              <input
                className="studentInput"
                type="number"
                name="amount"
                value={fee.amount}
                onChange={(e) => handleFeeChange(e, index)} // This will allow the user to input the value manually
              />

              <label>Amount Date</label>
              <input
                className="studentInput"
                type="date"
                name="amountDate"
                value={fee.amountDate}
                onChange={(e) => handleFeeChange(e, index)}
              />
              <label>Admission Date</label>
              <input
                className="studentInput"
                type="date"
                name="admissionDate"
                value={fee.admissionDate}
                onChange={(e) => handleFeeChange(e, index)}
              />
            </div>
          ))}
        </div>
        <button type="button" onClick={handleSubmit}>
          Submit
        </button>
      </div>
    </div>
  );
};

export default Student;
