import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Report from "./pages/Report";
import Student from "./pages/Student";
import Attendance from "./pages/Attendance";
import Fees from "./pages/Fees";
import Hostel from "./pages/Hostel";
import Marks from "./pages/Marks";
import UploadStudent from "./pages/UploadStudents";
import ProtectedRoute from "./components/ProtectedRoute";
import "./styles/App.css";

interface Auth {
  username: string;
  role: "teacher" | "admin";
}

const App: React.FC = () => {
  const [auth, setAuth] = useState<Auth | null>(null);

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
      <div className="login">
        <input type="text" placeholder="Username" id="username" />
        <input type="password" placeholder="Password" id="password" />
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
    );
  }

  return (
    <div className="App">
      <Navbar auth={auth} logout={logout} />
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
            path="/Upload"
            element={
              <ProtectedRoute auth={auth} allowedRoles={["admin"]}>
                <UploadStudent />
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
  );
};

export default App;
