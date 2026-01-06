import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CurrentUser {
    id: string
    name: string
    email: string
    phone?: string
}

interface UserStore {
    currentUser: CurrentUser | null
    setCurrentUser: (user: CurrentUser | null) => void
    clearUser: () => void
}

export const useUserStore = create<UserStore>()(
    persist(
        (set) => ({
            currentUser: null,
            setCurrentUser: (user) => set({ currentUser: user }),
            clearUser: () => set({ currentUser: null }),
        }),
        {
            name: '19-20-user',
        }
    )
)

// Bill state for the current session
interface BillState {
    currentBillId: string | null
    currentGroupCode: string | null
    setCurrentBill: (billId: string, groupCode: string) => void
    clearCurrentBill: () => void
}

export const useBillStore = create<BillState>()((set) => ({
    currentBillId: null,
    currentGroupCode: null,
    setCurrentBill: (billId, groupCode) =>
        set({ currentBillId: billId, currentGroupCode: groupCode }),
    clearCurrentBill: () =>
        set({ currentBillId: null, currentGroupCode: null }),
}))
