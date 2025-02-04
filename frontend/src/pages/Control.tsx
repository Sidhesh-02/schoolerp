import React, { useEffect, useState } from 'react'
import { addControlValues, addStandard, addSubjects, currentSession, uploadSchoolLogo } from '../apis/api';
import PhotoUpdate from '../components/Search/PhotoUpdate';
import axios from 'axios';
import { AxiosError } from "axios";

const Control = () => {
    
    const [Standard, Setstandard] = useState<string>('');
    const [dropdownStandard,setDropdownStandard] = useState<string>('');
    const [SubString, SetSubString] = useState<string>('');
    const [num_of_beds, Setnum_of_beds] = useState<number>(0);
    const [InstitutionName , SetInstitutionName] = useState<string>('');
    const [hostelName,setHostelName] = useState<string>("");
    const [schoolAddress,setSchoolAddress] = useState<string>("");
    const [totalFee,setTotalFee] = useState<number>(0);
    const [installment,setInstallment] = useState<string>("");
    const [url, setUrl] = useState("");

    const handleChangeStandard = (e: React.ChangeEvent<HTMLInputElement>) => {
        Setstandard(e.target.value);
    }
    const handleDropdownStandardChange = (e: React.ChangeEvent<HTMLSelectElement>)=>{
        setDropdownStandard(e.target.value)
    }

    const handleChangeSubject = (e: React.ChangeEvent<HTMLInputElement>) => {
        SetSubString(e.target.value);
    }


    const Submit = async () => {
        try {    
            if (!Standard.trim()) {
                alert("Please provide Standard");
                return;
            }
    
            const data = {
                std: Standard,
            };
    
            const res = await addStandard(data);
            if (res) {
                alert("Standard Added Successfully");
                Setstandard('');
            }
        } catch (error) {
            console.error("Error adding standard and subjects:", error);
            alert("Already Exist");
        }
    };

    const SubmitSubjects = async()=>{
        const subjectsArray = SubString.trim().split(" ").map((subject) => ({ name: subject }));
        const data = {
            std : dropdownStandard,
            subjects: subjectsArray,
        }
        const res = await addSubjects(data);
        if(res){
            alert("Subjects Added Successfully")
        }
    }

    const handleControlChanges = async () => {
        const data = {
            num_of_beds,
            InstitutionName,
            hostelName,
            schoolAddress,
            totalFee,
            url
        }
        // console.log(data);
       try{
        const controlDataStatus = await addControlValues(data);
        if(controlDataStatus){
            alert("Data Added Sccessfully")
        }
       }catch(error){
        const errorData = error as AxiosError;
        if(errorData?.status == 400){
            alert(errorData?.response?.data?.errorMsg)
        }
       }
    }

    const studentPromoteRoute = async()=>{
        const promotionData = await axios.post("http://localhost:5000/promotion");
        if(promotionData){
            alert("Student Promoted Succesfully");
        }
    }

    const [input1, setInput1] = useState<string>('');
    const [input2, setInput2] = useState<string>('');
    
    const handleAddSession = async () => {
        try {
            if (input1 && input2) {
                const newSession = `${input1}-${input2}`;
                const response = await currentSession(newSession);

                if (response.status === 200) {
                    alert("Session Added Successfully");
                }
                window.location.reload();
            } else {
                alert("Both start year and end year are required.");
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response) {
                const { status, data } = error.response;
                if (status === 409) {
                    alert(data.error || "Session already exists");
                } else if (status === 400) {
                    alert(data.error || "Year is required");
                } else {
                    alert("An unexpected error occurred. Please try again.");
                }
            } else {
                console.error("Error:", error);
                alert("An error occurred. Please check the console for details.");
            }
        }
    };

    const [standard,setStandard] = useState(["1st"])
    useEffect(()=>{
        async function fetchStandards (){
        try {
            const response = await axios.get("http://localhost:5000/standards");
            const standards = response.data?.standard || [];
            const standardArr = standards.map((ele: { std: string; id:number }) => ele.std);
            setStandard(standardArr);
        } catch (error) {
            console.error("Error fetching standards:", error);
            throw error;
        }
        }
        fetchStandards();
    },[])
    
      const handleImageUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
      ) => {
        const file = e.target.files?.[0];
        if (file) {
          try {
            const photoUrl = await uploadSchoolLogo(file);
            setUrl(photoUrl);
          } catch (error) {
            console.error(error);
            alert("Failed to upload image");
          }
        }
      };

    
    const handleInstallment = async()=>{
        console.log(installment);
        const result = await axios.post("http://localhost:5000/handleInstallments",{installment});
        if(result){
            alert("Success");
        }
    }

    return (
        <div className='global-container'>
            <h1>Control Panel </h1>
            <hr style={{ margin: "30px 0px" }} />
            <div>
                <h2>Set Configurations</h2>
                <label>Set Institute Name : </label>
                <input type='text' placeholder='Enter institution name' onChange={(e) => {SetInstitutionName(e.target.value)}}></input>
                <label>Set School Logo</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e)}
                />
                <label>Set Hostel Name : </label>
                <input type="text" placeholder='Enter Hostel Name' onChange={(e)=> {setHostelName(e.target.value)}}/>
                <label>Set School Address</label>
                <input type="text" placeholder='Enter Hostel Address' onChange={(e)=> {setSchoolAddress(e.target.value)}}/>
                <label>Set Hostel Beds : </label>
                <input type='number' placeholder='Enter Number of Hostel Beds' onChange={(e) => { Setnum_of_beds(Number(e.target.value)) }}></input>
                <label>Set Total Fees</label>
                <input type="number" placeholder='Enter Total Fees' onChange={(e)=> {setTotalFee(Number(e.target.value))}}/>
                <button onClick={handleControlChanges}>Submit</button>
            </div>
            <hr style={{ margin: "30px 0px" }} />
            {/* for standard and subject */}
            <div>
                <h2>Add Standard</h2>
                <label>Enter Standards :</label>
                <input title='Standard Formating - LKG, UKG, 1st, 2nd, 3rd, 4th, 5th, 6th, 7th, 8th, 9th, 10th' type='text' placeholder='Standard' onChange={handleChangeStandard}></input>
                <span><button className="btn" onClick={Submit}>Submit</button></span>
            </div>
            <hr style={{ margin: "30px 0px" }} />
            {/* Add Subjects Choosing Standard */}
            <div>
                <h2>Add Subjects</h2>
                <select
                    name="standard"
                    onChange={handleDropdownStandardChange}
                    >
                    <option value="">Select standard</option>
                    {standard.map((ele,key)=>(
                        <option key={key}>{ele}</option>
                    ))}
                </select>
                <input type='text' placeholder='Subject' onChange={handleChangeSubject}></input> 
                <button className="btn" onClick={SubmitSubjects}>Submit</button>
            </div>


            <hr style={{ margin: "30px 0px" }} />
        
            <h2>Add Installments</h2>
            <div>
                <label>Add Installments List</label>
                <input type="text" placeholder='Enter Installment Name' onChange={(e)=>{setInstallment(e.target.value)}}/>
                <button onClick={handleInstallment}>Submit Installment</button>
            </div>
            <br />
            <div>
                <h2>Set Sessions</h2>
                <label>Add Session : </label>
                <input
                    type="text"
                    placeholder="Enter start year"
                    value={input1}
                    onChange={(e) => setInput1(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Enter end year"
                    value={input2}
                    onChange={(e) => setInput2(e.target.value)}
                />
                <button onClick={handleAddSession}>Add Session</button>
            </div>
            <hr style={{ margin: "30px 0px" }} />
            <PhotoUpdate />
            <hr style={{ margin: "30px 0px" }} />
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


