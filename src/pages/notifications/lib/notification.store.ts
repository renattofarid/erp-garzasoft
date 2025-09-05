// stores/notificationStore.ts
import { create } from "zustand";
import { NotificationResource } from "./notification.interface";
import { Meta } from "@/lib/pagination.interface";
import { NotificationSchema } from "./notification.schema";
import {
  findNotificationById,
  getNotification,
  storeNotification,
  updateNotification,
} from "./notification.actions";

interface notificationStore {
  notifications: NotificationResource[] | null;
  notification: NotificationResource | null;
  meta: Meta | null;
  isLoading: boolean;
  isFinding: boolean;
  error: string | null;
  isSubmitting: boolean;
  fetchnotifications: (params?: Record<string, any>) => Promise<void>;
  fetchnotification: (id: number) => Promise<void>;
  createnotification: (data: NotificationSchema) => Promise<void>;
  updatenotification: (id: number, data: NotificationSchema) => Promise<void>;
}

export const usenotificationStore = create<notificationStore>((set) => ({
  notification: null,
  notifications: null,
  meta: null,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: null,

  fetchnotifications: async (params?: Record<string, any>) => {
    set({ isLoading: true, error: null });
    try {
      const { data, meta } = await getNotification({ params });
      set({ notifications: data, meta, isLoading: false });
    } catch (err) {
      set({ error: "Error al cargar tipos de usuarios", isLoading: false });
    }
  },

  fetchnotification: async (id: number) => {
    set({ isFinding: true, error: null });
    try {
      const { data } = await findNotificationById(id);
      set({ notification: data, isFinding: false });
    } catch (err) {
      set({ error: "Error al cargar el notificationo", isFinding: false });
    }
  },

  createnotification: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      await storeNotification(data);
    } catch (err) {
      set({ error: "Error al crear el notificationo" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updatenotification: async (id: number, data: NotificationSchema) => {
    set({ isSubmitting: true, error: null });
    try {
      await updateNotification(id, data);
    } catch (err) {
      set({ error: "Error al actualizar el notificationo" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));
