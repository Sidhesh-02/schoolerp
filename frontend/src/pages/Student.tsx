import React, { useState } from "react";
import { createStudent, uploadPhoto } from "../utils/api";
import "../styles/student.css";
import UploadStudents from "../components/Student/AppendStudentExcel";

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
  pendingAmount: number;
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
        pendingAmount: 0,
      },
    ],
  });

  const handleSubmit = async () => {
    try {
      const data = await createStudent(student);
      console.log(data);
      alert("Student created successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to create student");
    }
  };

  const handleParentChange = (
    e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>,
    index: number
  ) => {
    const { name, value } = e.target;
    const newParents = [...student.parents];
    newParents[index] = { ...newParents[index], [name]: value };
    setStudent((prev) => ({ ...prev, parents: newParents }));
  };

  const handleFeeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const { name, value } = e.target;
    const newFees = [...student.fees];
    newFees[index] = { ...newFees[index], [name]: value };
    setStudent((prev) => ({ ...prev, fees: newFees }));
  };

  const handleFeeChange2 = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    index: number
  ) => {
    const { name, value } = e.target;
    const newFees = [...student.fees];
    
    if (name === "installmentType") {
      let amount = 0;
      switch (value) {
        case "Total":
          amount = 10500;
          break;
        case "1st":
          amount = 5000;
          break;
        case "2nd":
          amount = 3500;
          break;
        case "3rd":
          amount = 2000;
          break;
        default:
          amount = 0;
          break;
      }
  
      newFees[index] = { ...newFees[index], [name]: value, amount };
    } else {
      newFees[index] = { ...newFees[index], [name]: value };
    }
  
    // Calculate the new pending amount
    const totalPaid = newFees.reduce((acc, fee) => acc + fee.amount, 0);
    const totalAmount = 10500; // Total amount for all installments
    const updatedPendingAmount = totalAmount - totalPaid;
  
    newFees[index] = { ...newFees[index], pendingAmount: Math.max(updatedPendingAmount, 0) };
  
    setStudent((prev) => ({ ...prev, fees: newFees }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const photoUrl = await uploadPhoto(file);
        setStudent((prev) => ({ ...prev, photoUrl }));
      } catch (error) {
        console.error(error);
        alert('Failed to upload image');
      }
    }
  };

  return (
    <div>
      <div className="global-container">
          <UploadStudents/>
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
              setStudent((v) => ({ ...v, fullName: e.target.value }));
            }}
          />
        </div>
        <div>
          <label>Gender</label>
          <select
            name="gender"
            value={student.gender}
            onChange={(e) =>
              setStudent((v) => ({ ...v, gender: e.target.value }))
            }
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <div>
          <label>Date of Birth</label>
          <input
            className="studentInput"
            type="date"
            name="dateOfBirth"
            value={student.dateOfBirth}
            onChange={(e) =>
              setStudent((v) => ({ ...v, dateOfBirth: e.target.value }))
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
              setStudent((v) => ({ ...v, rollNo: e.target.value }))
            }
          />
        </div>

        <label>Standard</label>
        <select
          name="standard"
          value={student.standard}
          onChange={(e) =>
            setStudent((v) => ({ ...v, standard: e.target.value }))
          }
        >
          <option value="">Select standard</option>
          <option value="lkg1">Lkg1</option>
          <option value="kg1">kg1</option>
          <option value="kg2">kg2</option>
          <option value="1st">1st</option>
          <option value="2nd">2nd</option>
          <option value="3rd">3rd</option>
          <option value="4th">4th</option>
          <option value="5th">5th</option>
        </select>

        <div>
          <label>Adhaar Card No</label>
          <input
            className="StudentInput"
            type="text"
            name="adhaarCardNo"
            maxLength={12}
            required
            value={student.adhaarCardNo}
            onChange={(e) =>
              setStudent((v) => ({ ...v, adhaarCardNo: e.target.value }))
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
              setStudent((v) => ({ ...v, scholarshipApplied: e.target.checked }))
            }
          />
        </div>
        <div>
          <label>Address</label>
          <textarea
            name="address"
            value={student.address}
            onChange={(e) =>
              setStudent((v) => ({ ...v, address: e.target.value }))
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
                type="text"
                name="fatherContact"
                value={parent.fatherContact}
                onChange={(e) => handleParentChange(e, index)}
                maxLength={10}
                minLength={10}
              />
              <label>Mother Contact</label>
              <input
                className="StudentInput"
                type="text"
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
                <option value="Total">Total</option>
                <option value="1st">1st</option>
                <option value="2nd">2nd</option>
                <option value="3rd">3rd</option>
              </select>

              <label>Amount</label>
              <input
                className="studentInput"
                type="number"
                name="amount"
                value={fee.amount}
                onChange={(e) => handleFeeChange(e, index)}
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
              <label>Pending Amount</label>
              <input
                className="studentInput"
                type="number"
                name="pendingAmount"
                value={fee.pendingAmount}
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
