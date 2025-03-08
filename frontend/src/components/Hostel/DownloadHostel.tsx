import React from 'react'
import {downloadHosteldata } from '../../apis/api';

const DownloadHostel : React.FC = () => {
    const handleDownload = async () => {
        try {
          const response = await downloadHosteldata();
          const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'Hostel.xlsx';
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
        } catch (error) {
          console.error('Error downloading Hostel records:', error);
          alert('Failed to download Hostel records');
        }
      };
  return (
    <div style={{marginTop:"-20px"}}>
        <button onClick={handleDownload}>Download Hostel Data</button>
    </div>
  )
}

export default DownloadHostel
