import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { useUsers, type UserListItem } from "@/contexts/UsersContext";

export default function AdminUsers() {
  const { users, meta, loading, error, refetch } = useUsers();

  const columns: ColumnDef<UserListItem>[] = useMemo(
    () => [
      {
        accessorKey: "username",
        header: "User",
        cell: ({ row }) => {
          const u = row.original;
          return (
            <div className="flex items-center gap-3">
              <img
                src={u.image}
                alt=""
                className="size-9 shrink-0 rounded-full border object-cover"
              />
              <div>
                <span className="font-medium">{u.username}</span>
                {u.roles?.length ? (
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {u.roles.map((r) => (
                      <span
                        key={r}
                        className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">{row.original.email}</span>
        ),
      },
      {
        accessorKey: "created_at",
        header: () => <div className="text-right">Joined</div>,
        cell: ({ row }) => (
          <div className="text-right text-muted-foreground text-sm">
            {row.original.created_at
              ? new Date(row.original.created_at).toLocaleDateString()
              : "—"}
          </div>
        ),
      },
    ],
    []
  );

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Users
        </h1>
        <div className="rounded-xl border border-destructive/50 bg-destructive/5 p-6 text-center">
          <p className="text-destructive font-medium">{error}</p>
          <Button variant="outline" className="mt-3" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Users
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            View all registered users.
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm ring-1 ring-border/50 p-4 sm:p-5">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
            <span>Loading users…</span>
          </div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <p className="font-medium">No users yet</p>
            <p className="mt-1 text-sm">Users will appear here when they register.</p>
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={users}
              filterColumn="username"
              filterPlaceholder="Search users..."
            />
            {meta && meta.last_page > 1 && (
              <p className="mt-4 text-center text-muted-foreground text-sm">
                Page {meta.current_page} of {meta.last_page} ({meta.total} total)
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
