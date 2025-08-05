import { errorToast, successToast } from "@/lib/core.function";
import { GeneralModal } from "@/components/GeneralModal";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useProductStore } from "../lib/product.store";
import { useProducts } from "../lib/product.hook";
import { ProductSchema } from "../lib/product.schema";
import { ProductDescriptionAdd, ProductTitle } from "../lib/product.interface";
import { ProductForm } from "./ProductForm";
import { Plus } from "lucide-react";

export default function ProductAddPage() {
  const [open, setOpen] = useState(false);
  const { isSubmitting, createProduct } = useProductStore();
  const { refetch } = useProducts();

  const handleSubmit = async (data: ProductSchema) => {
    await createProduct(data)
      .then(() => {
        setOpen(false);
        successToast("Producto creado exitosamente");
        refetch();
      })
      .catch(() => {
        errorToast("Hubo un error al crear el Producto");
      });
  };

  return (
    <>
      <Button size="sm" className="ml-auto !px-10" onClick={() => setOpen(true)}>
        <Plus className="size-4 mr-2" />
        Agregar
      </Button>
      <GeneralModal
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        title={ProductTitle}
        subtitle={ProductDescriptionAdd}
        maxWidth="!max-w-(--breakpoint-lg)"
      >
        <ProductForm
          defaultValues={{ nombre: "" }}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode="create"
          onCancel={() => setOpen(false)}
        />
      </GeneralModal>
    </>
  );
}
