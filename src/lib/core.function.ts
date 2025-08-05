import { toast } from "sonner";

export const per_page = 10  ;

export const successToast = (
  body: string,
  description: string = new Date().toLocaleString()
) => {
  return toast.success(body, {
    description: description,
    action: {
      label: "Listo",
      onClick: () => toast.dismiss(),
    },
  });
};

export const errorToast = (
  body: string = "Error",
  description: string = new Date().toLocaleString()
) => {
  return toast.error(body, {
    description: description,
    action: {
      label: "Cerrar",
      onClick: () => toast.dismiss(),
    },
  });
};
