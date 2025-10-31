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
    consultation_type: ConsultationType;
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
