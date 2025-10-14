import React, { useEffect, useMemo, useState } from "react";
import { Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

/* ===================== API ===================== */
const API_TXN = "http://localhost:8080/transaction";
const API_MONTHLY = "http://localhost:8080/monthlyCategories";
const API_CATEGORIES = "http://localhost:8080/categories";

/* ===================== Types ===================== */
type Txn = {
  id?: number;
  category: string;
  amount: number;
  note: string;
  month: string; // ví dụ "September 2025"
  type?: "expense" | "income";
};

type MonthlyCategory = {
  id: number;
  month: string;
  categories?: Array<{ id?: number; name: string } | string>;
};

/* ===================== Helpers ===================== */
const formatVND = (n: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);

/* ===================== Subcomponents ===================== */
function SidebarNavLink({
  to,
  icon,
  children,
}: {
  to: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 rounded-md px-3 py-2 text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
    >
      <span className="text-lg">{icon}</span>
      <span className="text-sm font-medium">{children}</span>
    </Link>
  );
}

/* ===================== Component ===================== */
export default function History() {
  const navigate = useNavigate();
  const handleLogout = () => {
    const confirmLogout = window.confirm("Bạn có chắc muốn đăng xuất không?");
    if (confirmLogout) {
      localStorage.removeItem("auth_user");
    navigate("/user/login");
    }
  };
  //  const handleLogout = () => {
  //   const confirmLogout = window.confirm("Bạn có chắc muốn đăng xuất không?");
  //   if (confirmLogout) {
  //     localStorage.removeItem("auth_user");
  //     nav("/user/login");
  //   }
  // };

  // Tháng & Danh mục (metadata)
  const [months, setMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [metaErr, setMetaErr] = useState("");

  // Danh sách giao dịch
  const [items, setItems] = useState<Txn[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Tìm kiếm / Sắp xếp / Phân trang
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"none" | "asc" | "desc">("none");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 3;
  const [totalPages, setTotalPages] = useState(1);

  // Form
  const [form, setForm] = useState<{
    category: string;
    amount: string;
    note: string;
    month: string;
    type: "expense" | "income";
  }>({
    category: "",
    amount: "",
    note: "",
    month: "",
    type: "expense",
  });
  const [errors, setErrors] = useState<{ category?: string; amount?: string; note?: string; month?: string }>({});

  // ==== Modal xác nhận xoá ====
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const openDeleteConfirm = (id: number) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };
  const closeDeleteConfirm = () => {
    setConfirmOpen(false);
    setPendingDeleteId(null);
  };

  /* ========== Fetch danh sách tháng (on mount) ========== */
  useEffect(() => {
    let cancel = false;
    (async () => {
      setMetaErr("");
      try {
        const res = await axios.get<MonthlyCategory[]>(API_MONTHLY, { validateStatus: () => true });
        if (cancel) return;
        if (res.status >= 200 && res.status < 300) {
          const mset = Array.from(new Set((res.data || []).map((x) => x.month).filter(Boolean)));
          setMonths(mset);
          const initial = mset[0] || "";
          setSelectedMonth((prev) => prev || initial);
          setForm((f) => ({ ...f, month: f.month || initial }));
        } else {
          setMetaErr(`Không tải được danh sách tháng (${res.status}).`);
        }
      } catch {
        setMetaErr("Không thể kết nối API monthlyCategories.");
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  /* ========== Fetch danh mục theo tháng (nhiều schema) ========== */
  useEffect(() => {
    if (!selectedMonth) return;
    let cancel = false;

    const norm = (v: any) => (v ?? "").toString().trim().toLowerCase();
    const toNames = (arr: any[]): string[] =>
      (arr || [])
        .map((c: any) => (typeof c === "string" ? c : c?.name))
        .filter((x: any) => typeof x === "string" && x.trim())
        .map((x: string) => x.trim());
    const uniq = (xs: string[]) => Array.from(new Set(xs));

    const fetchCategories = async () => {
      setMetaErr("");
      try {
        const sel = norm(selectedMonth);

        // A) monthlyCategories?month=selectedMonth
        const resA = await axios.get<MonthlyCategory[]>(API_MONTHLY, {
          params: { month: selectedMonth },
          validateStatus: () => true,
        });
        if (cancel) return;

        if (resA.status >= 200 && resA.status < 300 && Array.isArray(resA.data)) {
          const matches = resA.data.filter((x) => norm(x.month) === sel);
          const mergedA = uniq(matches.flatMap((m) => (Array.isArray(m.categories) ? toNames(m.categories as any[]) : [])));
          if (mergedA.length > 0) {
            setCategoryOptions(mergedA);
            setForm((f) => ({ ...f, category: mergedA.includes(f.category) ? f.category : "" }));
            return;
          }
        }

        // B) categories?month=selectedMonth
        const resB = await axios.get<any[]>(API_CATEGORIES, {
          params: { month: selectedMonth },
          validateStatus: () => true,
        });
        if (cancel) return;

        if (resB.status >= 200 && resB.status < 300 && Array.isArray(resB.data)) {
          const mergedB = uniq(resB.data.filter((c) => norm(c.month) === sel).flatMap((c) => toNames([c])));
          if (mergedB.length > 0) {
            setCategoryOptions(mergedB);
            setForm((f) => ({ ...f, category: mergedB.includes(f.category) ? f.category : "" }));
            return;
          }
        }

        // C) Liên kết qua id
        const resMonth = await axios.get<MonthlyCategory[]>(API_MONTHLY, {
          params: { month: selectedMonth },
          validateStatus: () => true,
        });
        if (cancel) return;

        if (resMonth.status >= 200 && resMonth.status < 300 && Array.isArray(resMonth.data)) {
          const matches = resMonth.data.filter((x) => norm(x.month) === sel && x.id != null);
          const ids = matches.map((m) => m.id);

          const tryKey = async (key: "monthlyCategoryId" | "monthId") => {
            const allNames: string[] = [];
            for (const id of ids) {
              const r = await axios.get<any[]>(API_CATEGORIES, {
                params: { [key]: id },
                validateStatus: () => true,
              });
              if (r.status >= 200 && r.status < 300 && Array.isArray(r.data)) {
                allNames.push(...toNames(r.data));
              }
            }
            const merged = uniq(allNames);
            if (merged.length > 0) {
              setCategoryOptions(merged);
              setForm((f) => ({ ...f, category: merged.includes(f.category) ? f.category : "" }));
              return true;
            }
            return false;
          };

          if (await tryKey("monthlyCategoryId")) return;
          if (await tryKey("monthId")) return;
        }

        setCategoryOptions([]);
        setForm((f) => ({ ...f, category: "" }));
        setMetaErr(
          "Không tìm thấy danh mục cho tháng đã chọn. Hãy kiểm tra lại giá trị 'month' giữa /monthlyCategories và /categories."
        );
      } catch {
        setCategoryOptions([]);
        setForm((f) => ({ ...f, category: "" }));
        setMetaErr("Lỗi mạng khi lấy danh mục. Kiểm tra JSON-Server & URL.");
      }
    };

    fetchCategories();
    return () => {
      cancel = true;
    };
  }, [selectedMonth]);

  /* ========== Fetch transactions (client-side paging/sort/search) ========== */
  useEffect(() => {
    if (!selectedMonth) return;
    let cancel = false;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const params: Record<string, any> = {
          month: selectedMonth,
          q: searchTerm || undefined,
        };
        const res = await axios.get<Txn[]>(API_TXN, { params, validateStatus: () => true });
        if (cancel) return;
        if (res.status >= 200 && res.status < 300) {
          let data = res.data || [];
          if (searchTerm) {
            const term = searchTerm.toLowerCase();
            data = data.filter(
              (item) => item.category.toLowerCase().includes(term) || item.note.toLowerCase().includes(term)
            );
          }
          if (sortOrder === "asc") data = [...data].sort((a, b) => a.amount - b.amount);
          else if (sortOrder === "desc") data = [...data].sort((a, b) => b.amount - a.amount);

          const total = data.length;
          setTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)));
          const paged = data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
          setItems(paged);
        } else {
          setErr(`Lỗi tải dữ liệu (${res.status}).`);
        }
      } catch {
        setErr("Không thể kết nối server (transaction).");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [page, searchTerm, sortOrder, selectedMonth]);

  /* ========== Validate & Submit ========== */
  const validate = () => {
    const next: typeof errors = {};
    if (!form.month.trim()) next.month = "Vui lòng chọn tháng.";
    if (!form.category.trim()) next.category = "Vui lòng chọn danh mục.";
    if (!form.amount.trim()) next.amount = "Vui lòng nhập số tiền.";
    else if (Number.isNaN(Number(form.amount)) || Number(form.amount) <= 0) next.amount = "Số tiền phải là số dương.";
    if (!form.note.trim()) next.note = "Vui lòng nhập ghi chú.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const payload: Txn = {
        category: form.category.trim(),
        amount: Math.floor(Number(form.amount)),
        note: form.note.trim(),
        month: form.month.trim(),
        type: form.type,
      };
      const res = await axios.post(API_TXN, payload, { validateStatus: () => true });
      if (res.status >= 200 && res.status < 300) {
        setForm((f) => ({ ...f, amount: "", note: "" }));
        setErrors({});
        setPage(1);

        // refresh trang 1
        const rf = await axios.get<Txn[]>(API_TXN, {
          params: {
            _page: 1,
            _limit: PAGE_SIZE,
            month: selectedMonth,
            q: searchTerm || undefined,
            _sort: sortOrder === "none" ? undefined : "amount",
            _order: sortOrder === "none" ? undefined : sortOrder,
          },
          validateStatus: () => true,
        });
        setItems(rf.data || []);
        const total = Number(rf.headers["x-total-count"] || 0);
        setTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)));
      } else {
        // Thay alert bằng hiển thị lỗi inline
        setErr("Thêm giao dịch thất bại.");
      }
    } catch {
      setErr("Không thể kết nối server khi thêm giao dịch.");
    }
  };

  /* ========== Delete ========== */
  const confirmDelete = async () => {
    if (pendingDeleteId == null) return;
    try {
      const res = await axios.delete(`${API_TXN}/${pendingDeleteId}`, { validateStatus: () => true });
      if (res.status >= 200 && res.status < 300) {
        // refresh list hiện tại
        const rf = await axios.get<Txn[]>(API_TXN, {
          params: {
            _page: page,
            _limit: PAGE_SIZE,
            month: selectedMonth,
            q: searchTerm || undefined,
            _sort: sortOrder === "none" ? undefined : "amount",
            _order: sortOrder === "none" ? undefined : sortOrder,
          },
          validateStatus: () => true,
        });
        setItems(rf.data || []);
        const total = Number(rf.headers["x-total-count"] || 0);
        const newTotalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
        setTotalPages(newTotalPages);
        if (page > newTotalPages) setPage(newTotalPages);
      } else {
        setErr("Xoá thất bại.");
      }
    } catch {
      setErr("Không thể kết nối server khi xoá.");
    } finally {
      closeDeleteConfirm();
    }
  };

  const subtotal = useMemo(() => items.reduce((s, t) => s + (t.amount || 0), 0), [items]);

  /* ===================== UI ===================== */
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-indigo-600 text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <span>📒</span>
            <span>Tài Chính Cá Nhân K24_Rikkei</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleLogout} className="flex items-center gap-1 text-sm hover:text-indigo-200">
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="col-span-12 lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <nav className="p-2">
                <SidebarNavLink to="/user/home" icon="ℹ️">Information</SidebarNavLink>
                <SidebarNavLink to="/user/category" icon="📊">Category</SidebarNavLink>
                <SidebarNavLink to="/user/history" icon="🕐">History</SidebarNavLink>
              </nav>
            </div>
          </aside>

          {/* Main */}
          <div className="col-span-12 lg:col-span-10 space-y-6">
            {/* Banner */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📊</span>
                <div>
                  <h2 className="text-xl font-semibold">Kiểm soát chi tiêu thông minh</h2>
                  <p className="text-indigo-100 text-sm mt-1">Theo dõi ngân sách và chi tiêu hàng tháng dễ dàng</p>
                </div>
              </div>
            </div>

            {/* Chọn tháng */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <span className="text-pink-500 text-xl">🗓️</span>
                <span className="text-gray-700 font-medium">Chọn tháng:</span>
                <div className="relative">
                  <select
                    value={selectedMonth}
                    onChange={(e) => {
                      const m = e.target.value;
                      setSelectedMonth(m);
                      setForm((f) => ({ ...f, month: m }));
                    }}
                    className="appearance-none border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {months.length === 0 && <option value="">(Không có tháng)</option>}
                    {months.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">📅</span>
                </div>
              </div>
              {metaErr && <p className="text-center text-sm text-red-600 mt-3">{metaErr}</p>}
            </div>

            {/* FORM Thêm giao dịch */}
            <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                  {/* Số tiền */}
                  <div className="md:col-span-3">
                    <input
                      type="number"
                      min={1}
                      value={form.amount}
                      onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                      className={`w-full h-11 rounded-lg px-4 border ${
                        errors.amount ? "border-red-500" : "border-gray-300"
                      } shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      placeholder="Số tiền"
                    />
                    {errors.amount && <p className="text-xs text-red-600 mt-1">{errors.amount}</p>}
                  </div>

                  {/* Danh mục */}
                  <div className="md:col-span-4">
                    <select
                      value={form.category}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      className={`w-full h-11 rounded-lg px-4 border ${
                        errors.category ? "border-red-500" : "border-gray-300"
                      } shadow-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      disabled={categoryOptions.length === 0}
                    >
                      <option value="">{categoryOptions.length ? "Tiền chi tiêu" : "(Không có danh mục)"}</option>
                      {categoryOptions.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    {errors.category && <p className="text-xs text-red-600 mt-1">{errors.category}</p>}
                    {categoryOptions.length === 0 && !errors.category && (
                      <p className="text-xs text-amber-600 mt-1">Chưa có danh mục cho tháng này.</p>
                    )}
                  </div>

                  {/* Ghi chú */}
                  <div className="md:col-span-4">
                    <input
                      type="text"
                      value={form.note}
                      onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                      className={`w-full h-11 rounded-lg px-4 border ${
                        errors.note ? "border-red-500" : "border-gray-300"
                      } shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      placeholder="Ghi chú"
                    />
                    {errors.note && <p className="text-xs text-red-600 mt-1">{errors.note}</p>}
                  </div>

                  {/* Nút Thêm */}
                  <div className="md:col-span-1 flex">
                    <button
                      type="submit"
                      className="w-full h-11 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition shadow"
                    >
                      Thêm
                    </button>
                  </div>
                </div>
                <input type="hidden" value={form.month} readOnly />
              </form>
            </div>

            {/* Tìm kiếm & Sắp xếp */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex flex-col md:flex-row items-center gap-3 mb-6">
                <div className="ml-auto flex gap-2 w-full md:w-auto">
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as any)}
                    className="border border-gray-300 rounded px-4 py-2 text-sm"
                  >
                    <option value="none">Sắp xếp theo giá</option>
                    <option value="asc">Giá tăng dần</option>
                    <option value="desc">Giá giảm dần</option>
                  </select>
                  <div className="relative flex-1 md:w-72">
                    <input
                      type="text"
                      placeholder="Tìm theo danh mục/ghi chú"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full border border-gray-300 rounded px-4 py-2 pr-10 text-sm"
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white p-1.5 rounded hover:bg-indigo-700"
                      title="Tìm"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Bảng lịch sử */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">#</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tháng</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Danh mục</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Số tiền</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ghi chú</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td className="px-4 py-4 text-sm text-gray-500" colSpan={6}>
                          Đang tải…
                        </td>
                      </tr>
                    ) : items.length === 0 ? (
                      <tr>
                        <td className="px-4 py-4 text-sm text-gray-500" colSpan={6}>
                          Không có giao dịch.
                        </td>
                      </tr>
                    ) : (
                      items.map((t, idx) => (
                        <tr key={t.id} className="border-b hover:bg-gray-50 transition">
                          <td className="px-4 py-4 text-sm text-gray-700">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                          <td className="px-4 py-4 text-sm text-gray-700">{t.month}</td>
                          <td className="px-4 py-4 text-sm text-gray-700">{t.category}</td>
                          <td className="px-4 py-4 text-sm text-gray-700">{formatVND(t.amount)}</td>
                          <td className="px-4 py-4 text-sm text-gray-700">{t.note}</td>
                          <td className="px-4 py-4">
                            <button
                              onClick={() => t.id && openDeleteConfirm(t.id)}
                              className="text-gray-400 hover:text-red-500 transition"
                              title="Xoá"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {!loading && items.length > 0 && (
                    <tfoot>
                      <tr>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-700" colSpan={3}>
                          Tổng (trang hiện tại)
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-700">{formatVND(subtotal)}</td>
                        <td colSpan={2}></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

              {/* Phân trang */}
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 hover:bg-gray-100 rounded transition disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>

                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`px-4 py-2 rounded transition ${
                      page === i + 1 ? "bg-indigo-600 text-white" : "hover:bg-gray-100"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-2 hover:bg-gray-100 rounded transition disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {err && <p className="text-center text-sm text-red-600 mt-4">{err}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* ===== Modal Xác nhận Xoá (thay confirm/alert) ===== */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/30" onClick={closeDeleteConfirm} />
          {/* card */}
          <div className="relative z-10 w-[92%] max-w-md rounded-xl bg-white shadow-lg">
            <div className="px-5 pt-5">
              <h3 className="text-[15px] font-semibold text-gray-800">Xác nhận</h3>
              <p className="mt-2 mb-4 text-sm text-gray-600">
                Bạn có chắc chắn muốn xoá giao dịch này khỏi hệ thống không?
              </p>
            </div>
            <div className="h-px bg-gray-100" />
            <div className="flex items-center justify-end gap-3 px-5 py-3">
              <button
                onClick={closeDeleteConfirm}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
