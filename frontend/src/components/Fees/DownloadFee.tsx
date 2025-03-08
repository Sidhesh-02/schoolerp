import React from 'react'
import { downloadFees } from '../../apis/api';

const DownloadFee : React.FC = () => {
    const handleDownload = async () => {
        try {
          const response = await downloadFees();
          const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'Fees.xlsx';
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
        } catch (error) {
          console.error('Error downloading fees records:', error);
          alert('Failed to download fees records');
        }
      };
  return (
    <div style={{marginTop:"-20px"}}>
        <button onClick={handleDownload}>Download Fees</button>
    </div>
  )
}

export default DownloadFee
