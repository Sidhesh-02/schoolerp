const express = require("express");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();
const ExcelJS = require("exceljs");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const fs = require("fs");
const path = require("path");
const fileStorage = require("../sessionManager");

const data = fileStorage.readData();
const session = data.year;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '/uploads'); 
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const prisma = new PrismaClient();
//Get all student information in excel file 
router.get('/excelstudents', async (req, res) => {
    try {
      const studentsInfo = await prisma.student.findMany({
        where:{session:session},
        include: {
          parents: true,
          fees: true,
          marks:true,
        },
      });

      
  
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Students');
  
      // Define columns for the worksheet
      worksheet.columns = [
        { header: 'Session', key: 'session', width:10},
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
        { header: 'Fees Paid', key: 'feesPaid', width: 15 },
      ];
  
      // Add student data to worksheet
      studentsInfo.forEach((student) => {
        const feesPaid = student.fees.reduce((sum, fee) => sum + fee.amount, 0);
        worksheet.addRow({
          session: student.session,
          sid: student.id,
          fullName: student.fullName,
          gender: student.gender,
          dateOfBirth: student.dateOfBirth.toISOString().split('T')[0],
          rollNo: student.rollNo,
          standard: student.standard,
          adhaarCardNo: student.adhaarCardNo.toString(),
          scholarshipApplied: student.scholarshipApplied,
          address: student.address,
          photoUrl: student.photoUrl,
          fatherName: student.parents[0]?.fatherName || '',
          motherName: student.parents[0]?.motherName || '',
          fatherContact: student.parents[0]?.fatherContact?.toString() || '',
          motherContact: student.parents[0]?.motherContact?.toString() || '',
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
  
  //Upload Photo
  router.post('/uploadPhoto', upload.single('file'), async (req, res) => {
    try {
      const fileUrl = 'http://localhost:5000/' + req.file.path; 
      res.status(200).send(fileUrl);
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).send('Error uploading file');
    }
  });
  
  // Upload Student In Bulk with Excel
  router.post("/upload", upload.single("file"), async (req, res) => {
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
          scholarshipApplied: row.getCell(7).value.toString().toLowerCase() === "true" || row.getCell(7).value.toString().toLowerCase() === "yes",
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
              
            },
          ],
          remark:row.getCell(19).value,
          session:row.getCell(20).value
          
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
            remark:student.remark,
            session:student.session,
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
  
  
  router.get('/reportsdata', async (req, res) => {
    try {
        // Fetch all required student data (including fees) in one query
        const studentData = await prisma.student.findMany({
          where: {
            session: session,
          },
          include: {
            fees: true,  // Include the related fees data
          },
        });

        // Count of students
        const len = studentData.length;

        // Calculate the total fee amount
        let sumFee = 0;
        studentData.forEach(student => {
          student.fees.forEach(fee => {
            sumFee += fee.amount;
          });
        });

        // Get hostel count and bed-related data
        const hostelData = await prisma.hostel.count();
        let totalBed = await prisma.control.findFirst();
        totalBed = totalBed?.number_of_hostel_bed ?? 0;
        const sumBed = totalBed - hostelData;

        // Send the result
        res.send({ len, sumFee, sumBed });
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});


  router.post("/changesFromControlPanel", async (req, res) => {
    let { number_of_hostel_bed, one, two, three } = req.body;
    
    try {
      // Check if a record already exists
      const existingRecord = await prisma.control.findFirst();
  
      // Only parse and update fields that have valid values
      const updatedData = {};
  
      if (number_of_hostel_bed) {
        const hostelBed = parseInt(number_of_hostel_bed);
        if (!isNaN(hostelBed)) {
          updatedData.number_of_hostel_bed = hostelBed;
        } else {
          return res.status(400).json({ error: "Invalid number_of_hostel_bed." });
        }
      }
  
      if (one) {
        const installmentOne = parseInt(one);
        if (!isNaN(installmentOne)) {
          updatedData.Installment_one = installmentOne;
        } else {
          return res.status(400).json({ error: "Invalid Installment_one." });
        }
      }
  
      if (two) {
        const installmentTwo = parseInt(two);
        if (!isNaN(installmentTwo)) {
          updatedData.Installment_two = installmentTwo;
        } else {
          return res.status(400).json({ error: "Invalid Installment_two." });
        }
      }
  
      if (three) {
        const installmentThree = parseInt(three);
        if (!isNaN(installmentThree)) {
          updatedData.Installment_three = installmentThree;
        } else {
          return res.status(400).json({ error: "Invalid Installment_three." });
        }
      }

      if(session){
        updatedData.session = session;
      }else{
        return res.status(400).json({ error: "Error " });
      }
  
      if (Object.keys(updatedData).length === 0) {
        return res.status(400).json({ error: "No valid data provided for update." });
      }
  
      if (existingRecord) {
        // Update existing record
        const updatedRecord = await prisma.control.update({
          where: {
            id: existingRecord.id, // Use appropriate identifier field
          },
          data: updatedData,
        });
        
        return res.status(200).json(updatedRecord);
      } else {
        // Create a new record
        const newRecord = await prisma.control.create({
          data: updatedData
        });
        return res.status(200).json(newRecord);
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "An error occurred while processing your request." });
    }
  });
  
  
router.get("/getChanges", async(req,res)=>{
  try{
    const hostelRes = await prisma.control.findFirst();
    res.status(200).json(hostelRes);
  }catch(error){
    res.status(500).json(error);
  }
})


  module.exports = router;