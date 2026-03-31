import { createBrowserRouter } from 'react-router-dom';

import { ProtectedRoute } from '../components/guards/ProtectedRoute';
import { AuthLayout } from '../components/layouts/AuthLayout';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { DocumentReviewPage } from '../pages/admin/DocumentReviewPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { DocumentListPage } from '../pages/documents/DocumentListPage';
import { NotFoundPage } from '../pages/error/NotFoundPage';
import { UnauthorizedPage } from '../pages/error/UnauthorizedPage';
import { TeacherUploadPage } from '../pages/teacher/TeacherUploadPage';
import { TeacherPortalPage } from '../pages/teacher/TeacherPortalPage';
import { TeacherDocumentsPage } from '../pages/teacher/TeacherDocumentsPage';
import { UserManagementPage } from '../features/users/components/UserManagementPage';
import { CategoryManagementPage } from '../features/categories/components/CategoryManagementPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DocumentListPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={['admin']}>
        <AdminDashboardPage />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'users',
        element: <UserManagementPage />,
      },
      {
        path: 'categories',
        element: <CategoryManagementPage />,
      },
      {
        path: 'documents-review',
        element: <DocumentReviewPage />,
      },
    ],
  },
  {
    path: '/teacher',
    element: (
      <ProtectedRoute allowedRoles={['admin', 'teacher']}>
        <TeacherPortalPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/teacher/upload',
    element: (
      <ProtectedRoute allowedRoles={['admin', 'teacher']}>
        <TeacherUploadPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/teacher/my-documents',
    element: (
      <ProtectedRoute allowedRoles={['admin', 'teacher']}>
        <TeacherDocumentsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
