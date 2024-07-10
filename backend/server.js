const express = require("express");
const { PrismaClient } = require("@prisma/client");
const cors = require("cors");
const ExcelJS = require("exceljs");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

const app = express();
const prisma = new PrismaClient();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

function jsonBigIntReplacer(key, value) {
  if (typeof value === "bigint") {
    return value.toString();
  }
  return value;
}

// Update student route
app.put("/update/student/:id", async (req, res) => {
  const studentId = parseInt(req.params.id);
  const {
    fullName,
    gender,
    dateOfBirth,
    rollNo,
    standard,
    adhaarCardNo,
    scholarshipApplied,
    address,
    photoUrl,
    parents,
  } = req.body;

  try {
    // Update student details
    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: {
        fullName,
        gender,
        dateOfBirth: new Date(dateOfBirth),
        rollNo,
        standard,
        adhaarCardNo,
        scholarshipApplied,
        address,
        photoUrl,
      },
    });

    // Update parent details
    const updatedParents = await Promise.all(
      parents.map((parent) =>
        prisma.parent.update({
          where: { id: parent.id },
          data: {
            fatherName: parent.fatherName,
            fatherOccupation: parent.fatherOccupation,
            motherName: parent.motherName,
            motherOccupation: parent.motherOccupation,
            fatherContact: parent.fatherContact,
            motherContact: parent.motherContact,
            address: parent.address,
          },
        })
      )
    );
    
    const response = {
      message: "Student updated successfully",
      student: updatedStudent,
      parents: updatedParents,
    };
    res.status(201).json(JSON.stringify(response, jsonBigIntReplacer));
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({ error: "Failed to update student" });
  }
});

//Get all student information in excel file 
app.get('/excelstudents', async (req, res) => {
  try {
    const studentsInfo = await prisma.student.findMany({
      include: {
        parents: true,
        fees: true,
      },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Students');

    // Define columns for the worksheet
    worksheet.columns = [
      { header: 'StudentId', key: 'sid', width: 10 },
      { header: 'Full Name', key: 'fullName', width: 30 },
      { header: 'Gender', key: 'gender', width: 10 },
      { header: 'Date of Birth', key: 'dateOfBirth', width: 15 },
      { header: 'Roll No', key: 'rollNo', width: 10 },
      { header: 'Standard', key: 'standard', width: 10 },
      { header: 'Adhaar Card No', key: 'adhaarCardNo', width: 20 },
      { header: 'Scholarship Applied', key: 'scholarshipApplied', width: 15 },
      { header: 'Address', key: 'address', width: 30 },
      { header: 'Photo URL', key: 'photoUrl', width: 30 },
      { header: 'Father Name', key: 'fatherName', width: 20 },
      { header: 'Mother Name', key: 'motherName', width: 20 },
      { header: 'Father Contact', key: 'fatherContact', width: 15 },
      { header: 'Mother Contact', key: 'motherContact', width: 15 },
      { header: 'Fees Pending', key: 'feesPending', width: 15 },
      { header: 'Fees Paid', key: 'feesPaid', width: 15 },
    ];

    // Add student data to worksheet
    studentsInfo.forEach((student) => {
      const feesPaid = student.fees.reduce((sum, fee) => sum + fee.amount, 0);
      const totalFees = 10500; // Assuming total fees is 10500
      const feesPending = totalFees - feesPaid;

      worksheet.addRow({
        sid: student.id,
        fullName: student.fullName,
        gender: student.gender,
        dateOfBirth: student.dateOfBirth.toISOString().split('T')[0],
        rollNo: student.rollNo,
        standard: student.standard,
        adhaarCardNo: student.adhaarCardNo.toString(),
        scholarshipApplied: student.scholarshipApplied ? 'Yes' : 'No',
        address: student.address,
        photoUrl: student.photoUrl,
        fatherName: student.parents[0]?.fatherName || '',
        motherName: student.parents[0]?.motherName || '',
        fatherContact: student.parents[0]?.fatherContact?.toString() || '',
        motherContact: student.parents[0]?.motherContact?.toString() || '',
        feesPending: feesPending,
        feesPaid: feesPaid,
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="students_data.xlsx"'
    );

    // Send Excel file as response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error fetching students data:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

//Photo
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/uploads'); 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

app.post('/uploadPhoto', upload.single('file'), async (req, res) => {
  try {
    const fileUrl = 'http://localhost:5000/' + req.file.path; 
    res.status(200).send(fileUrl);
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send('Error uploading file');
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
    photoUrl
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
        photoUrl,
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
      // console.log("Backend data from postgress ", student);
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
  const { standard, roll_no, download } = req.query;

  if (!standard || isNaN(parseInt(roll_no))) {
    return res.status(400).json({ error: "Invalid query parameters" });
  }

  try {
    const result = await prisma.student.findFirst({
      where: {
        standard: standard.toString(),
        rollNo: parseInt(roll_no),
      },
      select: {
        id: true,
        fullName: true,
        rollNo: true,
        standard: true,
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
      const ExcelJS = require("exceljs");
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


app.get("/feetable", async(req,res)=>{
  const {title, id} = req.query;
  try{
    const result = await prisma.fee.findMany({
      where :{
        title,
        studentId : parseInt(id)
      }
    });
    res.status(200).json(result);
  }catch(error){
    console.log(error);
  }
})

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
app.get('/gethosteldata', async (req, res) => {
  try {
    const result = await prisma.hosteldata.findMany();

    const available = [];
    for (let i = 1; i <= 100; i++) {
      available.push(i);
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
    res.status(500).json({ error: 'An error occurred while fetching the hostel data.' });
  }
});

app.post("/hosteldata",async (req, res)=>{

  const { name, rollNo, standard, gender, room_no, bed_no } = req.body;

  try {
      const result = await prisma.hosteldata.create({
          data: {
              name : name,
              standard: standard,
              gender : gender,
              room_number : room_no,
              bed_number: bed_no,
              rollNo : rollNo,
          },
      });
     
      res.status(201).json(result);
  }catch (error) {
      console.log(error);
      res.status(500).json({ error: "An error occurred while creating the hostel data entry." });
  }
});

app.post("/updatehostel",async (req, res)=>{

  const { rollNo, standard, room_no, bed_no} = req.body;
  try {
      const result = await prisma.hosteldata.update({
          where : {
            rollNo_standard : {
              rollNo : rollNo,
              standard : standard
            }
          },
          data: {
            room_number : room_no,
            bed_number: bed_no,
          },
      });
     
      res.status(201).json(result);
  }catch (error) {
      console.log(error);
      res.status(500).json({ error: "An error occurred while updating the hostel data entry." });
  }
});

app.post("/hostel/delete" , async(req, res)=>{
    const {rollNo, bed_no } = req.body;

    try{
        const result = await prisma.hosteldata.delete({
          where :{
            rollNo : rollNo,
            bed_number : bed_no
          }
        })
        res.status(201).json(result)
    }catch(error){
      res.status(404).json({message : error})
    }
})

app.listen(5000, () => {
  console.log(`Server is running on http://localhost:${5000}`);
});