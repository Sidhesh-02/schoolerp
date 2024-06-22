import React, { useState } from 'react';
import axios from 'axios';

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
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false); // New state for loading indicator

  const search = async () => {
    try {
      if (!name || !rollNo) {
        alert('Please enter both Full Name and Roll_no.');
        return;
      }

      setLoading(true); // Set loading state to true during API call

      const res = await axios.get('http://localhost:5000/fees/details', {
        params: {
          name: name,
          roll_no: rollNo,
        }
      });

      if (res.data && !res.data.error) {
        setStudent(res.data);
      } else {
        setStudent(null); // Clear student state on error
        alert("Student does not exist");
      }
    } catch (error) {
      console.error('Error fetching fees details', error);
      alert('An error occurred while fetching fees details. Please try again later.');
    } finally {
      setLoading(false); // Always set loading state to false after API call
    }
  };

  const clearForm = () => {
    setName('');
    setRollNo('');
    setStudent(null);
  };

  const downloadExcel = async () => {
    try {
      if (!student) {
        alert('No student data available to download.');
        return;
      }

      const downloadUrl = `http://localhost:5000/fees/details?name=${encodeURIComponent(name)}&roll_no=${encodeURIComponent(rollNo)}&download=true`;
      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error('Error downloading fees details', error);
      alert('An error occurred while downloading fees details. Please try again later.');
    }
  };

  return (
    <div>
      <div>
        <input
          type="text"
          placeholder='Full Name'
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading} 
        /><br />
        <input
          type="text"
          placeholder='Roll_no'
          value={rollNo}
          onChange={(e) => setRollNo(e.target.value)}
          required
          disabled={loading} 
        /><br />
        <button onClick={search} disabled={loading}>Search</button>
        <button onClick={clearForm} disabled={loading}>Clear</button>
        {student && (
          <button onClick={downloadExcel} disabled={loading}>Download Excel</button>
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
        </div>
      )}
    </div>
  );
};

export default Fees;
