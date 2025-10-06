import React from 'react'
//user
import Register from './page/auth/Register'
import Login from './page/auth/login'
import HomeUser from './page/user/homeUser'
//admin
import LoginAdmin from './page/auth/loginAdmin'
import DashboardAdmin from './page/admin/dashboard'
import Users from './page/admin/users'
import Category from './page/admin/category'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
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
      element:<HomeUser/>
    },{//admin
      path:'/admin/login',
      element:<LoginAdmin/>
    },{
      path:'/admin/dashboard',
      element:<DashboardAdmin/>
    },{
      path:'/admin/users',
      element:<Users/>
    },{
      path:'/admin/category',
      element:<Category/>
    }
  ])
  return (
    <div>
    <RouterProvider router={router}></RouterProvider>
    </div>
  )
}
