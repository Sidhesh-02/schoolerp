import { useRecoilValue } from "recoil";
import { address, handleInstitutionLogo, handleInstitutionName } from "../../store/store";
import { searchStudent } from "../../apis/api";
import jsPDF from "jspdf";

const GetBonafide = ({ rollNo, standard }: { rollNo: number; standard: string }) => {
    const Institute_name = useRecoilValue(handleInstitutionName);
    const Institute_address = useRecoilValue(address);
    const InstitueLogo: string = useRecoilValue(handleInstitutionLogo);
    const generatePDF = async () => {
        const { data } = await searchStudent(rollNo, standard);
        const doc = new jsPDF("p", "mm", "a4");

        const date = new Date().toLocaleDateString();
        const admission = new Date(data.fees[0].admissionDate).toLocaleDateString();
        const dob = new Date(data.dateOfBirth).toLocaleDateString();

        const getBase64Image = async (url: string): Promise<string> => {
            const response = await fetch(url);
            const blob = await response.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
            });
        };

        // ** Font Settings **
        doc.setFont("times", "normal");
        doc.setTextColor(55, 55, 55); // Dark gray text
        
        // ** Header **
        // Fetch logo as Base64
        const logoBase64 = await getBase64Image(InstitueLogo);

        // ** Header (Institute Name + Logo) **
        if (logoBase64) {
            doc.addImage(logoBase64, "JPEG", 26, 14, 14, 12); // Logo at the top-left
        }
        let startPostition = 25;
        doc.setFontSize(26);
        doc.setFont("times", "bold");
        doc.setTextColor(29, 78, 216); // Blue color

        doc.text(Institute_name, 105, startPostition, { align: "center" });
        startPostition += 10; 
        doc.setFontSize(12);
        doc.setFont("times", "normal");
        doc.setTextColor(55, 55, 55);
        
        doc.text(Institute_address, 105, startPostition, { align: "center" });
        startPostition += 5; // 40
        doc.line(20, startPostition, 190, startPostition); // Header underline
        startPostition += 15; // 55
        // ** Date **
        doc.setFontSize(12);
        doc.text(`DATE: ${date}`, 160, startPostition);

        // ** Certificate Title **
        doc.setFontSize(18);
        doc.setFont("times", "bold");
        startPostition += 30; // 85
        doc.text("BONAFIDE CERTIFICATE", 105, startPostition, { align: "center" });

        // ** Certificate Body with Line Spacing**
        doc.setFontSize(16);
        doc.setFont("times", "normal");

        const marginLeft = 25;
        startPostition += 15; // 100
        const lineSpacing = 10; // **Increase this for more spacing**
        const text1 = `This is to certify that ${data.fullName}, son/daughter of ${data.parents[0].fatherName}, is a student of ${Institute_name} and is currently studying in class ${data.standard}. He/She has been studying in this institution since ${admission} and has been regular in attendance.`;
        const text2 = `His/her date of birth according to the admission register is ${dob}. His/her performance and character is good and satisfactory to the best of our knowledge.`;

        // ** Manual Line Spacing Fix **
        const splitText1 = doc.splitTextToSize(text1, 160);
        const splitText2 = doc.splitTextToSize(text2, 160);

        splitText1.forEach((line:string) => {
            doc.text(line, marginLeft, startPostition);
            startPostition += lineSpacing; // Proper spacing between lines
        });

        startPostition += 10; // Extra space between paragraphs

        splitText2.forEach((line:string) => {
            doc.text(line, marginLeft, startPostition);
            startPostition += lineSpacing; // Proper spacing between lines
        });

        // ** Principal Signature **
        doc.setFontSize(14);
        doc.setFont("times", "bold");
        doc.text("PRINCIPAL", 150, startPostition + 30);
        doc.text("GODSON V. ZACHARIAS", 130, startPostition + 40);

        // ** Generate PDF **
        doc.save("Bonafide_Cert.pdf");
    };

    return (
        <div>
            <button onClick={generatePDF}>Get Bonafide</button>
        </div>
    );
};

export default GetBonafide;
