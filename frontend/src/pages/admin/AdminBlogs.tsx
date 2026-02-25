import { useState, useMemo, useEffect } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  FileText,
  Loader2,
} from "lucide-react";
import { Formik, type FormikProps } from "formik";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  useBlogs,
  type BlogItem,
  type BlogParams,
} from "@/contexts/BlogsContext";
import { useCategories } from "@/contexts/CategoriesContext";
import { useTags } from "@/contexts/TagsContext";
import { toast } from "react-toastify";

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "scheduled", label: "Scheduled" },
  { value: "archived", label: "Archived" },
];

/** Storage URL bazen port içermez (örn. http://localhost/storage/...); API base ile düzeltir. */
function featuredImageSrc(url: string | null | undefined): string {
  if (!url) return "";
  const apiBase = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
  if (!apiBase) return url;
  if (url.startsWith("/")) return `${apiBase}${url}`;
  try {
    const u = new URL(url);
    if (u.hostname === "localhost" && !u.port && apiBase.startsWith("http")) {
      const base = new URL(apiBase);
      return `${base.origin}${u.pathname}${u.search}`;
    }
  } catch {
    // ignore
  }
  return url;
}

export interface BlogFormValues {
  title: string;
  excerpt: string;
  body: string;
  category_id: number | "";
  tag_ids: number[];
  featured_image: string;
  featured_image_file: File | null;
  status: string;
  published_at: string;
}

const initialFormValues: BlogFormValues = {
  title: "",
  excerpt: "",
  body: "",
  category_id: "",
  tag_ids: [],
  featured_image: "",
  featured_image_file: null,
  status: "draft",
  published_at: "",
};

function blogToFormValues(blog: BlogItem): BlogFormValues {
  return {
    title: blog.title,
    excerpt: blog.excerpt ?? "",
    body: blog.body,
    category_id: blog.category_id ?? "",
    tag_ids: blog.tags?.map((t) => t.id) ?? [],
    featured_image: blog.featured_image ?? "",
    featured_image_file: null,
    status: blog.status,
    published_at: blog.published_at ?? "",
  };
}

function formValuesToParams(values: BlogFormValues): BlogParams {
  return {
    title: values.title,
    excerpt: values.excerpt || undefined,
    body: values.body,
    category_id: values.category_id === "" ? null : values.category_id,
    tag_ids: values.tag_ids,
    featured_image: values.featured_image || undefined,
    featured_image_file: values.featured_image_file ?? undefined,
    status: values.status,
    published_at: values.published_at || undefined,
  };
}

/** Laravel errors (string[]) -> Formik errors (string) */
function apiErrorsToFormik(errors: Record<string, string[]>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(errors).map(([k, v]) => [k, Array.isArray(v) ? v.join(" ") : String(v)])
  );
}

export default function AdminBlogs() {
  const { blogs, meta, loading, error, refetch, addBlog, updateBlog, deleteBlog } =
    useBlogs();
  const { categories } = useCategories();
  const { tags } = useTags();

  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogItem | null>(null);
  const [blogToDelete, setBlogToDelete] = useState<BlogItem | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const openEditModal = (blog: BlogItem) => {
    setEditingBlog(blog);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingBlog(null);
  };

  const openDeleteModal = (blog: BlogItem) => {
    setBlogToDelete(blog);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!blogToDelete || deletingId !== null) return;
    setDeletingId(blogToDelete.id);
    try {
      await deleteBlog(blogToDelete.slug);
      toast.success("Blog deleted.");
      setDeleteModalOpen(false);
      setBlogToDelete(null);
    } catch {
      toast.error("Failed to delete blog.");
    } finally {
      setDeletingId(null);
    }
  };

  const columns: ColumnDef<BlogItem>[] = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => {
          const b = row.original;
          return (
            <div className="flex items-center gap-3 max-w-[320px]">
              {b.featured_image ? (
                <img
                  src={featuredImageSrc(b.featured_image)}
                  alt=""
                  className="size-10 shrink-0 rounded-lg border object-cover"
                />
              ) : (
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileText className="size-4" />
                </span>
              )}
              <span className="font-medium truncate" title={b.title}>
                {b.title}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {row.original.category?.name ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "user",
        header: "Author",
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {row.original.user?.username ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
              row.original.status === "published"
                ? "bg-green-500/15 text-green-700 dark:text-green-400"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {row.original.status}
          </span>
        ),
      },
      {
        accessorKey: "published_at",
        header: () => <div className="text-right">Published</div>,
        cell: ({ row }) => (
          <div className="text-right text-muted-foreground text-sm">
            {row.original.published_at
              ? new Date(row.original.published_at).toLocaleDateString()
              : "—"}
          </div>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const blog = row.original;
          const isDeleting = deletingId === blog.id;
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
                    onSelect={() => openEditModal(blog)}
                    className="gap-2"
                  >
                    <Pencil className="size-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => openDeleteModal(blog)}
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
    ],
    [deletingId]
  );

  const renderFormFields = (formik: FormikProps<BlogFormValues>) => {
    const { values, errors, touched, handleChange, handleBlur, setFieldValue } = formik;
    const showError = (field: keyof BlogFormValues) => {
      const e = errors[field];
      if (!e) return null;
      return (
        <p className="text-destructive text-sm" role="alert">
          {e}
        </p>
      );
    };

    const toggleTag = (tagId: number) => {
      const next = values.tag_ids.includes(tagId)
        ? values.tag_ids.filter((id) => id !== tagId)
        : [...values.tag_ids, tagId];
      setFieldValue("tag_ids", next);
    };

    return (
      <>
        <div className="space-y-2">
          <Label htmlFor="blog-title">Title *</Label>
          <Input
            id="blog-title"
            name="title"
            value={values.title}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Blog title"
            required
            aria-invalid={!!(touched.title && errors.title)}
          />
          {showError("title")}
        </div>
        <div className="space-y-2">
          <Label htmlFor="blog-excerpt">Excerpt</Label>
          <Textarea
            id="blog-excerpt"
            name="excerpt"
            value={values.excerpt}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Short summary"
            rows={2}
            aria-invalid={!!(touched.excerpt && errors.excerpt)}
          />
          {showError("excerpt")}
        </div>
        <div className="space-y-2">
          <Label htmlFor="blog-body">Body *</Label>
          <Textarea
            id="blog-body"
            name="body"
            value={values.body}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Content..."
            rows={6}
            required
            aria-invalid={!!(touched.body && errors.body)}
          />
          {showError("body")}
        </div>
        <div className="space-y-2">
          <Label htmlFor="blog-category">Category</Label>
          <select
            id="blog-category"
            name="category_id"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive"
            value={values.category_id === "" ? "" : values.category_id}
            onChange={(e) =>
              setFieldValue("category_id", e.target.value ? Number(e.target.value) : "")
            }
            onBlur={handleBlur}
            aria-invalid={!!(touched.category_id && errors.category_id)}
          >
            <option value="">None</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {showError("category_id")}
        </div>
        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2 rounded-md border border-input p-3">
            {tags.length === 0 ? (
              <span className="text-muted-foreground text-sm">No tags yet.</span>
            ) : (
              tags.map((tag) => (
                <label
                  key={tag.id}
                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-muted/50"
                >
                  <input
                    type="checkbox"
                    checked={values.tag_ids.includes(tag.id)}
                    onChange={() => toggleTag(tag.id)}
                    className="rounded border-input"
                  />
                  <span className="text-sm">{tag.name}</span>
                </label>
              ))
            )}
          </div>
          {showError("tag_ids")}
        </div>
        <div className="space-y-2">
          <Label htmlFor="blog-status">Status</Label>
          <select
            id="blog-status"
            name="status"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={values.status}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={!!(touched.status && errors.status)}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {showError("status")}
        </div>
        <div className="space-y-2">
          <Label htmlFor="blog-featured">Featured image</Label>
          <input
            id="blog-featured"
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm file:mr-3 file:border-0 file:bg-primary file:text-primary-foreground file:text-sm file:font-medium aria-invalid:border-destructive"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setFieldValue("featured_image_file", file);
            }}
            aria-invalid={!!(touched.featured_image && errors.featured_image)}
          />
          <p className="text-muted-foreground text-xs">
            JPEG, PNG, GIF or WebP. Max 2 MB.
          </p>
          {showError("featured_image")}
          {(values.featured_image_file != null || values.featured_image) && (
            <div className="mt-2">
              <FeaturedImagePreview
                file={values.featured_image_file}
                existingUrl={values.featured_image || undefined}
              />
            </div>
          )}
        </div>
      </>
    );
  };

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Blogs
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
            Blogs
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Create and manage blog posts.
          </p>
        </div>

        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" disabled={loading}>
              <Plus className="size-4" />
              Add blog
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add blog</DialogTitle>
            </DialogHeader>
            {modalOpen && (
            <Formik
              key="add-blog"
              initialValues={initialFormValues}
              onSubmit={async (values, { setErrors, resetForm }) => {
                try {
                  await addBlog(formValuesToParams(values));
                  resetForm({ values: initialFormValues });
                  setModalOpen(false);
                  toast.success("Blog created.");
                } catch (err: unknown) {
                  const data = (err as { response?: { data?: { errors?: Record<string, string[]> } } })
                    ?.response?.data;
                  if (data?.errors && typeof data.errors === "object") {
                    setErrors(apiErrorsToFormik(data.errors));
                  } else {
                    toast.error("Failed to create blog.");
                  }
                }
              }}
              validate={(values) => {
                const err: Partial<Record<keyof BlogFormValues, string>> = {};
                if (!values.title?.trim()) err.title = "Title is required.";
                if (!values.body?.trim()) err.body = "Body is required.";
                return err;
              }}
            >
              {(formik) => (
                <form onSubmit={formik.handleSubmit} className="mt-4 space-y-4">
                  {renderFormFields(formik)}
                  <div className="flex gap-2 pt-2">
                    <Button
                      type="submit"
                      disabled={formik.isSubmitting}
                    >
                      {formik.isSubmitting ? "Saving…" : "Create blog"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setModalOpen(false)}
                      disabled={formik.isSubmitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </Formik>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={editModalOpen} onOpenChange={(o) => !o && closeEditModal()}>
          <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit blog</DialogTitle>
            </DialogHeader>
            {editingBlog && (
              <Formik
                key={editingBlog.id}
                initialValues={blogToFormValues(editingBlog)}
                enableReinitialize
                onSubmit={async (values, { setErrors }) => {
                  if (!editingBlog) return;
                  try {
                    await updateBlog(editingBlog.slug, formValuesToParams(values));
                    toast.success("Blog updated.");
                    closeEditModal();
                  } catch (err: unknown) {
                    const data = (err as { response?: { data?: { errors?: Record<string, string[]> } } })
                      ?.response?.data;
                    if (data?.errors && typeof data.errors === "object") {
                      setErrors(apiErrorsToFormik(data.errors));
                    } else {
                      toast.error("Failed to update blog.");
                    }
                  }
                }}
                validate={(values) => {
                  const err: Partial<Record<keyof BlogFormValues, string>> = {};
                  if (!values.title?.trim()) err.title = "Title is required.";
                  if (!values.body?.trim()) err.body = "Body is required.";
                  return err;
                }}
              >
                {(formik) => (
                  <form onSubmit={formik.handleSubmit} className="mt-4 space-y-4">
                    {renderFormFields(formik)}
                    <div className="flex gap-2 pt-2">
                      <Button
                        type="submit"
                        disabled={formik.isSubmitting}
                      >
                        {formik.isSubmitting ? "Saving…" : "Save changes"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={closeEditModal}
                        disabled={formik.isSubmitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </Formik>
            )}
          </DialogContent>
        </Dialog>

        <Dialog
          open={deleteModalOpen}
          onOpenChange={(o) => !o && setDeleteModalOpen(false)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete blog</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground text-sm">
              Are you sure you want to delete &quot;{blogToDelete?.title}&quot;?
              This action cannot be undone.
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
            <span>Loading blogs…</span>
          </div>
        ) : blogs.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <p className="font-medium">No blogs yet</p>
            <p className="mt-1 text-sm">Create your first blog post.</p>
            <Button className="mt-4 gap-2" onClick={() => setModalOpen(true)}>
              <Plus className="size-4" />
              Add blog
            </Button>
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={blogs}
              filterColumn="title"
              filterPlaceholder="Search blogs..."
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

/** Preview with object URL cleanup when file changes. existingUrl = API'den gelen storage URL. */
function FeaturedImagePreview({
  file,
  existingUrl,
}: {
  file: File | null;
  existingUrl?: string;
}) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  useEffect(() => {
    if (file == null) {
      setObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const src = objectUrl ?? featuredImageSrc(existingUrl) ?? "";
  if (!src) return null;
  return (
    <img
      src={src}
      alt="Preview"
      className="h-32 w-auto rounded-md border object-cover"
    />
  );
}
