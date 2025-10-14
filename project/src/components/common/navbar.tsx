import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGear } from "@fortawesome/free-solid-svg-icons";

type Props = {
  onLogout: () => void;
};

export default function Navbar({ onLogout }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm px-5 py-3 flex items-center justify-between">
      <h1 className="text-[15px] font-semibold text-gray-800">
        Financial <span className="text-indigo-600">Manager</span>
      </h1>

      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="h-9 w-9 grid place-items-center rounded-full border border-gray-300 hover:bg-gray-50"
          aria-label="Open user menu"
        >
          <FontAwesomeIcon icon={faUserGear} className="text-gray-700" />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-40 rounded-md border border-gray-200 bg-white shadow-md">
            <button
              className="w-full text-left text-sm px-3 py-2 hover:bg-gray-50"
              onClick={() => alert("Change password clicked")}
            >
              Change Password
            </button>
            <div className="px-3 pb-3 pt-1">
              <button
                onClick={onLogout}
                className="w-full rounded-md bg-red-600 text-white text-sm py-2 hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
