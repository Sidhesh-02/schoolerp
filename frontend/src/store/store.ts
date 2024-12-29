import {atom}  from "recoil";
import { getInstitutionName } from "../apis/api";
const schoolName = await getInstitutionName();
export const handleInstitutionName = atom({
    key: "name",
    default: schoolName ?? "School",
  });