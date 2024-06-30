const express = require("express");
const { PrismaClient } = require("@prisma/client");
const cors = require("cors");
const ExcelJS = require("exceljs");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const PORT = 5000;
const app = express();
const prisma = new PrismaClient();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());

function jsonBigIntReplacer(key, value) {
  if (typeof value === "bigint") {
    return value.toString();
  }
  return value;
}

// Create Student
app.post("/students", async (req, res) => {
  const {
    fullName,
    gender,
    dateOfBirth,
    rollNo,
    standard,
    adhaarCardNo,
    scholarshipApplied,
    address,
    parents,
    fees,
  } = req.body;

  try {
    const student = await prisma.student.create({
      data: {
        fullName,
        gender,
        dateOfBirth: new Date(dateOfBirth),
        rollNo: parseInt(rollNo),
        standard,
        adhaarCardNo: parseInt(adhaarCardNo),
        scholarshipApplied,
        address,
        parents: {
          create: parents.map((parent) => ({
            fatherName: parent.fatherName,
            fatherOccupation: parent.fatherOccupation,
            motherName: parent.motherName,
            motherOccupation: parent.motherOccupation,
            fatherContact: parseInt(parent.fatherContact),
            motherContact: parseInt(parent.motherContact),
            address: parent.address,
          })),
        },
        fees: {
          create: fees.map((fee) => ({
            title: fee.installmentType,
            amount: parseFloat(fee.amount),
            amountDate: new Date(fee.amountDate),
            admissionDate: new Date(fee.admissionDate),
            pendingAmount: 10500 - parseFloat(fee.amount),
          })),
        },
      },
      include: {
        parents: true,
        fees: true,
        attendanceRecords: true,
      },
    });

    res.status(201).json(JSON.stringify(student, jsonBigIntReplacer));
  } catch (error) {
    console.error("Error creating student:", error);
    res.status(500).send("Failed to create student");
  }
});


const deleteStudent = async (studentId) => {
  try {
    // Delete related records
    await prisma.parent.deleteMany({ where: { studentId: studentId } });
    await prisma.fee.deleteMany({ where: { studentId: studentId } });
    await prisma.attendance.deleteMany({ where: { studentId: studentId } });
    // await prisma.mark.deleteMany({ where: { studentId: studentId, } });

    // Delete the student record
    await prisma.student.delete({ where: { id: parseInt(studentId) } });

    return {
      success: true,
      message: "Student and related records deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting student:", error);
    throw new Error("Failed to delete student");
  }
};

app.delete("/delete/students", async (req, res) => {
  const { studentId } = req.query;
  try {
    await deleteStudent(parseInt(studentId));
    res.status(200).send({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).send({ error: "Failed to delete student" });
  }
});

// Upload Student In Bulk with Excel
app.post("/upload", upload.single("file"), async (req, res) => {
  const filePath = req.file.path;

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.getWorksheet(1);

  const students = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber !== 1) {
      // Skip header row
      const student = {
        fullName: row.getCell(1).value,
        gender: row.getCell(2).value,
        dateOfBirth: row.getCell(3).value,
        rollNo: parseInt(row.getCell(4).value),
        standard: row.getCell(5).value,
        adhaarCardNo: BigInt(row.getCell(6).value),
        scholarshipApplied: row.getCell(7).value === "Yes",
        address: row.getCell(8).value,
        parents: [
          {
            fatherName: row.getCell(9).value,
            fatherOccupation: row.getCell(10).value,
            motherName: row.getCell(11).value,
            motherOccupation: row.getCell(12).value,
            fatherContact: BigInt(row.getCell(13).value),
            motherContact: BigInt(row.getCell(14).value),
            address: row.getCell(8).value,
          },
        ],
        fees: [
          {
            title: row.getCell(15).value,
            amount: parseFloat(row.getCell(16).value),
            amountDate: row.getCell(17).value,
            admissionDate: row.getCell(18).value,
            pendingAmount: 0,
          },
        ],
      };
      students.push(student);
    }
  });

  try {
    // Create students with mapped class ids
    for (const student of students) {
      await prisma.student.create({
        data: {
          fullName: student.fullName,
          gender: student.gender,
          dateOfBirth: student.dateOfBirth,
          rollNo: student.rollNo,
          standard: student.standard,
          adhaarCardNo: student.adhaarCardNo,
          scholarshipApplied: student.scholarshipApplied,
          address: student.address,
          parents: {
            create: student.parents,
          },
          fees: {
            create: student.fees,
          },
        },
      });
    }

    fs.unlinkSync(filePath);
    res.status(200).send("File uploaded and data imported successfully");
  } catch (error) {
    console.error("Error importing data:", error);
    res.status(500).send("Failed to import data");
  }
});

//Attendance
// Get Student by Standards
app.get("/getstandards", async (req, res) => {
  try {
    const standards = await prisma.student.findMany({
      distinct: ["standard"],
      select: {
        standard: true,
      },
    });

    const standardList = standards.map((std) => std.standard);
    res
      .status(200)
      .send(JSON.stringify({ standards: standardList }, jsonBigIntReplacer));
  } catch (error) {
    console.error("Error fetching standards:", error);
    res.status(500).send("Failed to fetch standards");
  }
});

// Get Student List according to standard for Attendance
app.get("/getattendancelist", async (req, res) => {
  const { standard, subjectId } = req.query;

  try {
    const students = await prisma.student.findMany({
      where: {
        standard,
      },
      orderBy: { rollNo: "asc" },
    });

    res.status(200).send(JSON.stringify(students, jsonBigIntReplacer));
  } catch (error) {
    console.error("Error fetching students by standard:", error);
    res.status(500).send("Failed to fetch students");
  }
});

app.get("/getsubjects", async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany();
    res.status(200).json(subjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    res.status(500).send("Failed to fetch subjects");
  }
});

app.post("/submitattendance", async (req, res) => {
  const { standard, date, absentStudents, subjectId } = req.body;

  try {
    const students = await prisma.student.findMany({
      where: { standard },
    });

    let subject = null;
    if (subjectId) {
      subject = await prisma.subject.findUnique({
        where: { id: parseInt(subjectId) },
        select: { name: true },
      });
    }

    const attendanceRecords = students.map((student) => ({
      studentName: student.fullName,
      date: new Date(date),
      status: absentStudents.includes(student.rollNo),
      rollNo: student.rollNo,
      studentId: student.id,
      subjectId: subject ? parseInt(subjectId) : null,
      subjectName: subject ? subject.name : null, // Assign subject name if found
      standard, // Assign standard to each attendance record
    }));

    await prisma.attendance.createMany({
      data: attendanceRecords,
    });

    res.status(201).send("Attendance recorded successfully");
  } catch (error) {
    console.error("Error recording attendance:", error);
    res.status(500).send("Failed to record attendance");
  }
});

// Download attendance by Date & Class
app.get("/downloadattendance", async (req, res) => {
  try {
    const attendanceRecords = await prisma.attendance.findMany({
      include: {
        student: true,
        subject: true,
      },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Attendance");

    worksheet.columns = [
      { header: "Student Name", key: "studentName", width: 30 },
      { header: "Standard", key: "standard", width: 15 },
      { header: "Subject Name", key: "subjectName", width: 30 },
      { header: "Date", key: "date", width: 20 },
      { header: "Status", key: "status", width: 10 },
      { header: "Roll No", key: "rollNo", width: 10 },
    ];

    attendanceRecords.forEach((record) => {
      worksheet.addRow({
        studentName: record.studentName,
        standard: record.standard,
        subjectName: record.subjectName || "Global Attendance",
        date: new Date(record.date).toLocaleDateString(),
        status: record.status ? "Absent" : "Present",
        rollNo: record.rollNo,
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=attendance.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error generating attendance Excel file:", error);
    res.status(500).send("Failed to generate Excel file");
  }
});

//Get searched student by rollno.:
app.get("/students/rollNo", async (req, res) => {
  const { rollno, standard } = req.query;

  if (!rollno || isNaN(rollno) || !standard) {
    return res.status(400).json({ message: "Invalid roll number or standard" });
  }

  try {
    const student = await prisma.student.findFirst({
      where: {
        rollNo: parseInt(rollno),
        standard: standard,
      },
      include: {
        parents: true,
        fees: true,
        attendanceRecords: true,
      },
    });

    if (student) {
      console.log("Backend data from postgress ", student);
      res.status(200).send(JSON.stringify(student, jsonBigIntReplacer));
    } else {
      res.status(404).json({ message: "Student not found" });
    }
  } catch (error) {
    console.error("Error fetching student:", error.message);
    console.error("Stack trace:", error.stack);
    res
      .status(500)
      .json({ message: "An error occurred while fetching the student" });
  }
});

// Fees Structure
app.get("/fees/details", async (req, res) => {
  const { name, roll_no, download } = req.query;

  if (!name || isNaN(parseInt(roll_no))) {
    return res.status(400).json({ error: "Invalid query parameters" });
  }

  try {
    const result = await prisma.student.findFirst({
      where: {
        fullName: name.toString(),
        rollNo: parseInt(roll_no),
      },
      select: {
        id: true,
        fullName: true,
        rollNo: true,
        fees: {
          select: {
            title: true,
            amount: true,
            amountDate: true,
            admissionDate: true,
            pendingAmount: true,
          },
        },
      },
    });

    if (!result) {
      return res.status(404).json({ error: "Student not found" });
    }

    if (download === "true") {
      // Convert BigInt fields using jsonBigIntReplacer function
      const jsonResult = JSON.stringify(result, jsonBigIntReplacer);

      // Prepare data for Excel using exceljs
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("FeesDetails");

      // Define columns for the worksheet
      worksheet.columns = [
        { header: "Title", key: "title", width: 20 },
        { header: "Amount", key: "amount", width: 15 },
        { header: "Amount Date", key: "amountDate", width: 15 },
        { header: "Admission Date", key: "admissionDate", width: 15 },
        { header: "Pending Amount", key: "pendingAmount", width: 15 },
      ];

      // Add rows to the worksheet
      result.fees.forEach((fee) => {
        worksheet.addRow({
          title: fee.title,
          amount: fee.amount,
          amountDate: fee.amountDate,
          admissionDate: fee.admissionDate,
          pendingAmount: fee.pendingAmount,
        });
      });

      // Set headers for download
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="fees_details_roll_${roll_no}.xlsx"`
      );

      // Send Excel file as response
      await workbook.xlsx.write(res);
      res.end();
    } else {
      // Return JSON response if download is not requested
      res.status(200).json(result);
    }
  } catch (error) {
    console.error("Error fetching fees details:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

app.post("/fees/add", async (req, res) => {
  const { title, amount, amountDate, admissionDate, pendingAmount, studentId } =
    req.body;

  if (!title || !amount || !amountDate || !admissionDate || !studentId) {
    return res.status(400).json({ error: "Invalid data" });
  }

  try {
    const fee = await prisma.fee.create({
      data: {
        title,
        amount: parseFloat(amount),
        amountDate: new Date(amountDate),
        admissionDate: new Date(admissionDate),
        pendingAmount: parseFloat(pendingAmount),
        studentId: parseInt(studentId),
      },
    });

    res.status(201).json(fee);
  } catch (error) {
    console.error("Error adding fee:", error);
    res.status(500).json({ error: "An error occurred" });
  }
});

// Marks Structure
app.post("/add", async (req, res) => {
  const { studentName, standard, examinationType, marks } = req.body;

  try {
    const student = await prisma.student.findFirst({
      where: { fullName: studentName, standard },
    });

    if (!student) {
      return res.status(400).json({ error: "Student not found" });
    }

    const newMarks = await Promise.all(
      marks.map(async (mark) => {
        const { subjectId, subjectName, obtainedMarks, totalMarks } = mark;
        const percentage = (obtainedMarks / totalMarks) * 100;

        return await prisma.marks.create({
          data: {
            studentId: student.id,
            subjectId,
            subjectName,
            examinationType,
            obtainedMarks,
            totalMarks,
            percentage,
          },
        });
      })
    );

    res.status(201).json(newMarks);
  } catch (error) {
    console.error("Error adding marks:", error);
    res.status(500).json({ error: "Error adding marks" });
  }
});

// Hostel Structure
<<<<<<< HEAD
app.get('/gethosteldata', async (req, res) => {
=======
const occupied = [];
const available = [];
for (let i = 1; i <= 100; i++) {
  available.push(i);
}

app.get("/gethosteldata", async (req, res) => {
>>>>>>> 2669e3c89cc049ec03b3e3a9869ec2c44639c985
  try {
    const result = await prisma.hosteldata.findMany();
    if (result.length > 0) {
      console.log(result[0].bed_number); // Log the bed number for debugging
    }

    available.forEach((e) => {
      result.forEach((v) => {
        if (e === v.bed_number) {
          let index = available.indexOf(e);
          available[index] = 0;
        }
      });
    });

    res.status(201).json({ result, available });
  } catch (error) {
    console.error("Error fetching hostel data: ", error); // Detailed logging
    res
      .status(500)
      .json({ error: "An error occurred while fetching the hostel data." });
  }
});

app.post("/hosteldata", async (req, res) => {
  const { name, rollNo, standard, gender, room_no, bed_no } = req.body;

  try {
    const result = await prisma.hosteldata.create({
      data: {
        name: name,
        standard: standard,
        gender: gender,
        room_number: room_no,
        bed_number: bed_no,
        rollNo: rollNo,
      },
    });

    res.status(201).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "An error occurred while creating the hostel data entry.",
    });
  }
});

app.post("/updatehostel", async (req, res) => {
  const { rollNo, standard, room_no, bed_no } = req.body;
  try {
    const result = await prisma.hosteldata.update({
      where: {
        rollNo_Class: {
          rollNo: rollNo,
          standard: standard,
        },
      },
      data: {
        room_number: room_no,
        bed_number: bed_no,
      },
    });

    res.status(201).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "An error occurred while updating the hostel data entry.",
    });
  }
});

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });

app.post("/uploads", upload.single("photo"), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: "No file uploaded" });
  }
  res.send({
    message: "File uploaded successfully",
    filename: req.file.filename,
  });
});

// server.js
app.get("/uploads/:filename", (req, res) => {
  const { filename } = req.params;
  const filepath = path.join(__dirname, "uploads", filename);

  fs.exists(filepath, (exists) => {
    if (exists) {
      res.sendFile(filepath);
    } else {
      res.status(404).send({ message: "File not found" });
    }
  });
});

app.post("/hostel/delete", async (req, res) => {
  const { rollNo, bed_no } = req.body;

  try {
    const result = await prisma.hosteldata.delete({
      where: {
        rollNo: rollNo,
        bed_number: bed_no,
      },
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(404).json({ message: error });
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

// Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Upload endpoint
app.post("/Student", upload.single("photo"), async (req, res) => {
  try {
    const { studentId } = req.body; // Example: Retrieve studentId from request if needed
    const photoFilename = req.file.filename;

    // Save photoFilename to database using Prisma
    const updatedStudent = await prisma.student.update({
      where: { id: Number(studentId) },
      data: { photoFilename },
    });

    console.log("Photo uploaded for student:", updatedStudent);
    res.status(200).json({ message: "Photo uploaded successfully" });
  } catch (error) {
    console.error("Error uploading photo:", error);
    res.status(500).json({ error: "Failed to upload photo" });
  }
});
app.get("/Student/:filename", (req, res) => {
  const { filename } = req.params;
  const filepath = path.join(__dirname, "uploads", filename);

  if (fs.existsSync(filepath)) {
    res.sendFile(filepath);
  } else {
    res.status(404).send({ message: "File not found" });
  }
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
