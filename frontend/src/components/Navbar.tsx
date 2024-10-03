import { NavLink } from "react-router-dom";
import "../styles/navbar.css";
import { SetStateAction, useState, useEffect } from "react";
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

  // Initialize state with value from localStorage if available
  const [selectYear, setSelectedYear] = useState(
    localStorage.getItem("selectedSession") || "2024-2025"
  );

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
      const res = await currentSession(selectYear);
      if (res) {
        // Save the selected year in localStorage
        localStorage.setItem("selectedSession", selectYear);
        alert(`${selectYear} Session Selected`);
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="navbar">
      <label>Select Year</label>
      <select value={selectYear} onChange={handleYearChange} style={{ width: "150px" }}>
        <option value="2024-2025">2024-2025</option>
        <option value="2025-2026">2025-2026</option>
        <option value="2026-2027">2026-2027</option>
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
