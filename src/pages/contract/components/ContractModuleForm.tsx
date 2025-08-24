"use client";

import { useState, useEffect } from "react";
import { Control, useWatch } from "react-hook-form";
import { FormSelect } from "@/components/FormSelect";
import { GeneralModal } from "@/components/GeneralModal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { ProductResource } from "@/pages/products/lib/product.interface";

interface Props {
  control: Control<any>;
  products: ProductResource[];
  onAssign: (values: any) => void;
  open: boolean;
  onOpenChange: () => void;
}

export default function ContractModuleForm({
  onAssign,
  products,
  control,
  open,
  onOpenChange,
}: Props) {
  const productId = useWatch({ control, name: "productos_modulos.product_id" });

  const [selectedModules, setSelectedModules] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const selectedProduct = products.find(
    (product) => String(product.id) === String(productId)
  );

  // Reset cuando cambia el producto
  useEffect(() => {
    setSelectedModules([]);
    setSelectAll(false);
  }, [productId]);

  const handleToggleModule = (moduloId: number) => {
    setSelectedModules((prev) =>
      prev.includes(moduloId)
        ? prev.filter((id) => id !== moduloId)
        : [...prev, moduloId]
    );
  };

  const handleToggleAll = () => {
    if (!selectedProduct) return;
    if (selectAll) {
      setSelectedModules([]);
      setSelectAll(false);
    } else {
      setSelectedModules(selectedProduct.modulos.map((m) => m.id));
      setSelectAll(true);
    }
  };

  const onSave = () => {
    if (!selectedProduct) return;

    const modulosSeleccionados = selectedProduct.modulos.filter((m) =>
      selectedModules.includes(m.id)
    );

    modulosSeleccionados.forEach((modulo) => {
      onAssign({
        producto_id: selectedProduct.id,
        modulo_id: modulo.id,
        precio: modulo.precio_unitario,
      });
    });
  };

  return (
    <GeneralModal
      open={open}
      onClose={onOpenChange}
      title="Agregar Módulos del Producto"
    >
      <FormSelect
        control={control}
        label="Producto"
        name="productos_modulos.product_id"
        options={products.map((product) => ({
          label: product.nombre,
          value: String(product.id),
        }))}
        placeholder="Selecciona un producto"
      />

      {selectedProduct && (
        <div className="space-y-3 mt-4">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={handleToggleAll}
          >
            <Checkbox checked={selectAll} onCheckedChange={handleToggleAll} />
            <span className="font-medium">Seleccionar todos</span>
          </div>

          {selectedProduct.modulos.map((modulo) => (
            <div
              key={modulo.id}
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => handleToggleModule(modulo.id)}
            >
              <Checkbox
                checked={selectedModules.includes(modulo.id)}
                onCheckedChange={() => handleToggleModule(modulo.id)}
              />
              <span>
                {modulo.nombre} — S/ {modulo.precio_unitario.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <Button
          type="button"
          onClick={() => {
            onSave();
            onOpenChange();
          }}
          disabled={!selectedModules.length}
        >
          Asignar Módulos
        </Button>
      </div>
    </GeneralModal>
  );
}
