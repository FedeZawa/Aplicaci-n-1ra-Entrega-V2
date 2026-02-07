import { User, UserRole, ClassDefinition, ClassSession, Booking, Announcement } from './types';

export const MOCK_USERS: User[] = [
  {
    id: 'admin-1',
    email: 'admin@openperk.com',
    full_name: 'Admin User',
    role: UserRole.ADMIN,
    avatar_url: 'https://picsum.photos/200',
  },
  {
    id: 'student-1',
    email: 'alumno@openperk.com',
    full_name: 'Juan Pérez',
    role: UserRole.STUDENT,
    avatar_url: 'https://picsum.photos/201',
    unit: 'Unit A',
  },
  {
    id: 'student-2',
    email: 'maria@openperk.com',
    full_name: 'Maria Garcia',
    role: UserRole.STUDENT,
    avatar_url: 'https://picsum.photos/202',
    unit: 'Unit B',
  }
];

export const MOCK_CLASSES: ClassDefinition[] = [
  {
    id: 'c1',
    name: 'Morning Yoga',
    instructor: 'Sarah Jenkins',
    capacity: 15,
    duration_min: 60,
    image_url: 'https://picsum.photos/800/400?random=1',
    schedule_days: [1, 3, 5], // Mon, Wed, Fri
    schedule_time: '07:00'
  },
  {
    id: 'c2',
    name: 'HIIT Blast',
    instructor: 'Mike Tyson',
    capacity: 20,
    duration_min: 45,
    image_url: 'https://picsum.photos/800/400?random=2',
    schedule_days: [2, 4], // Tue, Thu
    schedule_time: '18:30'
  },
  {
    id: 'c3',
    name: 'Spinning',
    instructor: 'Anna Spin',
    capacity: 10,
    duration_min: 50,
    image_url: 'https://picsum.photos/800/400?random=3',
    schedule_days: [6], // Sat
    schedule_time: '10:00'
  }
];

// Generate sessions for the current month
const generateSessions = (): ClassSession[] => {
  const sessions: ClassSession[] = [];
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  MOCK_CLASSES.forEach(cls => {
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      if (cls.schedule_days.includes(date.getDay())) {
        sessions.push({
          id: `sess-${cls.id}-${d}`,
          class_def_id: cls.id,
          date: date.toISOString().split('T')[0],
          start_time: cls.schedule_time,
          current_bookings: Math.floor(Math.random() * 5),
          definition: cls
        });
      }
    }
  });
  return sessions;
};

export const MOCK_SESSIONS: ClassSession[] = generateSessions();

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'b1',
    user_id: 'student-1',
    class_session_id: MOCK_SESSIONS[0].id,
    status: 'CONFIRMED',
    created_at: new Date().toISOString(),
    session: MOCK_SESSIONS[0]
  }
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a1',
    title: 'New Equipment Arrived!',
    message: 'We have upgraded our treadmills to the latest model. Come try them out!',
    created_at: new Date().toISOString(),
    is_active: true
  },
  {
    id: 'a2',
    title: 'Holiday Hours',
    message: 'We will be closed on December 25th only.',
    created_at: new Date().toISOString(),
    is_active: true
  }
];
