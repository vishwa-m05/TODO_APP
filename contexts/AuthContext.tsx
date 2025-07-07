import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { Auth, getAuth } from 'firebase/auth';
import { TodoService } from '../services/todoService';

interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const unsubscribe = onAuthStateChanged(auth, () => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setLoading(false);

        if (user) {
          // Initialize offline storage and sync
          const todoService = TodoService.getInstance();
          todoService.initializeOfflineStorage();
          todoService.syncWithFirebase(user.uid);
        }
      });

      return unsubscribe;
    },
    
  );

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  return useContext(AuthContext);
};
