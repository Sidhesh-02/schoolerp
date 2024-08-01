import "./styles/App.css";
import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Report from "./pages/Report";
import Student from "./pages/Student";
import Attendance from "./pages/Attendance";
import Fees from "./pages/Fees";
import Hostel from "./pages/Hostel";
import Marks from "./pages/Marks";
import ProtectedRoute from "./components/ProtectedRoute";
import Search from "./pages/Search";

interface Auth {
  username: string;
  role: "teacher" | "admin";
}

const App: React.FC = () => {
  const [auth, setAuth] = useState<Auth | null>(null);
  const [isNavbarOpen, setIsNavbarOpen] = useState(true); // Add this line

  useEffect(() => {
    const storedAuth = localStorage.getItem("auth");
    if (storedAuth) {
      setAuth(JSON.parse(storedAuth));
    }
  }, []);

  const login = (username: string, password: string) => {
    let user: Auth | null = null;
    if (username === "teacher" && password === "teacherpassword") {
      user = { username, role: "teacher" };
    } else if (username === "admin" && password === "adminpassword") {
      user = { username, role: "admin" };
    } else {
      alert("Invalid credentials");
      return;
    }
    setAuth(user);
    localStorage.setItem("auth", JSON.stringify(user));
  };

  const logout = () => {
    setAuth(null);
    localStorage.removeItem("auth");
  };

  if (!auth) {
    return (
      <form className="login" action="">
        <div>
          <input className="studentInput" type="text" placeholder="Username" id="username" /><br />
          <input className="studentInput" type="password" placeholder="Password" id="password" /><br />
          <button
            onClick={() =>
              login(
                (document.getElementById("username") as HTMLInputElement).value,
                (document.getElementById("password") as HTMLInputElement).value
              )
            }
          >
            Login
          </button>
        </div>
      </form>
    );
  }

  return (
    <div>
      <div style={{ backgroundColor: "#f4e3e3",padding:"10px 10px",display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <button className="nullify-button" style={{fontSize:"15px"}} onClick={() => setIsNavbarOpen(!isNavbarOpen)}>
          {isNavbarOpen ? "Close Navigation" : "Open Nagivation"}
        </button>
        <div>Developed by SVPCET Software Developer Team - 2024</div>
      </div>

      <div className="App">
        {isNavbarOpen && <Navbar auth={auth} logout={logout} />}
        <div className="content-wrapper">
          <header>
            <h1>Sacred Heart School</h1>
          </header>
          <Routes>
            <Route path="/" element={<Navigate to="/Report" />} />
            <Route
              path="/Report"
              element={
                <ProtectedRoute auth={auth} allowedRoles={["admin"]}>
                  <Report />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Student"
              element={
                <ProtectedRoute auth={auth} allowedRoles={["admin"]}>
                  <Student />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Search"
              element={
                <ProtectedRoute auth={auth} allowedRoles={["admin"]}>
                  <Search />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Attendance"
              element={
                <ProtectedRoute auth={auth} allowedRoles={["teacher", "admin"]}>
                  <Attendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Fees"
              element={
                <ProtectedRoute auth={auth} allowedRoles={["admin"]}>
                  <Fees />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Hostel"
              element={
                <ProtectedRoute auth={auth} allowedRoles={["admin"]}>
                  <Hostel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/Marks"
              element={
                <ProtectedRoute auth={auth} allowedRoles={["teacher", "admin"]}>
                  <Marks />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </div>

  );
};

export default App;
