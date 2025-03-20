import { atom } from "recoil";
import { 
  getInstitutionNameAndLogo, 
  getCurrentSession, 
  fetchStandards, 
  fetchInstallments 
} from "../apis/api";

// Default values in case API calls fail
const defaultSession = ["2024-2025"];
const defaultStandards = [""];
const defaultInstallments = [""];

// Fetch and process session data
async function fetchSession() {
  try {
    const fetchSessionJson = await getCurrentSession();
    return fetchSessionJson?.map((element: { year: string }) => element.year) || defaultSession;
  } catch {
    return defaultSession;
  }
}

// Fetch and process installment data
async function fetchInstallmentsData() {
  try {
    const installmentHandle = await fetchInstallments();
    return installmentHandle?.map((element: { installments: string }) => element.installments) || defaultInstallments;
  } catch {
    return defaultInstallments;
  }
}

// Fetch institution data
async function fetchInstitutionData() {
  try {
    return await getInstitutionNameAndLogo();
  } catch {
    return {
      Institution_name: "Institution Placeholder",
      SchoolLogo: "",
      TotalFees: 0,
      SchoolAddress: "Not Available",
      Institution_hostel_name: "No Hostel",
    };
  }
}

// Fetch standard list
async function fetchStandardsData() {
  try {
    const data = await fetchStandards();
    return data.standards || defaultStandards;
  } catch {
    return defaultStandards;
  }
}

// Initialize atoms with async values
export const handleInstitutionName = atom({
  key: "name",
  default: (async () => (await fetchInstitutionData()).Institution_name)(),
});

export const handleInstitutionLogo = atom({
  key: "logo",
  default: (async () => (await fetchInstitutionData()).SchoolLogo)(),
});

export const totalFee = atom({
  key: "totalFee",
  default: (async () => (await fetchInstitutionData()).TotalFees)(),
});

export const address = atom({
  key: "address",
  default: (async () => (await fetchInstitutionData()).SchoolAddress)(),
});

export const handleHostelName = atom({
  key: "hostelName",
  default: (async () => (await fetchInstitutionData()).Institution_hostel_name)(),
});

export const sessionYear = atom({
  key: "session",
  default: fetchSession(),
});

export const standardList = atom({
  key: "standard",
  default: fetchStandardsData(),
});

export const installmentArr = atom({
  key: "installments",
  default: fetchInstallmentsData(),
});
