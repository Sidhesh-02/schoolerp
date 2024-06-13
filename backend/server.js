const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const ExcelJS = require('exceljs');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const prisma = new PrismaClient();
const PORT = 5000;

const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

app.post('/upload', upload.single('file'), async (req, res) => {
  const filePath = req.file.path;

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.getWorksheet(1);

  const students = [];
  const classes = new Set();

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber !== 1) { // Skip header row
      const name = row.getCell(1).value;
      const rollNo = row.getCell(2).value;
      const classId = row.getCell(3).value;
      students.push({ name, rollNo, classId });
      classes.add(classId.toString());
    }
  });

  try {
    // Insert unique classes into the Class table and get their IDs
    const classEntries = Array.from(classes).map(name => ({ name }));
    
    // Prisma does not support createMany with skipDuplicates
    // So we manually handle it by inserting classes one by one
    const existingClasses = await prisma.class.findMany();
    const existingClassNames = new Set(existingClasses.map(cls => cls.name));
    
    const newClasses = classEntries.filter(cls => !existingClassNames.has(cls.name));
    const insertedClasses = await Promise.all(newClasses.map(cls => prisma.class.create({ data: cls })));

    const classMap = {};
    const allClasses = await prisma.class.findMany();
    allClasses.forEach(cls => {
      classMap[cls.name] = cls.id;
    });

    // Map class names to new class IDs
    const studentData = students.map(student => ({
      name: student.name,
      rollNo: student.rollNo,
      classId: classMap[student.classId.toString()],
    }));

    // Insert students into the Student table
    await prisma.student.createMany({
      data: studentData,
      skipDuplicates: true,
    });

    fs.unlinkSync(filePath);

    res.status(200).send('File uploaded and data imported successfully');
  } catch (error) {
    console.error('Error importing data:', error);
    res.status(500).send('Failed to import data');
  }
});



app.get('/classes', async (req, res) => {
  const classes = await prisma.class.findMany();
  res.json(classes);
});

app.get('/students/:classId', async (req, res) => {
  const { classId } = req.params;
  const students = await prisma.student.findMany({
    where: {
      classId: parseInt(classId),
    },
  });
  res.json(students);
});

app.post('/attendance', async (req, res) => {
  const { date, records } = req.body;
  const attendancePromises = records.map((record) => {
    return prisma.attendance.create({
      data: {
        date: new Date(date),
        status: record.status,
        rollNo: record.rollNo,
      },
    });
  });

  await Promise.all(attendancePromises);
  res.status(201).send('Attendance recorded');
});

app.get('/attendance/download/:classId', async (req, res) => {
  const { classId } = req.params;
  const attendance = await prisma.attendance.findMany({
    where: {
      student: {
        classId: parseInt(classId),
      },
    },
    include: {
      student: true,
    },
  });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Attendance');

  worksheet.columns = [
    { header: 'Student Name', key: 'name', width: 30 },
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Status', key: 'status', width: 15 },
  ];

  attendance.forEach((record) => {
    worksheet.addRow({
      name: record.student.name,
      date: record.date.toISOString().split('T')[0],
      status: record.status,
    });
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=attendance.xlsx');

  await workbook.xlsx.write(res);
  res.end();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
