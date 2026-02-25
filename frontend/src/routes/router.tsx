import Home from "@/pages/Home"
import Blogs from "@/pages/Blogs"
import BlogDetail from "@/pages/BlogDetail"
import CreateBlog from "@/pages/CreateBlog"
import EditBlog from "@/pages/EditBlog"
import TagPage from "@/pages/TagPage"
import CategoryPage from "@/pages/CategoryPage"
import AuthorPage from "@/pages/AuthorPage"
import Profile from "@/pages/Profile"
import Login from "@/pages/Login"
import Register from "@/pages/Register"
import ForgotPassword from "@/pages/ForgotPassword"
import AdminDashboard from "@/pages/admin/AdminDashboard"
import AdminBlogs from "@/pages/admin/AdminBlogs"
import AdminCategories from "@/pages/admin/AdminCategories"
import AdminTags from "@/pages/admin/AdminTags"
import AdminUsers from "@/pages/admin/AdminUsers"
import AdminSettings from "@/pages/admin/AdminSettings"
import { createBrowserRouter } from "react-router-dom"
import UserLayout from "@/layouts/UserLayout"
import AdminLayout from "@/layouts/AdminLayout"

const router = createBrowserRouter([
  {
    path: "/",
    element: <UserLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/blogs", element: <Blogs /> },
      { path: "/blogs/new", element: <CreateBlog /> },
      { path: "/blogs/:slug/edit", element: <EditBlog /> },
      { path: "/blogs/:slug", element: <BlogDetail /> },
      { path: "/tags/:slug", element: <TagPage /> },
      { path: "/categories/:slug", element: <CategoryPage /> },
      { path: "/authors/:slug", element: <AuthorPage /> },
      { path: "/profile", element: <Profile /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/forgot-password", element: <ForgotPassword /> },
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "posts", element: <AdminBlogs /> },
      { path: "categories", element: <AdminCategories /> },
      { path: "tags", element: <AdminTags /> },
      { path: "users", element: <AdminUsers /> },
      { path: "settings", element: <AdminSettings /> },
    ],
  },
])

export default router