import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface StudentInfo {
  name: string;
  className: string;
}

interface StudentContextType {
  student: StudentInfo | null;
  loading: boolean;
  setStudent: (info: StudentInfo) => void;
  clearStudent: () => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export function StudentProvider({ children }: { children: ReactNode }) {
  const [student, setStudentState] = useState<StudentInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('studentInfo');
    if (saved) {
      try {
        setStudentState(JSON.parse(saved));
      } catch {
        localStorage.removeItem('studentInfo');
      }
    }
    setLoading(false);
  }, []);

  const setStudent = (info: StudentInfo) => {
    localStorage.setItem('studentInfo', JSON.stringify(info));
    setStudentState(info);
  };

  const clearStudent = () => {
    localStorage.removeItem('studentInfo');
    setStudentState(null);
  };

  return (
    <StudentContext.Provider value={{ student, loading, setStudent, clearStudent }}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  const context = useContext(StudentContext);
  if (!context) throw new Error('useStudent must be used within StudentProvider');
  return context;
}