const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const ExcelJS = require('exceljs');
const multer = require('multer');
const fs = require('fs');

const PORT = 5000;
const app = express();
const prisma = new PrismaClient();

const upload = multer({ dest: 'uploads/' });

function jsonBigIntReplacer(key, value) {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
}

app.use(cors());
app.use(express.json());

// Create Student
app.post('/students', async (req, res) => {
  const { fullName, gender, dateOfBirth, rollNo, standard, adhaarCardNo, scholarshipApplied, address, parents, fees } = req.body;

  try {
    const student = await prisma.student.create({
      data: {
        fullName,
        gender,
        dateOfBirth: new Date(dateOfBirth),
        rollNo: parseInt(rollNo),
        standard,
        adhaarCardNo :parseInt(adhaarCardNo) ,
        scholarshipApplied,
        address,
        parents: {
          create: parents.map(parent => ({
            ...parent,
            fatherContact : parseInt(parent.fatherContact),
            motherContact : parseInt(parent.motherContact)
          })),
        },
        fees: {
          create: fees.map(fee => ({
            ...fee,
            amount: parseFloat(fee.amount),
            amountDate: new Date(fee.amountDate),
            admissionDate: new Date(fee.admissionDate),
            pendingAmount : parseInt(fee.pendingAmount)
          })),
        },
      },
      include: {
        parents: true,
        fees: true,
        attendanceRecords: true,
      },
    });

    res.status(201).json(JSON.stringify(student,jsonBigIntReplacer));
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).send('Failed to create student');
  }
});

// Upload Student In Bulk with Excel
app.post('/upload', upload.single('file'), async (req, res) => {
  const filePath = req.file.path;

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.getWorksheet(1);

  const students = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber !== 1) { // Skip header row
      const student = {
        fullName: row.getCell(1).value,
        gender: row.getCell(2).value,
        dateOfBirth: row.getCell(3).value,
        rollNo: parseInt(row.getCell(4).value),
        standard: row.getCell(5).value, 
        adhaarCardNo: BigInt(row.getCell(6).value),
        scholarshipApplied: row.getCell(7).value === 'Yes',
        address: row.getCell(8).value,
        parents: [{
          fatherName: row.getCell(9).value,
          fatherOccupation: row.getCell(10).value,
          motherName: row.getCell(11).value,
          motherOccupation: row.getCell(12).value,
          fatherContact: BigInt(row.getCell(13).value),
          motherContact: BigInt(row.getCell(14).value),
          address: row.getCell(8).value,
        }],
        fees: [{
          title: row.getCell(15).value,
          amount: parseFloat(row.getCell(16).value),
          amountDate: row.getCell(17).value,
          admissionDate:row.getCell(18).value,
          pendingAmount: 0,
        }],
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
    res.status(200).send('File uploaded and data imported successfully');
  } catch (error) {
    console.error('Error importing data:', error);
    res.status(500).send('Failed to import data');
  }
});

//Attendance
// Get Student by Standards
app.get('/getstandards', async (req, res) => {
  try {
    const standards = await prisma.student.findMany({
      distinct: ['standard'],
      select: {
        standard: true,
      },
    });

    const standardList = standards.map((std) => std.standard);
    res.status(200).send(JSON.stringify({ standards: standardList }, jsonBigIntReplacer));
  } catch (error) {
    console.error('Error fetching standards:', error);
    res.status(500).send('Failed to fetch standards');
  }
});

app.get('/getattendancelist', async (req, res) => {
  const { standard, subjectId } = req.query;

  try {
    const students = await prisma.student.findMany({
      where: {
        standard,
      },
      orderBy: { rollNo: 'asc' },
    });

    res.status(200).send(JSON.stringify(students, jsonBigIntReplacer));
  } catch (error) {
    console.error('Error fetching students by standard:', error);
    res.status(500).send('Failed to fetch students');
  }
});

app.get('/getsubjects', async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany();
    res.status(200).json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).send('Failed to fetch subjects');
  }
});

app.post('/submitattendance', async (req, res) => {
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

    res.status(201).send('Attendance recorded successfully');
  } catch (error) {
    console.error('Error recording attendance:', error);
    res.status(500).send('Failed to record attendance');
  }
});

// Download attendance by Date & Class
app.get('/downloadattendance', async (req, res) => {
  try {
    const attendanceRecords = await prisma.attendance.findMany({
      include: {
        student: true,
        subject: true,
      },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance');

    worksheet.columns = [
      { header: 'Student Name', key: 'studentName', width: 30 },
      { header: 'Standard', key: 'standard', width: 15 },
      { header: 'Subject Name', key: 'subjectName', width: 30 },
      { header: 'Date', key: 'date', width: 20 },
      { header: 'Status', key: 'status', width: 10 },
      { header: 'Roll No', key: 'rollNo', width: 10 },
    ];

    attendanceRecords.forEach((record) => {
      worksheet.addRow({
        studentName: record.studentName,
        standard: record.standard,
        subjectName: record.subjectName || 'Global Attendance',
        date: new Date(record.date).toLocaleDateString(),
        status: record.status ? 'Absent' : 'Present',
        rollNo: record.rollNo,
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error generating attendance Excel file:', error);
    res.status(500).send('Failed to generate Excel file');
  }
});

//get searched student by rollno.:
app.get("/students/rollNo/:rollno", async (req, res) => {
  const rollno = parseInt(req.params.rollno);

  if (isNaN(rollno)) {
    return res.status(400).json({ message: "Invalid roll number" });
  }

  try {
    const student = await prisma.student.findFirst({
      where: {
        rollNo: rollno,
      },
      include: {
        parents: true,
        fees: true,
        attendanceRecords: true,
      },
    });

    if (student) {
      res.status(200).send(JSON.stringify(student, jsonBigIntReplacer));
    } else {
      res.status(404).json({ message: "Student not found" });
    }
  } catch (error) {
    console.error('Error fetching student:', error.message);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ message: "An error occurred while fetching the student" });
  }
});

// Fees Structure
app.get("/fees/details", async (req, res) => {
  const { name, roll_no, download } = req.query;

  if (!name || isNaN(parseInt(roll_no))) {
    return res.status(400).json({ error: 'Invalid query parameters' });
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
      return res.status(404).json({ error: 'Student not found' });
    }

    if (download === 'true') {
      // Convert BigInt fields using jsonBigIntReplacer function
      const jsonResult = JSON.stringify(result, jsonBigIntReplacer);

      // Prepare data for Excel using exceljs
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('FeesDetails');

      // Define columns for the worksheet
      worksheet.columns = [
        { header: 'Title', key: 'title', width: 20 },
        { header: 'Amount', key: 'amount', width: 15 },
        { header: 'Amount Date', key: 'amountDate', width: 15 },
        { header: 'Admission Date', key: 'admissionDate', width: 15 },
        { header: 'Pending Amount', key: 'pendingAmount', width: 15 },
      ];

      // Add rows to the worksheet
      result.fees.forEach(fee => {
        worksheet.addRow({
          title: fee.title,
          amount: fee.amount,
          amountDate: fee.amountDate,
          admissionDate: fee.admissionDate,
          pendingAmount: fee.pendingAmount,
        });
      });

      // Set headers for download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="fees_details_roll_${roll_no}.xlsx"`);

      // Send Excel file as response
      await workbook.xlsx.write(res);
      res.end();

    } else {
      // Return JSON response if download is not requested
      res.status(200).json(result);
    }
  } catch (error) {
    console.error('Error fetching fees details:', error);
    res.status(500).json({ error: "An error occurred" });
  }
});


// // To Get Hostel Details
// app.get("/gethosteldata", async (req, res) => {
//   const { id } = req.body;
  
//   try {
//       const result = await prisma.hosteldata.findFirst({
//           where: {
//               id: id,
//           }
//       });
//       res.status(201).json(result);
//   } catch (error) {
//       res.status(500).json({ error: "An error occurred while creating the hostel data entry." });
//   }
// });

// //To Download the Hostel Details
// app.get("/gethosteldata/download", async (req, res) => {
//   const workbook = new ExcelJS.Workbook();
//   const worksheet = workbook.addWorksheet("HostelData");
  
//   try {
//       const hosteldata = await prisma.hosteldata.findMany();
      
//       worksheet.columns = [
//           { header: 'Student Name', key: 'name', width: 30 },
//           { header: 'Age', key: 'age', width: 30 },
//           { header: 'Class', key: 'Class', width: 30 },
//           { header: 'Gender', key: 'gender', width: 30 },
//           { header: 'Room Number', key: 'room_number', width: 30 },
//           { header: 'Bed Number', key: 'bed_number', width: 30 },
//       ];

//       hosteldata.forEach(e => {
//           worksheet.addRow({
//               name: e.name,
//               age: e.age,
//               Class: e.Class,
//               gender: e.gender,
//               room_number: e.room_number,
//               bed_number: e.bed_number,
//           });
//       });

//       res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
//       res.setHeader('Content-Disposition', 'attachment; filename=Hosteldata.xlsx');
      
//       await workbook.xlsx.write(res);
//       res.end();
//   } catch (error) {
//       res.status(500).json({ error: "An error occurred while creating the hostel data entry." });
//   }
// });

// //To Append the Hostel Data to Database
// app.post("/hosteldata", async (req, res) => {
//   const { name, age, Class, gender, room_no, bed_no } = req.body;
  
//   try {
//       const result = await prisma.hosteldata.create({
//           data: {
//               name: name,
//               age: age,
//               Class: Class,
//               gender: gender,
//               room_number: room_no,
//               bed_number: bed_no,
//           },
//       });
      
//       res.status(201).json(result);
//   } catch (error) {
//       console.log(error);
//       res.status(500).json({ error: "An error occurred while creating the hostel data entry." });
//   }
// });


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
