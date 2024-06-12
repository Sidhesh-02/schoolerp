import React, { useState } from 'react';
import axios from 'axios';


const UploadExcel: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(() => {
        alert('File uploaded successfully');
      })
      .catch(error => {
        console.error('Error uploading file:', error);
        alert('Failed to upload file');
      });
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload Excel File</h2>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
      <button onClick={handleUpload} className="upload-button">Upload</button>
    </div>
  );
};

export default UploadExcel;
