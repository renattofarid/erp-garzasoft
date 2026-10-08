import { api } from "@/lib/config";

export async function getPaymentNotificationSettings(): Promise<{ notification_email: string | null }> {
  const { data } = await api.get("configuracion/notificaciones-pagos");
  return data.data;
}

export async function savePaymentNotificationSettings(notification_email: string) {
  const { data } = await api.put("configuracion/notificaciones-pagos", { notification_email: notification_email || null });
  return data;
}
