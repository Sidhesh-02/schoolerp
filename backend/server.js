const express = require("express");
const cors = require("cors");
const path = require("path");
const student = require("./routes/studentRoutes");
const attendance = require("./routes/attendanceRoutes");
const fees = require("./routes/feesRoutes");
const marks = require("./routes/marksRoutes");
const hostel = require("./routes/hostelRoutes");
const other = require("./routes/otherRoutes");

const app = express();

// Configure CORS
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use routers with appropriate paths
app.use(student);
app.use(attendance);
app.use(fees);
app.use(marks);
app.use(hostel);
app.use(other);


app.listen(5000, () => {
    console.log(`Server is running on http://localhost:5000`);
});
