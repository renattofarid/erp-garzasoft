// stores/UserStore.ts
import { create } from "zustand";
import { UserResource } from "./user.interface";
import { getUser, storeUser } from "./User.actions";
import { UserSchema } from "./User.schema";
// import { TypeUserSchema } from "./typeUser.schema";

interface UserStore {
  Users: UserResource[] | null;
  isLoading: boolean;
  error: string | null;
  isSubmitting: boolean;
  fetchUsers: () => Promise<void>;
  createUser: (data: UserSchema) => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
  Users: null,
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const users = await getUser({});
      set({ Users: users, isLoading: false });
    } catch (err: any) {
      set({
        error: err?.message || "Error al cargar usuarios",
        isLoading: false,
      });
    }
  },

  createUser: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      await storeUser(data);
    } catch (err) {
      set({ error: "Error al crear el Tipo de Usuario" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));
