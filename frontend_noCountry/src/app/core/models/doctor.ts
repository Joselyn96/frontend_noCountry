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

export interface DoctorResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
  speciality: string;
  licenseNumber: string;
  urlImage: string | null;
  isActive: boolean;
  phone: string | null;
}

export interface DoctorCreateByAdmin {
  firstName: string,
  lastName: string,
  phone: string | null,
  email: string,
  specialty: string;
  licenseNumber: string;
  bio: string;
}