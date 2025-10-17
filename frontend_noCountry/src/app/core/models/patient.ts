export interface Patient {
  id: number;
  dateOfBirth: string;
  gender: string;
  dni: string;
}

export interface PatientCreate {
  firstName: string,
  lastName: string,
  phone: string | null,
  email: string,
  password: string,
  repeatPassword: string,
  dateOfBirth: string,
  gender: string,
  dni: string
}

export interface PatientCreateAdmin {
  firstName: string,
  lastName: string,
  phone: string | null,
  email: string,
  dateOfBirth: string,
  gender: string,
  dni: string
}

export interface PatientUpdateAdmin {
  firstName: string,
  lastName: string,
  phone: string | null,
  email: string,
  dateOfBirth: string,
  gender: string,
  dni: string
}