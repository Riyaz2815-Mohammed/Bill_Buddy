import { create } from 'zustand'
import { DUMMY_USER, DUMMY_FRIENDS, DUMMY_BILLS, DUMMY_TRANSACTIONS } from '../data/dummy'

const useStore = create((set) => ({
  token: null,
  user: null, // Start null until login
  friends: [],
  bills: [],
  transactions: [],

  setToken: (token, user) => set({ token, user }), // Now receives actual DB user!
  logout: () => set({ token: null, user: null }),
  setUser: (user) => set({ user }),
  setFriends: (friends) => set({ friends }),
  setBills: (bills) => set({ bills }),
  setTransactions: (transactions) => set({ transactions }),
}))

export default useStore
