import axios from "axios";
import Student from "../pages/Student";

export const createStudent = async (student: Student) => {
  try {
    const response = await axios.post("http://localhost:5000/students", student);
    return response.data;
  } catch (error) {
    throw new Error("Error creating student");
  }
};

export const uploadPhoto = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post<string>("http://localhost:5000/uploadPhoto", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error("Error uploading image");
  }
};

// Attendance Routes
export const fetchStandards = async () => {
    return await axios.get("http://localhost:5000/getstandards");
  };
  
export const fetchSubjects = async () => {
    return await axios.get("http://localhost:5000/getsubjects");
};
  
export const fetchStudents = async (standard: string) => {
    return await axios.get(`http://localhost:5000/getattendancelist?standard=${standard}`);
};
  
export const submitAttendance = async (data: unknown) => {
    return await axios.post("http://localhost:5000/submitattendance", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
};

export const downloadAttendance = async () => {
  return await fetch('http://localhost:5000/downloadattendance');
};


// New API calls for Hostel
export const fetchHostelData = async () => {
    return await axios.get('http://localhost:5000/gethosteldata');
  };
  
  export const submitHostelData = async (hostelData: unknown) => {
    return await axios.post('http://localhost:5000/hosteldata', hostelData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };
  
  export const searchStudent = async (rollNo: number, standard: string | undefined) => {
    return await axios.get('http://localhost:5000/students/rollNo', {
      params: {
        rollno: rollNo,
        standard,
      },
    });
  };
  
  export const deleteHostelData = async (data: unknown) => {
    return await axios.post("http://localhost:5000/hostel/delete", data, {
      headers: {
        "Content-Type": "application/json",
      }
    });
  };
  
  export const updateHostelData = async (data: unknown) => {
    return await axios.post("http://localhost:5000/updatehostel", data, {
      headers: {
        "Content-Type": "application/json",
      }
    });
  };


  //marks
  export const addMarks = async (formData: unknown) => {
    return await axios.post("http://localhost:5000/add", formData);
  };
  
  export const searchMarks = async (rollNo: number, standard: string) => {
    return await axios.get("http://localhost:5000/marks/search", {
      params: {
        rollNo,
        standard
      }
    });
  };

  //fees
  export const fetchStudentFees = async (standard: string, rollNo: string) => {
    return await axios.get("http://localhost:5000/fees/details", {
      params: { standard: standard.trim(), roll_no: rollNo.trim() },
    });
  };
  
  export const addFeeInstallment = async (installment: unknown) => {
    return await axios.post("http://localhost:5000/fees/add", installment);
  };



  