import {atom}  from "recoil";
import { getInstitutionName, getCurrentSession, fetchStandards } from "../apis/api";
const schoolName = await getInstitutionName();
const fetchSessionJson = await getCurrentSession();
const sessions = fetchSessionJson.data;
const session: string[] = [];
sessions.forEach((element: { year: string; }) => {
  session.push(element.year)
});
export const handleInstitutionName = atom({
  key: "name",
  default: schoolName ?? "School",
});

export const sessionYear = atom({
  key:"session",
  default: session ?? ["2024-2025"]
})

const standards = await fetchStandards();
export const standardList = atom({
  key:"standard",
  default: standards.data.standards ?? [""]
})

