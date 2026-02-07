import React, { useState, useEffect, useRef } from 'react';
import { MOCK_CLASSES, MOCK_USERS, MOCK_BOOKINGS } from '../mockData';
import { ClassDefinition, ClassSession, User, UserRole } from '../types';
import { Button, Input, Card, Modal } from '../components/UI';
import { useToast } from '../context/ToastContext';

// --- Sub-components for Admin Views ---

const AdminClasses = ({ classes, setClasses }: { classes: ClassDefinition[], setClasses: React.Dispatch<React.SetStateAction<ClassDefinition[]>> }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassDefinition | null>(null);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  useEffect(() => {
    if (editingClass) {
        setImagePreview(editingClass.image_url || '');
    } else {
        setImagePreview('');
    }
  }, [editingClass]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    if (selectedDays.length === 0) {
      addToast('error', 'Please select at least one day for the schedule.');
      return;
    }

    // Use the preview (base64) as the image_url
    const finalImageUrl = imagePreview || `https://picsum.photos/800/400?random=${Math.floor(Math.random() * 100)}`;

    const newClass: ClassDefinition = {
      id: editingClass ? editingClass.id : Math.random().toString(36),
      name: formData.get('name') as string,
      instructor: formData.get('instructor') as string,
      capacity: Number(formData.get('capacity')),
      duration_min: Number(formData.get('duration')),
      schedule_time: formData.get('time') as string,
      schedule_days: selectedDays, 
      image_url: finalImageUrl,
    };

    if (editingClass) {
      setClasses(classes.map(c => c.id === c.id ? newClass : c));
      addToast('success', 'Class updated successfully');
    } else {
      setClasses([...classes, newClass]);
      addToast('success', 'Class created successfully');
    }
    setIsModalOpen(false);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  const toggleDay = (dayIndex: number) => {
    if (selectedDays.includes(dayIndex)) {
      setSelectedDays(selectedDays.filter(d => d !== dayIndex));
    } else {
      setSelectedDays([...selectedDays, dayIndex].sort());
    }
  };

  const openNewClassModal = () => {
    setEditingClass(null);
    setSelectedDays([]);
    setImagePreview('');
    setIsModalOpen(true);
  };

  const openEditClassModal = (cls: ClassDefinition) => {
    setEditingClass(cls);
    setSelectedDays(cls.schedule_days);
    setImagePreview(cls.image_url || '');
    setIsModalOpen(true);
  };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Class Management</h2>
        <Button onClick={openNewClassModal}>
          <i className="fas fa-plus"></i> New Class
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map(cls => (
          <Card key={cls.id} className="group hover:border-primary-500/50 transition-colors">
            <div className="relative h-40 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-xl">
              <img src={cls.image_url} alt={cls.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-2 right-2 bg-slate-900/80 px-2 py-1 rounded text-xs text-white">
                {cls.duration_min} min
              </div>
            </div>
            <h3 className="text-xl font-bold text-white">{cls.name}</h3>
            <p className="text-slate-400 text-sm mb-4">{cls.instructor} • Cap: {cls.capacity}</p>
            <div className="flex justify-between items-center text-sm text-slate-500">
              <div className="flex flex-col">
                <span className="text-white font-medium">{cls.schedule_time}</span>
                <span className="text-[10px] uppercase text-slate-500">
                  {cls.schedule_days.map(d => days[d].slice(0,3)).join(', ')}
                </span>
              </div>
              <div className="space-x-2">
                <button onClick={() => openEditClassModal(cls)} className="text-primary-500 hover:text-primary-400">Edit</button>
                <button 
                    onClick={() => {
                        setClasses(classes.filter(c => c.id !== cls.id));
                        addToast('info', 'Class definition deleted');
                    }} 
                    className="text-red-500 hover:text-red-400"
                >
                    Delete
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingClass ? "Edit Class" : "Create New Class"}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Class Name" name="name" defaultValue={editingClass?.name} required />
          <Input label="Instructor" name="instructor" defaultValue={editingClass?.instructor} required />
          
          {/* Image Upload Area */}
          <div className="space-y-1.5">
             <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Class Image</label>
             <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageFileChange} 
                accept="image/*" 
                className="hidden" 
             />
             <div 
                onClick={() => fileInputRef.current?.click()}
                className="relative w-full h-32 bg-slate-800 border-2 border-slate-700 border-dashed rounded-lg cursor-pointer hover:border-primary-500 hover:bg-slate-750 transition-all flex items-center justify-center overflow-hidden"
             >
                {imagePreview ? (
                    <>
                        <img src={imagePreview} className="w-full h-full object-cover opacity-60" alt="Preview" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="bg-slate-900/80 px-3 py-1 rounded text-xs text-white font-medium backdrop-blur-sm">Change Image</span>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center text-slate-400">
                        <i className="fas fa-image text-2xl mb-2"></i>
                        <span className="text-xs">Click to upload image</span>
                    </div>
                )}
             </div>
             {/* Hidden input to store current value for form submission/logic if needed, though we use state */}
             <input type="hidden" name="image_url" value={imagePreview} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input label="Capacity" name="capacity" type="number" defaultValue={editingClass?.capacity || 10} required />
            <Input label="Duration (min)" name="duration" type="number" defaultValue={editingClass?.duration_min || 60} required />
          </div>
          
          <div className="flex flex-col gap-1.5 w-full">
             <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Schedule Days</label>
             <div className="grid grid-cols-7 gap-1">
               {days.map((day, index) => (
                 <button
                   key={day}
                   type="button"
                   onClick={() => toggleDay(index)}
                   className={`py-2 rounded text-[10px] md:text-xs font-bold transition-all border ${
                     selectedDays.includes(index) 
                     ? 'bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/20' 
                     : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white'
                   }`}
                 >
                   {day.slice(0, 1)}
                 </button>
               ))}
             </div>
             <p className="text-[10px] text-slate-500 mt-1 h-4">
               {selectedDays.length > 0 
                 ? selectedDays.map(d => days[d]).join(', ') 
                 : 'No days selected'}
             </p>
          </div>

          <Input label="Default Time" name="time" type="time" defaultValue={editingClass?.schedule_time || "10:00"} required />
          <div className="pt-4">
             <Button type="submit" className="w-full">Save Class</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const AdminStudents = () => {
  const [users, setUsers] = useState(MOCK_USERS.filter(u => u.role === UserRole.STUDENT));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.trim().split('\n');
      // Simple CSV parser assuming: Name,Unit,Email
      const newUsers: User[] = lines.map((line, i) => {
        const [name, unit, email] = line.split(',').map(s => s.trim());
        if (!name || !email) return null;
        return {
          id: `imported-${Date.now()}-${i}`,
          full_name: name,
          unit: unit || 'General',
          email: email,
          role: UserRole.STUDENT,
          avatar_url: `https://ui-avatars.com/api/?name=${name}&background=random`
        };
      }).filter(Boolean) as User[];

      setUsers(prev => [...prev, ...newUsers]);
      addToast('success', `Imported ${newUsers.length} students from CSV`);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleIndividualRegister = (e: React.FormEvent) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);

      const newUser: User = {
          id: `student-${Date.now()}`,
          full_name: formData.get('full_name') as string,
          email: formData.get('email') as string,
          unit: formData.get('unit') as string,
          role: UserRole.STUDENT,
          avatar_url: `https://ui-avatars.com/api/?name=${formData.get('full_name')}&background=random`
      };

      setUsers([...users, newUser]);
      addToast('success', 'Student registered successfully');
      setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Student Management</h2>
        <Button onClick={() => setIsModalOpen(true)}>
             <i className="fas fa-user-plus"></i> New Student
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
           <div className="overflow-x-auto">
             <table className="w-full text-left text-sm text-slate-300">
               <thead className="text-xs uppercase bg-slate-900/50 text-slate-400">
                 <tr>
                   <th className="p-3">Student</th>
                   <th className="p-3">Unit</th>
                   <th className="p-3">Email</th>
                   <th className="p-3">Action</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-700">
                 {users.map(u => (
                   <tr key={u.id} className="hover:bg-slate-800/30">
                     <td className="p-3 flex items-center gap-3">
                       <img src={u.avatar_url} className="w-8 h-8 rounded-full" />
                       <span className="font-medium text-white">{u.full_name}</span>
                     </td>
                     <td className="p-3">{u.unit || '-'}</td>
                     <td className="p-3">{u.email}</td>
                     <td className="p-3">
                       <button 
                            className="text-red-400 hover:text-red-300" 
                            onClick={() => {
                                setUsers(users.filter(user => user.id !== u.id));
                                addToast('info', 'User removed');
                            }}
                        >
                            <i className="fas fa-trash"></i>
                       </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </Card>

        <Card>
          <h3 className="font-bold text-white mb-4">Bulk Import</h3>
          <p className="text-xs text-slate-400 mb-4">Upload a .csv file with columns: Name, Unit, Email</p>
          
          <div className="relative">
              <input 
                type="file" 
                ref={fileInputRef}
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-upload"
              />
              <label 
                htmlFor="csv-upload" 
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-700 border-dashed rounded-lg cursor-pointer bg-slate-900 hover:bg-slate-800 hover:border-primary-500 transition-all"
              >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <i className="fas fa-cloud-upload-alt text-2xl text-slate-400 mb-2"></i>
                      <p className="text-xs text-slate-400">Click to upload CSV</p>
                  </div>
              </label>
          </div>
          
          <div className="mt-4 p-3 bg-slate-900 rounded text-[10px] text-slate-500 font-mono">
              Example content:<br/>
              John Doe, Unit 101, john@gmail.com<br/>
              Jane Smith, Unit 202, jane@gmail.com
          </div>
        </Card>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Student">
          <form onSubmit={handleIndividualRegister} className="space-y-4">
              <Input label="Full Name" name="full_name" required placeholder="Ex. Juan Perez" />
              <Input label="Email Address" name="email" type="email" required placeholder="juan@example.com" />
              <Input label="Unit / Group (Optional)" name="unit" placeholder="Ex. Morning Crew" />
              <div className="pt-2">
                  <Button type="submit" className="w-full">Register Student</Button>
              </div>
          </form>
      </Modal>
    </div>
  );
};

const AdminCalendar = ({ classes }: { classes: ClassDefinition[] }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSession, setSelectedSession] = useState<ClassSession | null>(null);
  const [cancelledSessionIds, setCancelledSessionIds] = useState<string[]>([]);
  const { addToast } = useToast();

  const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
  const startDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay();

  // Dynamic Session Generation based on Classes and Selected Month
  const generateSessionsForMonth = () => {
      const generatedSessions: ClassSession[] = [];
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();

      for (let day = 1; day <= daysInMonth; day++) {
          const currentDate = new Date(year, month, day);
          const dayOfWeek = currentDate.getDay();
          const dateString = currentDate.toISOString().split('T')[0];

          classes.forEach(cls => {
              // If class is scheduled for this day of week
              if (cls.schedule_days.includes(dayOfWeek)) {
                  const sessionId = `sess-${cls.id}-${dateString}`;
                  
                  // Skip if cancelled
                  if (cancelledSessionIds.includes(sessionId)) return;

                  generatedSessions.push({
                      id: sessionId,
                      class_def_id: cls.id,
                      date: dateString,
                      start_time: cls.schedule_time,
                      current_bookings: 0, // Mock data, ideally would come from DB
                      definition: cls
                  });
              }
          });
      }
      return generatedSessions;
  };

  const sessions = generateSessionsForMonth();

  const getSessionsForDay = (day: number) => {
    const dateStr = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day).toISOString().split('T')[0];
    return sessions.filter(s => s.date === dateStr);
  };

  const handleCancelSession = () => {
      if (!selectedSession) return;
      
      setCancelledSessionIds(prev => [...prev, selectedSession.id]);
      addToast('success', 'Class cancelled. Announcement sent to students.');
      // Here you would functionally trigger the announcement creation
      setSelectedSession(null);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Schedule</h2>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))}>
            <i className="fas fa-chevron-left"></i>
          </Button>
          <span className="bg-slate-800 px-4 py-2 rounded-lg text-white font-medium min-w-[140px] text-center border border-slate-700">
            {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <Button variant="secondary" onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))}>
            <i className="fas fa-chevron-right"></i>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-700 rounded-xl overflow-hidden border border-slate-700 flex-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="bg-slate-900 p-3 text-center text-xs font-bold text-slate-400 uppercase">{d}</div>
        ))}
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-slate-900/50 min-h-[100px]" />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const daySessions = getSessionsForDay(day);
          const isToday = new Date().getDate() === day && new Date().getMonth() === selectedDate.getMonth();
          
          return (
            <div key={day} className={`bg-slate-900 p-2 min-h-[100px] border-t border-slate-800 relative hover:bg-slate-800/50 transition-colors cursor-pointer group`}>
              <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-primary-500 text-white' : 'text-slate-400'}`}>{day}</span>
              <div className="space-y-1">
                {daySessions.map(s => (
                   <div key={s.id} onClick={() => setSelectedSession(s)} className="text-[10px] bg-slate-800 border border-slate-700 text-slate-200 px-1.5 py-1 rounded truncate hover:border-primary-500 hover:text-primary-500 transition-colors">
                     {s.start_time.slice(0,5)} {s.definition?.name}
                   </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selectedSession && (
        <Modal isOpen={!!selectedSession} onClose={() => setSelectedSession(null)} title="Class Details">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <img src={selectedSession.definition?.image_url} className="w-20 h-20 rounded-lg object-cover" />
              <div>
                <h3 className="text-xl font-bold text-white">{selectedSession.definition?.name}</h3>
                <p className="text-slate-400">{selectedSession.date} at {selectedSession.start_time}</p>
              </div>
            </div>
            
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
               <h4 className="text-sm font-bold text-slate-300 uppercase mb-2">Registered Students ({selectedSession.current_bookings}/{selectedSession.definition?.capacity})</h4>
               <ul className="space-y-2">
                 {/* Mocking attendees based on bookings */}
                 {MOCK_BOOKINGS.filter(b => b.class_session_id === selectedSession.id).length > 0 ? (
                    MOCK_BOOKINGS.filter(b => b.class_session_id === selectedSession.id).map(b => (
                      <li key={b.id} className="flex items-center justify-between text-sm text-slate-400">
                        <span>{MOCK_USERS.find(u => u.id === b.user_id)?.full_name}</span>
                        <span className="text-green-500 text-xs">Confirmed</span>
                      </li>
                    ))
                 ) : (
                   <p className="text-slate-600 italic text-sm">No bookings yet.</p>
                 )}
               </ul>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="secondary" className="flex-1" onClick={() => setSelectedSession(null)}>Close</Button>
              <Button variant="danger" className="flex-1" onClick={handleCancelSession}>Cancel This Session</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

const AdminDashboard: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
  const [view, setView] = useState<'calendar' | 'classes' | 'students'>('calendar');
  // Lifted state to share between tabs (esp. for dynamic calendar generation based on updated class defs)
  const [classes, setClasses] = useState<ClassDefinition[]>(MOCK_CLASSES);

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 hidden md:flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <i className="fas fa-dumbbell text-white"></i>
          </div>
          <span className="font-bold text-xl text-white tracking-tight">OpenPerk</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setView('calendar')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${view === 'calendar' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <i className="fas fa-calendar-alt w-5"></i> Calendar
          </button>
          <button onClick={() => setView('classes')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${view === 'classes' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <i className="fas fa-layer-group w-5"></i> Classes
          </button>
          <button onClick={() => setView('students')} className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${view === 'students' ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <i className="fas fa-users w-5"></i> Students
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-2 mb-4">
             <img src={user.avatar_url} className="w-10 h-10 rounded-full bg-slate-700" />
             <div className="flex-1 min-w-0">
               <p className="text-sm font-medium text-white truncate">{user.full_name}</p>
               <p className="text-xs text-slate-500 truncate">Administrator</p>
             </div>
          </div>
          <button onClick={onLogout} className="w-full text-left px-2 py-2 text-sm text-red-400 hover:text-red-300 flex items-center gap-2">
            <i className="fas fa-sign-out-alt"></i> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 overflow-y-auto">
        {view === 'calendar' && <AdminCalendar classes={classes} />}
        {view === 'classes' && <AdminClasses classes={classes} setClasses={setClasses} />}
        {view === 'students' && <AdminStudents />}
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 w-full bg-slate-900 border-t border-slate-800 flex justify-around p-3 z-50 pb-safe">
        <button onClick={() => setView('calendar')} className={`flex flex-col items-center gap-1 ${view === 'calendar' ? 'text-primary-500' : 'text-slate-500'}`}>
          <i className="fas fa-calendar-alt text-lg"></i>
        </button>
        <button onClick={() => setView('classes')} className={`flex flex-col items-center gap-1 ${view === 'classes' ? 'text-primary-500' : 'text-slate-500'}`}>
          <i className="fas fa-layer-group text-lg"></i>
        </button>
        <button onClick={() => setView('students')} className={`flex flex-col items-center gap-1 ${view === 'students' ? 'text-primary-500' : 'text-slate-500'}`}>
          <i className="fas fa-users text-lg"></i>
        </button>
        <button onClick={onLogout} className="flex flex-col items-center gap-1 text-slate-500">
          <i className="fas fa-sign-out-alt text-lg"></i>
        </button>
      </nav>
    </div>
  );
};

export default AdminDashboard;