import { Link } from "react-router-dom";
import "../styles/Navbar.css"

const Navbar = () => {
  return (
    <div className="navbar">
      <ul>
        {["Admin", "Student", "Attendance", "Fees", "Hostel", "Marks"].map((ele) => (
          <li key={`link-${ele}`} className="app_flex p-text">
            <Link to={`/${ele}`}>{ele}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Navbar;
