import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Tenant, AppUser } from '../types';
import { api } from '../services/api';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  tenants: Tenant[];
  currentTenant: Tenant | null;
  setCurrentTenant: (tenant: Tenant) => void;
  currentUser: AppUser;
  setCurrentUser: (user: AppUser) => void;
  users: AppUser[];
  activeView: string;
  setActiveView: (view: string) => void;
  publicTenantSlug: string | null;
  setPublicTenantSlug: (slug: string | null) => void;
  loading: boolean;
  refreshTenants: () => Promise<void>;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [currentUser, setCurrentUser] = useState<AppUser>({
    id: 'user-grooming-admin',
    tenantId: 'tenant-grooming-01',
    name: 'Valentina Gómez (Admin)',
    email: 'valentina@huellitasgrooming.com',
    role: 'tenant_admin'
  });
  const [activeView, setActiveView] = useState<string>('overview');
  const [publicTenantSlug, setPublicTenantSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [fetchedTenants, fetchedUsers] = await Promise.all([
        api.getTenants(),
        api.getUsers()
      ]);
      setTenants(fetchedTenants);
      setUsers(fetchedUsers);

      if (fetchedTenants.length > 0 && !currentTenant) {
        // Default to first tenant or the one matching currentUser
        const matched = currentUser.tenantId
          ? fetchedTenants.find((t) => t.id === currentUser.tenantId)
          : fetchedTenants[0];
        setCurrentTenant(matched || fetchedTenants[0]);
      }
    } catch (err: any) {
      console.error('Failed to load initial data:', err);
      showToast('Error cargando empresas y usuarios', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update currentTenant if currentUser changes to a specific tenant
  const handleSetCurrentUser = (user: AppUser) => {
    setCurrentUser(user);
    if (user.tenantId) {
      const match = tenants.find((t) => t.id === user.tenantId);
      if (match) setCurrentTenant(match);
    }
  };

  return (
    <AppContext.Provider
      value={{
        tenants,
        currentTenant,
        setCurrentTenant,
        currentUser,
        setCurrentUser: handleSetCurrentUser,
        users,
        activeView,
        setActiveView,
        publicTenantSlug,
        setPublicTenantSlug,
        loading,
        refreshTenants: loadData,
        toasts,
        showToast,
        removeToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
