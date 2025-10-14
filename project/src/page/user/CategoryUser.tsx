import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { NavLink } from "react-router-dom";

/* ===================== Types ===================== */
type UserCategory = {
  id: number;
  name: string;
  amount: number;
};

type ServerCategory = {
  id: number;
  name: string;
  image?: string;
  active?: boolean;
};

type MonthlyDoc = {
  id: number;
  userId: number;
  month: string; // "yyyy-mm"
  amount: number;
  categories: Array<{
    id: number;
    name: string;
    amount: number;
  }>;
};

/* ===================== Constants & Helpers ===================== */
const CATE_API = "http://localhost:8080/category";
const MONTHLY_API = "http://localhost:8080/monthlyCategories";
const STORAGE_KEY = (month: string) => `fm_user_categories_${month}`;
const formatVND = (n: number) => new Intl.NumberFormat("vi-VN").format(n) + " VND";

// Lấy userId từ localStorage
const getCurrentUserId = (): number | null => {
  try {
    const raw = localStorage.getItem("auth_user");
    return raw ? (JSON.parse(raw)?.id ?? null) : null;
  } catch {
    return null;
  }
};

// Tìm (hoặc tạo) monthlyDoc theo userId + month
const fetchOrCreateMonthlyDoc = async (
  userId: number,
  month: string,
  fallbackAmount = 0
): Promise<MonthlyDoc> => {
  const res = await axios.get<MonthlyDoc[]>(MONTHLY_API, {
    params: { userId, month, _limit: 1 },
  });
  if (Array.isArray(res.data) && res.data.length > 0) return res.data[0];

  const createRes = await axios.post<MonthlyDoc>(MONTHLY_API, {
    userId,
    month,
    amount: fallbackAmount,
    categories: [],
  });
  return createRes.data;
};

const getMonthlyDocById = async (id: number) => {
  const res = await axios.get<MonthlyDoc>(`${MONTHLY_API}/${id}`);
  return res.data;
};

const putMonthlyDocCategories = async (doc: MonthlyDoc, nextCats: MonthlyDoc["categories"]) => {
  const payload: MonthlyDoc = { ...doc, categories: nextCats };
  await axios.put(`${MONTHLY_API}/${doc.id}`, payload, {
    headers: { "Content-Type": "application/json" },
  });
};

/* ===================== Component ===================== */
export default function CategoryUser() {
  /* ======= Month Scope ======= */
  const [selectedMonth, setSelectedMonth] = useState(() =>
    new Date().toISOString().slice(0, 7)
  ); // yyyy-mm

  /* ======= Month Amount từ server ======= */
  const [monthlyAmount, setMonthlyAmount] = useState<number | null>(null);
  useEffect(() => {
    (async () => {
      try {
        const userId = getCurrentUserId();
        if (!userId) {
          setMonthlyAmount(null);
          return;
        }
        const res = await axios.get<MonthlyDoc[]>(MONTHLY_API, {
          params: { userId, month: selectedMonth, _limit: 1 },
        });
        if (Array.isArray(res.data) && res.data.length > 0) {
          setMonthlyAmount(Number(res.data[0].amount));
        } else {
          setMonthlyAmount(null);
        }
      } catch {
        setMonthlyAmount(null);
      }
    })();
  }, [selectedMonth]);

  /* ======= Server categories (đổ vào select) ======= */
  const [serverCats, setServerCats] = useState<ServerCategory[]>([]);
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setCatLoading(true);
        setCatError("");
        const res = await axios.get<ServerCategory[]>(CATE_API, {
          params: { _sort: "id", _order: "desc" },
        });
        const data = (res.data || []).filter((c) =>
          typeof c.active === "boolean" ? c.active : true
        );
        setServerCats(data);
      } catch {
        setCatError("Không tải được danh mục từ server. Kiểm tra JSON-Server (8080).");
        setServerCats([]);
      } finally {
        setCatLoading(false);
      }
    })();
  }, []);

  /* ======= User list state (per month, localStorage) ======= */
  const [categories, setCategories] = useState<UserCategory[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY(selectedMonth));
    if (!raw) {
      const seed: UserCategory[] = [];
      setCategories(seed);
      localStorage.setItem(STORAGE_KEY(selectedMonth), JSON.stringify(seed));
    } else {
      try {
        setCategories(JSON.parse(raw) as UserCategory[]);
      } catch {
        setCategories([]);
      }
    }
  }, [selectedMonth]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY(selectedMonth), JSON.stringify(categories));
  }, [categories, selectedMonth]);

  /* ======= Add Form State ======= */
  const [categoryName, setCategoryName] = useState("");
  const [categoryAmount, setCategoryAmount] = useState("");
  const addDisabled = useMemo(
    () => !categoryName.trim() || !categoryAmount.trim() || Number(categoryAmount) <= 0,
    [categoryName, categoryAmount]
  );

  // Thêm & đồng bộ server
  const addCategory = async () => {
    if (addDisabled) return;

    const newItem: UserCategory = {
      id: Date.now(),
      name: categoryName.trim(),
      amount: Number(categoryAmount),
    };

    // Optimistic UI
    setCategories((prev) => [newItem, ...prev]);
    setCategoryName("");
    setCategoryAmount("");

    // Sync server
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        console.warn("Chưa đăng nhập -> bỏ qua đồng bộ server");
        return;
      }

      const baseDoc = await fetchOrCreateMonthlyDoc(
        userId,
        selectedMonth,
        monthlyAmount ?? 0
      );

      const freshDoc = await getMonthlyDocById(baseDoc.id);
      const currentCats = Array.isArray(freshDoc.categories) ? freshDoc.categories : [];

      const nextCats = [
        { id: newItem.id, name: newItem.name, amount: newItem.amount },
        ...currentCats,
      ];

      await putMonthlyDocCategories(freshDoc, nextCats);
    } catch (err) {
      console.error("Không thể cập nhật monthlyCategories:", err);
      // Có thể rollback nếu muốn
      // setCategories((prev) => prev.filter((c) => c.id !== newItem.id));
      // (Yêu cầu của bạn chỉ thay confirm khi xoá, nên giữ nguyên chỗ này)
    }
  };

  /* ======= Edit Modal State ======= */
  const [editOpen, setEditOpen] = useState(false);
  const [editing, setEditing] = useState<UserCategory | null>(null);
  const [editName, setEditName] = useState("");
  const [editAmount, setEditAmount] = useState("");

  const openEdit = (c: UserCategory) => {
    setEditing(c);
    setEditName(c.name);
    setEditAmount(String(c.amount));
    setEditOpen(true);
  };

  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    if (!editName.trim() || !editAmount.trim() || Number(editAmount) <= 0) {
      // có thể đổi thành inline error nếu cần
      return;
    }
    setCategories((prev) =>
      prev.map((x) =>
        x.id === editing.id ? { ...x, name: editName.trim(), amount: Number(editAmount) } : x
      )
    );
    setEditOpen(false);
  };

  /* ======= DELETE CONFIRM MODAL (thay window.confirm) ======= */
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
  const confirmDelete = () => {
    if (pendingDeleteId == null) return;
    setCategories((prev) => prev.filter((c) => c.id !== pendingDeleteId));
    // Nếu cần sync xoá lên server: fetch doc -> lọc mảng -> PUT lại.
    closeDeleteConfirm();
  };

  /* ======= Logout (giữ nguyên confirm mặc định nếu bạn muốn) ======= */
  const handleLogout = () => {
    if (window.confirm("Bạn có chắc muốn đăng xuất?")) {
      localStorage.removeItem("auth_user");
      window.location.href = "/user/login";
    }
  };

  /* ======= Sidebar NavLink ======= */
  const SidebarNavLink = ({
    to,
    icon,
    children,
  }: {
    to: string;
    icon: string;
    children: React.ReactNode;
  }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
          isActive
            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
            : "text-gray-700 hover:bg-gray-100"
        }`
      }
    >
      <span className="text-lg">{icon}</span>
      <span>{children}</span>
    </NavLink>
  );

  /* ======= Derived ======= */
  const totalBudget = useMemo(
    () => categories.reduce((s, c) => s + c.amount, 0),
    [categories]
  );

  /* ===================== UI ===================== */
  return (
    <div className="min-h-screen bg-gray-50">
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

      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="flex max-w-7xl mx-auto">
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
          <main className="flex-1 p-6 space-y-6">
            {/* Banner */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🧠</span>
                <div>
                  <h2 className="text-lg font-semibold mb-1">Kiểm soát chi tiêu thông minh</h2>
                  <p className="text-white/90 text-sm">Theo dõi ngân sách và thu chi hằng tháng dễ dàng</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">📊</span>
                <h3 className="text-xl font-bold text-indigo-600">Quản Lý Tài Chính Cá Nhân</h3>
              </div>
              <div className="text-center py-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-2">Tổng hạn mức danh mục trong tháng</p>
                {monthlyAmount !== null ? (
                  <p className="text-3xl font-bold text-emerald-500">{formatVND(monthlyAmount)}</p>
                ) : (
                  <p className="text-sm text-gray-500">Chưa có hạn mức tháng này</p>
                )}
              </div>
            </div>

            {/* Month Selector */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <span className="text-xl">📅</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Chọn tháng</span>
                </div>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-medium"
                />
              </div>
            </div>

            {/* Category Management */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">📁</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Quản lý danh mục (Theo tháng)</h3>
              </div>

              {catError && (
                <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                  {catError}
                </div>
              )}

              {/* Add Category Form */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 mb-6 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <select
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    disabled={catLoading || serverCats.length === 0}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="">
                      {catLoading ? "Đang tải danh mục..." : "Tên danh mục"}
                    </option>
                    {serverCats.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Giới hạn (VNĐ)"
                    value={categoryAmount}
                    onChange={(e) => setCategoryAmount(e.target.value.replace(/\D/g, ""))}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white"
                  />

                  <button
                    onClick={addCategory}
                    disabled={addDisabled || catLoading || serverCats.length === 0}
                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium text-sm shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    Thêm danh mục
                  </button>
                </div>
              </div>

              {/* Category Grid */}
              {categories.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">$</span>
                  </div>
                  <p className="text-gray-500 font-medium">Chưa có danh mục nào</p>
                  <p className="text-sm text-gray-400 mt-1">Thêm danh mục để bắt đầu quản lý</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="relative rounded-xl border border-gray-200 bg-white p-3 shadow-sm hover:shadow transition"
                    >
                      {/* nút X xoá mở modal xác nhận */}
                      <button
                        onClick={() => openDeleteConfirm(category.id)}
                        className="absolute right-2 top-2 h-5 w-5 rounded-full text-gray-500 hover:bg-gray-100 hover:text-red-600 leading-none"
                        title="Xóa danh mục"
                      >
                        ×
                      </button>

                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-md border border-gray-300 text-2xl text-gray-800">
                          $
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900 truncate">{category.name}</span>

                            <button
                              onClick={() => openEdit(category)}
                              className="text-gray-400 hover:text-gray-600"
                              title="Sửa danh mục"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M14.06 6.19l3.75 3.75" stroke="currentColor" strokeWidth="1.5" />
                              </svg>
                            </button>
                          </div>

                          <div className="mt-1 text-xs text-gray-400">{formatVND(category.amount)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>

        {/* ======= EDIT MODAL ======= */}
        {editOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-3">
            <form
              onSubmit={saveEdit}
              className="w-full max-w-md rounded-xl bg-white shadow-md p-5 space-y-4 ring-1 ring-gray-200"
            >
              <h3 className="text-lg font-semibold">Sửa danh mục</h3>

              <div className="space-y-1">
                <label className="text-sm font-medium">Tên danh mục</label>
                <select
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {!serverCats.some((c) => c.name === editName) && editName && (
                    <option value={editName}>{editName}</option>
                  )}
                  {serverCats.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Giới hạn (VNĐ)</label>
                <input
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value.replace(/\D/g, ""))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nhập số tiền..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="rounded-md px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-md px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ======= DELETE CONFIRM MODAL ======= */}
        {confirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* backdrop */}
            <div className="absolute inset-0 bg-black/30" onClick={closeDeleteConfirm} />
            {/* card */}
            <div className="relative z-10 w-[92%] max-w-md rounded-xl bg-white shadow-lg">
              <div className="px-5 pt-5">
                <h3 className="text-[15px] font-semibold text-gray-800">Xác nhận</h3>
                <p className="mt-2 mb-4 text-sm text-gray-600">
                  Bạn có chắc chắn muốn xóa danh mục này khỏi hệ thống không?
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
    </div>
  );
}
