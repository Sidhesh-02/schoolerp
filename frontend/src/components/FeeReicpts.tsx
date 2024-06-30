/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";
import axios from "axios";

const FeeReicpts = ({ id , name } : {id : number ,name : any}) => {

  const [title ,setTitle] = useState<string>('');
  const [, setFeedata] = useState<any>();
  
  const fetchFeeData = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/feetable", {
        params: {
          id,
          title,
        },
      });
      console.log(data)
      setFeedata(data[0]);
      generateWordDocument(data[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const generateWordDocument = async(data : any) => {
   
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth(); // Note: Month is zero-based
    const dayOfMonth = date.getDate();

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "SACRED HEART SCHOOL",
                  bold: true,
                  size: 48,
                  color: "1E90FF",
                }),
              ],
              alignment: "center",
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "DAPORIJO, P.B. NO.6, UPPER SUBANSIRI DT, ARUNACHAL PRADESH.",
                  bold: true,
                  size: 24,
                }),
              ],
              alignment: "center",
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: "PIN - 791 122",
                  bold: true,
                  size: 24,
                }),
                new TextRun({
                  text: "     REG.NO:SRITA1803",
                  bold: true,
                  size: 24,
                }),
              ],
              alignment: "center",
            }),
            new Paragraph({
              text: "",
              spacing: { before: 400, after: 400 },
              
            }),
            new Paragraph({
                text: "Fee Receipt",
                spacing: { before: 400, after: 400 },
                alignment: "center",
            }),
            new Paragraph({
                text: `Date : ${dayOfMonth}-${month + 1}-${year}`,
                spacing: { before: 400, after: 400 },
                alignment: "right"
            }),
            new Paragraph({
              text: `Name: ${name}`,
              spacing: { before: 200, after: 200 },
            }),
            
            new Paragraph({
              text: `Title: ${title}`,
              spacing: { before: 200, after: 200 },
            }),
            new Paragraph({
              text: `Amount:  ${data.amount}`,
              spacing: { before: 200, after: 200 },
            }),
          ],
        },
      ],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, "receipt.docx");
    });
  };
 
  useEffect(()=>{
    console.log("title : " , title )
  },[title])

  const handlecange = (e: React.ChangeEvent<HTMLSelectElement>)=>{
      setTitle(e.target.value);
  }

  return (
    <div>
      <div>
            <label>Installment Type</label>
            <select
              name="title"
              value={title}
              onChange={handlecange}
            >
              <option value="">Select installment type</option>
              <option value="1st Installment">1st Installment</option>
              <option value="2nd Installment">2nd Installment</option>
              <option value="3rd Installment">3rd Installment</option>
            </select>
      </div>
      <button onClick={fetchFeeData}>Generate fees Receipt</button>
    </div>
  );
};


export default FeeReicpts

