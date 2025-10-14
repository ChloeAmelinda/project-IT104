import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faUnlock, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import Navbar from "../../components/common/navbar";
import Sidebar from "../../components/common/sidebar";

type User = {
  id: number;
  name?: string;
  email: string;
  phone?: string;
  gender?: "Male" | "Female" | "Other" | "Nam" | "Nữ" | "Khác";
  status?: boolean;
};

const API_URL = "http://localhost:8080/users";
const PAGE_SIZE = 5;

export default function Category() {
  const navigate = useNavigate();

  // state cơ bản
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("admin");
    navigate("/admin/login");
  };

  // debounce
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [search]);

  // fetch
  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
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

  useEffect(() => {
    fetchUsers();
  }, [page, debouncedSearch]);

  // toggle status
  const handleToggleStatus = async (u: User) => {
    if (togglingId !== null) return;
    setTogglingId(u.id);
    const prev = users;
    setUsers((list) => list.map((x) => (x.id === u.id ? { ...x, status: !u.status } : x)));

    try {
      await axios.patch(`${API_URL}/${u.id}`, { status: !u.status });
    } catch (e) {
      console.error(e);
      setUsers(prev);
      alert("Đổi trạng thái thất bại!");
    } finally {
      setTogglingId(null);
    }
  };

  const rows = useMemo(() => users ?? [], [users]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <Navbar onLogout={() => setShowLogoutModal(true)} />

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar onOpenLogout={() => setShowLogoutModal(true)} />

        {/* Main */}
        <main className="flex-1 p-6">
          {/* Search */}
          <div className="flex justify-end items-center mb-4">
            <div className="relative">
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên..."
                className="pl-9 pr-3 py-2 w-72 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Table */}
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
                      <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50/60">
                        <td className="px-6 py-3">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                        <td className="px-6 py-3">{u.name || u.email?.split("@")[0] || "—"}</td>
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
                          >
                            {u.status ? (
                              <FontAwesomeIcon icon={faUnlock} className="text-green-600 text-lg" />
                            ) : (
                              <FontAwesomeIcon icon={faLock} className="text-red-600 text-lg" />
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
              >
                ›
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Modal đăng xuất */}
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
