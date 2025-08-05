"use client";

import { useState } from "react";
import PageSkeleton from "@/components/PageSkeleton";
import TitleComponent from "@/components/TitleComponent";

import {
  UserDescription,
  UserIconName,
  UserTitle,
} from "../lib/User.interface";
import UserOptions from "./UserOptions";
import UserTable from "./UserTable";
import { UserColumns } from "./UserColumns";
import UserActions from "./UserActions";
import { useUsers } from "../lib/User.hook";
import UserEditPage from "./UserEditPage";
import { SimpleDeleteDialog } from "@/components/SimpleDeleteDialog";
import { deleteUser } from "../lib/User.actions";
import { errorToast, successToast } from "@/lib/core.function";
// import DataTablePagination from "@/components/DataTablePagination";
// import NotFound from "@/components/not-found";

export default function UserPage() {
  // const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // useEffect(() => {
  //   setPage(1);
  // }, [search]);

  const { data, isLoading, refetch } = useUsers();

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteUser(deleteId);
      await refetch();
      successToast("Tipo de Usuario eliminado correctamente.");
    } catch {
      errorToast("Error al eliminar el Tipo de Usuario.");
    } finally {
      setDeleteId(null);
    }
  };

  // make pagination of 10 in data

  if (isLoading) return <PageSkeleton />;
  // if (!checkRouteExists("Users")) notFound();
  // if (!data) NotFound();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <TitleComponent
          title={UserTitle}
          subtitle={UserDescription}
          icon={UserIconName}
        />
        <UserActions />
      </div>
      <UserTable
        isLoading={isLoading}
        columns={UserColumns({ onEdit: setEditId, onDelete: setDeleteId })}
        data={data || []}
      >
        <UserOptions search={search} setSearch={setSearch} />
      </UserTable>

      {/* Formularios */}
      {editId !== null && (
        <UserEditPage id={editId} open={true} setOpen={() => setEditId(null)} />
      )}

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {/* <DataTablePagination
        page={page}
        totalPages={data?.meta?.last_page || 1}
        onPageChange={setPage}
      /> */}
    </div>
  );
}
