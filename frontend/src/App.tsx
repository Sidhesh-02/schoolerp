import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Admin from './pages/Admin.tsx';
import Student from './pages/Student.tsx';
import Attendance from './pages/Attendance.tsx';
import Fees from './pages/Fees.tsx';
import Hostel from './pages/Hostel.tsx';
import Marks from './pages/Marks.tsx';
import "./styles/App.css"
import UploadStudent from './pages/UploadStudents.tsx';

const App = () => {
  return (
    <div className="App">
      <Navbar />
      <div className='content-wrapper'>
        <Routes>
          <Route path="/Admin" element={<Admin />} />
          <Route path="/UploadAll" element={<UploadStudent />} />
          <Route path="/Student" element={<Student />} />
          <Route path="/Attendance" element={<Attendance />} />
          <Route path="/Fees" element={<Fees />} />
          <Route path="/Hostel" element={<Hostel />} />
          <Route path="/Marks" element={<Marks/>} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
