import { NavLink } from "react-router-dom";
import "../styles/navbar.css";
import { SetStateAction, useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import { sessionYear } from "../store/store";
import axios from "axios";

interface NavbarProps {
  auth: { token: string; role: "teacher" | "admin" } | null;
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

  // Initialize state with value from localStorage if available
  const [selectYear, setSelectedYear] = useState(
    localStorage.getItem("selectedSession") || "2024-2025"
  );
  const years : string[] = useRecoilValue(sessionYear);
  
  useEffect(() => {
    // On component mount, if there's a saved session, use it
    const savedSession = localStorage.getItem("selectedSession");
    if (savedSession) {
      setSelectedYear(savedSession);
    }
  }, []);

  const handleYearChange = (event: { target: { value: SetStateAction<string> } }) => {
    const selectedValue = event.target.value;
    setSelectedYear(selectedValue);
  };

  const submitSession = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/setSession`, { params: { year: selectYear } });
  
      if (response.status === 200) {
        alert(response.data.message); // Consider replacing with a toast notification or modal
        localStorage.setItem("selectedSession", selectYear);
        window.location.reload();
      } else {
        console.error("Unexpected response status:", response.status);
      }
    } catch (e) {
      console.error("Error setting session:", e);
      alert("Failed to set session. Please try again later."); // User-friendly error message
    }
  };
  

  return (
    <div className="navbar">
      <label>Select Year</label>
      <select value={selectYear} onChange={handleYearChange} style={{ width: "150px" }}>
        {
          years.map((ele,key)=>(
            <option key={key} value={ele}>{ele}</option>
          ))
        }
      </select>
      <button style={{ maxWidth: "max-content" }} onClick={submitSession}>
        Select Session
      </button>
      <ul style={{ paddingLeft: "5px" }}>
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
