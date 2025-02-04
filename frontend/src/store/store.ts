import {atom}  from "recoil";
import { getInstitutionNameAndLogo, getCurrentSession, fetchStandards, fetchInstallments } from "../apis/api";
const jsonControlData = await getInstitutionNameAndLogo();
const fetchSessionJson = await getCurrentSession();
const sessions = fetchSessionJson.data;
const session: string[] = [];
sessions.forEach((element: { year: string; }) => {
  session.push(element.year)
});

export const handleInstitutionName = atom({
  key: "name",
  default: jsonControlData.Institution_name,
});
export const handleInstitutionLogo = atom({
  key: "logo",
  default:jsonControlData.SchoolLogo
})

export const totalFee = atom({
  key:"totalFee",
  default:jsonControlData.TotalFees,
})

export const sessionYear = atom({
  key:"session",
  default: session ?? ["2024-2025"]
})

const standards = await fetchStandards();
export const standardList = atom({
  key:"standard",
  default: standards.data.standards ?? [""]
})

const installmentHandle = await fetchInstallments();
const installmentArrHandle : string[] = [];
installmentHandle.forEach((element: {installments : string })=> {
  installmentArrHandle.push(element.installments)
});
export const installmentArr = atom({
  key:"installments",
  default:installmentArrHandle ?? [""]
})


