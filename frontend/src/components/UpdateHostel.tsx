import axios from 'axios';
import { useState } from 'react'

const UpdateHostel = () => {
    const [rollNo,setrollNo] = useState<number>();
    const [room_no , setRoom] = useState<number | undefined>();
    const [bed_no, setBed] = useState<number | undefined>();
    const [standard, setstandard] = useState<string | undefined>();
    const update = async() =>{
        try{
            await axios.post("http://localhost:5000/updatehostel" , {
                rollNo,
                standard,
                room_no,
                bed_no,
            },{
                headers:{
                    "Content-Type" : "application/json"
                }
            })
            alert("successfully updated")
        }catch(error){
            alert("unsuccessfully updation")
            console.log(error);
        }
        
    }

    const Delete = async()=>{
        try{
            const res = await axios.post("http://localhost:5000/hostel/delete", {
                rollNo,
                standard,
                room_no,
                bed_no,
            },{
                headers:{
                    "Content-Type":"application/json",
                }
            })
            if(res){
                alert("student removed successfully!");
            }
            location.reload();
        }catch(error){
            console.log(error);
        }
    }

  return (

    <div >
        <h2>Hostel Page</h2>
    
        <input className='inputB' type="number"  placeholder='roll number' onChange={(e) =>{setrollNo(Number(e.target.value))}}/><br/>
        <input className='inputB' type="text"  placeholder='standard' onChange={(e) =>{setstandard(e.target.value)}}/><br/>
        <input className='inputB' type="number"  placeholder='Room no.' onChange={(e) =>{setRoom(Number(e.target.value))}}/><br/>
        <input className='inputB' type="number"  placeholder='Bed no.' onChange={(e) =>{setBed(Number(e.target.value))}}/><br/>
       <button onClick={update}>Update details</button>

       <button onClick={Delete} style={{background:"#DC143C"}}> Delete</button>
    </div>

  )
}

export default UpdateHostel