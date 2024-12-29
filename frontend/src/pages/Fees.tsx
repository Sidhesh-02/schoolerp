import React, { useState } from "react";
import { fetchStudentFees, addFeeInstallment, constants_from_db } from "../apis/api";
import "../styles/fee.css";
import FeeReicpts from "../components/Fees/FeeReicpts";
import DownloadFee from "../components/Fees/DownloadFee";
import UploadFee from "../components/Fees/UploadFee";

interface Fee {
  title: string;
  amount: number;
  amountDate: string;
  admissionDate: string;
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
    admissionDate: ""
  });

  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const search = async () => {
    if (!standard || !rollNo) {
      alert("Please enter both Standard and Roll_no.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetchStudentFees(standard, rollNo);

      if (res.data && !res.data.error) {
        setStudent(res.data);
      } else {
        setStudent(null);
        alert("Student does not exist");
      }
    } catch (error) {
      console.error("Error fetching fees details", error);
      alert("Error, Contact Developer/Check Student Presence");
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setStandard("");
    setRollNo("");
    setStudent(null);
  };

  const handleAddInstallmentChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    let amount = newInstallment.amount;
    
    const resForMis = await constants_from_db();
    
    if (name === "title") {
      switch (value) {
        case "1st" :
          amount = resForMis.data.Installment_one;
          break;
        case "2nd":
          amount = resForMis.data.Installment_two;
          break;
        case "3rd":
          amount = resForMis.data.Installment_three;
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

  const addInstallment = async () => {
    if (!student) {
      alert("No student data available.");
      return;
    }

    const updatedInstallment = {
      ...newInstallment,
      admissionDate: student.fees[0]?.admissionDate ?? new Date(),
      studentId: student.id,
    };
    
    try {
      const res = await addFeeInstallment(updatedInstallment);
      let check = false;
      student.fees.forEach((e : any) =>{
       
          if(e.title === updatedInstallment.title){
            if(e.studentId === updatedInstallment.studentId){
              check = true;
            }
          }
      });
      
      if(check){
        
        alert("Installment Already Exists");
        return;
      }

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
          admissionDate: ""
        });
      } else {
        alert("Failed to add installment");
      }
    } catch (error) {
      console.error("Error adding installment", error);
      alert("An error occurred while adding installment. Please try again later.");
    }
  };

  return (
    <div>
      <div className="fee-container">
        <div className="import_export">
          <div className="innerbox"> 
              <h2>Download Fees Data</h2>
              <DownloadFee/>
          </div>
          <div className="innerbox">
              <h2>Upload Fees data</h2>
              <UploadFee/>
          </div>
        </div>
        
      </div>
      <div className="fee-container">
        <h1 className="fee-header">Fee System</h1>
        <div>
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

          <label>Roll No</label>
          <input
            type="text"
            placeholder="Roll No"
            className="StudentInput"
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
                <p>Amount Date: {formatDateForInput(fee.amountDate)}</p>
                <p>Admission Date: {formatDateForInput(fee.admissionDate)}</p>
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
                <option value="1st">1st Installment</option>
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
