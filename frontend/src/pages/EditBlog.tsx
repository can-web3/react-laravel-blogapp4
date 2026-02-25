import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Formik } from "formik";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useBlogs, type BlogParams } from "@/contexts/BlogsContext";
import { useCategories } from "@/contexts/CategoriesContext";
import { useTags } from "@/contexts/TagsContext";
import type { BlogItem } from "@/contexts/BlogsContext";
import { PageSEO } from "@/components/PageSEO";

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

interface FormValues {
  title: string;
  excerpt: string;
  body: string;
  category_id: number | "";
  tag_ids: number[];
  featured_image_file: File | null;
  status: string;
  published_at: string;
}

function blogToFormValues(blog: BlogItem): FormValues {
  return {
    title: blog.title,
    excerpt: blog.excerpt ?? "",
    body: blog.body,
    category_id: blog.category_id ?? "",
    tag_ids: blog.tags?.map((t) => t.id) ?? [],
    featured_image_file: null,
    status: blog.status,
    published_at: blog.published_at ?? "",
  };
}

function toParams(values: FormValues): BlogParams {
  return {
    title: values.title,
    excerpt: values.excerpt || undefined,
    body: values.body,
    category_id: values.category_id === "" ? null : values.category_id,
    tag_ids: values.tag_ids,
    featured_image_file: values.featured_image_file ?? undefined,
    status: values.status,
    published_at: values.published_at || undefined,
  };
}

export default function EditBlog() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isInitialized, isAuthenticated, user } = useAuth();
  const { getBlog, updateBlog } = useBlogs();
  const { categories } = useCategories();
  const { tags } = useTags();
  const [blog, setBlog] = useState<BlogItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);

  const loadBlog = useCallback(async () => {
    if (!slug || !user) return;
    setLoading(true);
    try {
      const data = await getBlog(slug);
      setBlog(data);
      if (data && data.user_id !== user.id) {
        setForbidden(true);
      }
    } catch {
      setBlog(null);
    } finally {
      setLoading(false);
    }
  }, [slug, user, getBlog]);

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }
    loadBlog();
  }, [isInitialized, isAuthenticated, navigate, loadBlog]);

  useEffect(() => {
    if (forbidden) navigate("/profile", { replace: true });
  }, [forbidden, navigate]);

  if (!isInitialized || !isAuthenticated) return null;
  if (loading || !blog) {
    return (
      <main className="min-h-screen border-b bg-background">
        <div className="container mx-auto max-w-2xl px-4 py-8">
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-muted-foreground">
            <Loader2 className="size-10 animate-spin" aria-hidden />
            <p>{loading ? "Loading…" : "Post not found."}</p>
            {!loading && (
              <Button variant="outline" asChild>
                <Link to="/profile">Back to profile</Link>
              </Button>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen border-b bg-background">
      <PageSEO title="Edit post" noindex />
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Link
          to={`/blogs/${blog.slug}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to post
        </Link>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground">
          Edit post
        </h1>
        <p className="mt-1 text-muted-foreground text-sm">
          Update your blog post.
        </p>

        <Formik
          key={blog.slug}
          initialValues={blogToFormValues(blog)}
          enableReinitialize
          validate={(values) => {
            const err: Partial<Record<keyof FormValues, string>> = {};
            if (!values.title?.trim()) err.title = "Title is required.";
            if (!values.body?.trim()) err.body = "Body is required.";
            return err;
          }}
          onSubmit={async (values, { setErrors }) => {
            try {
              await updateBlog(blog.slug, toParams(values));
              navigate(`/blogs/${blog.slug}`);
            } catch (err: unknown) {
              const data = (err as { response?: { data?: { errors?: Record<string, string[]> } } })?.response?.data;
              if (data?.errors && typeof data.errors === "object") {
                setErrors(
                  Object.fromEntries(
                    Object.entries(data.errors).map(([k, v]) => [k, Array.isArray(v) ? v.join(" ") : String(v)])
                  ) as Partial<Record<keyof FormValues, string>>
                );
              }
            }
          }}
        >
          {(formik) => (
            <form onSubmit={formik.handleSubmit} className="mt-8 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  name="title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Post title"
                  aria-invalid={!!(formik.touched.title && formik.errors.title)}
                />
                {formik.touched.title && formik.errors.title && (
                  <p className="text-destructive text-sm" role="alert">{formik.errors.title}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-excerpt">Excerpt</Label>
                <Textarea
                  id="edit-excerpt"
                  name="excerpt"
                  value={formik.values.excerpt}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Short summary"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-body">Body *</Label>
                <Textarea
                  id="edit-body"
                  name="body"
                  value={formik.values.body}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Write your content..."
                  rows={10}
                  aria-invalid={!!(formik.touched.body && formik.errors.body)}
                />
                {formik.touched.body && formik.errors.body && (
                  <p className="text-destructive text-sm" role="alert">{formik.errors.body}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <select
                  id="edit-category"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  value={formik.values.category_id === "" ? "" : formik.values.category_id}
                  onChange={(e) =>
                    formik.setFieldValue("category_id", e.target.value ? Number(e.target.value) : "")
                  }
                >
                  <option value="">None</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 rounded-md border border-input p-3">
                  {tags.length === 0 ? (
                    <span className="text-muted-foreground text-sm">No tags available.</span>
                  ) : (
                    tags.map((tag) => (
                      <label key={tag.id} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-muted/50">
                        <input
                          type="checkbox"
                          checked={formik.values.tag_ids.includes(tag.id)}
                          onChange={() => {
                            const next = formik.values.tag_ids.includes(tag.id)
                              ? formik.values.tag_ids.filter((id) => id !== tag.id)
                              : [...formik.values.tag_ids, tag.id];
                            formik.setFieldValue("tag_ids", next);
                          }}
                          className="rounded border-input"
                        />
                        <span className="text-sm">{tag.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <select
                  id="edit-status"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  value={formik.values.status}
                  onChange={(e) => formik.setFieldValue("status", e.target.value)}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-image">Featured image</Label>
                <input
                  id="edit-image"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm file:mr-3 file:border-0 file:bg-primary file:text-primary-foreground file:text-sm file:font-medium"
                  onChange={(e) => formik.setFieldValue("featured_image_file", e.target.files?.[0] ?? null)}
                />
                <p className="text-muted-foreground text-xs">Leave empty to keep current image. Max 2 MB.</p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={formik.isSubmitting}>
                  {formik.isSubmitting ? "Saving…" : "Save changes"}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link to={`/blogs/${blog.slug}`}>Cancel</Link>
                </Button>
              </div>
            </form>
          )}
        </Formik>
      </div>
    </main>
  );
}
