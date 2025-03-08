import { atom } from "recoil";
import { 
  getInstitutionNameAndLogo, 
  getCurrentSession, 
  fetchStandards, 
  fetchInstallments 
} from "../apis/api";

// Fetch data asynchronously
const jsonControlDataPromise = getInstitutionNameAndLogo();
const fetchSessionJsonPromise = getCurrentSession();
const standardsDataPromise = fetchStandards();
const installmentHandlePromise = fetchInstallments();

// Default values in case API calls fail
const defaultSession = ["2024-2025"];
const defaultStandards = [""];
const defaultInstallments = [""];

// Process fetched session data
const session: string[] = [];
fetchSessionJsonPromise.then((fetchSessionJson) => {
  fetchSessionJson?.forEach((element: { year: string }) => {
    session.push(element.year);
  });
}).catch(() => session.push(...defaultSession));

// Process fetched installment data
const installmentArrHandle: string[] = [];
installmentHandlePromise.then((installmentHandle) => {
  installmentHandle?.forEach((element: { installments: string }) => {
    installmentArrHandle.push(element.installments);
  });
}).catch(() => installmentArrHandle.push(...defaultInstallments));

// Initialize atoms with default values
export const handleInstitutionName = atom({
  key: "name",
  default: jsonControlDataPromise.then(data => data.Institution_name).catch(() => "Institution Placeholder"),
});

export const handleInstitutionLogo = atom({
  key: "logo",
  default: jsonControlDataPromise.then(data => data.SchoolLogo).catch(() => ""),
});

export const totalFee = atom({
  key: "totalFee",
  default: jsonControlDataPromise.then(data => data.TotalFees).catch(() => 0),
});

export const address = atom({
  key: "address",
  default: jsonControlDataPromise.then(data => data.SchoolAddress).catch(() => "Not Available"),
});

export const handleHostelName = atom({
  key: "hostelName",
  default: jsonControlDataPromise.then(data => data.Institution_hostel_name).catch(() => "No Hostel"),
});

export const sessionYear = atom({
  key: "session",
  default: session,
});

export const standardList = atom({
  key: "standard",
  default: standardsDataPromise.then(data => data.standards).catch(() => defaultStandards),
});

export const installmentArr = atom({
  key: "installments",
  default: installmentArrHandle,
});
