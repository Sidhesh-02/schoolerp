const express = require("express");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();
const ExcelJS = require("exceljs");
const path = require("path");

const prisma = new PrismaClient();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/* Marks Model */

  router.get("/downloadMarks", async (req, res) => {
    try {
      const feeRecord = await prisma.marks.findMany();
  
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Marks");
  
      worksheet.columns = [
        { header: "id", key: "id", width: 30 },
        { header: "studentId", key: "studentId", width: 15 },
        { header: "subjectId", key: "subjectId", width: 15 },
        { header: "subjectName", key: "subjectName", width: 30 },
        { header: "examinationType", key: "examinationType", width: 20 },
        { header: "obtainedMarks", key: "obtainedMarks", width: 10 },
        { header: "totalMarks ", key: "totalMarks", width: 10 },
        { header: "percentage ", key: "percentage", width: 10 },
      ];
  
      feeRecord.forEach((record) => {
        worksheet.addRow({
          id                  : record.id,
          studentId           : record.studentId,
          subjectId           : record.subjectId,
          subjectName         : record.subjectName,
          examinationType     : record.examinationType,
          obtainedMarks       : record.obtainedMarks,
          totalMarks          : record.totalMarks,
          percentage          : record.percentage,
      })});
  
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=Marks.xlsx"
      );
      
      await workbook.xlsx.write(res);
      res.end();
    }catch (error) {
      console.error("Error generating attendance Excel file:", error);
      res.status(500).send("Failed to generate Excel file");
    }
  });

  router.post('/api/marks', async (req, res) => {
    const { studentId, subjectId, subjectName, examinationType, obtainedMarks, totalMarks, percentage } = req.body;
  
    try {
      // Save the marks data
      const result = await prisma.marks.create({
        data: {
          studentId,
          subjectId,
          subjectName,
          examinationType,
          obtainedMarks,
          totalMarks,
          percentage,
        },
      });
  
      res.status(201).json(result);
    } catch (error) {
      console.error("Error saving marks:", error);
      res.status(500).json({ error: "Failed to save marks." });
    }
  });


  router.get('/api/getMarks', async (req, res) => {
    try {
      const {examinationType} = req.query;
      const result = await prisma.marks.findMany({
        where:{
          examinationType
        }
      });
      
      res.status(200).json(result); // Send the fetched marks as JSON
    } catch (error) {
      console.error("Error fetching marks:", error);
      res.status(500).json({ error: "Failed to fetch marks" });
    }
  });

  router.post("/api/updateMarks", async (req, res) => {
    const { studentId, subjectId, subjectName, examinationType, obtainedMarks, totalMarks, percentage } = req.body;
  
    try {
      // Check if the marks entry already exists
      const existingMark = await prisma.marks.findUnique({
        where: {
          studentId_subjectId_examinationType: {
            studentId,
            subjectId,
            examinationType,
          },
        },
      });
  
      let status;
      if (existingMark) {
        // Update if it exists
        status = await prisma.marks.update({
          where: {
            studentId_subjectId_examinationType: {
              studentId,
              subjectId,
              examinationType,
            },
          },
          data: {
            subjectName,
            obtainedMarks,
            totalMarks,
            percentage,
          },
        });
      } else {
        // Create if it doesn't exist
        status = await prisma.marks.create({
          data: {
            studentId,
            subjectId,
            subjectName,
            examinationType,
            obtainedMarks,
            totalMarks,
            percentage,
          },
        });
      }
  
      return res.status(200).json({ message: "Marks updated successfully", status });
    } catch (error) {
      console.error("Error updating marks:", error);
      return res.status(500).json({ message: "Failed to update marks", error: error.message });
    }
  });
  
  
  
  router.post("/api/totalMarks", async (req, res) => {
    try {
      const { subjectId, examinationType, totalMarks } = req.body;
  
      if (!subjectId || !examinationType || totalMarks === undefined) {
        return res.status(400).json({ error: "All fields are required" });
      }
  
      // Check if an entry already exists
      const existingTotalMarks = await prisma.totalMarks.findFirst({
        where: {
          subjectId,
          examinationType,
        },
      });
  
      if (existingTotalMarks) {
        // If an entry exists, update it
        const updatedTotalMarks = await prisma.totalMarks.update({
          where: { id: existingTotalMarks.id }, // Use ID as it's unique
          data: { totalMarks },
        });
        return res.status(200).json(updatedTotalMarks);
      }
  
      // If no entry exists, create a new one
      const newTotalMarks = await prisma.totalMarks.create({
        data: { subjectId, examinationType, totalMarks },
      });
  
      return res.status(201).json(newTotalMarks);
    } catch (error) {
      console.error("Error saving total marks:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  

  router.get("/getTotalMarks",async (req,res)=>{
    const {examinationType} = req.query;
    const totalMarks = await prisma.totalMarks.findMany(
      {
        where:{
          examinationType
        }
      }
    );
    
    res.status(201).json(totalMarks)
  })
  


  module.exports = router;