import React from 'react';
import axios from 'axios';

const StudentsInfoDownload: React.FC = () => {
  const downloadExcel = async () => {
    try {
      const response = await axios.get('http://localhost:5000/excelstudents', {
        responseType: 'blob', 
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'students_data.xlsx'); // file name for the downloaded file
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading Excel file', error);
      alert('An error occurred while downloading the Excel file. Please try again later.');
    }
  };

  return (
    <div>
      <h2>Download All Student Data</h2>
      <button style={{marginTop:"-2px"}} onClick={downloadExcel}>Download Excel</button>
    </div>
  );
};

export default StudentsInfoDownload;
