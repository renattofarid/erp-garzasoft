import { Control } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Package, Trash, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ContractModuleForm from "./ContractModuleForm";
import { ProductResource } from "@/pages/products/lib/product.interface";
import { Badge } from "@/components/ui/badge";

interface ProductoModuloField {
  id: string;
  producto_id: number;
  modulo_id: number;
  precio: number;
}

interface ProductsSectionProps {
  control: Control<any>;
  fields: (ProductoModuloField & { id: string })[];
  append: (value: any) => void;
  remove: (index: number) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  products: ProductResource[];
  sum: number;
  manualSum: number;
  recalculateSum: () => void;
}

export const ProductsSection = ({
  control,
  fields,
  append,
  remove,
  open,
  setOpen,
  products,
  sum,
  manualSum,
  recalculateSum,
}: ProductsSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Productos y Módulos</h2>
            <p className="text-sm text-muted-foreground">
              Lista de productos y módulos incluidos en el contrato
            </p>
          </div>
        </div>
        <Button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full sm:w-auto"
        >
          <Package className="w-4 h-4 mr-2" />
          Agregar Producto
        </Button>
      </div>

      <ContractModuleForm
        open={open}
        onAssign={append}
        control={control}
        products={products}
        onOpenChange={() => setOpen(!open)}
        existingItems={fields} // Pasamos la lista de elementos existentes
      />

      <div className="w-full">
        {fields.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-muted rounded-lg">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground mb-2">
              No hay productos agregados
            </p>
            <p className="text-sm text-muted-foreground">
              Agrega al menos un producto para continuar
            </p>
          </div>
        )}

        {fields.length > 0 && (
          <div className="rounded-lg overflow-hidden border">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-hidden">
              <Table>
                <TableHeader className="bg-modal">
                  <TableRow className="hover:!bg-modal">
                    <TableHead className=" w-16 text-center">#</TableHead>
                    <TableHead className="">Producto</TableHead>
                    <TableHead className="">Módulo</TableHead>
                    <TableHead className=" w-32 text-center">
                      Precio (S/.)
                    </TableHead>
                    <TableHead className=" w-16 text-center">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((row, index) => (
                    <TableRow
                      key={row.id}
                      className="bg-background hover:bg-muted/50"
                    >
                      <TableCell className="text-center">
                        <Badge>{index + 1}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {
                          products?.find((p) => p.id === row.producto_id)
                            ?.nombre
                        }
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {
                          products
                            ?.find((p) => p.id === row.producto_id)
                            ?.modulos.find((m) => m.id === row.modulo_id)
                            ?.nombre
                        }
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={control}
                          name={`productos_modulos.${index}.precio`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  variant={"default"}
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  value={field.value ?? ""}
                                  className="text-right h-7 w-24 shadow"
                                  onChange={(e) => {
                                    const newValue =
                                      e.target.value === ""
                                        ? 0
                                        : Number(e.target.value);
                                    field.onChange(newValue);
                                    setTimeout(() => recalculateSum(), 0);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y">
              {fields.map((row, index) => (
                <div key={row.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full bg-primary/10 text-primary">
                      {index + 1}
                    </span>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => remove(index)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Producto</p>
                      <p className="font-medium text-sm">
                        {
                          products?.find((p) => p.id === row.producto_id)
                            ?.nombre
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">Módulo</p>
                      <p className="text-sm">
                        {
                          products
                            ?.find((p) => p.id === row.producto_id)
                            ?.modulos.find((m) => m.id === row.modulo_id)
                            ?.nombre
                        }
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Precio (S/.)
                      </p>
                      <FormField
                        control={control}
                        name={`productos_modulos.${index}.precio`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={field.value ?? ""}
                                className="text-right"
                                onChange={(e) => {
                                  const newValue =
                                    e.target.value === ""
                                      ? 0
                                      : Number(e.target.value);
                                  field.onChange(newValue);
                                  setTimeout(() => recalculateSum(), 0);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="bg-modal border-t p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
                <span className="text-muted-foreground">
                  {fields.length} producto{fields.length !== 1 ? "s" : ""}{" "}
                  agregado{fields.length !== 1 ? "s" : ""}
                </span>
                <div className="font-semibold">
                  Subtotal: S/. {(manualSum || sum).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
