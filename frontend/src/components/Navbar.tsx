import { NavLink } from "react-router-dom";
import "../styles/navbar.css";
import { SetStateAction, useState } from "react";
import { currentSession } from "../utils/api";

interface NavbarProps {
  auth: { username: string; role: "teacher" | "admin" } | null;
  logout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ auth, logout }) => {
  const links = [
    { name: "Report", roles: ["admin"] },
    { name: "Student", roles: ["admin"] },
    { name: "Search", roles: ["admin"] },
    { name: "Attendance", roles: ["teacher", "admin"] },
    { name: "Fees", roles: ["admin"] },
    { name: "Hostel", roles: ["admin"] },
    { name: "Marks", roles: ["teacher", "admin"] },
    { name: "Control", roles: ["admin"] },
  ];
  const [selectYear,setSelectedYear] = useState("2024-2025");
  
  const handleYearChange = (event: { target: { value: SetStateAction<string>; }; }) => {
    setSelectedYear(event.target.value);
  };

  const submitSession = async()=>{
    try{
      const res = await currentSession(selectYear);
      if(!res){
        alert("Not able to select");
      }
    }catch(e){
      console.error(e);
    }
  }
  return (
    <div className="navbar">
      <label>Select Year</label>
      <select value={selectYear} onChange={handleYearChange} style={{width:"150px"}}>
        <option value="2024-2025">2024-2025</option>
        <option value="2025-2026">2025-2026</option>
        <option value="2026-2027">2026-2027</option>
      </select>
      <button onClick={submitSession}>Submit Session</button>
      <ul>
        {auth &&
          links
            .filter((link) => link.roles.includes(auth.role))
            .map((link) => (
              <li key={`link-${link.name}`}>
                <NavLink
                  className={({ isActive }) => (isActive ? "active" : "")}
                  to={`/${link.name}`}
                  style={{ fontSize: "20px" }}
                >
                  {link.name}
                </NavLink>
              </li>
            ))}
      </ul>
      {auth && (
        <button className="logout" onClick={logout}>
          Logout
        </button>
      )}
    </div>
  );
};

export default Navbar;
