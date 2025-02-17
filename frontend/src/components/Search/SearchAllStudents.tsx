import { useState } from 'react';
import { fetchAllStudents } from '../../apis/api';
import { useRecoilValue } from 'recoil';
import { standardList } from '../../store/store';
import GetBonafide from './GetBonafide';
import GetTransferCertificate from './GetTransferCertificate';

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
}

const Searchall = () => {
  const [std, setStd] = useState<string>("");
  const [result, setResult] = useState<Student[]>([]);
  const standards = useRecoilValue(standardList);
  const search = async () => {
    try {
      const data = await fetchAllStudents(std);
      if(data.length === 0){
        alert("No Student Found");
      }
      setResult(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <h2>Search Students By Standard</h2>
      <div>
        <label>Select Standard</label>
        <select value={std} onChange={(e) => setStd(e.target.value)}>
          <option value="">Select Standard</option>
          {standards.map((standard: string) => (
            <option key={standard} value={standard}>
              {standard}
            </option>
          ))}
        </select>
        <button onClick={search}>Search</button> &nbsp;
        <button onClick={() => { setStd(""); setResult([]); }}>Clear</button>
      </div>

      {result.length > 0 && (
        <div style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid #ddd", marginTop: "10px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ position: "sticky", top: 0, background: "#f9f9f9", zIndex: 1 }}>
              <tr>
                <th>Full Name</th>
                <th>Date of Birth</th>
                <th>Adhaar Card No</th>
                <th>Address</th>
                <th>Gender</th>
                <th>Roll No</th>
                <th>Scholarship Applied</th>
                <th>Standard</th>
                <th>Bonafide Certificate</th>
                <th>Transfer Certificate</th>
              </tr>
            </thead>
            <tbody>
              {result.map((e: Student) => {
                const formattedDate = new Date(e.dateOfBirth).toISOString().split('T')[0];
                const scholarshipApplied: string = e.scholarshipApplied ? "True" : "False";
                return (
                  <tr key={e.rollNo}>
                    <td>{e.fullName}</td>
                    <td>{formattedDate}</td>
                    <td>{e.adhaarCardNo}</td>
                    <td>{e.address}</td>
                    <td>{e.gender}</td>
                    <td>{e.rollNo}</td>
                    <td>{scholarshipApplied}</td>
                    <td>{e.standard}</td>
                    <td><GetBonafide rollNo={parseInt(e.rollNo)} standard={e.standard} /></td>
                    <td><GetTransferCertificate rollNo={parseInt(e.rollNo)} standard={e.standard} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Searchall;
