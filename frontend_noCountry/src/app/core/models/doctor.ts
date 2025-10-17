export interface Doctor {
  id: number;
  specialty: string;
  licenseNumber: string;
  bio: string;
}

export interface DoctorCreate {
  firstName: string,
  lastName: string,
  phone: string | null,
  email: string,
  password: string,
  repeatPassword: string,
  specialty: string;
  licenseNumber: string;
  bio: string;
}

export interface DoctorUpdate {
  firstName: string,
  lastName: string,
  phone: string | null,
  email: string,
  specialty: string;
  licenseNumber: string;
  bio: string;
}