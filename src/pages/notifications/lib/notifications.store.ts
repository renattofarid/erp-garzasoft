// stores/NotificationStore.ts
import { create } from "zustand";

import { Meta } from "@/lib/pagination.interface";
import { NotificationsSchema } from "./notifications.schema.ts";
import { NotificationsResource } from "./notifications.interface.ts";
import { findNotificationsById, getNotification, storeNotifications, updateNotifications } from "./notifications.actions.ts";

interface NotificationStore {
  Notifications: NotificationsResource[] | null;
  Notification: NotificationsResource | null;
  meta: Meta | null;
  isLoading: boolean;
  isFinding: boolean;
  error: string | null;
  isSubmitting: boolean;
  fetchNotifications: (params?: Record<string, any>) => Promise<void>;
  fetchNotification: (id: number) => Promise<void>;
  createNotification: (data: NotificationsSchema) => Promise<void>;
  updateNotification: (id: number, data: NotificationsSchema) => Promise<void>;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  Notification: null,
  Notifications: null,
  meta: null,
  isLoading: false,
  isFinding: false,
  isSubmitting: false,
  error: null,

  fetchNotifications: async (params?: Record<string, any>) => {
    set({ isLoading: true, error: null });
    try {
      const { data, meta } = await getNotification({ params });
      set({ Notifications: data, meta, isLoading: false });
    } catch (err) {
      set({ error: "Error al cargar Contratos", isLoading: false });
    }
  },

  fetchNotification: async (id: number) => {
    set({ isFinding: true, error: null });
    try {
      const { data } = await findNotificationsById(id);
      set({ Notification: data, isFinding: false });
    } catch (err) {
      set({ error: "Error al cargar el Contrato", isFinding: false });
    }
  },

  createNotification: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      await storeNotifications(data);
    } catch (err) {
      set({ error: "Error al crear el Contrato" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateNotification: async (id: number, data: NotificationsSchema) => {
    set({ isSubmitting: true, error: null });
    try {
      await updateNotifications(id, data);
    } catch (err) {
      set({ error: "Error al actualizar el Contrato" });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },
}));
