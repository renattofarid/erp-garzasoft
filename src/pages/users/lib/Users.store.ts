// stores/UserStore.ts
import { create } from "zustand";
import { findUserById, getUser, storeUser, updateUser } from "./User.actions";
import { UserSchema } from "./User.schema";
import { UserResource } from "./User.interface";
import { Meta } from "@/lib/pagination.interface";
// import { TypeUserSchema } from "./typeUser.schema";

interface UserStore {
  Users: UserResource[] | null;
  User: UserResource | null;
  meta: Meta | null;

  isLoading: boolean;
  isFinding: boolean;

  error: string | null;
  isSubmitting: boolean;
  fetchUsers: (params?: Record<string, any>) => Promise<void>;
  fetchUser: (id: number) => Promise<void>;

  createUser: (data: UserSchema) => Promise<void>;
  updateUser: (id: number, data: UserSchema) => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
  Users: null,
  User: null,
  meta: null,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: null,

  fetchUsers: async (params?: Record<string, any>) => {
    set({ isLoading: true, error: null });
    try {
      const { data, meta } = await getUser({ params });
      set({ Users: data, meta: meta, isLoading: false });
    } catch (err) {
      set({ error: "Error al cargar tipos de usuarios", isLoading: false });
      console.log(err);
      
    }
  },
  fetchUser: async (id: number) => {
    set({ isFinding: true, error: null });
    try {
      const data = await findUserById(id);
      set({ User: data, isFinding: false });
    } catch (err) {
      set({ error: "Error al cargar el usuario", isFinding: false });
      console.log(err);
      
    }
  },

  createUser: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      await storeUser(data);
    } catch (err) {
      set({ error: "Error al crear el Usuario" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },
  updateUser: async (id: number, data: UserSchema) => {
    set({ isSubmitting: true, error: null });
    try {
      await updateUser(id, data);
    } catch (err) {
      set({ error: "Error al actualizar el Tipo de Usuario" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));
