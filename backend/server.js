const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
const { parse } = require('json2csv');

const app = express();
const prisma = new PrismaClient();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get('/classes', async (req, res) => {
  const classes = await prisma.class.findMany();
  res.json(classes);
});

app.get('/students/:classId', async (req, res) => {
  const { classId } = req.params;
  const students = await prisma.student.findMany({
    where: {
      classId: parseInt(classId)
    }
  });
  res.json(students);
});

app.post('/attendance', async (req, res) => {
  const { date, records } = req.body;
  const attendancePromises = records.map(record => {
    return prisma.attendance.create({
      data: {
        date: new Date(date),
        status: record.status,
        rollNo: record.rollNo 
      }
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
        classId: parseInt(classId)
      }
    },
    include: {
      student: true
    }
  });

  const fields = ['student.name', 'date', 'status'];
  const csv = parse(attendance, { fields });
  res.header('Content-Type', 'text/csv');
  res.attachment('attendance.csv');
  res.send(csv);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
