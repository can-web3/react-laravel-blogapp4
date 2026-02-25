import { createRoot } from 'react-dom/client'
import './index.css'
import router from './routes/router.tsx'
import { RouterProvider } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider } from './contexts/AuthContext'
import { CategoriesProvider } from './contexts/CategoriesContext'
import { TagsProvider } from './contexts/TagsContext'
import { BlogsProvider } from './contexts/BlogsContext'
import { UsersProvider } from './contexts/UsersContext'

createRoot(document.getElementById('root')!).render(
  <HelmetProvider>
  <AuthProvider>
    <CategoriesProvider>
      <TagsProvider>
        <BlogsProvider>
          <UsersProvider>
            <RouterProvider router={router} />
            <ToastContainer />
          </UsersProvider>
        </BlogsProvider>
      </TagsProvider>
    </CategoriesProvider>
  </AuthProvider>
  </HelmetProvider>
)
