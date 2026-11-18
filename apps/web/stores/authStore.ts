import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, UserRole } from '@elevateos/types';

interface AuthStore {
  user: UserProfile | null;
  isAuthenticated: boolean;
  activeRole: UserRole;
  currentOrganisationId: string;
  setUser: (user: UserProfile) => void;
  switchRole: (role: UserRole) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: {
        id: 'usr-rajesh-sharma',
        email: 'admin@apexproperties.com',
        firstName: 'Rajesh',
        lastName: 'Sharma',
        role: 'ORGANISATION_ADMIN',
        organisationId: 'org-apex-01',
        buildingIds: ['bldg-apex-twr-a'],
        elevatorIds: ['elv-a-01', 'elv-a-02', 'elv-a-03', 'elv-a-04'],
        mfaEnabled: true,
      },
      isAuthenticated: true,
      activeRole: 'ORGANISATION_ADMIN',
      currentOrganisationId: 'org-apex-01',

      setUser: (user) =>
        set({
          user,
          isAuthenticated: true,
          activeRole: user.role,
          currentOrganisationId: user.organisationId || '',
        }),

      switchRole: (role) =>
        set((state) => ({
          activeRole: role,
          user: state.user ? { ...state.user, role } : null,
        })),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          activeRole: 'RESIDENT',
          currentOrganisationId: '',
        }),
    }),
    {
      name: 'elevateos-auth-storage',
    }
  )
);

