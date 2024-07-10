/* eslint-disable @typescript-eslint/no-explicit-any */
import "../styles/report.css";
// import axios from "axios";
// import {useEffect, useState} from "react";

const Report = () => {
    // const[report , setReport] = useState<any>([]);
    // const[count, setCount] = useState<number>();
    // const[amount,setAmount] = useState<number>();
    // const[pending, setPending] = useState<number>();
    // const[numbed , setNumbed] = useState<number>();
    // useEffect(()=>{
    //     async function fetchData() {
    //         const res = await axios.get("http://localhost:5000/getstudents");
    //         const hostel_res = await axios.get("http://localhost:5000/gethosteldata");
    //         console.log(res.data)
    //         setReport(res.data);
    //         details(res.data);   
    //         setNumbed(100 - hostel_res.data.result.length);
    //     }
    //     fetchData();
        
    // }, [])
 
    // const details = (data : any) =>{
    //     let abscount = 0;
    //     data.forEach((e : any)=>{
    //         if(e.attendanceRecords[0].status == true){
    //             abscount++;
    //         }
    //     })
    //     setCount(abscount);


    //     let amt = 0;
    //     let yettopay = 0;
    //     data.forEach((e : any) =>{
    //         amt = amt + e.fees[0].amount;

    //         if(e.fees[0].pendingAmount){
    //             yettopay = yettopay +1;
    //         }
    //     })
    //     setPending(yettopay);
    //     setAmount(amt);
    // }
    
  
    return ( 
        <>
            Reports
            <div>
                <div className="Dashboard">
                    {/* <h3>Total Students</h3>
                    <h3>{report.length}</h3>
                    <h3>Absent Students</h3>
                    <h3>{count}</h3>
                    <h3>Total Money Collected</h3>
                    <h3>{amount}</h3>
                    <h3>Students Yet to pay Fees</h3>
                    <h3>{pending}</h3>
                    <h3>Total Bed Remaining</h3>
                    <h3>{numbed}</h3> */}
                </div>

                
            </div>
        </>
     );
}
 
export default Report;