import { create } from "zustand";

interface UserState {
  email: string | null;
  wallet: string | null;
  username: string | null;
  profile_image: string | null;
  isAuthenticated: boolean;
  setUser: (
    email: string,
    wallet: string,
    username?: string | null,
    profile_image?: string | null
  ) => void;
  clearUser: () => void;
}

export const useUser = create<UserState>((set) => ({
  email: null,
  wallet: null,
  username: null,
  profile_image: null,
  isAuthenticated: false,
  setUser(email, wallet, username = null, profile_image = null) {
    set({ email, wallet, username, profile_image, isAuthenticated: true });
  },
  clearUser() {
    set({
      email: null,
      wallet: null,
      username: null,
      profile_image: null,
      isAuthenticated: false,
    });
  },
}));
