import axios from "axios";
import { useState } from "react";

const UploadStudents = () => {
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
            }).then(() => {
                alert('File uploaded successfully');
            }).catch(error => {
            console.error('Error uploading file:', error);
            alert('Failed to upload file');
        });
        }
    };
    return ( 
        <div>
            <h2>Upload Students at Once</h2>
            <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
            <button onClick={handleUpload} >Upload</button>
        </div>
     );
}
 
export default UploadStudents;