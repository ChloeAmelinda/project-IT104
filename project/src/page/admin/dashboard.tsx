import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/common/navbar";
import Sidebar from "../../components/common/sidebar";

export default function Dashboard() {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("admin");
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar onLogout={() => setConfirmOpen(true)} />

      <div className="flex flex-1">
        <Sidebar onOpenLogout={() => setConfirmOpen(true)} />

        {/* MAIN */}
        <main className="flex-1 p-6 space-y-5">
          {/* Top cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "USER", value: "1,500", trend: "+ 36%", trendColor: "text-emerald-600" },
              { label: "CATEGORY", value: "500", trend: "− 14%", trendColor: "text-rose-600" },
              { label: "SPENDING", value: "84,382", trend: "+ 36%", trendColor: "text-emerald-600" },
              { label: "TOTAL MONEY", value: "33,493,022 $", trend: "+ 36%", trendColor: "text-emerald-600" },
            ].map((c) => (
              <div key={c.label} className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-[11px] text-gray-500 uppercase">{c.label}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-800">{c.value}</span>
                  <span className={`text-xs font-medium ${c.trendColor}`}>{c.trend}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Chart + recent customers */}
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
            {/* Chart card */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-700">report money</p>
                <div className="space-x-2 text-[12px]">
                  {["12 Months", "6 Months", "30 Days", "7 Days"].map((t) => (
                    <button key={t} className="border border-gray-200 px-2 py-1 rounded hover:bg-gray-50">
                      {t}
                    </button>
                  ))}
                  <button className="border px-2 py-1 rounded hover:bg-gray-50">Export PDF</button>
                </div>
              </div>
              {/* placeholder chart */}
              <div className="h-64 rounded-md bg-gray-50 grid place-items-center text-gray-400">
                Chart Placeholder
              </div>
            </div>

            {/* Recent customers */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700">Recent Customers</p>
                <p className="text-xs text-gray-400">Lorem ipsum dolor sit amet.</p>
              </div>

              <ul className="space-y-2 text-sm">
                {[
                  { name: "Jenny Wilson", email: "jenny.wilson@gmail.com", money: "$11,234", city: "Austin" },
                  { name: "Devon Lane", email: "devon.lane@gmail.com", money: "$11,159", city: "New York" },
                  { name: "Jane Cooper", email: "jane.cooper@gmail.com", money: "$10,483", city: "Toledo" },
                  { name: "Dianne Russell", email: "dianne.russell@gmail.com", money: "$9,084", city: "Naperville" },
                ].map((u) => (
                  <li key={u.email} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gray-200" />
                      <div>
                        <p className="font-medium text-gray-800">{u.name}</p>
                        <p className="text-[11px] text-gray-500">{u.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium text-gray-700">{u.money}</div>
                      <div className="text-[11px] text-gray-400">{u.city}</div>
                    </div>
                  </li>
                ))}
              </ul>

              <button className="mt-3 w-full text-[12px] border border-gray-200 rounded py-2 text-gray-700 hover:bg-gray-50">
                SEE ALL CUSTOMERS →
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* confirm logout */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 grid place-items-center">
          <div className="w-80 rounded-md bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Xác nhận đăng xuất</h3>
            <p className="text-sm text-gray-600 mb-5">Bạn có chắc chắn muốn đăng xuất không?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
