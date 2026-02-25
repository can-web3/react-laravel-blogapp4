import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, MoreHorizontal, Pencil, Trash2, Tag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/ui/data-table";
import { useTags, type TagItem } from "@/contexts/TagsContext";
import { toast } from "react-toastify";

type TagRow = TagItem & { postCount: number };

export default function AdminTags() {
  const { tags, loading, error, refetch, addTag, updateTag, deleteTag } =
    useTags();
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagRow | null>(null);
  const [tagToDelete, setTagToDelete] = useState<TagRow | null>(null);
  const [formName, setFormName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const tableData: TagRow[] = tags.map((t) => ({
    ...t,
    postCount: 0,
  }));

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || submitting) return;
    setSubmitting(true);
    try {
      await addTag({ name: formName.trim() });
      setFormName("");
      setModalOpen(false);
      toast.success("Tag added.");
    } catch {
      toast.error("Failed to add tag.");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (tag: TagRow) => {
    setEditingTag(tag);
    setFormName(tag.name);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingTag(null);
    setFormName("");
  };

  const handleUpdateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTag || !formName.trim() || submitting) return;
    setSubmitting(true);
    try {
      await updateTag(editingTag.id, { name: formName.trim() });
      toast.success("Tag updated.");
      closeEditModal();
    } catch {
      toast.error("Failed to update tag.");
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteModal = (tag: TagRow) => {
    setTagToDelete(tag);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!tagToDelete || deletingId !== null) return;
    setDeletingId(tagToDelete.id);
    try {
      await deleteTag(tagToDelete.id);
      toast.success("Tag deleted.");
      setDeleteModalOpen(false);
      setTagToDelete(null);
    } catch {
      toast.error("Failed to delete tag.");
    } finally {
      setDeletingId(null);
    }
  };

  const columns: ColumnDef<TagRow>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const t = row.original;
        return (
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Tag className="size-4" />
            </span>
            <span className="font-medium">{t.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => (
        <span className="text-muted-foreground text-sm">/{row.original.slug}</span>
      ),
    },
    {
      accessorKey: "postCount",
      header: () => <div className="text-right">Posts</div>,
      cell: ({ row }) => (
        <div className="text-right text-muted-foreground text-sm">
          {row.original.postCount} post{row.original.postCount !== 1 ? "s" : ""}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const tag = row.original;
        const isDeleting = deletingId === tag.id;
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  aria-label="Open menu"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <MoreHorizontal className="size-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={() => openEditModal(tag)}
                  className="gap-2"
                >
                  <Pencil className="size-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => openDeleteModal(tag)}
                  className="gap-2 text-destructive focus:text-destructive"
                  disabled={isDeleting}
                >
                  <Trash2 className="size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Tags
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
            Tags
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Organize posts with tags. Add, edit, or remove tags.
          </p>
        </div>
        <Dialog
          open={modalOpen}
          onOpenChange={(open) => {
            setModalOpen(open);
            if (open) setFormName("");
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2" disabled={loading}>
              <Plus className="size-4" />
              Add tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add tag</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddTag} className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tag-name">Name</Label>
                <Input
                  id="tag-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. javascript"
                  required
                />
                <p className="text-muted-foreground text-xs">
                  Slug is generated automatically from the name.
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving…" : "Save tag"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit tag modal */}
        <Dialog open={editModalOpen} onOpenChange={(open) => !open && closeEditModal()}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit tag</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdateTag} className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-tag-name">Name</Label>
                <Input
                  id="edit-tag-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. javascript"
                  required
                />
                <p className="text-muted-foreground text-xs">
                  Slug is updated automatically from the name.
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Saving…" : "Save changes"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeEditModal}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete confirmation modal */}
        <Dialog
          open={deleteModalOpen}
          onOpenChange={(open) => !open && setDeleteModalOpen(false)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete tag</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground text-sm">
              Are you sure you want to delete &quot;{tagToDelete?.name}&quot;? This
              action cannot be undone.
            </p>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteModalOpen(false)}
                disabled={deletingId !== null}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={deletingId !== null}
              >
                {deletingId !== null ? "Deleting…" : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border bg-card shadow-sm ring-1 ring-border/50 p-4 sm:p-5">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
            <span>Loading tags…</span>
          </div>
        ) : tableData.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <p className="font-medium">No tags yet</p>
            <p className="mt-1 text-sm">
              Add a tag to organize your posts.
            </p>
            <Button
              className="mt-4 gap-2"
              onClick={() => setModalOpen(true)}
            >
              <Plus className="size-4" />
              Add tag
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={tableData}
            filterColumn="name"
            filterPlaceholder="Search tags..."
          />
        )}
      </div>
    </div>
  );
}
