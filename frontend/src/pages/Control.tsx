/* eslint-disable @typescript-eslint/ban-types */
import React, { useState } from 'react'
import { addMiscellaneous, addSubject } from '../utils/api';
// import '../styles/Control.css';


interface subject {
    // eslint-disable-next-line @typescript-eslint/ban-types
    name : String
}


const Control = () => {
    const [arrSub, SetarrSub] = useState<subject[]>([]);
    const [Standard, Setstandard] = useState<String>('');
    const [SubString , SetSubString] = useState<String>('');
    const [num_of_beds , Setnum_of_beds] = useState<number>(0);
    const [Installment1 , SetInstallment1] = useState<number>(0);
    const [Installment2 , SetInstallment2] = useState<number>(0);
    const [Installment3 , SetInstallment3] = useState<number>(0);
    
    const handleChangeStandard = (e : React.ChangeEvent<HTMLInputElement>)=>{
        Setstandard(e.target.value);
    }

    const handleChangeSubject = (e : React.ChangeEvent<HTMLInputElement>)=>{
        SetSubString(e.target.value);
    }
     


    const SplitSubString = async () =>{
        const array = SubString.trim().split(" ")
        const data : subject[] = [];
        array.forEach((e: string) =>{
            data.push({
                name : e
            })
        })
        
        SetarrSub(data);
        if(data){
            alert("Data Added Successfully");
        }
    }
   

    const Submit = async()=>{
        const data = {
            std : Standard,
            subjects : arrSub
        }
        console.log("arrSub.length  --> " , arrSub.length )
        if(arrSub.length == 0){
            alert("Add some subject") 
        }else{
           const res =  await addSubject(data);
           if(res){
                alert("Subjects were added successfully") 
           }
        }
        
    } 

    const handleMiscellaneousChanges = async()=>{
            const data = {
                num_of_beds,
                Installment1,
                Installment2,
                Installment3,
            }
            const res = await addMiscellaneous(data);
            if(res){
                alert("Changes made to Database")
            }else{
                alert("unsuccsesful")
            }
    }

  return (
    <div>
        <h2>Control Panel </h2>
        {/* for standard and subject */}
        <div>
            <h4>Add Subjects according to Standard</h4>
            <input type='text' placeholder='Standard' onChange={handleChangeStandard}></input>
            <input type='text' placeholder='Subject' onChange={handleChangeSubject}></input>
            <span><button  className="btn" onClick={SplitSubString}>Add</button></span> 
            <span><button className="btn" onClick={Submit}>Submit</button></span>
        </div>

        {/* for changing number of hostel beds  and Installment fee*/}
        <div>
            <h4>Update number of hostel beds  and Installment fee </h4>
            <input type='number' placeholder='Enter number of hostel beds' onChange={(e) =>{Setnum_of_beds(Number(e.target.value))}}></input>
            <input type='number' placeholder='Installment 1' onChange={(e) =>{SetInstallment1(Number(e.target.value))}}></input>
            <input type='number' placeholder='Installment 2' onChange={(e) =>{SetInstallment2(Number(e.target.value))}}></input>
            <input type='number' placeholder='Installment 3' onChange={(e) =>{SetInstallment3(Number(e.target.value))}}></input>
            <button onClick={handleMiscellaneousChanges}>Submit</button>
        </div>

    </div>
  )
}

export default Control
