import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type CaseStatus = 'Active' | 'Closed' | 'Archived';

export interface Room {
    id: string;
    name: string;
    photos: number; // Count of photos
    status: 'In Progress' | 'Done' | 'Empty';
}

export interface RentalCase {
    id: string;
    name: string;
    address: string;
    createdAt: string;
    status: CaseStatus;

    // Contract Data
    contractAnalysis?: {
        summary: string;
        rent?: string;
        deposit?: string;
        noticePeriod?: string;
        issues?: string[];
    };

    // Check-in Data
    rooms: Room[];
}

interface AppState {
    cases: RentalCase[];
    apiKey: string | null;
    addCase: (newCase: RentalCase) => void;
    updateCase: (id: string, updates: Partial<RentalCase>) => void;
    setApiKey: (key: string) => void;
    getCase: (id: string) => RentalCase | undefined;
}

export const useCaseStore = create<AppState>()(
    persist(
        (set, get) => ({
            cases: [],
            apiKey: null,

            addCase: (newCase) => set((state) => ({ cases: [newCase, ...state.cases] })),

            updateCase: (id, updates) => set((state) => ({
                cases: state.cases.map((c) => (c.id === id ? { ...c, ...updates } : c)),
            })),

            setApiKey: (key) => set({ apiKey: key }),

            getCase: (id) => get().cases.find((c) => c.id === id),
        }),
        {
            name: 'guard-rent-storage', // name of the item in the storage (must be unique)
            storage: createJSONStorage(() => localStorage),
        }
    )
);
