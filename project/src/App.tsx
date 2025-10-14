import React from 'react'
//user
import Register from './page/auth/Register'
import Login from './page/auth/login'
import HomeUser from './page/user/homeUser'
import CategoryUser from './page/user/CategoryUser'
import History from './page/user/History'
//admin
import LoginAdmin from './page/auth/loginAdmin'
import DashboardAdmin from './page/admin/dashboard'
import Users from './page/admin/users'
import Category from './page/admin/category'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'

// Component bảo vệ route
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuth = !!localStorage.getItem("auth_user");
  return isAuth ? children : <Navigate to="/user/login" replace />;
}

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const isAdmin = !!localStorage.getItem("admin");
  return isAdmin ? children : <Navigate to="/admin/login" replace />;
}

export default function App() {
  const router = createBrowserRouter([
    {//user
      path:'/user/login',
      element:<Login/>
    },
    {
      path:'/user/register',
      element:<Register/>
    },
    {
      path:'/user/home',
      element:<ProtectedRoute><HomeUser/></ProtectedRoute>
    },
    {
      path:'/user/category',
      element:<ProtectedRoute><CategoryUser/></ProtectedRoute>
    },
    {
      path:'/user/history',
      element:<ProtectedRoute><History/></ProtectedRoute>
    },
    {//admin
      path:'/admin/login',
      element:<LoginAdmin/>
    },
    {
      path:'/admin/dashboard',
      element:<ProtectedAdminRoute><DashboardAdmin/></ProtectedAdminRoute>
    },
    {
      path:'/admin/users',
      element:<ProtectedAdminRoute><Users/></ProtectedAdminRoute>
    },
    {
      path:'/admin/category',
      element:<ProtectedAdminRoute><Category/></ProtectedAdminRoute>
    }
  ])
  return (
    <div>
      <RouterProvider router={router}></RouterProvider>
    </div>
  )
}