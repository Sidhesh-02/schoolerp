/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { fetchAllStudentsSc } from "../../utils/api";

export default function Scholarship() {
    const [list, setList] = useState<any[]>([]);
    
    const getStudents = async () => {
        try {
            const students = await fetchAllStudentsSc();
            setList(students);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <>
            <div>
                <label>Students opted for scholarship</label>
                <button onClick={getStudents}>Get Students</button>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Standard</th>
                            <th>Roll No</th>
                            <th>Scholarship Applied</th>
                            <th>Remark</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((item, id) => (
                            <tr key={id}>
                                <td>{item.fullName}</td>
                                <td>{item.standard}</td>
                                <td>{item.rollNo}</td>
                                <td>{item.scholarshipApplied ? "Yes" : "No"}</td>
                                <td>{item.remark}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
