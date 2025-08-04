"use client";

import { useState } from "react";
import PageSkeleton from "@/components/PageSkeleton";
import TitleComponent from "@/components/TitleComponent";

import { UserDescription, UserIconName, UserTitle } from "../lib/user.interface";
import UserOptions from "./UserOptions";
import UserTable from "./UserTable";
import { UserColumns } from "./UserColumns";
import UserActions from "./UserActions";
import { useUsers } from "../lib/User.hook";
// import DataTablePagination from "@/components/DataTablePagination";
// import NotFound from "@/components/not-found";

export default function UserPage() {
  // const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  // useEffect(() => {
  //   setPage(1);
  // }, [search]);

  const { data, isLoading } = useUsers();

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
        columns={UserColumns}
        data={data || []}
      >
        <UserOptions search={search} setSearch={setSearch} />
      </UserTable>

      {/* <DataTablePagination
        page={page}
        totalPages={data?.meta?.last_page || 1}
        onPageChange={setPage}
      /> */}
    </div>
  );
}
