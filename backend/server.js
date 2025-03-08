const express = require("express");
const cors = require("cors");
const path = require("path");
// Import routes
const student = require("./routes/studentRoutes");
const attendance = require("./routes/attendanceRoutes");
const fees = require("./routes/feesRoutes");
const marks = require("./routes/marksRoutes");
const hostel = require("./routes/hostelRoutes");
const control = require("./routes/controlRoutes");
const other = require("./routes/otherRoutes");
const session = require("./routes/sessionRoute");
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware to attach the session to the request object
const sessionMiddleware = require("./middleware/sessionMiddleware")
app.use(sessionMiddleware);

// Use routers with appropriate paths AFTER session is set up
app.use(session);
app.use(student);
app.use(attendance);
app.use(fees);
app.use(marks);
app.use(hostel);
app.use(control);
app.use(other);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: err.message || 'Internal Server Error',
    });
});
// Start server
app.listen(5000, () => {
    console.log(`Server is running on http://localhost:5000`);
});
