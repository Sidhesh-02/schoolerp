import React from 'react';
import { downloadAttendance } from '../../apis/api';

const DownloadAttendance: React.FC = () => {
  const handleDownload = async () => {
    try {
      const response = await downloadAttendance();
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
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
    <div style={{marginTop:"-20px"}}>
      <button onClick={handleDownload}>Download Attendance</button>
    </div>
  );
};

export default DownloadAttendance;
