const express = require("express");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();
const path = require("path");
const ExcelJS = require("exceljs");
const fileStorage = require("../sessionManager");

const data = fileStorage.readData();
const session = data.year;

const prisma = new PrismaClient();


router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use('/uploads', express.static(path.join(__dirname, 'uploads')));

function jsonBigIntReplacer(key, value) {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
}

/* Attendance Model */

// Get Student by Standards For Attendance
router.get("/getstandards", async (req, res) => {
    try {
      const standards = await prisma.student.findMany({
        distinct: ["standard"],
        where : { session: session},
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
  
  // Get Student List wrt Standard for Attendance
  router.get("/getattendancelist", async (req, res) => {
    const { standard } = req.query;
  
    try {
      const students = await prisma.student.findMany({
        where: {
          standard,
          session:session
        },
        orderBy: { rollNo: "asc" },
      });
  
      res.status(200).send(JSON.stringify(students, jsonBigIntReplacer));
    } catch (error) {
      console.error("Error fetching students by standard:", error);
      res.status(500).send("Failed to fetch students");
    }
  });
  
  // Get Subject List for Attendance
  router.get("/getsubjects", async (req, res) => {
    const { selectedStandard } = req.query;
    
    try {
      const subjects = await prisma.subject.findMany({
        where: {
          stdId: selectedStandard, 
        },
      });
      res.status(200).json(subjects);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      res.status(500).send("Failed to fetch subjects");
    }
  });
  
  // Submit Attendance
  router.post("/submitattendance", async (req, res) => {
    const { standard, date, absentStudents, subjectId } = req.body;
  
    try {
      const students = await prisma.student.findMany({
        where: { standard, session:session },
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
  router.get("/downloadattendance", async (req, res) => {
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

  module.exports = router;