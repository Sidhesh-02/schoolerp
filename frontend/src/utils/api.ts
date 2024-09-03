/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import Student from "../pages/Student";

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

export const report = async () => {
  return await axios.get("http://localhost:5000/studentcount");
};


//Student Operations
export const createStudent = async (student: Student) => {
  try {
    const response = await axios.post("http://localhost:5000/students", student);
    return response.data;
  } catch (error) {
    throw new Error("Error creating student");
  }
};

export const updateStudent = async (studentId: number, studentData: any,rollNo?: any,standard?:string) => {
  try {
    
    if (studentData.photoUrl && Object.keys(studentData).length === 1) {
      // Fetch current student data
      const response = await axios.get(`http://localhost:5000/students/rollNo`, {
        params: { rollno: rollNo, standard }
      });
      const currentData = response.data;

      // Merge current data with the new photoUrl
      const updateData = { ...currentData, photoUrl: studentData.photoUrl };
      
      // Update student with only photoUrl change
      await axios.put(`http://localhost:5000/update/student/${studentId}`, updateData);
    } else {
      // Update student with all provided data
      await axios.put(`http://localhost:5000/update/student/${studentId}`, studentData);
    }
  } catch (error) {
    console.error("Error updating student:", error);
    throw error;
  }
};




export const deleteStudent = async (studentId: number) => {
  try {
    await axios.delete("http://localhost:5000/delete/students", {
      params: {
        studentId: studentId,
      },
    });
  } catch (error) {
    console.error("Error deleting student:", error);
    throw error;
  }
};


// As per standard
export const fetchAllStudents = async (std: string) => {
  try {
    const response = await axios.get("http://localhost:5000/getallstudent", {
      params: { std },
    });
    return response.data.result;
  } catch (error) {
    throw new Error("Error fetching students");
  }
};

// As per scholarship search

export const fetchAllStudentsSc = async()=>{
  try{
    const res = await axios.get("http://localhost:5000/getallstudentsc");
    return res.data;
  }catch(error){
    throw new Error("Error fetching students");
  }
}

export const downloadStudentsExcel = async () => {
  return await axios.get('http://localhost:5000/excelstudents', {
    responseType: 'blob',
  });
};

export const uploadStudentsFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  return await axios.post('http://localhost:5000/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
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
  
  export const searchStudent = (rollNo: number, standard: string | undefined) => {
    return axios.get('http://localhost:5000/students/rollNo', {
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

  export const feetable = async (id:number,title:string)=>{
    const res = await axios.get("http://localhost:5000/feetable", {
      params: {
        id,
        title,
      },
    });

    return res;
  }


// control panel

export const addSubject = async(data : any)=>{
  const res = await axios.post("http://localhost:5000/control/subjects", {
      std : data.std,
      subjects : data.subjects
  }, {
    headers : {
      'Content-Type' : 'application/json'
    }
  })
  return res;
}

export const addMiscellaneous = async(data : any) =>{
  const res = await axios.post("http://localhost:5000/fixChanges", {
      number_of_hostel_bed : data.num_of_beds,
      one: data.Installment1,
      two :data.Installment2, 
      three :data.Installment3
    },{
      headers : {
        'Content-Type' : 'application/json'
      }
    } 
  )
  return res;
}

export const constants_from_db = async ()=>{
  const data = await axios.get("http://localhost:5000/getChanges");
  return data || {};
}


  