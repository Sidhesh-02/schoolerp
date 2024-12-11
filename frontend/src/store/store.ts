import {atom}  from "recoil";
import { getInstitutionName } from "../utils/api";

const  {data } : any = await getInstitutionName();

export const handleInstitutionName = atom({
    key : "name",
    default : data.Institution_name,
})