/* Fees Model */
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();
const ExcelJS = require("exceljs");

const path = require("path");
const prisma = new PrismaClient();

const fileStorage = require("../sessionManager");
const data = fileStorage.readData();
const session = data.year;

router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Get Fees Details
router.get("/fees/details", async (req, res) => {
    const { standard, roll_no } = req.query;
  
    if (!standard || isNaN(parseInt(roll_no))) {
      return res.status(400).json({ error: "Invalid query parameters" });
    }
  
    try {
      const result = await prisma.student.findFirst({
        where: {
          session:session,
          standard: standard.toString(),
          rollNo: parseInt(roll_no),
        },
        select: {
          id: true,
          fullName: true,
          rollNo: true,
          standard: true,
          fees: {
            where :{

            },
            select: {
              title: true,
              amount: true,
              amountDate: true,
              admissionDate: true,
            },
          },
        },
      });
  
      if (!result) {
        return res.status(404).json({ error: "Student not found" });
      }
      res.status(200).json(result);
    } catch (error) {
      console.error("Error fetching fees details:", error);
      res.status(500).json({ error: "An error occurred" });
    }
  });
  
  // Redundant Route to Get Fees Details
  router.get("/feetable", async(req,res)=>{
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
  
  //Add Fees Details
  router.post("/fees/add", async (req, res) => {
    const { title, amount, amountDate, admissionDate, studentId } =
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
          admissionDate: new Date(),
          studentId: parseInt(studentId),
        },
      });
  
      res.status(201).json(fee);
    } catch (error) {
      console.error("Error adding fee:", error);
      res.status(500).json({ error: "An error occurred" });
    }
  });



  router.get("/downloadfeedata", async (req, res) => {
    try {
      const feeRecord = await prisma.fee.findMany();
  
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Fees");
  
      worksheet.columns = [
        { header: "id", key: "id", width: 30 },
        { header: "title", key: "title", width: 15 },
        { header: "amount", key: "amount", width: 30 },
        { header: "amountDate", key: "amountDate", width: 20 },
        { header: "admissionDate", key: "admissionDate", width: 10 },
        { header: "studentId ", key: "studentId", width: 10 },
      ];
  
      feeRecord.forEach((record) => {
        worksheet.addRow({
          id                  : record.id,
          title               : record.title,
          amount              : record.amount,
          amountDate          : record.amountDate,
          admissionDate       : record.admissionDate,
          studentId           : record.studentId
      })});
  
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=Fees.xlsx"
      );
     
      await workbook.xlsx.write(res);
      res.end();
    }catch (error) {
      console.error("Error generating attendance Excel file:", error);
      res.status(500).send("Failed to generate Excel file");
    }
  });

  module.exports = router;