import { useState } from "react";
import { fetchAllStudents, updateStudent, uploadPhoto } from "../../apis/api";
import { useRecoilValue } from "recoil";
import { standardList } from "../../store/store";

export default function PhotoUpdate() {
  const [std, setStd] = useState<string>("");
  const [result, setResult] = useState<any[]>([]);
  const [url, setUrl] = useState("");
  const [activeRowId, setActiveRowId] = useState<number | null>(null);
  const standards = useRecoilValue(standardList);

  const search = async () => {
    try {
      const data = await fetchAllStudents(std);
      setResult(data.result);
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdate = async (id: number, rollNo: number, standard: string) => {
    try {
      if (!id || !url) {
        alert("No student data or photo URL to update.");
        return;
      }
      await updateStudent(id, { url, rollNo, standard });
      alert("Student updated successfully");
      setActiveRowId(null);
    } catch (error) {
      console.error("Error updating student:", error);
      alert("Failed to update student");
    }
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    id: number
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const photoUrl = await uploadPhoto(file);
        setUrl(photoUrl);
        setActiveRowId(id);
      } catch (error) {
        console.error(error);
        alert("Failed to upload image");
      }
    }
  };

  return (
    <div>
      <h2>Photo Upload</h2>
      <div>
        <label>Select Standard</label>
        <select onChange={(e) => setStd(e.target.value)}>
          <option value="">Select Standard</option>
          {standards.map((standard: string) => (
            <option key={standard} value={standard}>
              {standard}
            </option>
          ))}
        </select>
        <button onClick={search}>Search</button>
      </div>
      {result.length > 0 && (
        <div>
          {/* Conditional scrollable container: scrolls if more than 8 records */}
          <div
            style={{
              maxHeight: result.length > 8 ? "400px" : "auto",
              overflowY: result.length > 8 ? "auto" : "visible",
            }}
          >
            <table>
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Roll No</th>
                  <th>Standard</th>
                  <th>Upload</th>
                  <th>Update Photo</th>
                </tr>
              </thead>
              <tbody style={{ minWidth: "100%" }}>
                {result.map((item) => (
                  <tr key={item.id}>
                    <td>{item.fullName}</td>
                    <td>{item.rollNo}</td>
                    <td>{item.standard}</td>
                    <td>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={activeRowId !== null && activeRowId !== item.id}
                        onChange={(e) => handleImageUpload(e, item.id)}
                      />
                    </td>
                    <td>
                      <button
                        disabled={activeRowId !== item.id || !url}
                        onClick={() =>
                          handleUpdate(item.id, item.rollNo, item.standard)
                        }
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
