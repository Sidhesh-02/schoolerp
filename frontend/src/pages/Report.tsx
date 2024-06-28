// import React from "react";
import "../styles/report.css"; // Import the CSS file

const Report = () => {
  return (
    <>
      <div className="report-container">
        <h2>Reports</h2>
        <div className="dashboard">
          <div className="dashboard-item">
            <h3>Total Students</h3>
            <h3>0</h3>
          </div>
          <div className="dashboard-item">
            <h3>Absent Students</h3>
            <h3>0</h3>
          </div>
          <div className="dashboard-item">
            <h3>Total Money Collected</h3>
            <h3>0</h3>
          </div>
          <div className="dashboard-item">
            <h3>Students Yet to Pay Fees</h3>
            <h3>0</h3>
          </div>
          <div className="dashboard-item">
            <h3>Total Beds Remaining</h3>
            <h3>0</h3>
          </div>
        </div>
      </div>
    </>
  );
};

export default Report;
