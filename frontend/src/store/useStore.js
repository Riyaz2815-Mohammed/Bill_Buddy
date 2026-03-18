import { create } from 'zustand'
import { DUMMY_USER, DUMMY_FRIENDS, DUMMY_BILLS, DUMMY_TRANSACTIONS } from '../data/dummy'

const useStore = create((set) => ({
  user: DUMMY_USER,
  friends: DUMMY_FRIENDS,
  bills: DUMMY_BILLS,
  transactions: DUMMY_TRANSACTIONS,

  setUser: (user) => set({ user }),
  setFriends: (friends) => set({ friends }),
  setBills: (bills) => set({ bills }),
  setTransactions: (transactions) => set({ transactions }),
}))

export default useStore
