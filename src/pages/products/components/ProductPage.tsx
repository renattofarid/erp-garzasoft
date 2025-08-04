import { useState } from "react";
import TitleComponent from "@/components/TitleComponent";
import ProductActions from "./ProductActions";
import ProductTable from "./ProductTable";
import ProductOptions from "./ProductOptions";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { successToast, errorToast } from "@/lib/core.function";
import { ProductColumns } from "./ProductColumns";
import { useProducts } from "../lib/product.hook";
import { deleteProduct } from "../lib/product.actions";
import {
  ProductDescription,
  ProductIconName,
  ProductTitle,
} from "../lib/product.interface";
import ProductEditPage from "./ProductEditPage";

export default function ProductPage() {
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading, refetch } = useProducts();

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteProduct(deleteId);
      await refetch();
      successToast("Producto eliminado correctamente.");
    } catch {
      errorToast("Error al eliminar el Producto.");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <TitleComponent
          title={ProductTitle}
          subtitle={ProductDescription}
          icon={ProductIconName}
        />
        <ProductActions />
      </div>

      {/* Tabla */}
      <ProductTable
        isLoading={isLoading}
        columns={ProductColumns({ onEdit: setEditId, onDelete: setDeleteId })}
        data={data || []}
      >
        <ProductOptions search={search} setSearch={setSearch} />
      </ProductTable>

      {/* Formularios */}
      {editId !== null && (
        <ProductEditPage
          id={editId}
          open={true}
          setOpen={() => setEditId(null)}
        />
      )}

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
