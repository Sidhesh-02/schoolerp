import React, { useState } from "react";
import axios from "axios";
import "../styles/feesc.css";
interface Fee {
  title: string;
  amount: number;
  amountDate: string;
  admissionDate: string;
  pendingAmount: number;
}

interface Student {
  fullName: string;
  rollNo: number;
  fees: Fee[];
}

const Fees: React.FC = () => {
  const [name, setName] = useState("");
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
      if (!name || !rollNo) {
        alert("Please enter both Full Name and Roll_no.");
        return;
      }

      setLoading(true);

      const res = await axios.get("http://localhost:5000/fees/details", {
        params: {
          name: name,
          roll_no: rollNo,
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
    setName("");
    setRollNo("");
    setStudent(null);
  };

  const downloadExcel = async () => {
    try {
      if (!student) {
        alert("No student data available to download.");
        return;
      }

      const downloadUrl = `http://localhost:5000/fees/details?name=${encodeURIComponent(
        name
      )}&roll_no=${encodeURIComponent(rollNo)}&download=true`;
      window.open(downloadUrl, "_blank");
    } catch (error) {
      console.error("Error downloading fees details", error);
      alert(
        "An error occurred while downloading fees details. Please try again later."
      );
    }
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
        studentId: student.id, // assuming student ID is available
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
      <div>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading}
        />
        <br />
        <input
          type="text"
          placeholder="Roll_no"
          value={rollNo}
          onChange={(e) => setRollNo(e.target.value)}
          required
          disabled={loading}
        />
        <br />
        <button onClick={search} disabled={loading}>
          Search
        </button>
        <button onClick={clearForm} disabled={loading}>
          Clear
        </button>
        {student && (
          <button onClick={downloadExcel} disabled={loading}>
            Download Excel
          </button>
        )}
      </div>

      {student && (
        <div>
          <h3>Name: {student.fullName}</h3>
          <h3>Roll no.: {student.rollNo}</h3>
          <h3>Fees:</h3>
          {student.fees.map((fee, index) => (
            <div key={index}>
              <h4>Title: {fee.title}</h4>
              <p>Amount: {fee.amount}</p>
              <p>Amount Date: {fee.amountDate}</p>
              <p>Admission Date: {fee.admissionDate}</p>
              <p>Pending Amount: {fee.pendingAmount}</p>
            </div>
          ))}

          <h3>Add New Installment</h3>
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
              value={newInstallment.amount}
              onChange={handleAddInstallmentChange}
              disabled
            />
          </div>
          <div>
            <label>Amount Date</label>
            <input
              type="date"
              name="amountDate"
              value={newInstallment.amountDate}
              onChange={handleAddInstallmentChange}
            />
          </div>
          <button onClick={addInstallment}>Add Installment</button>
        </div>
      )}
    </div>
  );
};

export default Fees;
