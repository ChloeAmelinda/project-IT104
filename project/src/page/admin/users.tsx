import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faUnlock,
  faChartPie,
  faUsers,
  faLayerGroup,
  faRightFromBracket
} from "@fortawesome/free-solid-svg-icons";

type User = {
  id: number;
  name?: string;
  email: string;
  phone?: string;
  gender?: "Male" | "Female" | "Other" | "Nam" | "Nữ" | "Khác";
  status?: boolean;
};

const API_URL = "http://localhost:8080/users";
const PAGE_SIZE = 5; // ✅ 5 người / trang

export default function Category() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // data state
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // search + pagination
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(""); // ✅ debounce
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [togglingId, setTogglingId] = useState<number | null>(null); // ✅ loading khi toggle

  const handleLogout = () => {
    localStorage.removeItem("admin");
    navigate("/admin/login");
  };

  // ✅ debounce 300ms + reset về trang 1 khi đổi từ khóa
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [search]);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      // ✅ chỉ tìm theo tên: name_like
      const url =
        `${API_URL}?_page=${page}&_limit=${PAGE_SIZE}` +
        (debouncedSearch ? `&name_like=${encodeURIComponent(debouncedSearch)}` : "");

      const res = await axios.get<User[]>(url);
      const total = Number(res.headers["x-total-count"] || 0);
      setUsers(res.data);
      setTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)));
    } catch (err) {
      console.error(err);
      setError("Không thể tải dữ liệu người dùng.");
    } finally {
      setLoading(false);
    }
  };

  // refetch khi trang hoặc từ khóa (đã debounce) thay đổi
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch]);

  // ✅ toggle status (optimistic update + PATCH json-server)
  const handleToggleStatus = async (u: User) => {
    if (togglingId !== null) return; // tránh double click khi đang xử lý
    setTogglingId(u.id);

    // optimistic update
    const prev = users;
    setUsers((list) =>
      list.map((x) => (x.id === u.id ? { ...x, status: !u.status } : x))
    );

    try {
      await axios.patch(`${API_URL}/${u.id}`, { status: !u.status });
    } catch (e) {
      // rollback nếu lỗi
      console.error(e);
      setUsers(prev);
      alert("Đổi trạng thái thất bại. Vui lòng thử lại!");
    } finally {
      setTogglingId(null);
    }
  };

  const rows = useMemo(() => users ?? [], [users]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* HEADER */}
      <header className="w-full bg-white shadow-sm border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <h1 className="text-sm font-bold text-gray-800">
          Financial <span className="text-indigo-600">Manager</span>
        </h1>

        {/* Search on header (optional) */}
        <div className="hidden md:block">
          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên..."
              className="pl-10 pr-3 py-2 w-72 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
          </div>
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((s) => !s)}
            className="flex items-center justify-center h-9 w-9 rounded-full border border-gray-300 hover:bg-gray-50"
            aria-label="User menu"
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

          {menuOpen && (
            <div
              className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-md shadow-lg z-20"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <button
                onClick={() => setShowLogoutModal(true)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
              >
                ⏻ Sign out
              </button>
            </div>
          )}
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
              <FontAwesomeIcon icon={faLayerGroup} className="w-4 h-4" /> Category
            </NavLink>
          </div>

          <div className="border-t border-gray-200 p-3">
            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center gap-2 text-gray-600 text-sm hover:text-red-600"
            >
              <FontAwesomeIcon icon={faRightFromBracket} /> Sign out
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="flex-1 p-6">
          {/* Search (mobile) */}
          <div className="md:hidden mb-4">
            <div className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên..."
                className="pl-10 pr-3 py-2 w-full rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                🔍
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-gray-600">
                    <th className="text-left font-semibold px-6 py-4">STT</th>
                    <th className="text-left font-semibold px-6 py-4">Name</th>
                    <th className="text-left font-semibold px-6 py-4">Email</th>
                    <th className="text-left font-semibold px-6 py-4">Phone</th>
                    <th className="text-left font-semibold px-6 py-4">Gender</th>
                    <th className="text-left font-semibold px-6 py-4">Status</th>
                    <th className="text-left font-semibold px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        Đang tải dữ liệu...
                      </td>
                    </tr>
                  )}

                  {!loading && error && (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-red-600">
                        {error}
                      </td>
                    </tr>
                  )}

                  {!loading && !error && rows.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        Không có dữ liệu phù hợp.
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    !error &&
                    rows.map((u, idx) => (
                      <tr
                        key={u.id}
                        className="border-t border-gray-100 hover:bg-gray-50/60"
                      >
                        <td className="px-6 py-3">
                          {(page - 1) * PAGE_SIZE + idx + 1}
                        </td>
                        <td className="px-6 py-3">
                          {u.name || u.email?.split("@")[0] || "—"}
                        </td>
                        <td className="px-6 py-3">{u.email}</td>
                        <td className="px-6 py-3">{u.phone || "—"}</td>
                        <td className="px-6 py-3">{u.gender || "—"}</td>
                        <td className="px-6 py-3">
                          {u.status ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-600 ring-1 ring-inset ring-emerald-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-600 ring-1 ring-inset ring-red-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                              Deactivate
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3 text-center">
                          <button
                            onClick={() => handleToggleStatus(u)}
                            disabled={togglingId === u.id}
                            title="Đổi trạng thái"
                            className={`p-1 rounded transition-transform ${
                              togglingId === u.id
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:scale-110"
                            }`}
                            aria-label={`Toggle status for ${u.name || u.email}`}
                          >
                            {u.status ? (
                              <FontAwesomeIcon
                                icon={faUnlock}
                                className="text-green-600 text-lg"
                              />
                            ) : (
                              <FontAwesomeIcon
                                icon={faLock}
                                className="text-red-600 text-lg"
                              />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end gap-2 px-6 py-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className={`grid h-8 w-8 place-items-center rounded-md border border-gray-200 ${
                  page <= 1 ? "text-gray-300" : "hover:bg-gray-50"
                }`}
                aria-label="Prev"
              >
                ‹
              </button>

              {Array.from({ length: totalPages }).map((_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`grid h-8 w-8 place-items-center rounded-md border border-gray-200 text-sm font-medium ${
                      page === p
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                    aria-label={`Page ${p}`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className={`grid h-8 w-8 place-items-center rounded-md border border-gray-200 ${
                  page >= totalPages ? "text-gray-300" : "hover:bg-gray-50"
                }`}
                aria-label="Next"
              >
                ›
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Modal xác nhận đăng xuất */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-80">
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
  );
}
