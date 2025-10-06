import React from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartPie, faUsers, faLayerGroup, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

type SidebarProps = {
  onSignOut?: () => void;
};

export default function Sidebar({ onSignOut }: SidebarProps) {
  const itemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-3 border-l-4 text-sm transition
     ${isActive
       ? "border-indigo-600 text-indigo-600 bg-indigo-50"
       : "border-transparent text-gray-600 hover:bg-gray-50"}`;

  return (
    <aside className="w-[220px] bg-white/95 backdrop-blur border-r border-gray-200 flex flex-col justify-between sticky top-[48px] h-[calc(100vh-48px)]">
      <nav className="py-2">
        <NavLink to="/admin/dashboard" className={itemClass}>
          <FontAwesomeIcon icon={faChartPie} className="w-4 h-4" /> Dashboard
        </NavLink>
        <NavLink to="/admin/users" className={itemClass}>
          <FontAwesomeIcon icon={faUsers} className="w-4 h-4" /> Users
        </NavLink>
        <NavLink to="/admin/category" className={itemClass}>
          <FontAwesomeIcon icon={faLayerGroup} className="w-4 h-4" /> Category
        </NavLink>
      </nav>

      <div className="border-t border-gray-200 p-3">
        <button
          onClick={onSignOut}
          className="flex items-center gap-2 text-gray-600 text-sm hover:text-red-600"
        >
          <FontAwesomeIcon icon={faRightFromBracket} /> Sign out
        </button>
      </div>
    </aside>
  );
}
