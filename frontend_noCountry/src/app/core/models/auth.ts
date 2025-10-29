import { Doctor } from "./doctor";
import { Patient } from "./patient";

export interface AuthCurrentUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: string;
  urlImage: string | null;
  data: null | Doctor | Patient
}