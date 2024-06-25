// Navbar.tsx
import { Link } from "react-router-dom";
import "../styles/Navbar.css";

interface NavbarProps {
  auth: { username: string; role: 'teacher' | 'admin' } | null;
  logout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ auth, logout }) => {
  const links = [
    { name: "Report", roles: ['admin'] },
    { name: "Upload", roles: ['admin'] },
    { name: "Student", roles: ['admin'] },
    { name: "Attendance", roles: ['teacher', 'admin'] },
    { name: "Fees", roles: ['admin'] },
    { name: "Hostel", roles: ['admin'] },
    { name: "Marks", roles: ['teacher', 'admin'] }
  ];

  return (
    <div className="navbar">
      <ul>
        {auth && links
          .filter(link => link.roles.includes(auth.role))
          .map((link) => (
            <li key={`link-${link.name}`} className="app_flex p-text">
              <Link to={`/${link.name}`}>{link.name}</Link>
            </li>
          ))}
      </ul>
      {auth && (
        <button onClick={logout} className="logout-button">Logout</button>
      )}
    </div>
  );
};

export default Navbar;
