/* eslint-disable @typescript-eslint/no-explicit-any */
import "../styles/hostel.css";
import { useEffect, useState } from 'react';
import { fetchHostelData, submitHostelData, searchStudent, deleteHostelData, updateHostelData } from "../utils/api";

const Hostel = () => {
  const [rollNo, setRollNo] = useState<number>();
  const [standard, setStandard] = useState<string | undefined>();
  const [room_no, setRoom] = useState<number | undefined>();
  const [bed_no, setBed] = useState<number | undefined>();
  const [occupied, setOccupied] = useState<number[]>([]);
  const [available, setAvailable] = useState<number[]>([]);
  const [show, setShow] = useState<boolean>(false);
  const [data, setData] = useState<any>(null);
  const [res, setRes] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const submit = async () => {
    try {
      const response = await submitHostelData({
        name: res.fullName,
        rollNo,
        standard,
        gender: res.gender,
        room_no,
        bed_no,
      });

      if (response.data) {
        alert('Data added successfully');
        window.location.reload();
      }
    } catch (error) {
      console.error('Error submitting data', error);
      alert('Failed to add data');
    }
  };

  useEffect(() => {
    const newOccupied: number[] = [];
    for (let i = 1; i <= 100; i++) {
      newOccupied.push(i);
    }
    setOccupied(newOccupied);

    const fetchData = async () => {
      try {
        const response = await fetchHostelData();
        setAvailable(response.data.available);
      } catch (error) {
        console.log('Error fetching hostel data', error);
      }
    };

    fetchData();
  }, []);

  const update = () => {
    setIsUpdating(true);
    setRollNo(data.rollNo);
    setStandard(data.standard);
  };

  const details = async (ele: number) => {
    try {
      const response = await fetchHostelData();
      response.data.result.forEach((e: any) => {
        if (e.bed_number === ele) {
          setData(e);
          setRoom(e.room_number);
          setBed(e.bed_number);
          setRollNo(e.rollNo);
          setStandard(e.standard);
          setShow(true);
        }
      });
    } catch (error) {
      console.log('Error fetching details', error);
    }
  };

  const search = async () => {
    try {
      const response = await searchStudent(rollNo!, standard);
      setRes(response.data);
    } catch (error) {
      console.log('Error searching student', error);
    }
  };

  const Delete = async () => {
    try {
      await deleteHostelData({
        rollNo,
        standard,
        room_no,
        bed_no,
      });
      alert("Student removed successfully!");
      window.location.reload();
    } catch (error) {
      console.log('Error deleting student', error);
    }
  };

  const clear = () => {
    setRollNo(undefined);
    setStandard(undefined);
    setRoom(undefined);
    setBed(undefined);
    setRes(null);
  };

  const updateHostel = async () => {
    try {
      await updateHostelData({
        rollNo,
        standard,
        room_no,
        bed_no,
      });
      alert("Successfully updated");
      window.location.reload();
    } catch (error) {
      alert("Update failed");
      console.log('Error updating hostel details', error);
    }
  };

  const goBack = () => {
    setIsUpdating(false);
  };

  return (
    <div>
      <div className="global-container">
        <div>
          <div>
            <div>
              <div>
                <h2>Hostel Accommodation</h2>
                <label>Roll No</label>
                <input
                  className='inputB'
                  type='number'
                  placeholder='Roll number'
                  value={rollNo ?? ''}
                  onChange={(e) => { setRollNo(Number(e.target.value)); }}
                />

                <label>Standard</label>
                <select
                  className="selectB"
                  value={standard ?? ''}
                  onChange={(e) => { setStandard(e.target.value); }}>
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
                <button onClick={search}>Search</button>
                {res && <button onClick={clear} style={{ marginLeft: "10px" }}>Clear</button>}
              </div>

              {res && (
                <div>
                  <h2>Searched Student</h2>
                  <div style={{ paddingLeft: "10px" }}>
                    <p>Name: {res.fullName}</p>
                    <p>Gender: {res.gender}</p>
                  </div>
                  <h2>Set Student Bed</h2>
                  <div>
                    <input className='inputB' type='number' placeholder='Room no.' onChange={(e) => { setRoom(Number(e.target.value)); }} /><br />
                    <input className='inputB' type='number' placeholder='Bed no.' onChange={(e) => { setBed(Number(e.target.value)); }} />
                  </div>
                  <button onClick={submit}>Save</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="global-container">
        {show ? (
          <div>
            <h2>Occupied By:</h2>
            <div><strong>Name:</strong> {data.name}</div>
            <div><strong>Roll No:</strong> {data.rollNo}</div>
            <div><strong>Gender:</strong> {data.gender}</div>
            <div><strong>Standard:</strong> {data.standard}</div>
            <div><strong>Bed Number:</strong> {data.bed_number}</div>
            <div><strong>Room Number:</strong> {data.room_number}</div>
            <button onClick={Delete} style={{ background: "#F88379" }}>Delete</button>
            <button style={{ marginLeft: "10px" }} onClick={update}>Update</button>
            <button style={{ marginLeft: "10px" }} onClick={() => { setShow(false); }}>Back</button>
          </div>
        ) : (
          <> </>
        )}

        {isUpdating && (
          <div>
            <h2>Update Hostel Details</h2>
            <input type="number" placeholder='Roll no.' value={rollNo ?? ''} onChange={(e) => setRollNo(Number(e.target.value))} />
            <select className="selectB" value={standard ?? ''} onChange={(e) => setStandard(e.target.value)}>
              <option value=''>Select standard</option>
              <option value='lkg1'>Lkg1</option>
              <option value='kg1'>kg1</option>
              <option value='kg2'>kg2</option>
              <option value='1st'>1st</option>
              <option value='2nd'>2nd</option>
              <option value='3rd'>3rd</option>
              <option value='4th'>4th</option>
              <option value='5th'>5th</option>
            </select>
            <input type="number" placeholder='Room no.' onChange={(e) => setRoom(Number(e.target.value))} /><br />
            <input type="number" placeholder='Bed no.' onChange={(e) => setBed(Number(e.target.value))} /><br />
            <button onClick={updateHostel}>Update</button>
            <button onClick={goBack} style={{ marginLeft: "10px" }}>Back</button>
          </div>
        )}

        <div>
          <div className='row'>
            <h2>Hostel bed rooms:</h2>
            <div>
              {occupied.map((ele, index) => (
                <button key={index} onClick={() => details(ele)} style={{ backgroundColor: available[index] !== 0 ? '#76e57a' : '#F88379', marginLeft: '10px' }}>
                  {ele}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hostel;
