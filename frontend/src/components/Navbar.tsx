import React from "react";
import "../styles/navbar.css";
const Navbar = () => {
  return (
    <div className="nav">
      <ul className="app_navbar-links">
        {["Home", "About", "Contact", "Work", "skills"].map((ele) => (
          <li key={`link-${ele}`} className="app_flex p-text">
            <div></div>

            <a href={`/${ele}`}>{ele}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Navbar;
