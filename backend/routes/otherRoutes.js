const express = require("express");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();
const ExcelJS = require("exceljs");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

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
    const session = req.session;
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
        
        // { header: 'StudentId', key: 'sid', width: 10 },
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
        { header: 'Father Occupation', key: 'fatherOccupation', width: 20 },
        { header: 'Mother Name', key: 'motherName', width: 20 },
        { header: 'Mother Occupation', key: 'motherOccupation', width: 20 },
        { header: 'Father Contact', key: 'fatherContact', width: 15 },
        { header: 'Mother Contact', key: 'motherContact', width: 15 },
        { header: 'Fee Title', key: 'feeTitle', width: 15 },
        { header: 'Fee Amount', key: 'feeAmount', width: 15 },
        { header: 'Amount Date', key: 'feeAmountDate', width: 15 },
        { header: 'Admission Date', key: 'admissionDate', width: 15 },
        { header: 'Remark', key: 'remark', width: 15 },
        { header: 'Session', key: 'session', width:10},
        { header: 'Category', key:'category',width:10},
        { header: 'Caste', key:'caste',width:10},
      ];
  
      // Add student data to worksheet
      studentsInfo.forEach((student) => {
        const feesPaid = student.fees.reduce((sum, fee) => sum + fee.amount, 0);
        worksheet.addRow({
          
          // sid: student.id,
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
          fatherOccupation : student.parents[0]?.fatherOccupation || '',
          motherName: student.parents[0]?.motherName || '',
          motherOccupation : student.parents[0]?.motherOccupation || '',
          fatherContact: student.parents[0]?.fatherContact?.toString() || '',
          motherContact: student.parents[0]?.motherContact?.toString() || '',
          feeTitle: student.fees[0]?.title || '',
          feeAmount: student.fees[0]?.amount ,
          feeAmountDate: student.fees[0]?.amountDate,
          admissionDate: student.fees[0]?.admissionDate,
          remark: student.remark || '' ,
          session: student.session,
          castegory: student.category,
          caste: student.caste,
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

    const data = await prisma.control.findMany();

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
          photoUrl : row.getCell(9).value,
          parents: [
            {
              fatherName: row.getCell(10).value,
              fatherOccupation: row.getCell(11).value,
              motherName: row.getCell(12).value,
              motherOccupation: row.getCell(13).value,
              fatherContact: BigInt(row.getCell(14).value),
              motherContact: BigInt(row.getCell(15).value),
              address: row.getCell(8).value,
            },
          ],
          fees: [
            {
              title: row.getCell(16).value,
              amount: parseFloat(row.getCell(17).value),
              amountDate: row.getCell(18).value,
              admissionDate: row.getCell(19).value,
              
            },
          ],
          remark:row.getCell(20).value,
          session:row.getCell(21).value,
          category:row.getCell(22).value,
          caste:row.getCell(23).value,
        };
        students.push(student);
      }
    });
  
    try {
      // Create students with mapped class ids
      for (const student of students) {
        const totalFee = data[0].TotalFees ?? 0;
        if(student.fees[0].amount >= totalFee){
          return res.json({error:"Fee Amount in Excel Can't Be More than Total Amout"})
        }
        await prisma.student.create({
          data: {
            fullName: student.fullName,
            gender: student.gender,
            dateOfBirth: new Date(student.dateOfBirth),
            rollNo: student.rollNo,
            standard: student.standard,
            adhaarCardNo: student.adhaarCardNo,
            scholarshipApplied: student.scholarshipApplied,
            address: student.address,
            photoUrl : student.photoUrl,
            remark:student.remark,
            session:student.session,
            category:student.category,
            caste:student.caste,
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
    const session = req.session;
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
  const { number_of_hostel_bed, institutioName, hostelName, schoolAddress, totalFee, schoolLogo } = req.body;
  const existingRecord = await prisma.control.findFirst();

  if (!existingRecord) {
    // Create a new record if it doesn't exist
    const newRecord = await prisma.control.create({
      data: {
        number_of_hostel_bed,
        Institution_name: institutioName,
        Institution_hostel_name: hostelName,
        SchoolAddress: schoolAddress,
        TotalFees: totalFee,
        SchoolLogo:schoolLogo
      },
    });
    return res.status(201).json(newRecord);
  }

  // Update only the required fields
  const updatedData = {
    number_of_hostel_bed: number_of_hostel_bed || existingRecord.number_of_hostel_bed,
    Institution_name: institutioName || existingRecord.Institution_name,
    Institution_hostel_name: hostelName || existingRecord.Institution_hostel_name,
    SchoolAddress: schoolAddress || existingRecord.SchoolAddress,
    TotalFees: totalFee || existingRecord.TotalFees,
    SchoolLogo: schoolLogo || existingRecord.SchoolLogo
  };

  const updatedRecord = await prisma.control.update({
    where: { id: existingRecord.id },
    data: updatedData,
  });

  return res.status(200).json(updatedRecord);
});


  
  
  router.get("/getChanges", async (req, res) => {
    try {
      const controlData = await prisma.control.findFirst();
      if (controlData) {
        res.status(200).json(controlData);
      } else {
        res.status(404).json({ message: "Data not found" });
      }
    } catch (error) {
      res.status(500).json({ error: "Server error", details: error.message });
    }
  });
  

router.post("/uploadAttendance", upload.single("file"), async (req, res) => {
  const filePath = req.file.path;

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.getWorksheet(1);

  const Attendance = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber !== 1) {
      // Skip header row
      let dateValue = row.getCell(4).value;

      // If the date is a serial number in Excel, convert it
      if (typeof dateValue === 'number') {
        dateValue = new Date(Math.round((dateValue - 25569) * 86400 * 1000)); // Convert Excel serial date
      } else {
        // Parse date string and convert to UTC
        dateValue = new Date(dateValue);
        // Normalize to UTC by stripping local timezone offset
        dateValue = new Date(Date.UTC(
          dateValue.getFullYear(),
          dateValue.getMonth(),
          dateValue.getDate()
        ));
      }


      const attendance = {
       
        studentName     :row.getCell(1).value,
        standard        :row.getCell(2).value,
        subjectName     :row.getCell(3).value,
        date            :dateValue,
        status          :row.getCell(5).value,
        rollNo          :row.getCell(6).value,
        session         :row.getCell(7).value,
        studentId       :row.getCell(8).value,
      };
      Attendance.push(attendance);
    }
  });

  try {
    // Create students with mapped class ids
    for (const at of Attendance) {
      await prisma.attendance.create({
        data: {
          studentName     : at.studentName,
          date            : at.date,
          status          : at.status == "Absent"? false : true,
          subjectName     : at.subjectName,
          rollNo          : at.rollNo,
          standard        : at.standard,
          subjectId       : at.subjectId ? parseInt(at.subjectId) : null,
          session         : at.session,
          studentId       : at.studentId,
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

router.post("/uploadFee", upload.single("file"), async (req, res) => {
  const filePath = req.file.path;

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.getWorksheet(1);

  const fees = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber !== 1) {
 
      const fee = {
        id            :row.getCell(1).value,
        title         :row.getCell(2).value,
        amount        :row.getCell(3).value,
        amountDate    :row.getCell(4).value,
        admissionDate :row.getCell(5).value,
        studentId     :row.getCell(6).value,
      };
      fees.push(fee);
    }
  });

  try {
    // Create students with mapped class ids
    for (const at of fees) {
      await prisma.fee.create({
        data: {    
          title         : at.title,
          amount        : at.amount,
          amountDate    : at.amountDate,
          admissionDate : at.admissionDate,
          studentId     : at.studentId
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


router.post("/uploadHostel", upload.single("file"), async (req, res) => {
  const filePath = req.file.path;

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.getWorksheet(1);

  const Hostel = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber !== 1) {
 
      const hostel = {
        id              :row.getCell(1).value,
        name            :row.getCell(2).value,
        rollNo          :row.getCell(3).value,
        standard        :row.getCell(4).value,
        gender          :row.getCell(5).value,
        bed_number      :row.getCell(6).value,
      };
      Hostel.push(hostel);
    }
  });

  try {
    // Create students with mapped class ids
    for (const at of Hostel) {
      await prisma.hostel.create({
        data: {    
          name          : at.name,
          rollNo        : at.rollNo,
          standard      : at.standard,
          gender        : at.gender,
          bed_number    : at.bed_number
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

router.post("/uploadMarks", upload.single("file"), async (req, res) => {
  const filePath = req.file.path;

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.getWorksheet(1);

  const Marks = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber !== 1) {
 
      const mark = {
        id                :row.getCell(1).value,
        studentId         :row.getCell(2).value,
        subjectId         :row.getCell(3).value,
        subjectName       :row.getCell(4).value,
        examinationType   :row.getCell(5).value,
        obtainedMarks     :row.getCell(6).value,
        totalMarks        :row.getCell(7).value,
        percentage        :row.getCell(8).value,
      };
      Marks.push(mark);
    }
  });

  try {
    // Create students with mapped class ids
    for (const at of Marks) {
      await prisma.marks.create({
        data: {    
          studentId           : at.studentId,
          subjectId           : at.subjectId,
          subjectName         : at.subjectName,
          examinationType     : at.examinationType,
          obtainedMarks       : at.obtainedMarks,
          totalMarks          : at.totalMarks,
          percentage          : at.percentage
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



router.get('/scholarshipStudents', async (req, res) => {
  const session = req.session;
  try {
    const studentsInfo = await prisma.student.findMany({
      where:{
        session:session,
        scholarshipApplied : true,
      },
      include: {
        parents: true,
        fees: true,
        marks:true,
      },
    });

    console.log()

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Scholarship');

    // Define columns for the worksheet
    worksheet.columns = [
      
      // { header: 'StudentId', key: 'sid', width: 10 },
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
      { header: 'Father Occupation', key: 'fatherOccupation', width: 20 },
      { header: 'Mother Name', key: 'motherName', width: 20 },
      { header: 'Mother Occupation', key: 'motherOccupation', width: 20 },
      { header: 'Father Contact', key: 'fatherContact', width: 15 },
      { header: 'Mother Contact', key: 'motherContact', width: 15 },
      { header: 'Fee Title', key: 'feeTitle', width: 15 },
      { header: 'Fee Amount', key: 'feeAmount', width: 15 },
      { header: 'Amount Date', key: 'feeAmountDate', width: 15 },
      { header: 'Admission Date', key: 'admissionDate', width: 15 },
      { header: 'Remark', key: 'remark', width: 15 },
      { header: 'Session', key: 'session', width:10},
    ];

    // Add student data to worksheet
    studentsInfo.forEach((student) => {
     
      worksheet.addRow({
        
        // sid: student.id,
        fullName: student.fullName || 'N/A',  // Handle missing names
        gender: student.gender || 'N/A',
        dateOfBirth: student.dateOfBirth ? student.dateOfBirth.toISOString().split('T')[0] : 'N/A',
        rollNo: student.rollNo || 'N/A',
        standard: student.standard || 'N/A',
        adhaarCardNo: student.adhaarCardNo ? student.adhaarCardNo.toString() : 'N/A',
        scholarshipApplied: student.scholarshipApplied ? 'Yes' : 'No',
        address: student.address || 'N/A',
        photoUrl: student.photoUrl || '',
        fatherName: student.parents[0]?.fatherName || 'N/A',
        fatherOccupation: student.parents[0]?.fatherOccupation || 'N/A',
        motherName: student.parents[0]?.motherName || 'N/A',
        motherOccupation: student.parents[0]?.motherOccupation || 'N/A',
        fatherContact: student.parents[0]?.fatherContact?.toString() || '',
        motherContact: student.parents[0]?.motherContact?.toString() || '',
        feeTitle: student.fees[0]?.title || 'N/A',
        feeAmount: student.fees[0]?.amount || 0,
        feeAmountDate: student.fees[0]?.amountDate ? student.fees[0].amountDate.toISOString().split('T')[0] : 'N/A',
        admissionDate: student.fees[0]?.admissionDate ? student.fees[0].admissionDate.toISOString().split('T')[0] : 'N/A',
        remark: student.remark || '',
        session: student.session || 'N/A',
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="Scholarship.xlsx"'
    );

    // Send Excel file as response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error fetching students data:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

router.post("/credentials", async (req, res) => {
  const { username, password } = req.body;
  const hashedUsername = crypto.createHash("sha256").update(username).digest("hex");
  const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
  const adminStoredUsername = process.env.ADMIN_HASH ?? "";
  const userStoredUsername = process.env.USER_HASH ?? "";
  const token = crypto.randomBytes(16).toString("hex");

  if (hashedUsername == adminStoredUsername) {
    const adminStoredPassword = process.env.ADMINPASSWORD_HASH;
    if (hashedPassword == adminStoredPassword) {
      tokenRoleMap[token] = "admin"; // Store token-role mapping
      return res.status(200).json({ token, role: "admin" });
    }
  } else if (hashedUsername == userStoredUsername) {
    const userStoredPassword = process.env.USERPASSWORD_HASH;
    if (hashedPassword == userStoredPassword) {
      tokenRoleMap[token] = "teacher"; // Store token-role mapping
      return res.status(200).json({ token, role: "teacher" });
    }
  }
  return res.status(401).json({ message: "Invalid credentials" });
});

const tokenRoleMap = {};
router.post("/validate-token", (req, res) => {
  const { token } = req.body;
  const role = tokenRoleMap[token]; // Retrieve role for the token
  if (role) {
    return res.status(200).json({ token, role });
  }
  return res.status(401).json({ message: "Invalid or expired token" });
});

router.get("/standards",async(req,res)=>{
  const standard = await prisma.standards.findMany();
  if(!standard){
    return res.status(500).json({error:"Error fetching standard"})
  }
  return res.status(200).json({standard});
})

router.post('/uploadSchoolLogo', upload.single('file'), async (req, res) => {
  try {
    const fileUrl = 'http://localhost:5000/' + req.file.path; 
    res.status(200).send(fileUrl);
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send('Error uploading file');
  }
});

module.exports = router;