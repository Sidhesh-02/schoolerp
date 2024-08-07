import React, { useState } from "react";
import { deleteStudent, searchStudent, updateStudent } from "../../utils/api";

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
      const response = await searchStudent(parseInt(rollNo), standard);
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
      await deleteStudent(searchResult.id);
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
      await updateStudent(editableStudent.id,editableStudent);
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
      <h2>Search Update and Delete Students</h2>
      <div>
        <label>Roll No</label>
        <input
          className="StudentInput"
          type="text"
          placeholder="Search by Roll No"
          value={rollNo}
          onChange={(e) => setRollNo(e.target.value)}
        />
      </div>
      <div>
        <label>Select Standard</label>
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
          <h2 style={{paddingTop:"10px"}}>Student Profile</h2>
          <div className="profile-container">
            <div className="profile-header">
              <div>
                {searchResult.photoUrl && (
                  <div className="profile-photo">
                    <img src={searchResult.photoUrl} alt="Student Photo" />
                  </div>
                )}
              </div>
            </div>

            <div className="profile-section">
              <h4>Personal Information</h4>
              <div style={{marginLeft:"10px"}}>
                <div className="profile-field">
                  <label>Full Name:</label>
                  <p>{searchResult.fullName}</p>
                </div>
                <div className="profile-field">
                  <label>Gender:</label>
                  <p>{searchResult.gender}</p>
                </div>
                <div className="profile-field">
                  <label>Date of Birth:</label>
                  <p>{searchResult.dateOfBirth}</p>
                </div>
                <div className="profile-field">
                  <label>Roll No:</label>
                  <p>{searchResult.rollNo}</p>
                </div>
                <div className="profile-field">
                  <label>Class:</label>
                  <p>{searchResult.standard}</p>
                </div>
                <div className="profile-field">
                  <label>Adhaar Card No:</label>
                  <p>{searchResult.adhaarCardNo}</p>
                </div>
                <div className="profile-field">
                  <label>Scholarship Applied:</label>
                  <p>{searchResult.scholarshipApplied ? "Yes" : "No"}</p>
                </div>
                <div className="profile-field">
                  <label>Address:</label>
                  <p>{searchResult.address}</p>
                </div>
              </div>
            </div>

            <div className="profile-section">
              <h4>Parents Information</h4>
              <div style={{marginLeft:"10px"}}>
                {searchResult.parents.map((parent) => (
                  <div key={parent.id}>
                    <div className="profile-field">
                      <label>Father Name:</label>
                      <p>{parent.fatherName}</p>
                    </div>
                    <div className="profile-field">
                      <label>Father Occupation:</label>
                      <p>{parent.fatherOccupation}</p>
                    </div>
                    <div className="profile-field">
                      <label>Mother Name:</label>
                      <p>{parent.motherName}</p>
                    </div>
                    <div className="profile-field">
                      <label>Mother Occupation:</label>
                      <p>{parent.motherOccupation}</p>
                    </div>
                    <div className="profile-field">
                      <label>Father Contact:</label>
                      <p>{parent.fatherContact}</p>
                    </div>
                    <div className="profile-field">
                      <label>Mother Contact:</label>
                      <p>{parent.motherContact}</p>
                    </div>
                    <div className="profile-field">
                      <label>Address:</label>
                      <p>{parent.address}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
