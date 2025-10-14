import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import axios from "axios";

/* ====== API ====== */
const API_USERS = "http://localhost:8080/users";
const API_MONTHLY = "http://localhost:8080/monthlyCategories";

type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  gender: "Male" | "Female" | "Other" ;
  password?: string;
};

export default function HomeUser() {
  const nav = useNavigate();
  /* ====== UI state ====== */
 const [month, setMonth] = useState("2025-10");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  /* ====== user from API ====== */
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadErr, setLoadErr] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoadingUser(true);
      setLoadErr("");
      try {
        const raw = localStorage.getItem("auth_user");
        let id: number | null = null;
        try {
          id = raw ? JSON.parse(raw)?.id ?? null : null;
        } catch {}

        if (id) {
          const res = await axios.get<User>(`${API_USERS}/${id}`);
          if (!mounted) return;
          setUser(res.data);
        } else {
          const res = await axios.get<User[]>(API_USERS);
          if (!mounted) return;
          setUser(res.data?.[0] ?? null);
        }
      } catch (e) {
        setLoadErr("Không tải được người dùng từ API /users.");
      } finally {
        if (mounted) setLoadingUser(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);
//hien thi so tien 


useEffect(() => {
  async function fetchMonthlyAmount() {
    if (!user?.id || !month) {
      setSavedAmount(null);
      return;
    }
    try {
      const res = await axios.get(API_MONTHLY, { params: { userId: user.id, month } });
      if (Array.isArray(res.data) && res.data.length > 0) {
        setSavedAmount(Number(res.data[0].amount));
        setAmount(String(res.data[0].amount)); // nếu muốn tự động điền vào ô input
      } else {
        setSavedAmount(null);
        setAmount(""); // nếu muốn xóa ô input khi chưa có dữ liệu
      }
    } catch {
      setSavedAmount(null);
    }
  }
  fetchMonthlyAmount();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [month, user?.id]);
  /* ====== password edit local state ====== */
  const [passwords, setPasswords] = useState({ oldPass: "", newPass: "", confirmPass: "" });

  /* ====== modal flags ====== */
  const [editMode, setEditMode] = useState(false);
  const [editPass, setEditPass] = useState(false);

  /* ====== actions ====== */

  const handleSaveBudget = async () => {
    setError("");
    if (!month || !amount) {
      setError("Vui lòng nhập đầy đủ tháng và số tiền!");
      return;
    }
    if (!user?.id) {
      setError("Chưa có người dùng.");
      return;
    }

    const payload = { userId: user.id, month, amount: Number(amount) };

    try {
      const found = await axios.get(API_MONTHLY, { params: { userId: user.id, month } });
      if (Array.isArray(found.data) && found.data.length > 0) {
        const rec = found.data[0];
        await axios.patch(`${API_MONTHLY}/${rec.id}`, { amount: Number(amount), updatedAt: new Date().toISOString() });
      } else {
        await axios.post(API_MONTHLY, payload);
      }
      setError("");
      alert("Đã lưu ngân sách tháng!");
    } catch (err) {
      setError("Lỗi khi lưu dữ liệu ngân sách!");
    }
  };

  const handleSaveInfo = async () => {
    if (!user) return;
    if (!user.name?.trim() || !user.email?.trim() || !user.phone?.trim()) {
      alert("Vui lòng nhập đủ Name, Email, Phone.");
      return;
    }
    try {
      await axios.put(`${API_USERS}/${user.id}`, user);
      alert("Cập nhật thông tin thành công!");
      setEditMode(false);
    } catch {
      alert("Không cập nhật được.");
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;
    const { oldPass, newPass, confirmPass } = passwords;
    if (!oldPass || !newPass || !confirmPass) {
      alert("Vui lòng nhập đầy đủ mật khẩu.");
      return;
    }
    if (newPass !== confirmPass) {
      alert("Xác nhận mật khẩu không khớp.");
      return;
    }

    try {
      const fresh = await axios.get<User>(`${API_USERS}/${user.id}`);
      if (fresh.data.password && fresh.data.password !== oldPass) {
        alert("Mật khẩu hiện tại không đúng.");
        return;
      }

      await axios.patch(`${API_USERS}/${user.id}`, { password: newPass });
      alert("Đổi mật khẩu thành công!");
      setEditPass(false);
      setPasswords({ oldPass: "", newPass: "", confirmPass: "" });
    } catch {
      alert("Không đổi được mật khẩu.");
    }
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm("Bạn có chắc muốn đăng xuất không?");
    if (confirmLogout) {
      localStorage.removeItem("auth_user");
      nav("/user/login");
    }
  };


const [savedAmount, setSavedAmount] = useState<number | null>(null);
useEffect(() => {
  async function fetchMonthlyAmount() {
    if (!user?.id || !month) {
      setSavedAmount(null);
      return;
    }
    try {
      const res = await axios.get(API_MONTHLY, { params: { userId: user.id, month } });
      if (Array.isArray(res.data) && res.data.length > 0) {
        setSavedAmount(Number(res.data[0].amount));
        setAmount(String(res.data[0].amount)); // nếu muốn tự động điền vào ô input
      } else {
        setSavedAmount(null);
        setAmount(""); // nếu muốn xóa ô input khi chưa có dữ liệu
      }
    } catch {
      setSavedAmount(null);
    }
  }
  fetchMonthlyAmount();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [month, user?.id]);
  return (
    <div className="min-h-screen bg-gray-100">
      {/* HEADER */}
      <header className="bg-indigo-600 text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <span>📒</span>
            <span>Tài Chính Cá Nhân K24_Rikkei</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-1 text-sm hover:text-indigo-200"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      {/* BODY */}
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="col-span-12 lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <nav className="p-2">
                <SidebarNavLink to="/user/home" icon="ℹ️">
                  Information
                </SidebarNavLink>
                <SidebarNavLink to="/user/category" icon="📊">
                  Category
                </SidebarNavLink>
                <SidebarNavLink to="/user/history" icon="🕐">
                  History
                </SidebarNavLink>
              </nav>
            </div>
          </aside>

          {/* Main */}
          <main className="col-span-12 lg:col-span-10 space-y-5">
            {/* Banner */}
            <section className="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 px-8 py-6 text-white shadow-lg">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🧠</span>
                <div>
                  <h2 className="text-xl font-semibold">Kiểm soát chi tiêu thông minh</h2>
                  <p className="mt-1 text-sm text-indigo-100">Theo dõi ngân sách và thu chi hằng tháng dễ dàng</p>
                </div>
              </div>
            </section>

            {/* Title */}
            <h2 className="text-center text-2xl font-bold text-indigo-600">
              📊 Quản Lý Tài Chính Cá Nhân
            </h2>

            {/* Remaining Balance */}
             <div className="rounded-xl bg-white p-6 text-center shadow">
              <p className="text-sm text-gray-500 mb-1">Số tiền còn lại</p>
              <p className="text-3xl font-bold text-emerald-500">
                {savedAmount !== null
                  ? new Intl.NumberFormat("vi-VN").format(savedAmount)
                  : "Chưa có dữ liệu"}
              </p>
            </div>

            {/* Month Selector */}
            <div className="rounded-xl bg-white p-5 shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span>📅</span>
                  <span className="font-medium">Chọn tháng</span>
                </div>
                <input
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>

            {/* Budget Input */}
            <div className="rounded-xl bg-white p-5 shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span>💰</span>
                  <span className="font-medium">Ngân sách tháng:</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                    placeholder="VĐ: 5000000"
                    className="w-48 rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                  <button 
                    onClick={handleSaveBudget}
                    className="rounded-md bg-blue-500 px-5 py-2 text-sm font-medium text-white hover:bg-blue-600 shadow"
                  >
                    Lưu
                  </button>
                </div>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            {/* User Information */}
            <div className="rounded-xl bg-white p-6 shadow">
              <h3 className="text-center text-xl font-bold text-indigo-600 mb-6">
                Quản Lý Thông tin cá nhân
              </h3>

              {loadingUser ? (
                <div className="text-center text-sm text-gray-500 py-6">Đang tải...</div>
              ) : loadErr ? (
                <div className="text-center text-sm text-red-500 py-6">{loadErr}</div>
              ) : !user ? (
                <div className="text-center text-sm text-gray-500 py-6">Không có người dùng.</div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <Field label="Name" required>
                      <input value={user.name} className="input" disabled />
                    </Field>
                    <Field label="Email" required>
                      <input value={user.email} className="input" disabled />
                    </Field>
                    <Field label="Phone" required>
                      <input value={user.phone} className="input" disabled />
                    </Field>
                    <Field label="Gender" required>
                      <input value={user.gender} className="input" disabled />
                    </Field>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <button
                      onClick={() => setEditMode(true)}
                      className="border-2 border-indigo-600 text-indigo-600 px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-50 transition"
                    >
                      Change Information
                    </button>
                    <button
                      onClick={() => setEditPass(true)}
                      className="border-2 border-indigo-600 text-indigo-600 px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-50 transition"
                    >
                      Change Password
                    </button>
                  </div>
                </>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Modal edit info */}
      {editMode && user && (
        <Modal title="Change Information" onCancel={() => setEditMode(false)}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Name" required>
              <input
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Email" required>
              <input
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Phone" required>
              <input
                value={user.phone}
                onChange={(e) => setUser({ ...user, phone: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Gender" required>
              <select
                value={user.gender}
                onChange={(e) => setUser({ ...user, gender: e.target.value as User["gender"] })}
                className="input"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </Field>
          </div>
          <div className="flex justify-end mt-4 gap-2">
            <button onClick={() => setEditMode(false)} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100">
              Cancel
            </button>
            <button onClick={handleSaveInfo} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
              Save
            </button>
          </div>
        </Modal>
      )}

      {/* Modal password */}
      {editPass && user && (
        <Modal title="Change Password" onCancel={() => setEditPass(false)}>
          <Field label="Old Password" required>
            <input
              type="password"
              value={passwords.oldPass}
              onChange={(e) => setPasswords({ ...passwords, oldPass: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="New Password" required>
            <input
              type="password"
              value={passwords.newPass}
              onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Confirm New Password" required>
            <input
              type="password"
              value={passwords.confirmPass}
              onChange={(e) => setPasswords({ ...passwords, confirmPass: e.target.value })}
              className="input"
            />
          </Field>
          <div className="flex justify-end mt-4 gap-2">
            <button onClick={() => setEditPass(false)} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100">
              Cancel
            </button>
            <button onClick={handleChangePassword} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
              Save
            </button>
          </div>
        </Modal>
      )}

      <style>{`
        .input { 
          width: 100%; 
          border-radius: 0.375rem; 
          border: 1px solid #d1d5db; 
          padding: 0.5rem 0.75rem; 
          font-size: 0.875rem;
          background: white;
        }
        .input:focus {
          outline: none;
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }
        .input:disabled {
          background-color: #f9fafb;
          color: #6b7280;
        }
      `}</style>
    </div>
  );
}

function SidebarNavLink({ 
  to, 
  children, 
  icon 
}: { 
  to: string; 
  children: React.ReactNode; 
  icon?: string;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm font-medium mb-1 transition ${
          isActive 
            ? "bg-indigo-600 text-white" 
            : "text-gray-700 hover:bg-gray-100"
        }`
      }
    >
      {icon && <span>{icon}</span>}
      {children}
    </NavLink>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 inline-flex items-center gap-1 font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

function Modal({ title, onCancel, children }: { title: string; onCancel: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}