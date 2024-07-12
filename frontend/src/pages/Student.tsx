import React, { useState } from "react";
import axios from "axios";
import "../styles/student.css";
import UploadStudents from "../components/UploadStudents";

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
      const response = await axios.post("http://localhost:5000/students", student);
      console.log(response.data);
      alert("Student created successfully");
    } catch (error) {
      console.error("Error creating student:", error);
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

  const calculatePendingAmount = () => {
    if (student) {
      const totalPaid = student.fees.reduce((acc, fee) => acc + fee.amount, 0);
      const totalAmount = 10500; // assuming the total fee is 10500
      const pendingAmount = totalAmount - totalPaid;
      return pendingAmount;
    }
    return 0;
  };

  const handleFeeChange2 = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    index: number
  ) => {
    const { name, value } = e.target;

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

      const pendingAmount = calculatePendingAmount();
      if (pendingAmount <= 0) {
        alert("No pending fees. The student has completed all payments.");
        return;
      }

      const newFees = [...student.fees];
      newFees[index] = { ...newFees[index], [name]: value, amount, pendingAmount : pendingAmount-amount };
      setStudent((prev) => ({ ...prev, fees: newFees }));
    } else {
      const { name, value } = e.target;
      const newFees = [...student.fees];
      newFees[index] = { ...newFees[index], [name]: value };
      setStudent((prev) => ({ ...prev, fees: newFees }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axios.post<string>('http://localhost:5000/uploadPhoto', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setStudent((prev) => ({ ...prev, photoUrl: response.data }));
      } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image');
      }
    }
  };

  return (
    <div>
      <div style={{backgroundColor : "#f4f4f4", padding : "15px", borderRadius: "4px"}}>
          <UploadStudents/>
      </div>
      <div style={{backgroundColor : "#f4f4f4", padding : "15px", borderRadius: "4px", marginTop:"10px"}}>
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

        <h3>Parent Information</h3>
        {student.parents.map((parent, index) => (
          <div key={index}>
            <div>
              <label>Father Name</label>
              <input
                className="StudentInput"
                type="text"
                name="fatherName"
                value={parent.fatherName}
                onChange={(e) => handleParentChange(e, index)}
              />
            </div>
            <div>
              <label>Father Occupation</label>
              <input
                className="StudentInput"
                type="text"
                name="fatherOccupation"
                value={parent.fatherOccupation}
                onChange={(e) => handleParentChange(e, index)}
              />
            </div>
            <div>
              <label>Mother Name</label>
              <input
                className="StudentInput"
                type="text"
                name="motherName"
                value={parent.motherName}
                onChange={(e) => handleParentChange(e, index)}
              />
            </div>
            <div>
              <label>Mother Occupation</label>
              <input
                className="StudentInput"
                type="text"
                name="motherOccupation"
                value={parent.motherOccupation}
                onChange={(e) => handleParentChange(e, index)}
              />
            </div>
            <div>
              <label>Father Contact</label>
              <input
                className="StudentInput"
                type="text"
                name="fatherContact"
                value={parent.fatherContact}
                onChange={(e) => handleParentChange(e, index)}
              />
            </div>
            <div>
              <label>Mother Contact</label>
              <input
                className="StudentInput"
                type="text"
                name="motherContact"
                value={parent.motherContact}
                onChange={(e) => handleParentChange(e, index)}
              />
            </div>
            <div>
              <label>Address</label>
              <textarea
                name="address"
                value={parent.address}
                onChange={(e) => handleParentChange(e, index)}
              ></textarea>
            </div>
          </div>
        ))}

        <h3>Fee Information</h3>
        {student.fees.map((fee, index) => (
          <div key={index}>
            <div>
              <label>Installment Type</label>
              <select
                name="installmentType"
                value={fee.installmentType}
                onChange={(e) => handleFeeChange2(e, index)}
              >
                <option value="">Select Installment</option>
                <option value="Total">Total</option>
                <option value="1st">1st</option>
                <option value="2nd">2nd</option>
                <option value="3rd">3rd</option>
              </select>
            </div>
            <div>
              <label>Amount</label>
              <input
                className="StudentInput"
                type="number"
                name="amount"
                value={fee.amount}
                onChange={(e) => handleFeeChange(e, index)}
              />
            </div>
            <div>
              <label>Amount Date</label>
              <input
                className="StudentInput"
                type="date"
                name="amountDate"
                value={fee.amountDate}
                onChange={(e) => handleFeeChange(e, index)}
              />
            </div>
            <div>
              <label>Admission Date</label>
              <input
                className="StudentInput"
                type="date"
                name="admissionDate"
                value={fee.admissionDate}
                onChange={(e) => handleFeeChange(e, index)}
              />
            </div>
            <div>
              <label>Pending Amount</label>
              <input
                className="StudentInput"
                type="number"
                name="pendingAmount"
                value={fee.pendingAmount}
                onChange={(e) => handleFeeChange(e, index)}
              />
            </div>
          </div>
        ))}
        <button onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  );
};

export default Student;
