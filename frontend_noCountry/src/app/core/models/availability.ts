export type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";

export interface Availability {
    id: number;
    doctor_id: number;
    day_of_week: DayOfWeek;
    start_time: string; // Format: HH:MM:SS
    end_time: string;   // Format: HH:MM:SS
    rest_start_time: string;
    rest_end_time: string;
    period_time: number;
}

export interface AvailabilityCreate {
    doctor_id: number;
    day_of_week: DayOfWeek;
    start_time: string;
    end_time: string;
    rest_start_time: string;
    rest_end_time: string;
    period_time: number;
}

export interface TimeSlotsByDay {
    [day: string]: string[];
}
