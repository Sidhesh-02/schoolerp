const express = require("express");
const cors = require("cors");
const path = require("path");

const fileStorage = require("./sessionManager");

// Import routes
const student = require("./routes/studentRoutes");
const attendance = require("./routes/attendanceRoutes");
const fees = require("./routes/feesRoutes");
const marks = require("./routes/marksRoutes");
const hostel = require("./routes/hostelRoutes");
const control = require("./routes/controlRoutes");
const other = require("./routes/otherRoutes");

const app = express();

// Configure CORS
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/session', (req, res) => {
    const { year } = req.body;

    if (!year) {
        return res.status(400).send('Year is required');
    }

    // Read current data from the file
    const data = fileStorage.readData();
    
    // Set the year in the file
    data.year = year;
    fileStorage.writeData(data);

    console.log("Year stored in local file:", year);
    res.status(200).send({ message: 'Year stored', year });
});


// Use routers with appropriate paths AFTER session is set up
app.use(student);
app.use(attendance);
app.use(fees);
app.use(marks);
app.use(hostel);
app.use(control);
app.use(other);

// Start server
app.listen(5000, () => {
    console.log(`Server is running on http://localhost:5000`);
});
