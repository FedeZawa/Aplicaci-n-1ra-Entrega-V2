export enum UserRole {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT',
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  unit?: string; // For grouping students/members
}

export interface ClassDefinition {
  id: string;
  name: string;
  description?: string;
  instructor: string;
  capacity: number;
  duration_min: number;
  image_url?: string;
  schedule_days: number[]; // 0 = Sunday, 1 = Monday...
  schedule_time: string; // "18:00"
}

export interface ClassSession {
  id: string;
  class_def_id: string;
  date: string; // ISO Date string YYYY-MM-DD
  start_time: string;
  current_bookings: number;
  definition?: ClassDefinition; // Hydrated
}

export interface Booking {
  id: string;
  user_id: string;
  class_session_id: string;
  status: 'CONFIRMED' | 'CANCELLED';
  created_at: string;
  session?: ClassSession; // Hydrated
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  created_at: string;
  is_active: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
