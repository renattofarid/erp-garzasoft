"use client";

import { errorToast, successToast } from "@/lib/core.function";

import FormSkeleton from "@/components/FormSkeleton";
import NotFound from "@/components/not-found";

import { GeneralModal } from "@/components/GeneralModal";
import { useProduct, useProducts } from "../lib/product.hook";
import { useProductStore } from "../lib/product.store";
import { ProductSchema } from "../lib/product.schema";
import { ProductDescriptionEdit, ProductResource, ProductTitle } from "../lib/product.interface";
import { ProductForm } from "./ProductForm";

export default function ProductEditPage({
  id,
  open,
  setOpen,
}: {
  id: number;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  if (!id) return <NotFound />;

  const { data: Product, isFinding } = useProduct(id);
  const { refetch } = useProducts();
  const { isSubmitting, updateProduct } = useProductStore();

  const handleSubmit = async (data: ProductSchema) => {
    await updateProduct(id, data)
      .then(() => {
        setOpen(false);
        successToast("Tipo de Usuario actualizado exitosamente");
        refetch();
      })
      .catch(() => {
        errorToast("Hubo un error al actualizar el Tipo de Usuario");
      });
  };

  const mapProductToForm = (
    data: ProductResource
  ): Partial<ProductSchema> => ({
    nombre: data.nombre,
    descripcion: data.descripcion,
    modulos: data.modulos
  });

  if (!Product) return <NotFound />;

  return (
    <GeneralModal
      open={open}
      onClose={() => {
        setOpen(false);
      }}
      title={ProductTitle}
      subtitle={ProductDescriptionEdit}
      maxWidth="!max-w-(--breakpoint-lg)"
    >
      {isFinding ? (
        <FormSkeleton />
      ) : (
        <ProductForm
          defaultValues={mapProductToForm(Product)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          mode="update"
          onCancel={() => setOpen(false)}
        />
      )}
    </GeneralModal>
  );
}
