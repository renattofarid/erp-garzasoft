import { api } from "@/lib/config";

export async function submitManualPayment(cuotaId: number, data: { fecha_pago: string; monto_pagado: number; comprobante: File }) {
  const formData = new FormData();
  formData.append("fecha_pago", data.fecha_pago);
  formData.append("monto_pagado", String(data.monto_pagado));
  formData.append("comprobante", data.comprobante);
  const { data: response } = await api.post(`cuotas/${cuotaId}/pago-manual`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response;
}

export async function resendManualPaymentNotification(cuotaId: number) {
  const { data } = await api.post(`cuotas/${cuotaId}/pago-manual/reenviar-aviso`);
  return data;
}
