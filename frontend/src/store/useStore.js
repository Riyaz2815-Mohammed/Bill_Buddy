import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useStore = create(
  persist(
    (set) => ({
      token: null,
      user: null, 
      friends: [],
      bills: [],
      transactions: [],

      setToken: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null, friends: [], bills: [], transactions: [] }),
      setUser: (user) => set({ user }),
      setFriends: (friends) => set({ friends }),
      setBills: (bills) => set({ bills }),
      setTransactions: (transactions) => set({ transactions }),
    }),
    {
      name: 'bill-buddy-storage',
    }
  )
)

export default useStore
