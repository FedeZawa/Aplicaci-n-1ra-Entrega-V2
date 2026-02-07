-- Create Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'STUDENT' CHECK (role IN ('ADMIN', 'STUDENT')),
  avatar_url TEXT,
  unit TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Class Definitions
CREATE TABLE public.classes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  instructor TEXT,
  capacity INTEGER NOT NULL DEFAULT 10,
  duration_min INTEGER NOT NULL DEFAULT 60,
  image_url TEXT,
  schedule_days INTEGER[] NOT NULL, -- Array of days [1, 3, 5]
  schedule_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage classes" ON public.classes USING (
  exists(select 1 from public.profiles where id = auth.uid() and role = 'ADMIN')
);
CREATE POLICY "Everyone can view classes" ON public.classes FOR SELECT USING (true);

-- Class Sessions (Instances of a class on a specific date)
CREATE TABLE public.class_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  class_def_id UUID REFERENCES public.classes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  UNIQUE(class_def_id, date)
);

ALTER TABLE public.class_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage sessions" ON public.class_sessions USING (
  exists(select 1 from public.profiles where id = auth.uid() and role = 'ADMIN')
);
CREATE POLICY "Everyone view sessions" ON public.class_sessions FOR SELECT USING (true);

-- Bookings
CREATE TABLE public.bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  class_session_id UUID REFERENCES public.class_sessions(id),
  status TEXT DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'CANCELLED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own bookings" ON public.bookings USING (auth.uid() = user_id);
CREATE POLICY "Admins manage all bookings" ON public.bookings USING (
  exists(select 1 from public.profiles where id = auth.uid() and role = 'ADMIN')
);

-- Announcements
CREATE TABLE public.announcements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage announcements" ON public.announcements USING (
  exists(select 1 from public.profiles where id = auth.uid() and role = 'ADMIN')
);
CREATE POLICY "Everyone view announcements" ON public.announcements FOR SELECT USING (true);
