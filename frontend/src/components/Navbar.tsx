import { NavLink } from "react-router-dom";
import "../styles/navbar.css";

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
  ];

  return (
    <div className="navbar">
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
