import { useState } from "react";
import { fetchAllStudents, updateStudent, uploadPhoto } from "../../apis/api";


export default function PhotoUpdate(){
    const [std, setStd] = useState<string>("");
    const [result, setResult] = useState<any[]>([]);
    const [url,setUrl] = useState({});
    
    const search = async () => {
        try {
            const data = await fetchAllStudents(std);
            setResult(data);
        } catch (error) {
            console.log(error);
        }
    };

    const handleUpdate = async (id: number,rollNo:number,standard:string) => {
        try {
          if (!id) {
            alert("No student data to update.");
            return;
          }
          await updateStudent(id,url,rollNo,standard);
          alert("Student updated successfully");
        } catch (error) {
          console.error("Error updating student:", error);
          alert("Failed to update student");
        }
      };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
          try {
            const photoUrl = await uploadPhoto(file);
            setUrl({photoUrl});
          } catch (error) {
            console.error(error);
            alert('Failed to upload image');
          }
        }
      };
    
    return(
        <div>
            <h2>Photo Upload</h2>
            <div>
                <label>Select Standard</label>
                <select onChange={(e) => setStd(e.target.value)}>
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
                <button onClick={search}>Search</button>
            </div>
            {result.length>0 &&(
                <div>
                    <table>
                        <thead>
                            <tr>
                                <th>Full Name</th>
                                <th>Roll No</th>
                                <th>Standard</th>
                                <th>Upload</th>
                            </tr>
                        </thead>
                        <tbody style={{minWidth:"100%"}}>
                           {result.map((item,id)=>(
                                item.photoUrl === null && (
                                    <tr key={id}>
                                        <td>{item.fullName}</td>
                                        <td>{item.rollNo}</td>
                                        <td>{item.standard}</td>
                                        <td>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e)}
                                            />
                                        </td>
                                        <td>
                                            <button onClick={()=>{handleUpdate(item.id,item.rollNo,item.standard)}}>update</button>
                                        </td>
                                    </tr>
                                )
                           ))}
                        </tbody>
                    </table>
                </div>
            )
            }
        </div>
    )
}