import { useRecoilValue } from "recoil"
import { address, handleInstitutionLogo, handleInstitutionName } from "../../store/store"
import { searchStudent } from "../../apis/api";
import html2PDF from "jspdf-html2canvas";
import ReactDOM from "react-dom";
import "../components_css/bonafide.css";




const GetBonafide = ({rollNo , standard} : {rollNo : number , standard : string} )  => {
    const Institute_name = useRecoilValue(handleInstitutionName);
    const Institute_address = useRecoilValue(address);
    const InstitueLogo : string = useRecoilValue(handleInstitutionLogo);
    
    

    const GetHtml = (data : any, logo : string) =>{

        const date = new Date().toLocaleDateString();
        const admission = new Date(data.fees[0].admissionDate).toLocaleDateString();
        const dob =  new Date(data.dateOfBirth).toLocaleDateString();

        return (
        
            <div className="container">

                <div className="header" >
                    <span><img
                        src={logo}
                        style={{paddingRight: "10px"}}
                        alt="logo"
                    /></span>
                    <>
                        <h1>{Institute_name}</h1>
                        <p>{Institute_address}</p>
                    </>
                    
                </div>

                <div className="date">
                    <p>DATE: <u>{date}</u></p>
                </div>

                <h2 className="certificate-title">BONAFIDE CERTIFICATE</h2>

                <p className="certificate-body">
                    This is to certify that <span><b>{data.fullName}</b></span>, son/daughter of <span><b>{data.fatherName}</b></span>,
                    is a student of {Institute_name} and is currently studying in class <span><b>{data.standard}</b></span>.
                    He/She has been studying in this institution since <span><u>{admission}</u></span> and has been regular in attendance.
                </p>
                <p className="certificate-body">
                    His/her date of birth according to the admission register is <span><u>{dob}</u></span>.
                    His/her performance and character is good and satisfactory to the best of our knowledge.
                </p>

                <div className="principal">
                    <p>PRINCIPAL</p>
                    <p>GODSON V. ZACHARIAS</p>
                </div>
            </div>
        
        
        )
    }
    const getBase64Image = async (url: string): Promise<string> => {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
        });
    };

    const handlefunc = async() =>{
        const {data} = await searchStudent(rollNo , standard);
        const container = document.createElement("body");
        document.body.appendChild(container);

        const logoBase64 = await getBase64Image(InstitueLogo);

        ReactDOM.render(GetHtml(data ,logoBase64), container);
        
        
        await html2PDF(container, {
            jsPDF: {
                format: 'a4',
            },
            imageType: 'image/jpeg',
            output: 'Bonafide_Cert.pdf'
        });

        // Clean up the container
        document.body.removeChild(container);
       
        
        
    }   

    return (
        <div>
            <button onClick={handlefunc}>Get Bonafide</button>
        </div>
    )
}

export default GetBonafide



