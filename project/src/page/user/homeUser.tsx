import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HomeUser() {
  const [month, setMonth] = useState<string>(() => {
    const d = new Date();
    return d.toLocaleString("en-US", { month: "long", year: "numeric" });
  });
  const [budget, setBudget] = useState<string>("5000000");
  const [remain] = useState<number>(0);

  const remainFmt = useMemo(
    () => new Intl.NumberFormat("vi-VN").format(remain) + " VND",
    [remain]
  );

  const nav = useNavigate();

  const handleLogout = () => {
    const confirmLogout = window.confirm("Bạn có chắc muốn đăng xuất không?");
    if (confirmLogout) {
      localStorage.removeItem("auth_user");
      nav("/user/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-gray-800">
      {/* Top bar */}
      <header className="sticky top-0 z-40 w-full bg-[#4f46e5] text-white shadow">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 font-medium">
            <span className="text-yellow-300">📒</span>
            <span className="truncate">Tài Chính Cá Nhân K24_Rikkei</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-1 rounded-md bg-white/10 px-3 py-1.5 text-sm hover:bg-white/15">
              Tài khoản
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z"/></svg>
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1 rounded-md bg-red-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-600"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl grid-cols-12 gap-6 px-4 py-6">
        {/* Sidebar */}
        <aside className="col-span-12 h-max rounded-xl bg-white p-3 shadow sm:col-span-3 lg:col-span-2">
          <nav className="space-y-3">
            <SidebarBtn active>Information</SidebarBtn>
            <SidebarBtn>Category</SidebarBtn>
            <SidebarBtn>History</SidebarBtn>
          </nav>
        </aside>

        {/* Main */}
        <main className="col-span-12 space-y-6 sm:col-span-9 lg:col-span-10">
          <section className="rounded-2xl bg-[#4f46e5] px-6 py-6 text-white shadow">
            <div className="text-center text-lg font-medium">🎯 Kiểm soát chi tiêu thông minh</div>
            <p className="mt-1 text-center text-sm text-white/80">
              Theo dõi ngân sách và thu chi hằng tháng dễ dàng
            </p>
          </section>

          <h2 className="text-center text-2xl font-semibold text-[#4f46e5]">
            📊 Quản Lý Tài Chính Cá Nhân
          </h2>

          <div className="space-y-4">
            <div className="rounded-xl bg-white p-5 text-center shadow">
              <p className="text-sm text-gray-500">Số tiền còn lại</p>
              <p className="mt-1 text-xl font-semibold text-emerald-500">{remainFmt}</p>
            </div>

            <div className="flex flex-col items-center justify-between gap-3 rounded-xl bg-white p-5 shadow sm:flex-row">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                📅 Chọn tháng:
              </div>
              <div className="flex items-center gap-3">
                <input
                  aria-label="month"
                  type="text"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-56 rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                />
                <button className="inline-flex items-center justify-center rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50">
                  📆
                </button>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-3 rounded-xl bg-white p-5 shadow sm:flex-row">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                💰 Ngân sách tháng:
              </div>
              <div className="flex items-center gap-2">
                <input
                  aria-label="budget"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value.replace(/\D/g, ""))}
                  placeholder="5000000"
                  className="w-44 rounded-lg border border-gray-300 pl-3 pr-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                />
                <button className="rounded-lg bg-[#4f46e5] px-4 py-2 text-sm font-medium text-white shadow hover:bg-[#4338ca]">
                  Lưu
                </button>
              </div>
            </div>
          </div>

          <section>
            <h3 className="mb-4 text-center text-2xl font-semibold text-[#4f46e5]">
              Quản Lý Thông tin cá nhân
            </h3>

            <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Name" required>
                  <input disabled defaultValue="Nguyen Van A" className="input" />
                </Field>
                <Field label="Email" required>
                  <input disabled defaultValue="nguyenvana@gmail.com" className="input" />
                </Field>
                <Field label="Phone" required>
                  <input disabled defaultValue="0987654321" className="input" />
                </Field>
                <Field label="Gender">
                  <input disabled defaultValue="Male" className="input" />
                </Field>
              </div>
              <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button className="rounded-lg border border-[#4f46e5] px-4 py-2 text-[#4f46e5] hover:bg-[#4f46e5]/5">
                  Change Information
                </button>
                <button className="rounded-lg border border-[#4f46e5] px-4 py-2 text-[#4f46e5] hover:bg-[#4f46e5]/5">
                  Change Password
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>

      <style>{`
        .input { @apply w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 bg-gray-50; }
      `}</style>
    </div>
  );
}

function SidebarBtn({ children, active }: { children: React.ReactNode; active?: boolean; }) {
  return (
    <button
      className={[
        "flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm",
        active
          ? "border-[#4f46e5] bg-[#4f46e5]/10 text-[#4f46e5]"
          : "border-gray-200 hover:bg-gray-50"
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode; }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 inline-flex items-center gap-1 font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}