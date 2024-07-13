import React, { useState } from "react";
import "../styles/fee.css";
import axios from "axios";
import FeeReicpts from "../components/FeeReicpts";

interface Fee {
  title: string;
  amount: number;
  amountDate: string;
  admissionDate: string;
  pendingAmount: number;
}

interface Student {
  id: number;
  fullName: string;
  rollNo: number;
  standard: string;
  fees: Fee[];
}

const Fees: React.FC = () => {
  const [standard, setStandard] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);

  const [newInstallment, setNewInstallment] = useState<Fee>({
    title: "",
    amount: 0,
    amountDate: "",
    admissionDate: "",
    pendingAmount: 0,
  });

  const search = async () => {
    try {
      if (!standard || !rollNo) {
        alert("Please enter both Standard and Roll_no.");
        return;
      }

      setLoading(true);

      const res = await axios.get("http://localhost:5000/fees/details", {
        params: {
          standard: standard.trim(),
          roll_no: rollNo.trim(),
        },
      });

      if (res.data && !res.data.error) {
        setStudent(res.data);
      } else {
        setStudent(null);
        alert("Student does not exist");
      }
    } catch (error) {
      console.error("Error fetching fees details", error);
      alert(
        "An error occurred while fetching fees details. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setStandard("");
    setRollNo("");
    setStudent(null);
  };

 

  const handleAddInstallmentChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    let amount = newInstallment.amount;

    if (name === "title") {
      switch (value) {
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
    }

    setNewInstallment((prev) => ({
      ...prev,
      [name]: value,
      amount: name === "title" ? amount : prev.amount,
    }));
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

  const addInstallment = async () => {
    try {
      if (!student) {
        alert("No student data available.");
        return;
      }

      const pendingAmount = calculatePendingAmount();
      if (pendingAmount <= 0) {
        alert("No pending fees. The student has completed all payments.");
        return;
      }
      const updatedInstallment = {
        ...newInstallment,
        admissionDate: student.fees[0].admissionDate,
        pendingAmount: pendingAmount - newInstallment.amount,
        studentId: student.id,
      };

      const res = await axios.post(
        "http://localhost:5000/fees/add",
        updatedInstallment
      );

      if (res.data && !res.data.error) {
        setStudent((prevStudent) => {
          if (prevStudent) {
            return {
              ...prevStudent,
              fees: [...prevStudent.fees, updatedInstallment],
            };
          }
          return prevStudent;
        });
        setNewInstallment({
          title: "",
          amount: 0,
          amountDate: "",
          admissionDate: "",
          pendingAmount: 0,
        });
      } else {
        alert("Failed to add installment");
      }
    } catch (error) {
      console.error("Error adding installment", error);
      alert(
        "An error occurred while adding installment. Please try again later."
      );
    }
  };

  return (
    <div>
      <div className="fee-container">
        <h1 className="fee-header">Fee System</h1>
        <div className="fee-form">
          <div>
            <label>Standard</label>
            <select
              name="standard"
              value={standard}
              onChange={(e) => setStandard(e.target.value)}
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
          </div>
          
          <input
            type="text"
            placeholder="Roll No"
            className="FeeInput"
            value={rollNo}
            onChange={(e) => setRollNo(e.target.value)}
            required
            disabled={loading}
          />
          
          <div className="fee-buttons">
            <button onClick={search} style={{ marginRight: "20px" }} disabled={loading}>
              Search
            </button>
            <button onClick={clearForm} style={{ marginRight: "20px" }} disabled={loading}>
              Clear
            </button>
          </div>
        </div>
      </div>

      {student && (
        <div>

          <div className="fee-container">
            <h3>Name: {student.fullName}</h3>
            <h3>Roll No: {student.rollNo}</h3>
            <h3>Standard: {student.standard}</h3>
            <h3>Fees:</h3>
            {student.fees.map((fee, index) => (
              <div key={index} style={{ marginBottom: '10px', paddingLeft: '20px' }}>
                <h4>Title: {fee.title}</h4>
                <p>Amount: {fee.amount}</p>
                <p>Amount Date: {fee.amountDate}</p>
                <p>Admission Date: {fee.admissionDate}</p>
                <p>Pending Amount: {fee.pendingAmount}</p>
              </div>
            ))}
          </div>

          <div className="fee-container">
            <h2>Add New Installment</h2>
            <div>
              <label>Installment Type</label>
              <select
                name="title"
                value={newInstallment.title}
                onChange={handleAddInstallmentChange}
              >
                <option value="">Select installment type</option>
                <option value="2nd">2nd Installment</option>
                <option value="3rd">3rd Installment</option>
              </select>
            </div>
            <div>
              <label>Amount</label>
              <input
                type="number"
                name="amount"
                className="FeeInput"
                value={newInstallment.amount}
                onChange={handleAddInstallmentChange}
              />
            </div>
            <div>
              <label>Amount Date</label>
              <input
                type="date"
                name="amountDate"
                className="FeeInput"
                value={newInstallment.amountDate}
                onChange={handleAddInstallmentChange}
              />
            </div>
            <button onClick={addInstallment}>Add Installment</button>
          </div>
          <div className="fee-container">
            <FeeReicpts id={student.id} name={student.fullName} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Fees;
