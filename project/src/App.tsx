import React from 'react'
import Register from './page/auth/Register'
import Login from './page/auth/login'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
export default function App() {
  const router = createBrowserRouter([
    {
      path:'/user/login',
      element:<Login/>
    },
    {
      path:'/user/register',
      element:<Register/>
    }
  ])
  return (
    <div>
    <RouterProvider router={router}></RouterProvider>
    </div>
  )
}
