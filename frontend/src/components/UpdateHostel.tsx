import axios from 'axios';
import { useState } from 'react'
import { useNavigate } from 'react-router-dom';

const UpdateHostel = () => {
    const navigate = useNavigate();
    const [rollNo,setrollNo] = useState<number>();
    const [room_no , setRoom] = useState<number | undefined>();
    const [bed_no, setBed] = useState<number | undefined>();
    const [standard, setStandard] = useState<string | undefined>();
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

    const goBack = () => {
        navigate(-1); // Navigate to the previous route
      };

  return (

    <div >
        <h2>Hostel Page</h2>
    
        <input className='inputB' type="number"  placeholder='Roll no.' onChange={(e) =>{setrollNo(Number(e.target.value))}}/>
        <select className='inputB' onChange={(e) => { setStandard(e.target.value); }}>
              <option value=''>Select standard</option>
              <option value='lkg1'>Lkg1</option>
              <option value='kg1'>kg1</option>
              <option value='kg2'>kg2</option>
              <option value='1st'>1st</option>
              <option value='2nd'>2nd</option>
              <option value='3rd'>3rd</option>
              <option value='4th'>4th</option>
              <option value='5th'>5th</option>
            </select><br />
        <input className='inputB' type="number"  placeholder='Room no.' onChange={(e) =>{setRoom(Number(e.target.value))}}/><br/>
        <input className='inputB' type="number"  placeholder='Bed no.' onChange={(e) =>{setBed(Number(e.target.value))}}/><br/>
       <button onClick={update}>Update details</button>

       <button onClick={Delete} style={{background:"#DC143C"}}> Delete</button>
       <button onClick={goBack}>Go Back</button>
    </div>

  )
}

export default UpdateHostel