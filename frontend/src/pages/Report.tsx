import { useState, useEffect } from "react";
import "../styles/report.css"
import { report } from "../utils/api";

const Report = () => {
    const [count, setCount] = useState(0);
    const [fee,setFee] = useState(0);
    const [pendFee, setPenFee] = useState(0);
    const [remBed, setRemBed] = useState(0);

    const studentCount = async () => {
        try {
            const gotCount = await report();
            setCount(gotCount.data.len);
            setFee(gotCount.data.sumFee);
            setPenFee(gotCount.data.sumPen);
            setRemBed(gotCount.data.sumBed)
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
                    {/* Student Data */}
                    <h3>Total Students</h3>
                    <h3 className="data">{count} students</h3>
                    
                    {/* Fee Data */}
                    <h3>Total Money Collected</h3>
                    <h3 className="data">{fee} ₹</h3>

                    <h3>Total Money yet to Collected</h3>
                    <h3 className="data">{pendFee} ₹</h3>

                    {/* Hostel Data */}
                    <h3>Total Bed Remaining</h3>
                    <h3 className="data">{remBed}</h3>
                </div>
            </div>
        </>
    );
};

export default Report;
