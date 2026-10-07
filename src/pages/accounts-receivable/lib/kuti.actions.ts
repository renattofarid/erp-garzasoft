import { api } from "@/lib/config";

export interface KutiCheckoutResponse {
  checkout_url: string;
  payment_intent_id: string;
  amount: string;
}

export async function createKutiCheckout(cuotaId: number) {
  const { data } = await api.post<{ data: KutiCheckoutResponse }>(
    `cuotas/${cuotaId}/kuti-checkout`
  );
  return data.data;
}

export async function confirmKutiPayment(cuotaId: number, paymentIntentId: string) {
  await api.post(`cuotas/${cuotaId}/kuti-confirm`, { payment_intent_id: paymentIntentId });
}

export async function createKutiSubscription(contractId: number) {
  const { data } = await api.post<{ data: { subscription_id: string; status: string; checkout_url?: string | null; message: string } }>(
    `contratos/${contractId}/kuti-subscription`
  );
  return data.data;
}
