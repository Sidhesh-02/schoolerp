const express = require("express");
const { PrismaClient } = require("@prisma/client");
const router = express.Router();

const prisma = new PrismaClient();

function jsonBigIntReplacer(key, value) {
    if (typeof value === "bigint") {
        return value.toString();
    }
    return value;
}

// Delete Function
const deleteStudent = async (studentId) => {
    try {
        // Delete related records
        await prisma.parent.deleteMany({ where: { studentId: studentId } });
        await prisma.fee.deleteMany({ where: { studentId: studentId } });
        await prisma.attendance.deleteMany({ where: { studentId: studentId } });
        await prisma.student.delete({ where: { id: parseInt(studentId) } });

        return {
            success: true,
            message: "Student and related records deleted successfully",
        };
    } catch (error) {
        console.error("Error deleting student:", error);
        throw new Error("Failed to delete student");
    }
};

// Create Student
router.post("/students", async (req, res) => {
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
        photoUrl
    } = req.body;

    try {
        const student = await prisma.student.create({
            data: {
                fullName,
                gender,
                dateOfBirth: new Date(dateOfBirth),
                rollNo: parseInt(rollNo),
                standard,
                adhaarCardNo: parseInt(adhaarCardNo),
                scholarshipApplied,
                address,
                photoUrl,
                parents: {
                    create: parents.map((parent) => ({
                        fatherName: parent.fatherName,
                        fatherOccupation: parent.fatherOccupation,
                        motherName: parent.motherName,
                        motherOccupation: parent.motherOccupation,
                        fatherContact: parseInt(parent.fatherContact),
                        motherContact: parseInt(parent.motherContact),
                        address: parent.address,
                    })),
                },
                fees: {
                    create: fees.map((fee) => ({
                        title: fee.installmentType,
                        amount: parseFloat(fee.amount),
                        amountDate: new Date(fee.amountDate),
                        admissionDate: new Date(fee.admissionDate),
                        pendingAmount: 10500 - parseFloat(fee.amount),
                    })),
                },
            },
            include: {
                parents: true,
                fees: true,
                attendanceRecords: true,
            },
        });

        res.status(201).json(JSON.stringify(student, jsonBigIntReplacer));
    } catch (error) {
        console.error("Error creating student:", error);
        res.status(500).send("Failed to create student");
    }
});

// Delete Student
router.delete("/delete/students", async (req, res) => {
    const { studentId } = req.query;
    try {
        await deleteStudent(parseInt(studentId));
        res.status(200).send({ message: "Student deleted successfully" });
    } catch (error) {
        res.status(500).send({ error: "Failed to delete student" });
    }
});

// Search Students
router.get("/getallstudent", async (req, res) => {
    const { std } = req.query;
    try {
        const result = await prisma.student.findMany({
            where: {
                standard: std
            }
        });
        res.status(200).json(JSON.parse(JSON.stringify({ result }, jsonBigIntReplacer)));
    } catch (error) {
        res.status(400).json(error);
    }
});

// Get searched student by rollno.:
router.get("/students/rollNo", async (req, res) => {
    const { rollno, standard } = req.query;

    if (!rollno || isNaN(rollno) || !standard) {
        return res.status(400).json({ message: "Invalid roll number or standard" });
    }

    try {
        const student = await prisma.student.findFirst({
            where: {
                rollNo: parseInt(rollno),
                standard: standard,
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
        console.error("Error fetching student:", error.message);
        console.error("Stack trace:", error.stack);
        res.status(500).json({ message: "An error occurred while fetching the student" });
    }
});

// Update student route
router.put("/update/student/:id", async (req, res) => {
    const studentId = parseInt(req.params.id);
    const {
        fullName,
        gender,
        dateOfBirth,
        rollNo,
        standard,
        adhaarCardNo,
        scholarshipApplied,
        address,
        photoUrl,
        parents,
    } = req.body;

    try {
        // Update student details
        const updatedStudent = await prisma.student.update({
            where: { id: studentId },
            data: {
                fullName,
                gender,
                dateOfBirth: new Date(dateOfBirth),
                rollNo: parseInt(rollNo),
                standard,
                adhaarCardNo,
                scholarshipApplied,
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
