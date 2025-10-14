import React from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTableCellsLarge, faUsers, faLayerGroup, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

type Props = { onOpenLogout?: () => void };

const itemCls = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-2 px-4 py-2 text-[13px] border-l-2 ${
    isActive
      ? "border-indigo-600 text-indigo-600 bg-indigo-50"
      : "border-transparent text-gray-700 hover:bg-gray-50"
  }`;

export default function Sidebar({ onOpenLogout }: Props) {
  // tạm thời log để chắc chắn component render
  // console.log("Sidebar mounted");

  return (
    <aside
      className="
        w-56 shrink-0 bg-white border-r border-gray-200
        sticky top-[56px] self-start
        h-[calc(100vh-56px)]
      "
    >


      <nav className="flex flex-col">
        <NavLink to="/admin/dashboard" className={itemCls}>
          <FontAwesomeIcon icon={faTableCellsLarge} /> Dashboard
        </NavLink>
        <NavLink to="/admin/users" className={itemCls}>
          <FontAwesomeIcon icon={faUsers} /> Users
        </NavLink>
        <NavLink to="/admin/category" className={itemCls}>
          <FontAwesomeIcon icon={faLayerGroup} /> Category
        </NavLink>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 p-3 bg-white">
        <button
          onClick={onOpenLogout}
          className="w-full flex items-center gap-2 text-[13px] text-gray-700 hover:text-red-600"
        >
          <FontAwesomeIcon icon={faRightFromBracket} /> Sign out
        </button>
      </div>
    </aside>
  );
}
