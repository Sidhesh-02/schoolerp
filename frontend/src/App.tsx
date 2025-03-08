import "./styles/App.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { handleInstitutionLogo, handleInstitutionName } from "./store/store";
import { getCredentials } from "./apis/api";
import axios from "axios";

interface Auth {
  token: string;
  role: "teacher" | "admin";
}

const App: React.FC = () => {
  const navigate = useNavigate();
  const [auth, setAuth] = useState<Auth | null>(null);
  const [isNavbarOpen, setIsNavbarOpen] = useState(true);
  const InstitueName = useRecoilValue(handleInstitutionName);
  const InstitueLogo = useRecoilValue(handleInstitutionLogo);

  /**
   * Fetches user authentication details from local storage.
   * If a token exists, it validates the token and sets the user's role.
   */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchRole(token);
    }
  }, []);

  /**
   * Validates the user token by sending it to the backend.
   *
   * @param {string} token - The authentication token stored in local storage.
   * @throws {Error} - If the token is invalid, logs out the user.
   */
  const fetchRole = async (token: string) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/validate-token",
        { token },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

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

  /**
   * Handles user login by validating credentials and storing the token.
   * 
   * @returns {Promise<void>}
   */
  const login = async () => {
    const usernameElement = document.getElementById(
      "username"
    ) as HTMLInputElement | null;
    const passwordElement = document.getElementById(
      "password"
    ) as HTMLInputElement | null;
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

  /**
   * Logs out the user by clearing authentication details and redirecting to the login page.
   */
  const logout = () => {
    setAuth(null);
    localStorage.removeItem("token");
    if (localStorage.getItem("selectedSession")) {
      localStorage.removeItem("selectedSession");
    }
    navigate("/");
  };

  // If user is not authenticated, render the login form
  if (!auth) {
    return (
      <form className="login">
        <div>
          <input
            className="studentInput"
            type="text"
            placeholder="Username"
            id="username"
            autoComplete="username"
          />
          <br />
          <input
            className="studentInput"
            type="password"
            placeholder="Password"
            id="password"
            autoComplete="current-password"
          />
          <br />
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
      {/* Navbar Header */}
      <div
        style={{
          backgroundColor: "#0A255C",
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
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src={InstitueLogo}
            style={{ width: "40px", height: "40px", paddingRight: "10px" }}
            alt="Institute Logo"
          />
          <span style={{ fontSize: "20px", fontWeight: "semibold" }}>
            {InstitueName}
          </span>
        </div>
        <div>ERP - Pallotii</div>
      </div>

      <div className="App">
        {isNavbarOpen && <Navbar auth={auth} logout={logout} />}
        <div className="content-wrapper">
          <Routes>
            {/* Redirect root path to /Report */}
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
