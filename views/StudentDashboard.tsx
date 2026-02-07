import React, { useState, useMemo } from 'react';
import { MOCK_CLASSES, MOCK_ANNOUNCEMENTS, MOCK_BOOKINGS } from '../mockData';
import { ClassSession, User, Booking } from '../types';
import { Button, Card, Modal, Input } from '../components/UI';
import { useToast } from '../context/ToastContext';

// --- Student Calendar with Dynamic Generation ---
const StudentCalendar = ({ userId }: { userId: string }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSession, setSelectedSession] = useState<ClassSession | null>(null);
  const [bookings, setBookings] = useState<string[]>([]); // Array of session IDs
  const { addToast } = useToast();

  const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
  const startDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();

  // Dynamic Session Generation logic (Same as Admin but read-only)
  const sessions = useMemo(() => {
    const generated: ClassSession[] = [];
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day);
        const dayOfWeek = currentDate.getDay();
        const dateString = currentDate.toISOString().split('T')[0];

        MOCK_CLASSES.forEach(cls => {
            if (cls.schedule_days.includes(dayOfWeek)) {
                generated.push({
                    id: `sess-${cls.id}-${dateString}`,
                    class_def_id: cls.id,
                    date: dateString,
                    start_time: cls.schedule_time,
                    current_bookings: Math.floor(Math.random() * 5), // Random occupancy
                    definition: cls
                });
            }
        });
    }
    return generated;
  }, [selectedDate]);

  const getSessionsForDay = (day: number) => {
    const dateStr = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day).toISOString().split('T')[0];
    return sessions.filter(s => s.date === dateStr);
  };

  const handleBook = () => {
    if(!selectedSession) return;
    if(bookings.includes(selectedSession.id)) {
        setBookings(bookings.filter(id => id !== selectedSession.id));
        addToast('info', 'Booking cancelled');
    } else {
        setBookings([...bookings, selectedSession.id]);
        addToast('success', 'Class booked successfully!');
    }
    setSelectedSession(null);
  };

  const isBooked = selectedSession && bookings.includes(selectedSession.id);

  return (
    <div className="space-y-4 pb-20">
      {/* Announcements Header */}
      {MOCK_ANNOUNCEMENTS.filter(a => a.is_active).map(a => (
        <div key={a.id} className="bg-primary-500/10 border border-primary-500/20 p-4 rounded-xl flex items-start gap-3">
          <i className="fas fa-bell text-primary-500 mt-1"></i>
          <div>
            <h4 className="font-bold text-primary-500 text-sm">{a.title}</h4>
            <p className="text-slate-300 text-sm">{a.message}</p>
          </div>
        </div>
      ))}

      <div className="flex justify-between items-center py-2">
        <h2 className="text-2xl font-bold text-white">Book Class</h2>
        <div className="flex gap-2">
            <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))} className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700"><i className="fas fa-chevron-left"></i></button>
            <span className="text-white font-medium self-center">
                {selectedDate.toLocaleString('default', { month: 'short', year: 'numeric' })}
            </span>
            <button onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))} className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700"><i className="fas fa-chevron-right"></i></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 md:gap-3">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <div key={i} className="text-center text-xs font-bold text-slate-500 py-2">{d}</div>
        ))}
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const daySessions = getSessionsForDay(day);
          const isToday = new Date().getDate() === day && new Date().getMonth() === selectedDate.getMonth();
          
          return (
            <div key={day} className="flex flex-col gap-1 min-h-[60px] md:min-h-[100px]">
                <div className={`text-center py-1 text-sm font-medium rounded-full ${isToday ? 'bg-primary-500 text-white' : 'text-slate-300'}`}>
                    {day}
                </div>
                <div className="flex flex-col gap-1">
                    {daySessions.map(s => (
                        <button 
                            key={s.id}
                            onClick={() => setSelectedSession(s)}
                            className={`text-[10px] md:text-xs text-left px-2 py-1 rounded truncate transition-all
                                ${bookings.includes(s.id) ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}
                            `}
                        >
                            {s.start_time.slice(0, 5)} {s.definition?.name}
                        </button>
                    ))}
                </div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={!!selectedSession} onClose={() => setSelectedSession(null)} title="Confirm Booking">
         {selectedSession && (
             <div className="space-y-6 text-center">
                 <div className="w-full h-32 rounded-xl overflow-hidden mb-4">
                     <img src={selectedSession.definition?.image_url} className="w-full h-full object-cover" />
                 </div>
                 <div>
                     <h3 className="text-2xl font-bold text-white mb-1">{selectedSession.definition?.name}</h3>
                     <p className="text-primary-500 font-medium">{selectedSession.definition?.instructor}</p>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4 text-sm">
                     <div className="bg-slate-950 p-3 rounded border border-slate-800">
                         <span className="block text-slate-500 text-xs uppercase mb-1">Time</span>
                         <span className="text-white font-mono">{selectedSession.start_time}</span>
                     </div>
                     <div className="bg-slate-950 p-3 rounded border border-slate-800">
                         <span className="block text-slate-500 text-xs uppercase mb-1">Spots</span>
                         <span className="text-white">{selectedSession.definition?.capacity! - selectedSession.current_bookings} left</span>
                     </div>
                 </div>

                 <Button 
                    variant={isBooked ? 'danger' : 'primary'} 
                    className="w-full py-3 text-lg"
                    onClick={handleBook}
                 >
                     {isBooked ? 'Cancel Booking' : 'Confirm Spot'}
                 </Button>
             </div>
         )}
      </Modal>
    </div>
  );
};

// --- Student History Component ---
const StudentHistory = ({ userId }: { userId: string }) => {
    // Mocking a history list based on MOCK_BOOKINGS and some generated past data
    const history = [
        ...MOCK_BOOKINGS.filter(b => b.user_id === userId),
        // Add fake past booking
        {
            id: 'past-1',
            user_id: userId,
            class_session_id: 'old-1',
            status: 'CONFIRMED' as const,
            created_at: '2023-01-01',
            session: {
                id: 'old-1',
                class_def_id: 'c1',
                date: '2023-10-15',
                start_time: '09:00',
                current_bookings: 10,
                definition: MOCK_CLASSES[0]
            }
        }
    ];

    return (
        <div className="space-y-6 max-w-2xl mx-auto pt-4">
            <h2 className="text-2xl font-bold text-white mb-6">Class History</h2>
            <div className="space-y-4">
                {history.length > 0 ? history.map((booking) => (
                    <Card key={booking.id} className="flex flex-col md:flex-row gap-4 items-center">
                        <img 
                            src={booking.session?.definition?.image_url} 
                            className="w-full md:w-24 h-24 rounded-lg object-cover"
                            alt="Class"
                        />
                        <div className="flex-1 w-full text-center md:text-left">
                            <h3 className="font-bold text-lg text-white">{booking.session?.definition?.name}</h3>
                            <p className="text-slate-400 text-sm">{booking.session?.definition?.instructor}</p>
                            <div className="flex items-center justify-center md:justify-start gap-3 mt-2 text-sm">
                                <span className="bg-slate-900 px-2 py-1 rounded text-slate-300">
                                    <i className="fas fa-calendar-alt mr-2 text-primary-500"></i>
                                    {booking.session?.date}
                                </span>
                                <span className="bg-slate-900 px-2 py-1 rounded text-slate-300">
                                    <i className="fas fa-clock mr-2 text-primary-500"></i>
                                    {booking.session?.start_time}
                                </span>
                            </div>
                        </div>
                        <div className="w-full md:w-auto">
                            <span className={`block w-full text-center px-4 py-2 rounded-lg text-sm font-bold border ${
                                booking.status === 'CONFIRMED' 
                                ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                                : 'bg-red-500/10 text-red-500 border-red-500/20'
                            }`}>
                                {booking.status}
                            </span>
                        </div>
                    </Card>
                )) : (
                    <div className="text-center py-10 text-slate-500">
                        <i className="fas fa-history text-4xl mb-4 opacity-50"></i>
                        <p>No class history found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Student Profile Component ---
const StudentProfile = ({ user, onUpdate }: { user: User, onUpdate: (u: User) => void }) => {
    const [isEditing, setIsEditing] = useState(false);
    const { addToast } = useToast();

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        
        const updatedUser = {
            ...user,
            full_name: formData.get('full_name') as string,
            email: formData.get('email') as string,
            unit: formData.get('unit') as string,
        };

        onUpdate(updatedUser);
        addToast('success', 'Profile updated successfully');
        setIsEditing(false);
    };

    return (
        <div className="space-y-6 max-w-lg mx-auto pt-10">
            <div className="text-center relative">
                <div className="w-24 h-24 mx-auto rounded-full p-1 bg-gradient-to-tr from-primary-500 to-slate-800">
                    <img src={user.avatar_url} className="w-full h-full rounded-full bg-slate-900 border-4 border-slate-900 object-cover" />
                </div>
                <h2 className="text-2xl font-bold text-white mt-4">{user.full_name}</h2>
                <span className="inline-block px-3 py-1 bg-slate-800 rounded-full text-xs text-primary-500 mt-2 font-medium tracking-wide">STUDENT MEMBER</span>
            </div>

            <Card className="space-y-4">
                <h3 className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-4 border-b border-slate-700 pb-2">Personal Information</h3>
                
                <div className="grid gap-1">
                    <label className="text-slate-500 text-xs">Email Address</label>
                    <p className="text-white font-medium">{user.email}</p>
                </div>
                
                <div className="grid gap-1">
                    <label className="text-slate-500 text-xs">Unit / Group</label>
                    <p className="text-white font-medium">{user.unit || 'General'}</p>
                </div>

                <div className="grid gap-1">
                    <label className="text-slate-500 text-xs">Password</label>
                    <p className="text-white font-medium">••••••••••••</p>
                </div>
            </Card>

            <Button variant="secondary" className="w-full" onClick={() => setIsEditing(true)}>
                Edit Profile
            </Button>

            <Modal isOpen={isEditing} onClose={() => setIsEditing(false)} title="Edit Profile">
                <form onSubmit={handleSaveProfile} className="space-y-4">
                    <Input label="Full Name" name="full_name" defaultValue={user.full_name} required />
                    <Input label="Email" name="email" defaultValue={user.email} required />
                    <Input label="Unit" name="unit" defaultValue={user.unit} />
                    <div className="pt-4 flex gap-3">
                        <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsEditing(false)}>Cancel</Button>
                        <Button type="submit" className="flex-1">Save Changes</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

const StudentDashboard: React.FC<{ user: User; onLogout: () => void; onUpdateUser: (u: User) => void }> = ({ user, onLogout, onUpdateUser }) => {
  const [view, setView] = useState<'calendar' | 'profile' | 'history'>('calendar');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-20 md:pb-0">
      <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-4 flex justify-between items-center md:hidden">
          <div className="font-bold text-lg tracking-tight">OpenPerk</div>
          <img src={user.avatar_url} onClick={() => setView('profile')} className="w-8 h-8 rounded-full border border-slate-700" />
      </header>

      <div className="max-w-4xl mx-auto p-4 md:p-8">
          {view === 'calendar' && <StudentCalendar userId={user.id} />}
          {view === 'history' && <StudentHistory userId={user.id} />}
          {view === 'profile' && <StudentProfile user={user} onUpdate={onUpdateUser} />}
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 w-full bg-slate-900 border-t border-slate-800 flex justify-around p-2 pb-safe z-50 md:hidden">
        <button onClick={() => setView('calendar')} className={`flex flex-col items-center p-2 rounded-lg gap-1 transition-all ${view === 'calendar' ? 'text-primary-500' : 'text-slate-500'}`}>
          <i className="fas fa-calendar-alt text-xl"></i>
          <span className="text-[10px] font-medium">Book</span>
        </button>
        <button onClick={() => setView('history')} className={`flex flex-col items-center p-2 rounded-lg gap-1 transition-all ${view === 'history' ? 'text-primary-500' : 'text-slate-500'}`}>
          <i className="fas fa-history text-xl"></i>
          <span className="text-[10px] font-medium">History</span>
        </button>
        <button onClick={() => setView('profile')} className={`flex flex-col items-center p-2 rounded-lg gap-1 transition-all ${view === 'profile' ? 'text-primary-500' : 'text-slate-500'}`}>
          <i className="fas fa-user text-xl"></i>
          <span className="text-[10px] font-medium">Profile</span>
        </button>
        <button onClick={onLogout} className="flex flex-col items-center p-2 rounded-lg gap-1 text-slate-500">
          <i className="fas fa-sign-out-alt text-xl"></i>
          <span className="text-[10px] font-medium">Logout</span>
        </button>
      </nav>

      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed top-0 left-0 h-full w-20 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-6">
          <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center mb-8">
            <i className="fas fa-dumbbell text-white text-lg"></i>
          </div>
          <div className="space-y-4 flex-1 w-full px-2">
            <button onClick={() => setView('calendar')} className={`w-full p-3 rounded-lg flex justify-center transition-all ${view === 'calendar' ? 'bg-slate-800 text-primary-500' : 'text-slate-500 hover:text-white'}`} title="Book Class">
                <i className="fas fa-calendar-alt text-xl"></i>
            </button>
            <button onClick={() => setView('history')} className={`w-full p-3 rounded-lg flex justify-center transition-all ${view === 'history' ? 'bg-slate-800 text-primary-500' : 'text-slate-500 hover:text-white'}`} title="History">
                <i className="fas fa-history text-xl"></i>
            </button>
            <button onClick={() => setView('profile')} className={`w-full p-3 rounded-lg flex justify-center transition-all ${view === 'profile' ? 'bg-slate-800 text-primary-500' : 'text-slate-500 hover:text-white'}`} title="Profile">
                <i className="fas fa-user text-xl"></i>
            </button>
          </div>
          <button onClick={onLogout} className="text-slate-500 hover:text-red-500 p-3" title="Logout">
             <i className="fas fa-sign-out-alt text-xl"></i>
          </button>
      </div>
      <div className="hidden md:block fixed top-4 right-8">
          <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{user.full_name}</span>
              <img src={user.avatar_url} className="w-9 h-9 rounded-full border border-slate-700" />
          </div>
      </div>
    </div>
  );
};

export default StudentDashboard;