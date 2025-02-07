import { useRecoilValue } from "recoil";
import { address, handleInstitutionLogo, handleInstitutionName } from "../../store/store";
import { searchStudent } from "../../apis/api";
import html2PDF from "jspdf-html2canvas";
import ReactDOM from "react-dom";
import "../components_css/transfer_cert.css";

const GetTransferCertificate = ({ rollNo, standard }: { rollNo: number; standard: string }) => {
    const Institute_name = useRecoilValue(handleInstitutionName);
    const Institute_address = useRecoilValue(address);
    const InstitueLogo: string = useRecoilValue(handleInstitutionLogo);

    const GetHtml = (data: any, logo: string) => {
        const date = new Date().toLocaleDateString();
        const amt = new Date(data.fees[0].amountDate).toLocaleDateString();
        const dob = new Date(data.dateOfBirth).toLocaleDateString();

        return (
            <div className="container">
                <div className="header">
                    <span>
                        <img src={logo} style={{ paddingRight: "10px" }} alt="logo" />
                    </span>
                    <>
                        <h1>{Institute_name}</h1>
                        <p>{Institute_address}</p>
                    </>
                </div>

                <div className="date">
                    <p>DATE: <u>{date}</u></p>
                </div>

                <h2 className="certificate-title">TRANSFER CERTIFICATE</h2>

                <p className="certificate-body">
                    Certified that Sri/Miss <span><b>{data.fullName}</b></span>, son/daughter of <span><b>{data.parents[0].fatherName}</b></span>,
                    an inhabitant of <span><b>{data.address}</b></span>, left <b>{Institute_name}</b> on <u>{date}</u>.
                </p>
                <p className="certificate-body">
                    His/Her Date of Birth according to the School Admission Register is <span><b>{dob}</b></span>.
                    He/She was studying in Class <b>{data.standard}</b> and passed 
                    the examination for promotion to next Class .
                </p>
                <p className="certificate-body">
                    All the fees up to <span><b>{amt}</b></span> have been paid fully. His/Her character is Excellent.
                </p>
                

                <div className="principal">
                    <p>PRINCIPAL</p>
                    <p>GODSON V. ZACHARIAS</p>
                </div>
            </div>
        );
    };

    const getBase64Image = async (url: string): Promise<string> => {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
        });
    };

    const handlefunc = async () => {
        const { data } = await searchStudent(rollNo, standard);
        console.log(data);
        const container = document.createElement("body");
        document.body.appendChild(container);

        const logoBase64 = await getBase64Image(InstitueLogo);

        ReactDOM.render(GetHtml(data, logoBase64), container);

        
        await html2PDF(container, {
            jsPDF: {
                format: 'a4',
            },
            imageType: 'image/jpeg',
            output: 'Transfer_Cert.pdf'
        });

        document.body.removeChild(container);
      
    };

    return (
        <div>
            <button onClick={handlefunc}>Get Transfer Certificate</button>
        </div>
    );
};

export default GetTransferCertificate;
