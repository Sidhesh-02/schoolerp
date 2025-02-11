import { useRecoilValue } from "recoil";
import { address, handleInstitutionLogo, handleInstitutionName } from "../../store/store";
import { searchStudent } from "../../apis/api";
import jsPDF from "jspdf";

const GetTransferCertificate = ({ rollNo, standard }: { rollNo: number; standard: string }) => {
    const Institute_name = useRecoilValue(handleInstitutionName);
    const Institute_address = useRecoilValue(address);
    const InstitueLogo: string = useRecoilValue(handleInstitutionLogo);

    const getBase64Image = async (url: string): Promise<string> => {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
        });
    };

    const generatePDF = async () => {
        const { data } = await searchStudent(rollNo, standard);
        const doc = new jsPDF("p", "mm", "a4");

        const date = new Date().toLocaleDateString();
        const amt = new Date(data.fees[0].amountDate).toLocaleDateString();
        const dob = new Date(data.dateOfBirth).toLocaleDateString();
        
        // Fetch logo as Base64
        const logoBase64 = await getBase64Image(InstitueLogo);
        
        // ** Header (Institute Name + Logo) **
        if (logoBase64) {
            doc.addImage(logoBase64, "JPEG", 26, 11, 14, 12); // Logo at the top-left
        }

        doc.setFont("times", "bold");
        doc.setFontSize(26);
        doc.setTextColor(29, 78, 216); // Blue color
        doc.text(Institute_name, 105, 20, { align: "center" });

        doc.setFontSize(12);
        doc.setFont("times", "normal");
        doc.setTextColor(55, 55, 55);
        doc.text(Institute_address, 105, 30, { align: "center" });

        doc.line(20, 35, 190, 35); // Header underline

        // ** Date **
        doc.setFontSize(12);
        doc.text(`DATE: ${date}`, 160, 50);

        // ** Certificate Title **
        doc.setFontSize(20);
        doc.setFont("times", "bold");
        doc.text("TRANSFER CERTIFICATE", 105, 75, { align: "center" });

        // ** Certificate Body **
        doc.setFontSize(14);
        doc.setFont("times", "normal");

        const marginLeft = 25;
        let startY = 90;

        const lineSpacing = 10;
        const text1 = `Certified that Sri/Miss ${data.fullName}, son/daughter of ${data.parents[0].fatherName}, an inhabitant of ${data.address}, left ${Institute_name} on ${date}.`;
        const text2 = `His/Her Date of Birth according to the School Admission Register is ${dob}. He/She was studying in Class ${data.standard} and passed the examination for promotion to next Class.`;
        const text3 = `All the fees up to ${amt} have been paid fully. His/Her character is Excellent.`;

        // ** Wrap Text for Proper Line Spacing **
        const splitText1 = doc.splitTextToSize(text1, 160);
        const splitText2 = doc.splitTextToSize(text2, 160);
        const splitText3 = doc.splitTextToSize(text3, 160);


        splitText1.forEach((line:string) => {
            doc.text(line, marginLeft, startY);
            startY += lineSpacing; // Proper spacing between lines
        });

        splitText2.forEach((line:string) => {
            doc.text(line, marginLeft, startY);
            startY += lineSpacing; // Proper spacing between lines
        });

        splitText3.forEach((line:string) => {
            doc.text(line, marginLeft, startY);
            startY += lineSpacing; // Proper spacing between lines
        });

        // ** Principal Signature **
        doc.setFontSize(14);
        doc.setFont("times", "bold");
        doc.text("PRINCIPAL", 150, startY + 50);
        doc.text("GODSON V. ZACHARIAS", 130, startY + 60);

        // ** Generate PDF **
        doc.save("Transfer_Certificate.pdf");
    };

    return (
        <div>
            <button onClick={generatePDF}>Get Transfer Certificate</button>
        </div>
    );
};

export default GetTransferCertificate;
