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
      console.log(examinationType)
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
    
      // Update marks in the database
      const status = await prisma.marks.update({
        where: {
          studentId_subjectId_examinationType: {
            studentId, 
            subjectId, 
            examinationType,  // Composite unique key defined in your schema
          },
        },
        data: {
          subjectName,
          examinationType,
          obtainedMarks,
          totalMarks,
          percentage,
        },
      });
      console.log(status)
  
      return res.status(200).json({ message: "Marks updated successfully", status });
    } catch (error) {
      console.error("Error updating marks:", error);
      return res.status(500).json({ message: "Failed to update marks", error: error.message });
    }
  });
  
  
  router.post("/api/totalMarks", async (req, res) => {
    try {
      const { subjectId, examinationType, totalMarks } = req.body;
      const totalMarksData = await prisma.totalMarks.findMany(
        {
          where:{
            examinationType
          }
        }
      );
      if (totalMarksData.length === 0){
        const newTotalMarks = await prisma.totalMarks.create({
          data: {
            subjectId,
            examinationType,
            totalMarks,
          },
        });
        return res.status(201).json(newTotalMarks);
      }
      const updatedTotalMarks = await prisma.totalMarks.updateMany({
        where: {
          subjectId,
          examinationType,
        },
        data: {
          totalMarks,
        },
      });  
      return res.status(201).json(updatedTotalMarks);    
      
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
    console.log(totalMarks)
    res.status(201).json(totalMarks)
  })
  


  module.exports = router;