"use client";

import { errorToast, successToast } from "@/lib/core.function";

import FormSkeleton from "@/components/FormSkeleton";
import NotFound from "@/components/not-found";

import { GeneralModal } from "@/components/GeneralModal";
import {
  NotificationsDescription,
  NotificationsTitle,
} from "../lib/notification.interface";
import { NotificationSchema } from "../lib/notification.schema";
import { NotificationForm } from "./NotificacionForm";
import { useNotifications } from "../lib/notification.hook";
import { useNotificationStore } from "../lib/notification.store";
import { useContract } from "@/pages/contract/lib/contract.hook";

export default function NotificationModal({
  id,
  open,
  setOpen,
}: {
  id: number;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  if (!id) return <NotFound />;

  const { data: contract, isFinding } = useContract(id);
  const { refetch } = useNotifications();
  const { isSubmitting, createnotification } = useNotificationStore();

  const handleSubmit = async (data: NotificationSchema) => {
    await createnotification(data)
      .then(() => {
        setOpen(false);
        successToast("Notificación creada con éxito");
        refetch();
      })
      .catch(() => {
        errorToast("Hubo un error al crear la Notificación");
      });
  };

  return (
    <GeneralModal
      open={open}
      onClose={() => {
        setOpen(false);
      }}
      title={NotificationsTitle}
      subtitle={NotificationsDescription}
      maxWidth="!max-w-(--breakpoint-md)"
    >
      {isFinding || !contract ? (
        <FormSkeleton />
      ) : (
        <NotificationForm
          defaultValues={{
            contrato_id: contract?.id.toString(),
            detalle: "",
          }}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onCancel={() => setOpen(false)}
          contract={contract!}
        />
      )}
    </GeneralModal>
  );
}
