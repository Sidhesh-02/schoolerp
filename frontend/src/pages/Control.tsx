/* eslint-disable @typescript-eslint/ban-types */
import React, { useState } from 'react'
import { addMiscellaneous, addSubject } from '../utils/api';
import StudentsInfoDownload from '../components/Student/RetriveStudentExcel';
import PhotoUpdate from '../components/Search/PhotoUpdate';



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

    const handleMiscellaneousChanges = async () => {
        const data = {
            num_of_beds,
            Installment1,
            Installment2,
            Installment3,
        }
        const res = await addMiscellaneous(data);
        if (res) {
            alert("Installments and No of Beds Updated")
        } else {
            alert("unsuccsesful")
        }
    }

    return (
        <div className='global-container'>
            <h2>Control Panel </h2>
            <hr style={{ margin: "30px 0px" }} />

            <StudentsInfoDownload />
            <hr style={{ margin: "30px 0px" }} />

            <PhotoUpdate />
            <hr style={{ margin: "30px 0px" }} />
            {/* for standard and subject */}
            <div>
                <h2>Add Subject</h2>
                <input type='text' placeholder='Standard' onChange={handleChangeStandard}></input>
                <input type='text' placeholder='Subject' onChange={handleChangeSubject}></input>
                <span><button className="btn" onClick={SplitSubString}>Add</button></span>
                &nbsp;
                <span><button className="btn" onClick={Submit}>Submit</button></span>
            </div>

            <hr style={{ margin: "30px 0px" }} />
            {/* for changing number of hostel beds  and Installment fee*/}
            <div>
                <h2>Update Hostel Beds & Fees</h2>
                <input type='number' placeholder='Enter number of hostel beds' onChange={(e) => { Setnum_of_beds(Number(e.target.value)) }}></input>
                <input type='number' placeholder='Installment 1' onChange={(e) => { SetInstallment1(Number(e.target.value)) }}></input>
                <input type='number' placeholder='Installment 2' onChange={(e) => { SetInstallment2(Number(e.target.value)) }}></input>
                <input type='number' placeholder='Installment 3' onChange={(e) => { SetInstallment3(Number(e.target.value)) }}></input>
                <button onClick={handleMiscellaneousChanges}>Submit</button>
            </div>

        </div>
    )
}

export default Control
