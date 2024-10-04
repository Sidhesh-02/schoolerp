/* Hostel Model */
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();
const path = require("path");

const fileStorage = require("../sessionManager");
const data = fileStorage.readData();
const session = data.year;
 
const prisma = new PrismaClient();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));
router.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Get Hostel Data
router.get('/gethosteldata', async (req, res) => {
    try {
      const result = await prisma.hostel.findMany();
      const hostelRes = await prisma.control.findFirst();
      
      const available = [];
      for (let i = 1; i <= hostelRes.number_of_hostel_bed; i++) {
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
  
  // Posting Hostel Data
  router.post("/hosteldata",async (req, res)=>{
  
    const { name, rollNo, standard, gender, bed_no } = req.body;
  
    try {
        const result = await prisma.hostel.create({
            data: {
                name : name,
                standard: standard,
                gender : gender,
                bed_number: bed_no,
                rollNo : parseInt(rollNo),
            },
        });
       
        res.status(201).json(result);
    }catch (error) {
        console.log(error);
        res.status(500).json({ error: "An error occurred while creating the hostel data entry." });
    }
  });
  
  // Update Hostel Data
  router.post("/updatehostel",async (req, res)=>{
  
    const { rollNo, standard, bed_no} = req.body;
    try {
        const result = await prisma.hostel.update({
            where : {
              rollNo_standard : {
                rollNo : parseInt(rollNo),
                standard : standard,
              }
            },
            data: {
              bed_number: bed_no,
            },
        });
       
        res.status(201).json(result);
    }catch (error) {
        console.log(error);
        res.status(500).json({ error: "An error occurred while updating the hostel data entry." });
    }
  });
  
  // Delete Route for Hostel Data
  router.post("/hostel/delete" , async(req, res)=>{
      const {rollNo, bed_no } = req.body;
  
      try{
          const result = await prisma.hostel.delete({
            where :{
              rollNo : parseInt(rollNo),
              bed_number : bed_no,
            }
          })
          res.status(201).json(result)
      }catch(error){
        res.status(404).json({message : error})
      }
  })

  module.exports = router;