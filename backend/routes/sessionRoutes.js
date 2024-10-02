const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { route } = require("./studentRoutes");
const router = express.Router();

const prisma = new PrismaClient();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

router.get("/getsession",(req,res)=>{
    const {session} = req.query;

})

router.get("/addsession",(req,res)=>{
    const {session} = req
})

module.exports = router;