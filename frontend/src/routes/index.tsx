import { createBrowserRouter } from 'react-router-dom';

import { ProtectedRoute } from '../components/guards/ProtectedRoute';
import { AuthLayout } from '../components/layouts/AuthLayout';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { DocumentListPage } from '../pages/documents/DocumentListPage';
import { NotFoundPage } from '../pages/error/NotFoundPage';
import { UnauthorizedPage } from '../pages/error/UnauthorizedPage';
import { TeacherUploadPage } from '../pages/teacher/TeacherUploadPage';
import { UserManagementPage } from '../features/users/components/UserManagementPage';

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
    ],
  },
  {
    path: '/teacher',
    element: (
      <ProtectedRoute allowedRoles={['admin', 'teacher']}>
        <TeacherUploadPage />
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
