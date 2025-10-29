export type AppointmentStatus = "confirmado" | "cancelado" | "completado";
export type ConsultationType = "virtual" | "presencial";

export interface Appointment {
    id: number;
    availability_id: number;
    doctor_id: number;
    patient_id: number;
    day: string; // YYYY-MM-DD
    start_time: string; // HH:MM:SS
    end_time: string; // HH:MM:SS
    consultation_type: ConsultationType;
    status: AppointmentStatus;
}

export interface AppointmentCreate {
    availability_id: number;
    doctor_id: number;
    patient_id: number;
    day: string;
    start_time: string;
    end_time: string;
    consultation_type: "virtual" | "presencial";
}

export interface AppointmentFilter {
    status?: AppointmentStatus;
    page?: number;
    limit?: number;
}

export interface PaginatedAppointments {
    data: Appointment[];
    total: number;
    page: number;
    limit: number;
}

export interface TimeSlot {
    start_time: string;
    end_time: string;
}

export interface AppointmentResponse {
    id: number;
    availability_id: number;
    doctor_id: number;
    patient_id: number | null; // Puede ser nulo si la cita es un bloqueo o no está asignada
    day: string;              // Formato DATE (YYYY-MM-DD)
    start_time: string;       // Formato TIME (HH:MM:SS)
    end_time: string;         // Formato TIME (HH:MM:SS)
    status: AppointmentStatus;
    consultation_type: ConsultationType;
    created_at: Date;
    updated_at: Date;
}

export interface AppointmentDetailResponse extends AppointmentResponse {
    doctorFirstName: string;
    doctorLastName: string;
    patientFirstName: string | null;
    patientLastName: string | null;
    specialityName: string;
}