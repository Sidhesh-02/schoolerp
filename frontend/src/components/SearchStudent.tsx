import React, { useState } from "react";
import axios from "axios";

interface Student {
  id: number;
  fullName: string;
  rollNo: string;
  standard: string;
  photoUrl?: string;
  gender: string;
  dateOfBirth: string;
  adhaarCardNo: string;
  scholarshipApplied: boolean;
  address: string;
  parents: Parent[];
}

interface Parent {
  id: number;
  studentId: number;
  fatherName: string;
  fatherOccupation: string;
  motherName: string;
  motherOccupation: string;
  fatherContact: string;
  motherContact: string;
  address: string;
}

const SearchStudent: React.FC = () => {
  const [rollNo, setRollNo] = useState("");
  const [standard, setStandard] = useState("");
  const [searchResult, setSearchResult] = useState<Student | null>(null);
  const [editableStudent, setEditableStudent] = useState<Student | null>(null);

  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get<Student>(
        "http://localhost:5000/students/rollNo",
        {
          params: {
            rollno: rollNo,
            standard: standard,
          },
        }
      );
      console.log("Response",response.data);
      setSearchResult(response.data);
      setEditableStudent({
        ...response.data,
        dateOfBirth: formatDateForInput(response.data.dateOfBirth),
      });
    } catch (error) {
      console.error("Error fetching student:", error);
      alert("Failed to fetch student");
    }
  };

  const handleDelete = async () => {
    try {
      if (!searchResult?.id) {
        alert("Please search and select a valid student to delete.");
        return;
      }
      await axios.delete("http://localhost:5000/delete/students", {
        params: {
          studentId: searchResult.id,
        },
      });
      alert("Student deleted successfully");
      setSearchResult(null); // Clear the search result after deletion
      setEditableStudent(null); // Clear the editable student state
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("Failed to delete student");
    }
  };

  const handleUpdate = async () => {
    try {
      if (!editableStudent) {
        alert("No student data to update.");
        return;
      }
      console.log("ES",editableStudent);
      await axios.put(`http://localhost:5000/update/student/${editableStudent.id}`, editableStudent);
      alert("Student updated successfully");
      setSearchResult(null);
      setEditableStudent(null);
    } catch (error) {
      console.error("Error updating student:", error);
      alert("Failed to update student");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editableStudent) return;
    const { name, value } = e.target;
    setEditableStudent({
      ...editableStudent,
      [name]: value,
    });
  };

  const handleParentChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editableStudent) return;
    const { name, value } = e.target;
    const updatedParents = editableStudent.parents.map((parent, i) =>
      i === index ? { ...parent, [name]: value } : parent
    );
    setEditableStudent({
      ...editableStudent,
      parents: updatedParents,
    });
  };

  return (
    <div>
      <h2>Search, Update, and Delete Students</h2>

      <div>
        <input
          className="StudentInput"
          type="text"
          placeholder="Search by Roll No"
          value={rollNo}
          onChange={(e) => setRollNo(e.target.value)}
        />
      </div>
      <div>
        <select value={standard} onChange={(e) => setStandard(e.target.value)}>
          <option value="">Select Standard</option>
          <option value="lkg1">Lkg1</option>
          <option value="kg1">Kg1</option>
          <option value="kg2">Kg2</option>
          <option value="1st">1st</option>
          <option value="2nd">2nd</option>
          <option value="3rd">3rd</option>
          <option value="4th">4th</option>
          <option value="5th">5th</option>
        </select>
      </div>
      <button onClick={handleSearch}>Search</button>

      {searchResult && (
        <div>
          <h3>Student Profile</h3>
          <div>
            {searchResult.photoUrl && (
              <img
                src={searchResult.photoUrl}
                alt="Student Photo"
                style={{ maxWidth: "200px" }}
              />
            )}
          </div>
          <p>Full Name: {searchResult.fullName}</p>
          <p>Gender: {searchResult.gender}</p>
          <p>Date of Birth: {searchResult.dateOfBirth}</p>
          <p>Roll No: {searchResult.rollNo}</p>
          <p>Class: {searchResult.standard}</p>
          <p>Adhaar Card No: {searchResult.adhaarCardNo}</p>
          <p>
            Scholarship Applied:{" "}
            {searchResult.scholarshipApplied ? "Yes" : "No"}
          </p>
          <p>Address: {searchResult.address}</p>

          <h4>Parents Information</h4>
          {searchResult.parents.map((parent) => (
            <div key={parent.id}>
              <p>Student Id: {parent.studentId}</p>
              <p>Father Name: {parent.fatherName}</p>
              <p>Father Occupation: {parent.fatherOccupation}</p>
              <p>Mother Name: {parent.motherName}</p>
              <p>Mother Occupation: {parent.motherOccupation}</p>
              <p>Father Contact: {parent.fatherContact}</p>
              <p>Mother Contact: {parent.motherContact}</p>
              <p>Address: {parent.address}</p>
            </div>
          ))}

          <button onClick={handleDelete}>Delete Student</button>
        </div>
      )}

      {editableStudent && (
        <div>
          <h3>Edit Student Profile</h3>
          <form>
            <div>
              <label>Full Name:</label>
              <input
                className="StudentInput"
                type="text"
                name="fullName"
                value={editableStudent.fullName}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label>Gender:</label>
              <input
                className="StudentInput"
                type="text"
                name="gender"
                value={editableStudent.gender}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label>Date of Birth:</label>
              <input
                className="StudentInput"
                type="date"
                name="dateOfBirth"
                value={editableStudent.dateOfBirth}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label>Roll No:</label>
              <input
                className="StudentInput"
                type="text"
                name="rollNo"
                value={editableStudent.rollNo}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label>Class:</label>
              <input
                className="StudentInput"
                type="text"
                name="standard"
                value={editableStudent.standard}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label>Adhaar Card No:</label>
              <input
                className="StudentInput"
                type="text"
                name="adhaarCardNo"
                value={editableStudent.adhaarCardNo}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label>Scholarship Applied:</label>
              <input
                className="StudentInput"
                type="checkbox"
                name="scholarshipApplied"
                checked={editableStudent.scholarshipApplied}
                onChange={(e) =>
                  setEditableStudent({
                    ...editableStudent,
                    scholarshipApplied: e.target.checked,
                  })
                }
              />
            </div>
            <div>
              <label>Address:</label>
              <input
                className="StudentInput"
                type="text"
                name="address"
                value={editableStudent.address}
                onChange={handleInputChange}
              />
            </div>

            <h4>Edit Parents Information</h4>
            {editableStudent.parents.map((parent, index) => (
              <div key={parent.id}>
                <div>
                  <label>Father Name:</label>
                  <input
                    className="StudentInput"
                    type="text"
                    name="fatherName"
                    value={parent.fatherName}
                    onChange={(e) => handleParentChange(index, e)}
                  />
                </div>
                <div>
                  <label>Father Occupation:</label>
                  <input
                    className="StudentInput"
                    type="text"
                    name="fatherOccupation"
                    value={parent.fatherOccupation}
                    onChange={(e) => handleParentChange(index, e)}
                  />
                </div>
                <div>
                  <label>Mother Name:</label>
                  <input
                    className="StudentInput"
                    type="text"
                    name="motherName"
                    value={parent.motherName}
                    onChange={(e) => handleParentChange(index, e)}
                  />
                </div>
                <div>
                  <label>Mother Occupation:</label>
                  <input
                    className="StudentInput"
                    type="text"
                    name="motherOccupation"
                    value={parent.motherOccupation}
                    onChange={(e) => handleParentChange(index, e)}
                  />
                </div>
                <div>
                  <label>Father Contact:</label>
                  <input
                    className="StudentInput"
                    type="text"
                    name="fatherContact"
                    value={parent.fatherContact}
                    onChange={(e) => handleParentChange(index, e)}
                  />
                </div>
                <div>
                  <label>Mother Contact:</label>
                  <input
                    className="StudentInput"
                    type="text"
                    name="motherContact"
                    value={parent.motherContact}
                    onChange={(e) => handleParentChange(index, e)}
                  />
                </div>
                <div>
                  <label>Address:</label>
                  <input
                    className="StudentInput"
                    type="text"
                    name="address"
                    value={parent.address}
                    onChange={(e) => handleParentChange(index, e)}
                  />
                </div>
              </div>
            ))}

            <button type="button" onClick={handleUpdate}>
              Update Student
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default SearchStudent;
