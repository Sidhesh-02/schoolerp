import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "http://localhost:5000", 
});

// Global error handler
axiosInstance.interceptors.response.use(
    (response) => response, 
    (error) => {
        let errorMessage = error.response?.data?.message;

        // Check if errorMessage is an array or string
        if (Array.isArray(errorMessage)) {
            errorMessage = errorMessage[0];
        }

        // If errorMessage is a string, display it
        if (typeof errorMessage === "string") {
            alert(errorMessage);
        } else {
            alert("An unknown error occurred");
        }

        return Promise.reject(error); 
    }
);


export default axiosInstance;
