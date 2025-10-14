import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/common/navbar";
import Sidebar from "../../components/common/sidebar";

type Category = {
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
  categories: Array<{ id: number; name: string; amount: number }>;
};

const API_URL = "http://localhost:8080/category";
const MONTHLY_API = "http://localhost:8080/monthlyCategories";
const PAGE_SIZE = 3;

export default function CategoryPage() {
  // ====== Logout confirm ======
  const [confirmOpen, setConfirmOpen] = useState(false);

  // ====== Server-side list state ======
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // search + debounce
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setQuery(searchInput.trim()), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [query]);

  const fetchPage = async (p = page) => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get<Category[]>(API_URL, {
        params: {
          _page: p,
          _limit: PAGE_SIZE,
          q: query || undefined,
          _sort: "id",
          _order: "desc",
        },
      });
      const total = parseInt(res.headers["x-total-count"] ?? "0", 10);
      setItems(res.data ?? []);
      setTotalPages(Math.max(1, Math.ceil(total / PAGE_SIZE)));
    } catch {
      setError("Không tải được danh mục. Kiểm tra JSON-Server (8080) và dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, query]);

  // ====== Modal form state ======
  const [formOpen, setFormOpen] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [form, setForm] = useState<{ id?: number; name: string; image: string; active: boolean }>({
    name: "",
    image: "",
    active: true,
  });
  const [saving, setSaving] = useState(false);

  // upload
  const [fileName, setFileName] = useState<string>("");
  const [filePreview, setFilePreview] = useState<string>("");

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    const reader = new FileReader();
    reader.onload = () => {
      const dataURL = String(reader.result || "");
      setFilePreview(dataURL);
      setForm((s) => ({ ...s, image: dataURL }));
    };
    reader.readAsDataURL(f);
  };

  const removePickedFile = () => {
    setFileName("");
    setFilePreview("");
    setForm((s) => ({ ...s, image: "" }));
  };

  const openAdd = () => {
    setMode("add");
    setForm({ name: "", image: "", active: true });
    setFileName("");
    setFilePreview("");
    setFormOpen(true);
  };

  const openEdit = (c: Category) => {
    setMode("edit");
    setForm({ id: c.id, name: c.name ?? "", image: c.image ?? "", active: !!c.active });
    if (c.image && c.image.startsWith("data:image/")) {
      setFilePreview(c.image);
      setFileName("image.png");
    } else {
      setFilePreview("");
      setFileName("");
    }
    setFormOpen(true);
  };

  // ====== NEW: sync Category vừa tạo sang monthlyCategories.categories ======
  const seedCategoryIntoMonthlyDocs = async (created: Category) => {
    try {
      const res = await axios.get<MonthlyDoc[]>(MONTHLY_API);
      const docs = Array.isArray(res.data) ? res.data : [];

      // chạy tuần tự để đơn giản (JSON-Server an toàn)
      for (const doc of docs) {
        const current = Array.isArray(doc.categories) ? doc.categories : [];
        // nếu đã tồn tại theo tên thì bỏ qua (tránh trùng)
        const exists = current.some((c) => c.name === created.name);
        if (exists) continue;

        const nextCats = [
          { id: created.id, name: created.name, amount: 0 }, // amount khởi tạo 0
          ...current,
        ];

        const payload: MonthlyDoc = { ...doc, categories: nextCats };
        await axios.put(`${MONTHLY_API}/${doc.id}`, payload, {
          headers: { "Content-Type": "application/json" },
        });
      }
    } catch (err) {
      console.warn("Không thể seed sang monthlyCategories:", err);
      // Không chặn luồng chính; có thể thông báo nhẹ nếu cần
    }
  };

  const saveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alert("Vui lòng nhập tên danh mục");
      return;
    }
    setSaving(true);
    try {
      if (mode === "add") {
        const payload: Omit<Category, "id"> = {
          name: form.name.trim(),
          image: form.image?.trim() || "",
          active: form.active,
        };
        const { data: created } = await axios.post<Category>(API_URL, payload);

        // ➜ seed ngay vào /monthlyCategories[].categories
        await seedCategoryIntoMonthlyDocs(created);

        setFormOpen(false);
        setPage(1);
        await fetchPage(1);
      } else {
        const payload: Category = {
          id: form.id!,
          name: form.name.trim(),
          image: form.image?.trim() || "",
          active: form.active,
        };
        await axios.put(`${API_URL}/${payload.id}`, payload);
        setFormOpen(false);
        await fetchPage();
      }
    } catch {
      alert("Lưu thất bại. Kiểm tra server và dữ liệu.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (c: Category) => {
    const next = !c.active;
    try {
      setItems((prev) => prev.map((x) => (x.id === c.id ? { ...x, active: next } : x)));
      await axios.patch(`${API_URL}/${c.id}`, { active: next });
    } catch {
      setItems((prev) => prev.map((x) => (x.id === c.id ? { ...x, active: c.active } : x)));
      alert("Đổi trạng thái thất bại.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin");
    window.location.href = "/admin/login";
  };

  const renderImage = (value?: string) => {
    if (!value) return <span className="text-gray-400">—</span>;
    if (value.startsWith("data:image/")) {
      return <img src={value} alt="icon" className="h-6 w-6 object-cover rounded" />;
    }
    const isUrl = /^https?:\/\//i.test(value);
    if (isUrl) {
      return (
        <img
          src={value}
          alt="icon"
          className="h-6 w-6 object-contain rounded"
          onError={(e) => ((e.currentTarget.style.display = "none"))}
        />
      );
    }
    return <span className="text-xl leading-none">{value}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Navbar onLogout={() => setConfirmOpen(true)} />

      <div className="flex flex-1">
        <Sidebar onOpenLogout={() => setConfirmOpen(true)} />

        {/* MAIN */}
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between max-w-6xl mx-auto mb-6">
            <button
              onClick={openAdd}
              className="rounded-md bg-indigo-600 text-white text-sm px-4 py-2 hover:bg-indigo-700"
            >
              Add Category
            </button>

            <div className="relative">
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search here..."
                className="pl-3 pr-10 py-2 w-72 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M15.5 14h-.79l-.28-.27a6.471 6.471 0 001.48-5.34C15.37 5.59 13.28 3.5 10.75 3.5S6.13 5.59 6.13 8.13s2.09 4.63 4.62 4.63c1.61 0 3.06-.79 3.95-2.01l.27.28v.79l4.25 4.25 1.26-1.26L15.5 14zm-4.75 0a3.88 3.88 0 110-7.75 3.88 3.88 0 010 7.75z" />
              </svg>
            </div>
          </div>

          <div className="max-w-6xl mx-auto bg-white rounded-lg border border-gray-200">
            {error && (
              <div className="px-6 py-3 text-sm text-red-600 border-b border-gray-200 bg-red-50">{error}</div>
            )}

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-gray-500">
                    <th className="text-left px-6 py-3 w-16">STT</th>
                    <th className="text-left px-6 py-3">Name</th>
                    <th className="text-left px-6 py-3">Image</th>
                    <th className="text-left px-6 py-3">Status</th>
                    <th className="text-left px-6 py-3">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                        Đang tải...
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                        Không có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    items.map((c, idx) => (
                      <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-3">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                        <td className="px-6 py-3">{c.name}</td>
                        <td className="px-6 py-3">{renderImage(c.image)}</td>
                        <td className="px-6 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                              c.active
                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                                : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${c.active ? "bg-emerald-500" : "bg-rose-500"}`} />
                            {c.active ? "Active" : "InActive"}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEdit(c)}
                              className="rounded-md bg-amber-500 text-white px-3 py-1.5 text-xs hover:bg-amber-600"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => toggleActive(c)}
                              className={`rounded-md px-3 py-1.5 text-xs ${
                                c.active
                                  ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                  : "bg-green-500 text-white hover:bg-green-600"
                              }`}
                              title={c.active ? "Block" : "UnBlock"}
                            >
                              {c.active ? "Block" : "UnBlock"}
                            </button>
                            {/* no delete */}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-end gap-2 px-6 py-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="grid h-8 w-8 place-items-center rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                disabled={page <= 1}
              >
                ←
              </button>
              {Array.from({ length: totalPages }).map((_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`grid h-8 w-8 place-items-center rounded-md border text-sm font-medium ${
                      p === page
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="grid h-8 w-8 place-items-center rounded-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                disabled={page >= totalPages}
              >
                →
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Confirm logout */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 grid place-items-center">
          <div className="w-80 rounded-md bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-2">Xác nhận đăng xuất</h3>
            <p className="text-sm text-gray-600 mb-5">Bạn có chắc chắn muốn đăng xuất không?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmOpen(false)} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">
                Hủy
              </button>
              <button onClick={handleLogout} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {formOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-3">
          <form onSubmit={saveForm} className="w-full max-w-2xl rounded-lg bg-white shadow-xl ring-1 ring-black/5">
            {/* Header */}
            <div className="relative px-6 py-4 border-b">
              <h3 className="text-base font-semibold">Form Category</h3>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="absolute right-4 top-3.5 inline-grid h-8 w-8 place-items-center rounded hover:bg-gray-100"
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nhập tên danh mục..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Image</label>

                <label
                  htmlFor="file-input"
                  className="flex items-center justify-center w-full h-10 rounded-md bg-orange-500 text-white text-sm cursor-pointer hover:bg-orange-600 active:scale-[.99] transition"
                >
                  <svg className="mr-2" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3l4 4h-3v6h-2V7H8l4-4z"></path>
                    <path d="M5 13h14v6H5z"></path>
                  </svg>
                  Click to upload
                </label>
                <input id="file-input" type="file" accept="image/*" className="hidden" onChange={onPickFile} />

                {(filePreview || form.image) && (
                  <div className="mt-3 w-full rounded-md border border-gray-200">
                    <div className="flex items-center gap-3 px-3 py-2">
                      <div className="h-9 w-9 overflow-hidden rounded-md bg-gray-100 border">
                        {filePreview || (form.image?.startsWith("data:image/") ? form.image : "") ? (
                          <img src={filePreview || form.image} alt="preview" className="h-full w-full object-cover" />
                        ) : /^https?:\/\//i.test(form.image) ? (
                          <img src={form.image} alt="url" className="h-full w-full object-contain" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xl">
                            <span>{form.image || "📷"}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-sm text-gray-700 truncate">
                        {fileName || (form.image ? "image.png" : "No file")}
                      </div>
                      <button
                        type="button"
                        onClick={removePickedFile}
                        className="inline-grid h-8 w-8 place-items-center rounded hover:bg-gray-100"
                        title="Remove"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M6 7h12M9 7v11m6-11v11M10 4h4l1 2H9l1-2z" stroke="#f43f5e" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                <input
                  value={form.image}
                  onChange={(e) => setForm((s) => ({ ...s, image: e.target.value }))}
                  className="mt-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Hoặc dán URL/emoji (tùy chọn)"
                />
              </div>

              <label className="inline-flex items-center gap-2 select-none">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((s) => ({ ...s, active: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm">Active</span>
              </label>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="h-9 rounded-md px-4 text-sm bg-gray-200 hover:bg-gray-300"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-9 rounded-md px-4 text-sm text-white bg-orange-500 hover:bg-orange-600 disabled:opacity-60"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
