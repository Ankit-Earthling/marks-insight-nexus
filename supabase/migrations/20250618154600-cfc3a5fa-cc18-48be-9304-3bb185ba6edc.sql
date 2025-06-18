
-- Create enum for subjects
CREATE TYPE subject_name AS ENUM ('DSA', 'ADA', 'DBMS', 'JAVA', 'OS');

-- Create students table
CREATE TABLE public.students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usn VARCHAR(20) UNIQUE NOT NULL,
    dob DATE NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create marks table
CREATE TABLE public.marks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    subject subject_name NOT NULL,
    marks INTEGER NOT NULL CHECK (marks >= 0 AND marks <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(student_id, subject)
);

-- Create admins table for admin authentication
CREATE TABLE public.admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert a default admin (password: admin123)
INSERT INTO public.admins (username, email, password_hash) 
VALUES ('admin', 'admin@bmsitm.edu', '$2b$10$rQZ8qGHEkQm1VqJ9Cm4pBOKJ.Xz6XvYzK8hV3tDz9KJ7Q2M5N8WzS');

-- Enable Row Level Security
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Create policies for students table (public read access for now)
CREATE POLICY "Allow public read access to students" ON public.students
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to students" ON public.students
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to students" ON public.students
    FOR UPDATE USING (true);

-- Create policies for marks table (public access for now)
CREATE POLICY "Allow public read access to marks" ON public.marks
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to marks" ON public.marks
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to marks" ON public.marks
    FOR UPDATE USING (true);

-- Create policies for admins table (public read access for authentication)
CREATE POLICY "Allow public read access to admins" ON public.admins
    FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX idx_students_usn ON public.students(usn);
CREATE INDEX idx_marks_student_id ON public.marks(student_id);
CREATE INDEX idx_marks_subject ON public.marks(subject);
CREATE INDEX idx_admins_username ON public.admins(username);
