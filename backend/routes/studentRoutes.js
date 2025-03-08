const express = require("express");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();
const prisma = new PrismaClient();
const StudentSchema = require("../utils/joiSchema");

function jsonBigIntReplacer(key, value) {
    if (typeof value === "bigint") {
        return value.toString();
    }
    return value;
}

router.post("/students", async (req, res) => {
    
    // Validate request body
    const { error, value } = StudentSchema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            message: error.details.map((err) => err.message),
        });
    }

    // Extract validated data
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
        photoUrl,
        remark,
        category,
        caste
    } = value;

    const session = req.session;

    try {
        const student = await prisma.student.create({
            data: {
                fullName,
                gender,
                dateOfBirth: new Date(dateOfBirth),
                rollNo: parseInt(rollNo),
                standard,
                adhaarCardNo: BigInt(adhaarCardNo),
                scholarshipApplied,
                address,
                photoUrl,
                remark,
                category,
                caste,
                session,
                parents: {
                    create: parents.map((parent) => ({
                        fatherName: parent.fatherName,
                        fatherOccupation: parent.fatherOccupation,
                        motherName: parent.motherName,
                        motherOccupation: parent.motherOccupation,
                        fatherContact: BigInt(parent.fatherContact),
                        motherContact: BigInt(parent.motherContact),
                        address: parent.address,
                    })),
                },
                fees: {
                    create: fees.map((fee) => ({
                        title: fee.installmentType,
                        amount: parseFloat(fee.amount.toString()),
                        amountDate: new Date(fee.amountDate),
                        admissionDate: new Date(fee.admissionDate),
                    })),
                },
            },
            include: {
                parents: true,
                fees: true,
                attendanceRecords: true,
            },
        });
        res.status(201).json(JSON.parse(JSON.stringify(student, jsonBigIntReplacer)));
    } catch (error) {
        console.error("Error creating student:", error);
        res.status(500).send("Failed to create student");
    }
});



// Delete Student
router.delete("/delete/students", async (req, res) => {
    const { studentId } = req.query;
    try {
        // Delete all associated records first
        await Promise.all([
            prisma.parent.deleteMany({ where: { studentId: parseInt(studentId) } }),
            prisma.fee.deleteMany({ where: { studentId: parseInt(studentId) } }),
            prisma.attendance.deleteMany({ where: { studentId: parseInt(studentId) } }),
            prisma.marks.deleteMany({ where: { studentId: parseInt(studentId) } }),
        ]);

        // Now delete the student
        await prisma.student.delete({ where: { id: parseInt(studentId) } });

        res.status(200).json({ message: "Student deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to Delete Student" });
    }
});


// Search Students
router.get("/getallstudent", async (req, res) => {
    const { std } = req.query;
    const session = req.session;
    try {
        const result = await prisma.student.findMany({
            where: {
                standard: std,
                session : session
            }
        });
        res.status(200).json(JSON.parse(JSON.stringify({ result }, jsonBigIntReplacer)));
    } catch (error) {
        res.status(400).json({message:"Server Error"});
    }
});


// Get searched student by rollno.:
router.get("/students/rollNo", async (req, res) => {
    const { rollno , standard } = req.query;
    const session = req.session;
    try {
        let student;
        student = await prisma.student.findFirst({
            where: {
                rollNo: parseInt(rollno),
                standard: standard,
                session : session
            },
            include: {
                parents: true,
                fees: true,
            },
        });   
        if (student) {
            res.status(200).send(JSON.stringify(student, jsonBigIntReplacer));
        } else {
            res.status(404).json({ message: "Student Not Found" });
        }
    } catch (error) {
        res.status(400).json({message:"Server Error"});
    }
});

// get all who applied for scholarship
router.get("/getallstudentsc",async (req,res)=>{
    try{
        const session = req.session;
        const studentsc = await prisma.student.findMany({
            where:{
                scholarshipApplied:true,
                session:session
            }
        })
        if (studentsc.length>0) {
            res.status(200).send(JSON.stringify(studentsc, jsonBigIntReplacer));
        } else {
            res.status(404).json({ message: "No Student with Scholarship Found" });
        }
    }catch(error){
        console.error("Error fetching student:", error.message);
        console.error("Stack trace:", error.stack);
        res.status(500).json({ message: "An error occurred while fetching the student" });
    }
})

// Update student route
router.put("/update/student/:id", async (req, res) => {
    const studentId = parseInt(req.params.id);
    const {
        fullName,
        gender,
        dateOfBirth,
        category,
        caste,
        rollNo,
        standard,
        adhaarCardNo,
        scholarshipApplied,
        remark,
        address,
        photoUrl,   
        parents,
    } = req.body;

    try {
        // Update student details
        const updatedStudent = await prisma.student.update({
            where: { id: studentId},
            data: {
                fullName,
                gender,
                dateOfBirth: new Date(dateOfBirth),
                rollNo: parseInt(rollNo),
                category,
                caste,
                standard,
                adhaarCardNo,
                scholarshipApplied,
                remark,
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

module.exports = router;
