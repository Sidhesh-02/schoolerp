import axios from "axios";
import { useState, useEffect } from "react";

const Report = () => {
    const [count, setCount] = useState(0);

    const studentCount = async () => {
        try {
            const gotCount = await axios.get("http://localhost:5000/studentcount");
            console.log(gotCount.data);
            setCount(gotCount.data.len);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        studentCount();
    }, []);

    return (
        <>
            Reports
            <div>
                <div className="Dashboard">
                    {/* Student Data */}
                    <h3>Total Students</h3>
                    <h3>{count}</h3>

                    {/* Attendance Data */}
                    <h3>Absent Students</h3>
                    <h3>0</h3>
                    
                    {/* Fee Data */}
                    <h3>Total Money Collected</h3>
                    <h3>0</h3>
                    <h3>Students Yet to Fees</h3>
                    <h3>0</h3>

                    {/* Hostel Data */}
                    <h3>Total Bed Remaining</h3>
                    <h3>0</h3>
                </div>
            </div>
        </>
    );
};

export default Report;
