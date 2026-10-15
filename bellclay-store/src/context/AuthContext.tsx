import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, hasValidFirebaseConfig } from '../services/firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';

interface CustomerProfile {
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
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
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
          setCustomerProfile(prev => ({
            ...prev,
            uid: user.uid,
            name: user.displayName || prev.name,
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

  const loginWithGoogle = async () => {
    if (auth && hasValidFirebaseConfig) {
      try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        setIsAuthModalOpen(false);
      } catch (err) {
        console.error('Erro no login Google:', err);
      }
    } else {
      // Demo login
      const demoUser = {
        name: 'Cliente Bellclay',
        email: 'cliente@exemplo.com',
        phone: '(44) 99888-7766',
        cpf: '123.456.789-00',
        isGuest: false
      };
      setCustomerProfile(demoUser);
      setIsAuthModalOpen(false);
    }
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
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen
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
