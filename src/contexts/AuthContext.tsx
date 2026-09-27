import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface StudentInfo {
  id: string;
  name: string;
  className: string;
  email: string;
  isAdmin: boolean;
}

interface StudentInfoInput {
  id: string;
  name: string;
  className: string;
  email: string;
}

interface AuthContextType {
  student: StudentInfo | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, className: string) => Promise<void>;
  signOut: () => Promise<void>;
  setStudent: (info: StudentInfoInput) => void;
  clearStudent: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [student, setStudentState] = useState<StudentInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setStudentState(null);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('name, class_name')
      .eq('id', userId)
      .single();

    if (data) {
      const isAdmin = data.name === 'Linh Khôi Vĩ';
      setStudentState({ id: userId, name: data.name, className: data.class_name, email: '', isAdmin });
    }
    setLoading(false);
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, name: string, className: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        name,
        class_name: className,
      });
      if (profileError) throw profileError;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setStudentState(null);
  };

  const setStudent = (info: Omit<StudentInfo, 'isAdmin'>) => {
    const isAdmin = info.name === 'Linh Khôi Vĩ';
    setStudentState({ ...info, isAdmin });
  };

  const clearStudent = () => {
    setStudentState(null);
  };

  return (
    <AuthContext.Provider value={{ student, loading, signIn, signUp, signOut, setStudent, clearStudent }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export const useStudent = useAuth;
export const StudentProvider = AuthProvider;
