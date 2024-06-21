import React, { useState} from 'react';
import axios from 'axios';

interface Student {
  id?: number;
  fullName: string;
  gender: string;
  dateOfBirth: string;
  rollNo: string;
  standard: string;
  adhaarCardNo: string;
  scholarshipApplied: boolean;
  address: string;
  parents: Parent[];
  fees: Fee[];
}

interface Parent {
  fatherName: string;
  fatherOccupation: string;
  motherName: string;
  motherOccupation: string;
  fatherContact: string;
  motherContact: string;
  address: string;
}

interface Fee {
  title: string;
  amount: number;
  amountDate: string;
  admissionDate: string;
  pendingAmount: number;
}


const Student: React.FC = () => {
  const [student, setStudent] = useState<Student>({
    fullName: '',
    gender: 'Male',
    dateOfBirth: '',
    rollNo: '',
    standard: '',
    adhaarCardNo: '',
    scholarshipApplied: false,
    address: '',
    parents: [{
      fatherName: '',
      fatherOccupation: '',
      motherName: '',
      motherOccupation: '',
      fatherContact: '',
      motherContact: '',
      address: '',
    }],
    fees: [{
      title: '',
      amount: 0,
      amountDate: '',
      admissionDate: '',
      pendingAmount: 0,
    }],
  });
  const [searchRollNo, setSearchRollNo] = useState('');
  const [searchResult, setSearchResult] = useState<Student | null>(null);

  const handleSubmit = async () => {
    try {
      const response = await axios.post('http://localhost:5000/students', student);
      console.log(response)
      alert('Student created successfully');
    } catch (error) {
      console.error('Error creating student:', error);
      alert('Failed to create student');
    }
  };

  const handleParentChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>, index: number) => {
    const { name, value } = e.target;
    const newParents = [...student.parents];
    newParents[index] = { ...newParents[index], [name]: value };
    setStudent(prev => ({ ...prev, parents: newParents }));
  };

  const handleFeeChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { name, value } = e.target;
    const newFees = [...student.fees];
    newFees[index] = { ...newFees[index], [name]: value };
    setStudent(prev => ({ ...prev, fees: newFees }));
  };


  const handleSearch = async () => {
    try {
      const response = await axios.get<Student>(`http://localhost:5000/students/rollNo/${searchRollNo}`);
      console.log("Response Data -",response.data)
      setSearchResult(response.data);
    } catch (error) {
      console.error('Error fetching student:', error);
      alert('Failed to fetch student');
    }
  };

  return (
    <div>
      <h2>Create Student Profile</h2>
      <div>
        <label>Full Name</label>
        <input type="text" name="fullName" value={student.fullName} onChange={(e) => {setStudent(v =>({...v ,fullName:e.target.value}))}} />
      </div>
      <div>
        <label>Gender</label>
        <select name="gender" value={student.gender} onChange={(e) => (setStudent(v => ({...v, gender:e.target.value})))}>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
      </div>
      <div>
        <label>Date of Birth</label>
        <input type="date" name="dateOfBirth" value={student.dateOfBirth} onChange={(e) => (setStudent(v => ({...v, dateOfBirth:e.target.value})))} />
      </div>
      <div>
        <label>Roll No</label>
        <input type="text" name="rollNo" value={student.rollNo} onChange={(e) => (setStudent(v => ({...v, rollNo:e.target.value})))} />
      </div>
      <div>
        <label>Standard</label>
        <input type="text" name="standard" value={student.standard} onChange={(e) => (setStudent(v => ({...v, standard:e.target.value})))} />
      </div>
      <div>
        <label>Adhaar Card No</label>
        <input type="text" name="adhaarCardNo" value={student.adhaarCardNo} onChange={(e) => (setStudent(v => ({...v, adhaarCardNo:e.target.value})))} />
      </div>
      <div>
        <label>Scholarship Applied</label>
        <input type="checkbox" name="scholarshipApplied" checked={student.scholarshipApplied} onChange={(e) => (setStudent(v => ({...v, scholarshipApplied:e.target.checked})))} />
      </div>
      <div>
        <label>Address</label>
        <textarea name="address" value={student.address} onChange={(e) => (setStudent(v => ({...v, address:e.target.value})))}></textarea>
      </div>

      <h3>Parent Information</h3>
      {student.parents.map((parent, index) => (
        <div key={index}>
          <div>
            <label>Father Name</label>
            <input type="text" name="fatherName" value={parent.fatherName} onChange={(e) => handleParentChange(e, index)} />
          </div>
          <div>
            <label>Father Occupation</label>
            <input type="text" name="fatherOccupation" value={parent.fatherOccupation} onChange={(e) => handleParentChange(e, index)} />
          </div>
          <div>
            <label>Mother Name</label>
            <input type="text" name="motherName" value={parent.motherName} onChange={(e) => handleParentChange(e, index)} />
          </div>
          <div>
            <label>Mother Occupation</label>
            <input type="text" name="motherOccupation" value={parent.motherOccupation} onChange={(e) => handleParentChange(e, index)} />
          </div>
          <div>
            <label>Father Contact</label>
            <input type="text" name="fatherContact" value={parent.fatherContact} onChange={(e) => handleParentChange(e, index)} />
          </div>
          <div>
            <label>Mother Contact</label>
            <input type="text" name="motherContact" value={parent.motherContact} onChange={(e) => handleParentChange(e, index)} />
          </div>
          <div>
            <label>Address</label>
            <textarea name="address" value={parent.address} onChange={(e) => handleParentChange(e, index)}></textarea>
          </div>
        </div>
      ))}

      <h3>Fees Information</h3>
      {student.fees.map((fee, index) => (
        <div key={index}>
          <div>
            <label>Title</label>
            <input type="text" name="title" value={fee.title} onChange={(e) => handleFeeChange(e, index)} />
          </div>
          <div>
            <label>Amount</label>
            <input type="number" name="amount" value={fee.amount} onChange={(e) => handleFeeChange(e, index)} />
          </div>
          <div>
            <label>Amount Date</label>
            <input type="date" name="amountDate" value={fee.amountDate} onChange={(e) => handleFeeChange(e, index)} />
          </div>
          <div>
            <label>Admission Date</label>
            <input type="date" name="admissionDate" value={fee.admissionDate} onChange={(e) => handleFeeChange(e, index)} />
          </div>
          <div>
            <label>Pending Amount</label>
            <input type="number" name="pendingAmount" value={Number(fee.pendingAmount)} onChange={(e) => handleFeeChange(e, index)} />
          </div>
        </div>
      ))}

      <button onClick={handleSubmit}>Create Student</button>

      <h2>Search Student</h2>
      <div>
        <input type="number" placeholder="Enter Roll No" value={searchRollNo} onChange={(e) => setSearchRollNo(e.target.value)} />
        <button onClick={handleSearch}>Search</button>
      </div>
      {searchResult && (
        <div>
          <h3>Student Profile</h3>
          <p><strong>Full Name:</strong> {searchResult.fullName}</p>
          <p><strong>Gender:</strong> {searchResult.gender}</p>
          <p><strong>Date of Birth:</strong> {searchResult.dateOfBirth}</p>
          <p><strong>Roll No:</strong> {searchResult.rollNo}</p>
          <p><strong>Class:</strong> {searchResult.standard}</p>
          <p><strong>Adhaar Card No:</strong> {searchResult.adhaarCardNo}</p>
          <p><strong>Scholarship Applied:</strong> {searchResult.scholarshipApplied ? 'Yes' : 'No'}</p>
          <p><strong>Address:</strong> {searchResult.address}</p>

          <h4>Parents Information</h4>
          {searchResult.parents.map((parent, index) => (
            <div key={index}>
              <p><strong>Father Name:</strong> {parent.fatherName}</p>
              <p><strong>Father Occupation:</strong> {parent.fatherOccupation}</p>
              <p><strong>Mother Name:</strong> {parent.motherName}</p>
              <p><strong>Mother Occupation:</strong> {parent.motherOccupation}</p>
              <p><strong>Father Contact:</strong> {parent.fatherContact}</p>
              <p><strong>Mother Contact:</strong> {parent.motherContact}</p>
              <p><strong>Address:</strong> {parent.address}</p>
            </div>
          ))}

          <h4>Fees Information</h4>
          {searchResult.fees.map((fee, index) => (
            <div key={index}>
              <p><strong>Title:</strong> {fee.title}</p>
              <p><strong>Amount:</strong> {fee.amount}</p>
              <p><strong>Amount Date:</strong> {fee.amountDate}</p>
              <p><strong>Admission Date:</strong> {fee.admissionDate}</p>
              <p><strong>Pending Amount:</strong> {fee.pendingAmount}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Student;
