import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, hasValidFirebaseConfig } from '../services/firebase';
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  User
} from 'firebase/auth';

export interface CustomerProfile {
  uid?: string;
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  isGuest: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  customerProfile: CustomerProfile;
  setCustomerProfile: React.Dispatch<React.SetStateAction<CustomerProfile>>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  registerWithEmail: (
    name: string,
    email: string,
    pass: string,
    phone?: string,
    cpf?: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [customerProfile, setCustomerProfile] = useState<CustomerProfile>(() => {
    try {
      const saved = localStorage.getItem('bellclay_customer');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      name: '',
      email: '',
      phone: '',
      cpf: '',
      isGuest: true
    };
  });

  useEffect(() => {
    if (auth && hasValidFirebaseConfig) {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setCurrentUser(user);
        if (user) {
          setCustomerProfile((prev) => ({
            ...prev,
            uid: user.uid,
            name: user.displayName || prev.name || user.email?.split('@')[0] || 'Cliente',
            email: user.email || prev.email,
            isGuest: false
          }));
        }
      });
      return () => unsubscribe();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('bellclay_customer', JSON.stringify(customerProfile));
  }, [customerProfile]);

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    if (auth && hasValidFirebaseConfig) {
      try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const res = await signInWithPopup(auth, provider);
        if (res.user) {
          setCustomerProfile((prev) => ({
            ...prev,
            uid: res.user.uid,
            name: res.user.displayName || 'Cliente',
            email: res.user.email || '',
            isGuest: false
          }));
          return { success: true };
        }
      } catch (err: any) {
        console.error('Erro no login Google:', err);
        let errorMsg = 'Não foi possível concluir o login com o Google.';
        if (err.code === 'auth/popup-blocked') {
          errorMsg = 'O pop-up do Google foi bloqueado pelo seu navegador. Por favor, permita pop-ups para este site.';
        } else if (err.code === 'auth/popup-closed-by-user') {
          errorMsg = 'A janela do Google foi fechada antes de concluir o login.';
        } else if (err.code === 'auth/unauthorized-domain') {
          errorMsg = 'Domínio da Vercel não autorizado no Firebase. Adicione o seu domínio em Firebase Console > Authentication > Settings > Authorized Domains.';
        } else if (err.code === 'auth/operation-not-allowed' || err.code === 'auth/configuration-not-found') {
          errorMsg = 'O login com Google precisa ser ativado no Firebase Console: vá em Authentication > Sign-in method > Google e clique em Ativar.';
        } else if (err.message) {
          errorMsg = `Erro no Google: ${err.message}`;
        }
        return { success: false, error: errorMsg };
      }
    }

    // Local / offline fallback demo login
    const demoUser: CustomerProfile = {
      name: 'Cliente Bellclay',
      email: 'cliente@exemplo.com',
      phone: '(44) 99107-4932',
      cpf: '123.456.789-00',
      isGuest: false
    };
    setCustomerProfile(demoUser);
    return { success: true };
  };

  const loginWithEmail = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    if (auth && hasValidFirebaseConfig) {
      try {
        const res = await signInWithEmailAndPassword(auth, email, pass);
        if (res.user) {
          setCustomerProfile((prev) => ({
            ...prev,
            uid: res.user.uid,
            name: res.user.displayName || prev.name || email.split('@')[0],
            email: res.user.email || email,
            isGuest: false
          }));
          return { success: true };
        }
      } catch (err: any) {
        let msg = 'E-mail ou senha incorretos.';
        if (err.code === 'auth/user-not-found') msg = 'Nenhuma conta encontrada com este e-mail.';
        if (err.code === 'auth/wrong-password') msg = 'Senha incorreta.';
        if (err.code === 'auth/invalid-email') msg = 'E-mail inválido.';
        return { success: false, error: msg };
      }
    }

    // Fallback: check saved local customer
    setCustomerProfile((prev) => ({
      ...prev,
      name: prev.name || email.split('@')[0],
      email,
      isGuest: false
    }));
    return { success: true };
  };

  const registerWithEmail = async (
    name: string,
    email: string,
    pass: string,
    phone?: string,
    cpf?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (auth && hasValidFirebaseConfig) {
      try {
        const res = await createUserWithEmailAndPassword(auth, email, pass);
        if (res.user) {
          await updateProfile(res.user, { displayName: name });
          setCustomerProfile({
            uid: res.user.uid,
            name,
            email,
            phone: phone || '',
            cpf: cpf || '',
            isGuest: false
          });
          return { success: true };
        }
      } catch (err: any) {
        let msg = 'Erro ao criar conta.';
        if (err.code === 'auth/email-already-in-use') msg = 'Este e-mail já está em uso.';
        if (err.code === 'auth/weak-password') msg = 'A senha deve conter pelo menos 6 caracteres.';
        return { success: false, error: msg };
      }
    }

    // Fallback: save locally
    setCustomerProfile({
      name,
      email,
      phone: phone || '',
      cpf: cpf || '',
      isGuest: false
    });
    return { success: true };
  };

  const logout = async () => {
    if (auth && hasValidFirebaseConfig) {
      await signOut(auth);
    }
    setCurrentUser(null);
    setCustomerProfile({
      name: '',
      email: '',
      phone: '',
      cpf: '',
      isGuest: true
    });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        customerProfile,
        setCustomerProfile,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
