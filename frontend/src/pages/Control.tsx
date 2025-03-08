import React, { useEffect, useState } from 'react'
import { addControlValues, addStandard, addSubjects, currentSession, uploadSchoolLogo } from '../apis/api';
import PhotoUpdate from '../components/Search/PhotoUpdate';
import axios from 'axios';


const Control = () => {

    const [Standard, Setstandard] = useState<string>('');
    const [dropdownStandard, setDropdownStandard] = useState<string>('');
    const [SubString, SetSubString] = useState<string>('');
    const [num_of_beds, Setnum_of_beds] = useState<number>(0);
    const [InstitutionName, SetInstitutionName] = useState<string>('');
    const [hostelName, setHostelName] = useState<string>("");
    const [schoolAddress, setSchoolAddress] = useState<string>("");
    const [totalFee, setTotalFee] = useState<number>(0);
    const [installment, setInstallment] = useState<string>("");
    const [url, setUrl] = useState("");
    const [updatedInstallment, setUpdatedInstallment] = useState("");
    const [updatedInstallment2, setUpdatedInstallment2] = useState("");
    const [installmentStatus, setInstallmentStatus] = useState(false);

    const handleChangeStandard = (e: React.ChangeEvent<HTMLInputElement>) => {
        Setstandard(e.target.value);
    }
    const handleDropdownStandardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setDropdownStandard(e.target.value)
    }

    const handleChangeSubject = (e: React.ChangeEvent<HTMLInputElement>) => {
        SetSubString(e.target.value);
    }


    const submitStd = async () => {
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
                window.location.reload()
            }
        } catch (error) {
            console.error("Error adding standard and subjects:", error);
        }
    };

    const submitSubjects = async () => {
        const subjectsArray = SubString.trim().split(" ").map((subject) => ({ name: subject }));
        const data = {
            std: dropdownStandard,
            subjects: subjectsArray,
        }
        const res = await addSubjects(data);
        if (res) {
            alert("Subjects Added Successfully")
            window.location.reload()
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
        try {
            const controlDataStatus = await addControlValues(data);
            if (controlDataStatus) {
                alert("Data Added Sccessfully");
                window.location.reload();
            }
        } catch (error) {
            console.log(error);
        }
    }

    const studentPromoteRoute = async () => {
        const promotionData = await axios.post("http://localhost:5000/promotion");
        if (promotionData) {
            alert("Student Promoted Succesfully");
            window.location.reload();
        }
    }

    const [input1, setInput1] = useState<string>('');
    const [input2, setInput2] = useState<string>('');

    const handleAddSession = async () => {
        try {
            const newSession = `${input1}-${input2}`;
            await currentSession(newSession);
            alert("Session Added Successfully");
            window.location.reload();
        } catch (error) {
            alert(error.response.data.message);
        }
    };

    const [standard, setStandard] = useState(["1st"])
    useEffect(() => {
        async function fetchStandards() {
            try {
                const response = await axios.get("http://localhost:5000/standards");
                const standards = response.data?.standard || [];
                const standardArr = standards.map((ele: { std: string; id: number }) => ele.std);
                setStandard(standardArr);
            } catch (error) {
                console.error("Error fetching standards:", error);
                throw error;
            }
        }
        fetchStandards();
    }, [])

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


    const handleInstallment = async () => {
        const result = await axios.post("http://localhost:5000/handleInstallments", { installment });
        if (result) {
            alert("Installment Added Successfully ");
            window.location.reload();
        }
    }

    const updateInstallment = async () => {
        try {
            const res = await axios.post("http://localhost:5000/updateinstallment", {
                updatedInstallment, updatedInstallment2
            });
            if (res) {
                alert("Installment Updated Successfully");
                window.location.reload();
            }
        } catch (err) {
            console.log(err)
        }
    };
    const [isEditing, setIsEditing] = useState(false);
    const [prevStandard, setPrevStandard] = useState("");
    const [newStandard, setNewStandard] = useState("");

    const updateStd = async () => {
        try {
            const res = await axios.put("http://localhost:5000/updateStandard", { prevStandard, newStandard })
            if (!res) {
                alert("Error Updating Value");
                return;
            }
            alert("Updated Successfully");
            setIsEditing(false);
            window.location.reload();
        } catch (e) {
            console.log(e);
        }
    }

    const [prevSubject, setPrevSubject] = useState("");
    const [updatedSubject, setUpdatedSubject] = useState("");
    const [isEditing2, setIsEditing2] = useState(false);
    const [dropdownStandardChange2, setDropdownStandardChange2] = useState("");
    const updateSubjects = async () => {
        try {
            const res = await axios.put("http://localhost:5000/updateSubject", {
                prevSubject,
                updatedSubject,
                dropdownStandardChange2
            });

            if (res.status === 200) {
                alert("Updated Successfully");
                setIsEditing2(false);
            }
        } catch (e) {
            console.log(e);
            if (e.response) {
                const { error } = e.response.data;
                if (error === "Subject not found. Cannot update.") {
                    alert("Error: The subject does not exist.");
                } else if (error === "Subject with this name already exists.") {
                    alert("Error: This subject name already exists.");
                } else {
                    alert("Error updating subject. Please try again.");
                }
            } else {
                alert("Server Error: Unable to update.");
            }
        }
    };



    return (
        <div>
            <div className='global-container'>
                <h2>Set Configurations</h2>
                <label>Set Institute Name : </label>
                <input type='text' placeholder='Enter institution name' onChange={(e) => { SetInstitutionName(e.target.value) }}></input>
                <label>Set School Logo</label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e)}
                />
                <label>Set Institute Address</label>
                <input type="text" placeholder='Enter Institute Address' onChange={(e) => { setSchoolAddress(e.target.value) }} />
                <label>Set Hostel Name : </label>
                <input type="text" placeholder='Enter Hostel Name' onChange={(e) => { setHostelName(e.target.value) }} />
                <label>Set Hostel Beds : </label>
                <input type='number' placeholder='Enter Number of Hostel Beds' onChange={(e) => { Setnum_of_beds(Number(e.target.value)) }}></input>
                <label>Set Total Fees</label>
                <input type="number" placeholder='Enter Total Fees' onChange={(e) => { setTotalFee(Number(e.target.value)) }} />
                <button onClick={handleControlChanges}>Submit</button>
            </div>

            {/* for standard and subject */}
            <div className='global-container'>
                <h2>Add Standard</h2>
                <label>Enter Standards :</label>
                <input title='Standard Formating - LKG, UKG, 1st, 2nd, 3rd, 4th, 5th, 6th, 7th, 8th, 9th, 10th' type='text' placeholder='Standard' onChange={handleChangeStandard}></input>
                <span>
                    <button className="btn" onClick={submitStd}>Submit Standard</button> &nbsp;&nbsp;
                    <button className='btn' onClick={() => { setIsEditing(true) }}>Edit Standard</button>
                    {
                        isEditing && (
                            <>
                                <br />
                                <br />
                                <input type='text' placeholder='Enter Previous Standard' onChange={(e) => { setPrevStandard(e.target.value) }} />
                                <input type='text' placeholder='Enter New Standard' onChange={(e) => { setNewStandard(e.target.value) }} />
                                <button onClick={updateStd}>Update Standard</button>
                            </>
                        )
                    }
                </span>
            </div>

            {/* Add Subjects Choosing Standard */}
            <div className='global-container'>
                <h2>Add Subjects</h2>
                <select
                    name="standard"
                    onChange={handleDropdownStandardChange}
                >
                    <option value="">Select standard</option>
                    {standard.map((ele, key) => (
                        <option key={key}>{ele}</option>
                    ))}
                </select>
                <input type='text' placeholder='Subject' onChange={handleChangeSubject}></input>
                <button className="btn" onClick={submitSubjects}>Submit Subject</button> &nbsp;&nbsp;
                <button className="btn" onClick={() => { setIsEditing2(true) }}>Edit Subject</button>
                {
                    isEditing2 && (
                        <>
                            <select
                                name="standard"
                                onChange={(e) => { setDropdownStandardChange2(e.target.value) }}
                            >
                                <option value="">Select standard</option>
                                {standard.map((ele, key) => (
                                    <option key={key}>{ele}</option>
                                ))}
                            </select>
                            <input type='text' placeholder='Previous Subject' onChange={(e) => { setPrevSubject(e.target.value) }}></input>
                            <input type='text' placeholder='Update Subject' onChange={(e) => { setUpdatedSubject(e.target.value) }}></input>
                            <button onClick={updateSubjects}>Update Standard</button>
                        </>
                    )
                }

            </div>

            <div className='global-container'>
                <h2>Add Installments</h2>
                <div>
                    <div>
                        <label>Installment Name:</label>
                        <input
                            type="text"
                            placeholder="Enter Installment Name"
                            value={installment}
                            onChange={(e) => setInstallment(e.target.value)}
                        />
                        <div className="installment-button">
                            <button onClick={handleInstallment}>Submit Installment</button> &nbsp;&nbsp;
                            <button onClick={() => { setInstallmentStatus(true) }}>Update Installment</button>
                            {installmentStatus ? <div style={{ marginTop: "30px" }}>
                                <input type="text" onChange={(e) => {
                                    setUpdatedInstallment(e.target.value)
                                }
                                } placeholder='prev installment' />
                                <input onChange={(e) => {
                                    setUpdatedInstallment2(e.target.value)
                                }
                                } placeholder='new installment' type="text" />
                                <button onClick={updateInstallment} >Submit</button>
                            </div> : <div></div>}
                        </div>
                    </div>
                </div>

            </div>
            <div className='global-container'>
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

            <div className='global-container'>
                <PhotoUpdate />
            </div>

            <div className='global-container' style={{ color: "#8B0000", marginLeft: "5px" }}>
                <h2>Danger Zone - Handle with Caution</h2>
                <div>
                    <label>Promote Qualified Students</label>
                    <button style={{ marginTop: "5px" }} onClick={studentPromoteRoute} >Promote</button>
                </div>
            </div>

        </div>
    )
}

export default Control


