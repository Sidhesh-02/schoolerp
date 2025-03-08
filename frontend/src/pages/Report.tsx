import { useState, useEffect } from "react";
import "../styles/report.css"
import { report } from "../apis/api";

const Report = () => {
    const [count, setCount] = useState(0);
    const [fee,setFee] = useState(0);
    const [remBed, setRemBed] = useState(0);

    const studentCount = async () => {
        try {
            const gotCount = await report();
            setCount(gotCount.len);
            setFee(gotCount.sumFee);
            setRemBed(gotCount.sumBed)
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        studentCount();
    }, []);

    return (
        <>
            <div>
                <div className="Dashboard">
                    <h2 style={{padding:"8px 0px"}}>Reports</h2>
                    {/* Student Data */}
                    <h3>Total Students</h3>
                    <h3 className="data">{count} students</h3>
                    
                    {/* Fee Data */}
                    <h3>Total Money Collected</h3>
                    <h3 className="data">{fee} ₹</h3>

                    {/* Hostel Data */}
                    <h3>Total Bed Remaining</h3>
                    <h3 className="data">{remBed}</h3>
                </div>
            </div>
        </>
    );
};

export default Report;
