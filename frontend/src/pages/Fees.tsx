import React, { useState } from "react";
import { fetchStudentFees, addFeeInstallment } from "../apis/api";
import "../styles/fee.css";
import FeeReicpts from "../components/Fees/FeeReicpts";
import DownloadFee from "../components/Fees/DownloadFee";
import UploadFee from "../components/Fees/UploadFee";
import { useRecoilValue } from "recoil";
import { installmentArr, standardList, totalFee } from "../store/store";

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
  const standards = useRecoilValue(standardList);
  const [newInstallment, setNewInstallment] = useState<Fee>({
    title: "",
    amount: 0,
    amountDate: "",
    admissionDate: ""
  });
  const installmentArray = useRecoilValue(installmentArr);
  const fee = useRecoilValue(totalFee);
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
      const feeDetails = await fetchStudentFees(standard, rollNo);
      setStudent(feeDetails);
    } catch (error) {
      console.error("Error fetching fees details", error);
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
    setNewInstallment((prev) => ({
      ...prev,
      [name]: value,
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
      let check = false;
      let totalFeesPaid = 0;
      student.fees.forEach((e : Fee) =>{
        totalFeesPaid = totalFeesPaid + e.amount;
        if(e.title === updatedInstallment.title || totalFeesPaid === fee){
          check = true;
        }
      });
      
      if(check){
        alert("Installment already exists, or the full payment has been made.");
        return;
      }
      const installmentStatus = await addFeeInstallment(updatedInstallment);

      if (installmentStatus && !installmentStatus
        .error) {
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
              {standards.map((standard:string) => (
              <option key={standard} value={standard}>
                {standard}
              </option>
              ))}
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
          <div
  style={{
    margin: "20px auto",
    padding: "20px",
  }}
>
  {/* Header */}
  <div
    style={{
      paddingBottom: "10px",
      borderBottom: "2px solid #007BFF",
      marginBottom: "15px",
    }}
  >
    <h2 style={{ margin: 0, color: "#007BFF" }}>Fee Receipt</h2>
  </div>

  {/* Student Info */}
  <div style={{ marginBottom: "15px", lineHeight: "1.6" }}>
    <p><strong>Name:</strong> {student.fullName}</p>
    <p><strong>Roll No:</strong> {student.rollNo}</p>
    <p><strong>Standard:</strong> {student.standard}</p>
  </div>

  {/* Fee Details */}
  <h3 style={{ color: "#333", paddingBottom: "5px" }}>
    Fee Details:
  </h3>

  {student.fees.map((fee, index) => (
    <div
      key={index}
      style={{
        backgroundColor: "#F8F9FA",
        padding: "15px",
        marginTop: "10px",
        border: "1px solid #ddd",
      }}
    >
      <h4 style={{ margin: "5px 0", color: "#007BFF" }}>{fee.title}</h4>
      <p><strong>Amount:</strong> ₹{fee.amount}</p>
      <p><strong>Amount Date:</strong> {formatDateForInput(fee.amountDate)}</p>
      <p><strong>Admission Date:</strong> {formatDateForInput(fee.admissionDate)}</p>
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
                {installmentArray.map((ele,id)=> ele!=="first" && ele!=="1st" && ele!=="First" && (
                  <option key={id} value={ele}>{ele}</option>
                ))}
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
