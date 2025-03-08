/* eslint-disable @typescript-eslint/no-explicit-any */
import Student from "../pages/Student";
import axiosInstance from "../apis/axiosInstance"
import axios from "axios";

/**
 * Global API Request Method
 */
const apiRequest = async (method: any, url: string, data?: any, config?: any) => {
  const response = await axiosInstance({ method, url, data, ...config });
  return response.data;
};

/**
 * GET Request
 */
export const report = () => apiRequest("GET", "/reportsdata");
export const fetchAllStudents = (std: string) => apiRequest("GET", "/getallstudent", undefined, { params: { std } });
export const fetchAllStudentsSc = () => apiRequest("GET", "/getallstudentsc");
export const fetchStandards = () => apiRequest("GET", "/getstandards");
export const fetchSubjects = (selectedStandard: string) => apiRequest("GET", "/getsubjects",undefined, {params :{ selectedStandard }});
export const fetchStudents = (standard: string) => apiRequest("GET", "/getattendancelist", undefined,{params:{ standard }});
export const fetchHostelData = () => apiRequest("GET", "/gethosteldata");
export const searchStudent = (rollNo: number, standard: string) => apiRequest("GET", "/students/rollNo", undefined, { params : { rollno: rollNo, standard }});
export const searchMarks = (params: number | string, standard: string) => apiRequest("GET", "/marks/search", { params, standard });
export const fetchStudentFees = (standard: string, rollNo: string) => apiRequest("GET", "/fees/details", undefined, { params: { standard: standard.trim(), roll_no: parseInt(rollNo.trim()) } });
export const feeRecipt = (id: number, title: string) => apiRequest("GET", "/feeRecipt", undefined, {params:{ id, title }});
export const constants_from_db = () => apiRequest("GET", "/getChanges");
export const getCurrentSession = () => apiRequest("GET", "/getSessions");
export const getInstitutionNameAndLogo = () => apiRequest("GET", "/getChanges");
export const fetchInstallments = () => apiRequest("GET", "/getInstallments");

/**
 * POST Request
 */
export const createStudent = (student: Student) => apiRequest("POST", "/students", student);
export const submitAttendance = (data: unknown) => apiRequest("POST", "/submitattendance",undefined, {data});
export const submitHostelData = (hostelData: unknown) => apiRequest("POST", "/hosteldata", hostelData);
export const deleteHostelData = (data: unknown) => apiRequest("POST", "/hostel/delete", data);
export const updateHostelData = (data: unknown) => apiRequest("POST", "/updatehostel", data);
export const addMarks = (formData: unknown) => apiRequest("POST", "/add", formData);
export const addFeeInstallment = (installment: unknown) => apiRequest("POST", "/fees/add", installment);
export const addStandard = (data: any) => apiRequest("POST", "/control/standard", data);
export const addSubjects = (data: any) => apiRequest("POST", "/control/subjects", data);
export const addControlValues = (data: any) => apiRequest("POST", "/changesFromControlPanel", data);
export const currentSession = (year: string) => apiRequest("POST", "/session", { year });
export const getCredentials = (username: string, password: string) => apiRequest("POST", "/credentials", undefined,{ params : { username, password }});

export const deleteStudent = (studentId: number) => apiRequest("DELETE", `/delete/students`, undefined, {params : {studentId}});

/**
 * Document Download Route
 */
export const downloadStudentsExcel = async () => {
  return await axios.get('http://localhost:5000/excelstudents', {
    responseType: 'blob',
  });
};
export const downloadHosteldata = async () => {
  return await axios.get('http://localhost:5000/downloadhosteldata', {
    responseType: 'blob',
  });
};
export const downloadMarks = async () => {
  return await axios.get('http://localhost:5000/downloadMarks', {
    responseType: 'blob',
  });
};
export const downloadAttendance = async()=>{
  return await axios.get('http://localhost:5000/downloadAttendance', {
    responseType: 'blob',
  });
}
export const downloadFees = async () => {
  return await axios.get('http://localhost:5000/downloadFees', {
    responseType: 'blob',
  });
};
export const downloadScholarshipStudent = async()=>{
  return await axios.get('http://localhost:5000/scholarshipStudents', {
    responseType: 'blob',
  });
}

/**
 * Document Upload Route
 */
export const uploadStudentsFile = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return apiRequest("POST", "/upload", formData);
};
export const uploadAttendance = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return apiRequest("POST", "/uploadAttendance", formData);
};
export const uploadfeedata = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return apiRequest("POST", "/uploadFee", formData);
};
export const uploadSchoolLogo = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return apiRequest("POST", "/uploadSchoolLogo", formData);
};
export const uploadMarks = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return apiRequest("POST", "/uploadMarks", formData);
};
export const uploadHosteldata = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return apiRequest("POST", "/uploadHostel", formData);
};
export const uploadPhoto = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return apiRequest("POST", "/uploadPhoto", formData);
};


export const updateStudent = async (studentId: number,editableStudent:any) => {
  try {
    const currentData = searchStudent(editableStudent.rollNo,editableStudent.standard)
    if(editableStudent.url){
      const updateData = { ...currentData, photoUrl: editableStudent.url};
      return await axios.put(`http://localhost:5000/update/student/${studentId}`, updateData);
    }
    return await axios.put(`http://localhost:5000/update/student/${studentId}`, editableStudent);  
  } catch (error) {
    console.error("Error updating student:", error);
    throw error;
  }
};