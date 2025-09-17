"use client";

import { useState, useEffect } from "react";
import { Control, useWatch } from "react-hook-form";
import { FormSelect } from "@/components/FormSelect";
import { GeneralModal } from "@/components/GeneralModal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import type { ProductResource } from "@/pages/products/lib/product.interface";

interface ProductoModuloField {
  id: string;
  producto_id: number;
  modulo_id: number;
  precio: number;
}

interface Props {
  control: Control<any>;
  products: ProductResource[];
  onAssign: (values: any) => void;
  open: boolean;
  onOpenChange: () => void;
  // Agregamos la lista de productos/módulos ya agregados
  existingItems?: ProductoModuloField[];
}

export default function ContractModuleForm({
  onAssign,
  products,
  control,
  open,
  onOpenChange,
  existingItems = [],
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

  // Función para verificar si un módulo ya está agregado
  const isModuleAlreadyAdded = (productoId: number, moduloId: number) => {
    return existingItems.some(
      (item) => item.producto_id === productoId && item.modulo_id === moduloId
    );
  };

  // Obtener módulos disponibles (no agregados)
  const availableModules =
    selectedProduct?.modulos.filter(
      (modulo) => !isModuleAlreadyAdded(selectedProduct.id, modulo.id)
    ) || [];

  // Obtener módulos ya agregados para este producto
  const alreadyAddedModules =
    selectedProduct?.modulos.filter((modulo) =>
      isModuleAlreadyAdded(selectedProduct.id, modulo.id)
    ) || [];

  const handleToggleModule = (moduloId: number) => {
    // Solo permitir seleccionar módulos disponibles
    if (
      selectedProduct &&
      !isModuleAlreadyAdded(selectedProduct.id, moduloId)
    ) {
      setSelectedModules((prev) =>
        prev.includes(moduloId)
          ? prev.filter((id) => id !== moduloId)
          : [...prev, moduloId]
      );
    }
  };

  const handleToggleAll = () => {
    if (!selectedProduct || availableModules.length === 0) return;

    if (selectAll) {
      setSelectedModules([]);
      setSelectAll(false);
    } else {
      setSelectedModules(availableModules.map((m) => m.id));
      setSelectAll(true);
    }
  };

  // Actualizar el estado de "Seleccionar todos" cuando cambian las selecciones
  useEffect(() => {
    if (availableModules.length > 0) {
      const allAvailableSelected = availableModules.every((m) =>
        selectedModules.includes(m.id)
      );
      setSelectAll(allAvailableSelected);
    }
  }, [selectedModules, availableModules]);

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

    // Limpiar selecciones después de guardar
    setSelectedModules([]);
    setSelectAll(false);
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
        <div className="space-y-4 mt-4">
          {/* Módulos ya agregados */}
          {alreadyAddedModules.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">
                Módulos ya agregados:
              </h4>
              <div className="space-y-2">
                {alreadyAddedModules.map((modulo) => (
                  <div
                    key={`added-${modulo.id}`}
                    className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md"
                  >
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-800">
                      {modulo.nombre}
                    </span>
                    <Badge variant="secondary" className="ml-auto text-xs">
                      S/. {modulo.precio_unitario.toFixed(2)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Módulos disponibles */}
          {availableModules.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-sm">
                Módulos disponibles para agregar:
              </h4>

              <div
                className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted/50 rounded-md"
                onClick={handleToggleAll}
              >
                <Checkbox
                  checked={selectAll && availableModules.length > 0}
                  onCheckedChange={handleToggleAll}
                  disabled={availableModules.length === 0}
                />
                <span className="font-medium">
                  Seleccionar todos ({availableModules.length} disponibles)
                </span>
              </div>

              {availableModules.map((modulo) => (
                <div
                  key={`available-${modulo.id}`}
                  className="flex items-center gap-2 cursor-pointer p-2 hover:bg-muted/50 rounded-md"
                  onClick={() => handleToggleModule(modulo.id)}
                >
                  <Checkbox
                    checked={selectedModules.includes(modulo.id)}
                    onCheckedChange={() => handleToggleModule(modulo.id)}
                  />
                  <span className="flex-1">{modulo.nombre}</span>
                  <Badge variant="outline">
                    S/. {modulo.precio_unitario.toFixed(2)}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {/* Mensaje cuando no hay módulos disponibles */}
          {availableModules.length === 0 &&
            selectedProduct.modulos.length > 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                <p className="font-medium">
                  Todos los módulos ya están agregados
                </p>
                <p className="text-sm">
                  Este producto no tiene módulos disponibles para agregar.
                </p>
              </div>
            )}

          {/* Mensaje cuando el producto no tiene módulos */}
          {selectedProduct.modulos.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <p className="font-medium">
                Este producto no tiene módulos configurados
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onOpenChange}>
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={() => {
            onSave();
            onOpenChange();
          }}
          disabled={!selectedModules.length}
        >
          Asignar {selectedModules.length} Módulo
          {selectedModules.length !== 1 ? "s" : ""}
        </Button>
      </div>
    </GeneralModal>
  );
}
