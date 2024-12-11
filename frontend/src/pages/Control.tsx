/* eslint-disable @typescript-eslint/ban-types */
import React, { useState } from 'react'
import { addControlValues, addSubject, DownloadScholarshipStudent } from '../utils/api';
import PhotoUpdate from '../components/Search/PhotoUpdate';
import axios from 'axios';



interface subject {
    // eslint-disable-next-line @typescript-eslint/ban-types
    name: String
}


const Control = () => {
    const [arrSub, SetarrSub] = useState<subject[]>([]);
    const [Standard, Setstandard] = useState<String>('');
    const [SubString, SetSubString] = useState<String>('');
    const [num_of_beds, Setnum_of_beds] = useState<number>(0);
    const [Installment1, SetInstallment1] = useState<number>(0);
    const [Installment2, SetInstallment2] = useState<number>(0);
    const [Installment3, SetInstallment3] = useState<number>(0);
    const [InstitutionName , SetInstitutionName] = useState<String>('');

    const handleChangeStandard = (e: React.ChangeEvent<HTMLInputElement>) => {
        Setstandard(e.target.value);
    }

    const handleChangeSubject = (e: React.ChangeEvent<HTMLInputElement>) => {
        SetSubString(e.target.value);
    }

    const SplitSubString = async () => {
        const array = SubString.trim().split(" ")
        const data: subject[] = [];
        array.forEach((e: string) => {
            data.push({
                name: e
            })
        })

        SetarrSub(data);
        if (data) {
            alert("Data Added ! Now Submit Data");
        }
    }


    const Submit = async () => {
        await SplitSubString() 
        const data = {
            std: Standard,
            subjects: arrSub
        }
        if (arrSub.length == 0) {
            alert("Subject Required")
        } else {
            const res = await addSubject(data);
            if (res) {
                alert("Subjects Added Successfully")
            }
        }

    }

    const handleControlChanges = async () => {
        const data = {
            num_of_beds,
            Installment1,
            Installment2,
            Installment3,
            InstitutionName,
        }
       
        const res = await addControlValues(data);
        if (res) {
            alert("Entry Successfull");
            window.location.reload();
        } else {
            alert("Unsuccsesful");
        }
    }

    const studentPromoteRoute = async()=>{
        const promotionData = await axios.post("http://localhost:5000/promotion");
        if(promotionData){
            alert("Student Promoted Succesfully");
        }
    }

    const handleDownload = async()=>{
        try {
            const response = await DownloadScholarshipStudent();
            console.log("res --> " ,response);
            if (response.status < 200 || response.status >= 300) {
              alert("here first")
              throw new Error('Failed to download Scholarship records');
            }
            const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Scholarship.xlsx';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
          } catch (error) {
            console.error('Error downloading Scholarship records:', error);
            alert('Failed to download Scholarship records');
          }
    }

    return (
        <div className='global-container'>
            <h1>Control Panel </h1>
            <hr style={{ margin: "30px 0px" }} />
            <div>
                <h2>Download Students Opted For Scholarship</h2>
                <button style={{ marginTop: '-2px' }} onClick={handleDownload}>Dowload</button>
            </div>
            <hr style={{ margin: "30px 0px" }} />
            <PhotoUpdate />
            <hr style={{ margin: "30px 0px" }} />
            {/* for standard and subject */}
            <div>
                <h2>Add Subject</h2>
                <input type='text' placeholder='Standard' onChange={handleChangeStandard}></input>
                <input type='text' placeholder='Subject' onChange={handleChangeSubject}></input>
                <span><button className="btn" onClick={Submit}>Submit</button></span>
            </div>

            <hr style={{ margin: "30px 0px" }} />
            {/* for changing number of hostel beds  and Installment fee*/}
            <div>
                <h2>Control Beds and Installements</h2>
                <label>Set Hostel Beds : </label>
                <input type='number' placeholder='Enter number of hostel beds' onChange={(e) => { Setnum_of_beds(Number(e.target.value)) }}></input>
                <label>Set Installments : </label>
                <input type='number' placeholder='Installment 1' onChange={(e) => { SetInstallment1(Number(e.target.value)) }}></input>
                <input type='number' placeholder='Installment 2' onChange={(e) => { SetInstallment2(Number(e.target.value)) }}></input>
                <input type='number' placeholder='Installment 3' onChange={(e) => { SetInstallment3(Number(e.target.value)) }}></input>
                <h5>Alter the Institution Name</h5>
                <input type='text' placeholder='Update institution name' onChange={(e) => {SetInstitutionName(e.target.value)}}></input>
                <button onClick={handleControlChanges}>Submit</button>
            </div>
            <br />
            <div style={{color:"#8B0000", marginLeft:"5px"}}>
                <h2>Danger Zone - Handle with Caution</h2>
                <div>
                    <label>Promote Qualified Students</label>
                    <button style={{marginTop:"5px"}} onClick={studentPromoteRoute} >Promote</button>
                </div>
            </div>

        </div>
    )
}

export default Control
