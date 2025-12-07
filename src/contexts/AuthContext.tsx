import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface SignUpData {
  fullName: string;
  cpf: string;
  phone: string;
  address: string;
  preferredVoice: string;
  joinDate: string;
  hasStole: boolean;
  hasVestment: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, data: SignUpData) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Configurar listener PRIMEIRO
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Atualizar perfil após signup se necessário
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(() => {
            updateProfileFromMetadata(session.user);
          }, 0);
        }
      }
    );

    // DEPOIS verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateProfileFromMetadata = async (authUser: User) => {
    const metadata = authUser.user_metadata;
    if (!metadata?.full_name) return;

    try {
      await supabase.from('profiles').update({
        full_name: metadata.full_name,
        display_name: metadata.display_name || metadata.full_name?.split(' ')[0],
        cpf: metadata.cpf,
        phone: metadata.phone,
        address: metadata.address,
        preferred_voice: metadata.preferred_voice,
        join_date: metadata.join_date,
        has_stole: metadata.has_stole,
        has_vestment: metadata.has_vestment,
        email: authUser.email,
      }).eq('id', authUser.id);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const signUp = async (email: string, password: string, data: SignUpData) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: data.fullName.split(' ')[0],
          full_name: data.fullName,
          cpf: data.cpf,
          phone: data.phone,
          address: data.address,
          preferred_voice: data.preferredVoice,
          join_date: data.joinDate,
          has_stole: data.hasStole,
          has_vestment: data.hasVestment,
        }
      }
    });
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
