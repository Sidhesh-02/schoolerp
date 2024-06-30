/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/hostel.css";
function Hostel() {
  const nav = useNavigate();
  const [rollNo, setRollNo] = useState<number>();
  const [standard, setStandard] = useState<string | undefined>();
  const [room_no, setRoom] = useState<number | undefined>();
  const [bed_no, setBed] = useState<number | undefined>();
  const [occupied, setOccupied] = useState<number[]>([]);
  const [available, setAvailable] = useState<number[]>([]);
  const [show, setShow] = useState<boolean>(false);
  const [data, setData] = useState<any>(null);
  const [res, setRes] = useState<any>(null);

  const submit = async () => {
    try {
      const { data } = await axios.post(
        "http://localhost:5000/hosteldata",
        {
          name: res.fullName,
          rollNo,
          standard,
          gender: res.gender,
          room_no,
          bed_no,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (data) {
        alert("Data added successfully");
        location.reload();
      }
    } catch (error) {
      console.error("Error submitting data", error);
      alert("Failed to add data");
    }
  };

  useEffect(() => {
    const newOccupied: number[] = [];
    for (let i = 1; i <= 100; i++) {
      newOccupied.push(i);
    }
    setOccupied(newOccupied);
  }, []);

  useEffect(() => {
    const res = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/gethosteldata");
        setAvailable(data.available);
      } catch (error) {
        console.log("This is error: ", error);
      }
    };
    res();
  }, []);

  const update = () => {
    nav("/Hostel/update");
  };

  const details: any = async (ele: number) => {
    const { data } = await axios.get("http://localhost:5000/gethosteldata");
    console.log(data.result[0]);
    data.result.forEach((e: any) => {
      if (e.bed_number === ele) {
        setData(e);
        setShow(true);
      }
    });
  };

  const search = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/students/rollNo",
        {
          params: {
            rollno: rollNo,
            standard: standard,
          },
        }
      );
      setRes(data);
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="hostelsec">
      <div className="containerA">
        <h2 className="heading">Hostel Accommodation</h2>
        <div className="containerB">
          <div>
            <input
              className="inputB"
              type="number"
              placeholder="Roll number"
              onChange={(e) => {
                setRollNo(Number(e.target.value));
              }}
            />
            <select
              className="inputB"
              onChange={(e) => {
                setStandard(e.target.value);
              }}
            >
              <option value="">Select standard</option>
              <option value="lkg1">Lkg1</option>
              <option value="kg1">kg1</option>
              <option value="kg2">kg2</option>
              <option value="1st">1st</option>
              <option value="2nd">2nd</option>
              <option value="3rd">3rd</option>
              <option value="4th">4th</option>
              <option value="5th">5th</option>
            </select>
            <br />
            <button onClick={search}>Search</button>

            {res ? (
              <div>
                <p>Searched student:</p>
                <p>Name: {res.fullName}</p>
                <p>Gender: {res.gender}</p>
                <div>
                  <input className='inputB' type='number' placeholder='Room no.' onChange={(e) => { setRoom(Number(e.target.value)); }} /><br />
                  <input className='inputB' type='number' placeholder='Bed no.' onChange={(e) => { setBed(Number(e.target.value)); }} />
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>
{/* <<<<<<< HEAD
======= */}
          <input
            className="inputB"
            type="number"
            placeholder="Room no."
            onChange={(e) => {
              setRoom(Number(e.target.value));
            }}
          />
          <br />
          <input
            className="inputB"
            type="number"
            placeholder="Bed no."
            onChange={(e) => {
              setBed(Number(e.target.value));
            }}
          />
{/* >>>>>>> 2669e3c89cc049ec03b3e3a9869ec2c44639c985 */}
        </div>
        {res && <button onClick={submit}>Save</button>}
      </div>

      <button onClick={update}>Update</button>

      <div className="">
        {show ? (
          <div>
            <p>Occupied By:</p>
            name: {data.name}
            <br />
            rollNo: {data.rollNo}
            <br />
            gender: {data.gender}
            <br />
            standard: {data.standard}
            <br />
            bed_number: {data.bed_number}
            <br />
            room_number: {data.room_number}
            <br />
            <button
              onClick={() => {
                setShow(false);
              }}
            >
              Back
            </button>
          </div>
        ) : (
          <> </>
        )}
        <div className="row">
          <h2>Hostel bed rooms:</h2>
          {occupied.map((ele, index) => {
            return (
              <>
                <button
                  key={index}
                  onClick={() => details(ele)}
                  style={{
                    backgroundColor:
                      available[index] !== 0 ? "#0056b3" : "#DC143C",
                    borderRadius: "50px",
                  }}
                >
                  {ele}
                </button>
              </>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Hostel;
