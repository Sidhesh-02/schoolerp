import React from 'react';

const DownloadAttendance: React.FC = () => {
  const handleDownload = async () => {
    try {
      const response = await fetch('http://localhost:5000/downloadattendance');
      if (!response.ok) {
        throw new Error('Failed to download attendance records');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'attendance.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading attendance records:', error);
      alert('Failed to download attendance records');
    }
  };

  return (
    <div>
      <button onClick={handleDownload}>Download Attendance</button>
    </div>
  );
};

export default DownloadAttendance;
