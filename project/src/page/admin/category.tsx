import React from 'react'
import { useNavigate, NavLink } from "react-router-dom";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faUnlock,
  faChartPie,
  faUsers,
  faLayerGroup,
  faRightFromBracket
} from "@fortawesome/free-solid-svg-icons";
export default function category() {
   const navigate = useNavigate();
     const [menuOpen, setMenuOpen] = useState(false);
     const [showLogoutModal, setShowLogoutModal] = useState(false);
   
     const handleLogout = () => {
       localStorage.removeItem("admin");
       navigate("/admin/login");
     };
  return (
   <div className="min-h-screen bg-gray-100 flex flex-col">
         {/* HEADER */}
         <header className="w-full bg-white shadow-sm border-b border-gray-200 px-6 py-3 flex items-center justify-between">
           <h1 className="text-sm font-bold text-gray-800">
             Financial <span className="text-indigo-600">Manager</span>
           </h1>
           {/* User Menu */}
           <div className="relative">
             <button
               onClick={() => setMenuOpen(!menuOpen)}
               className="flex items-center justify-center h-9 w-9 rounded-full border border-gray-300 hover:bg-gray-50"
             >
               <svg
                 xmlns="http://www.w3.org/2000/svg"
                 className="h-5 w-5 text-gray-600"
                 fill="currentColor"
                 viewBox="0 0 24 24"
               >
                 <path d="M12 12c2.2 0 4-1.8 4-4s-1.8-4-4-4-4 1.8-4 4 1.8 4 4 4zm0 2c-3.3 0-6 2.2-6 5v1h12v-1c0-2.8-2.7-5-6-5z" />
               </svg>
             </button>
           </div>
         </header>
   
         <div className="flex flex-1">
           {/* SIDEBAR */}
           <aside className="w-[200px] bg-white border-r border-gray-200 flex flex-col justify-between">
             <div>
               <NavLink
                 to="/admin/dashboard"
                 className={({ isActive }) =>
                   `block px-4 py-3 border-l-4 ${
                     isActive
                       ? "border-indigo-600 text-indigo-600 bg-indigo-50"
                       : "border-transparent text-gray-600 hover:bg-gray-50"
                   }`
                 }
               >
                 <FontAwesomeIcon icon={faChartPie} className="w-4 h-4" /> Dashboard
               </NavLink>
               <NavLink
                 to="/admin/users"
                 className={({ isActive }) =>
                   `block px-4 py-3 border-l-4 ${
                     isActive
                       ? "border-indigo-600 text-indigo-600 bg-indigo-50"
                       : "border-transparent text-gray-600 hover:bg-gray-50"
                   }`
                 }
               >
                 <FontAwesomeIcon icon={faUsers} className="w-4 h-4" /> Users
               </NavLink>
               <NavLink
                 to="/admin/category"
                 className={({ isActive }) =>
                   `block px-4 py-3 border-l-4 ${
                     isActive
                       ? "border-indigo-600 text-indigo-600 bg-indigo-50"
                       : "border-transparent text-gray-600 hover:bg-gray-50"
                   }`
                 }
               >
                 <FontAwesomeIcon icon={faUsers} className="w-4 h-4" />Category
               </NavLink>
             </div>
   
             <div className="border-t border-gray-200 p-3">
               <button
                 onClick={() => setShowLogoutModal(true)}
                 className="flex items-center gap-2 text-gray-600 text-sm hover:text-red-600"
               >
                 <FontAwesomeIcon icon={faRightFromBracket} className="w-4 h-4" /> Sign out
               </button>
             </div>
           </aside>
         </div>
   
         {/* Modal xác nhận đăng xuất */}
         {showLogoutModal && (
           <div className="fixed inset-0 bg-opacity-30 flex items-center justify-center z-50">
             <div className="bg-white rounded shadow-lg p-6 w-80">
               <h2 className="text-lg font-semibold mb-4">Xác nhận đăng xuất</h2>
               <p className="mb-6">Bạn có chắc chắn muốn đăng xuất không?</p>
               <div className="flex justify-end gap-3">
                 <button
                   onClick={() => setShowLogoutModal(false)}
                   className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                 >
                   Hủy
                 </button>
                 <button
                   onClick={handleLogout}
                   className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                 >
                   Đăng xuất
                 </button>
               </div>
             </div>
           </div>
         )}
       </div>
  )
}
