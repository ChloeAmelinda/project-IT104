import React from 'react'
type NavbarProps = {
  onOpenLogout?: () => void;
  title?: string;
};
export default function navbar({ onOpenLogout, title = "Financial Manager" }: NavbarProps) {
  return (
    <header className="w-full bg-white/90 backdrop-blur shadow-sm border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
      <h1 className="text-sm font-bold text-gray-800 tracking-tight">
        {title.split(" ")[0]} <span className="text-indigo-600">{title.split(" ")[1] || ""}</span>
      </h1>

      <div className="relative">
        <button
          onClick={onOpenLogout}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50 text-sm text-gray-700"
          aria-label="Open logout dialog"
        >
          ⏻ <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
}
