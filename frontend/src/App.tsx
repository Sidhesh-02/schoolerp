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
import Control from "./pages/Control";
import { useRecoilValue } from "recoil";
import { handleInstitutionName } from "./store/store";
import { getCredentials } from "./apis/api";
import axios from "axios";

interface Auth {
  token: string;
  role: "teacher" | "admin";
}

const App: React.FC = () => {
  const [auth, setAuth] = useState<Auth | null>(null);
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);
  const InstitueName: string = useRecoilValue(handleInstitutionName);
  

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchRole(token);
    }
  }, []);

  const fetchRole = async (token: string) => {
    try {
      const response = await axios.post("http://localhost:5000/validate-token", { token }, {
        headers: { "Content-Type": "application/json" },
      });
  
      const data: Auth = response.data;
      setAuth(data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.response?.data || error.message);
      } else {
        console.error("Unexpected error:", error);
      }
      logout(); 
    }
  };
  

  const login = async () => {
    const usernameElement = document.getElementById("username") as HTMLInputElement | null;
    const passwordElement = document.getElementById("password") as HTMLInputElement | null;
    const username = usernameElement?.value || "";
    const password = passwordElement?.value || "";

    if (!username || !password) {
      alert("Username and password cannot be empty.");
      return;
    }

    try {
      const response = await getCredentials(username, password);
      if (response.message) {
        alert(response.message);
        return;
      }

      if (response.token) {
        localStorage.setItem("token", response.token);
        fetchRole(response.token);
      }
    } catch (error) {
      alert("Login failed. Please try again.");
    }
  };

  const logout = () => {
    setAuth(null);
    localStorage.removeItem("token");
    if(localStorage.getItem("selectedSession")){
      localStorage.removeItem("selectedSession");
    }
  };

  if (!auth) {
    return (
      <form className="login" action="">
        <div>
          <input className="studentInput" type="text" placeholder="Username" id="username" /><br />
          <input className="studentInput" type="password" placeholder="Password" id="password" /><br />
          <button
            onClick={(e) => {
              e.preventDefault();
              login();
            }}
          >
            Login
          </button>
        </div>
      </form>
    );
  }

  return (
    <div>
      <div
        style={{
          backgroundColor: "#313970",
          color: "white",
          padding: "10px 30px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <button
          style={{
            fontFamily: "Times New Roman",
            fontSize: "16px",
            color: "white",
            marginTop: "0",
            padding: "0",
            border: "none",
          }}
          onClick={() => setIsNavbarOpen(!isNavbarOpen)}
        >
          {isNavbarOpen ? <div>Close</div> : <div>Open</div>}
        </button>
        <div>
          <img
            src="/src/images/hamburger.png"
            style={{ width: "20px", height: "20px", paddingRight: "10px" }}
            alt=""
          />
          <span style={{ fontSize: "20px", fontWeight: "semibold" }}>{InstitueName}</span>
        </div>
        <div>ERP - Pallotii</div>
      </div>

      <div className="App">
        {isNavbarOpen && <Navbar auth={auth} logout={logout} />}
        <div className="content-wrapper">
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
            <Route
              path="/control"
              element={
                <ProtectedRoute auth={auth} allowedRoles={["admin"]}>
                  <Control />
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
