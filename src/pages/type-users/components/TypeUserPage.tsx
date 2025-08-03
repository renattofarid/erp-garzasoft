"use client";

import { useState } from "react";
import { useTypeUsers } from "../lib/typeUser.hook";
import PageSkeleton from "@/components/PageSkeleton";
import TitleComponent from "@/components/TitleComponent";
import TypeUserActions from "./TypeUserActions";
import TypeUserTable from "./TypeUserTable";
import { typeUserColumns } from "./TypeUserColumns";
import TypeUserOptions from "./TypeUserOptions";
// import DataTablePagination from "@/components/DataTablePagination";
import { TypeUserIconName } from "../lib/typeUser.interface";
// import NotFound from "@/components/not-found";

export default function TypeUserPage() {
  // const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  // useEffect(() => {
  //   setPage(1);
  // }, [search]);

  const { data, isLoading } = useTypeUsers();

  // make pagination of 10 in data

  if (isLoading) return <PageSkeleton />;
  // if (!checkRouteExists("typeUsers")) notFound();
  // if (!data) NotFound();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <TitleComponent
          title={"Tipos de Usuario"}
          subtitle={"Gestiona los tipos de usuario en el sistema."}
          icon={TypeUserIconName}
        />
        <TypeUserActions />
      </div>
      <TypeUserTable
        isLoading={isLoading}
        columns={typeUserColumns}
        data={data || []}
      >
        <TypeUserOptions search={search} setSearch={setSearch} />
      </TypeUserTable>

      {/* <DataTablePagination
        page={page}
        totalPages={data?.meta?.last_page || 1}
        onPageChange={setPage}
      /> */}
    </div>
  );
}
