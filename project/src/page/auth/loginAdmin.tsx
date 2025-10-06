import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginAdmin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate form
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    // Kiểm tra tài khoản admin
    if (username === "admin@gmail.com" && password === "123456") {
      // Lưu thông tin vào localStorage
      localStorage.setItem("admin", JSON.stringify({ username }));
      if (remember) localStorage.setItem("rememberAdmin", "true");

      // Chuyển sang trang dashboard
      navigate("/admin/dashboard");
    } else {
      setError("Invalid username or password.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8 text-center">
        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Financial <span className="text-indigo-600">Manager</span>
        </h1>
        <p className="text-sm text-gray-500 mb-6">Please sign in</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <input
            type="text"
            placeholder="Please enter your username ..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none"
          />

          <input
            type="password"
            placeholder="Please enter your password ..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none"
          />

          {/* Remember me */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-3 w-3 accent-indigo-600"
              />
              Remember me
            </label>
            <span className="italic text-gray-400">Admin only</span>
          </div>

          {/* Error message */}
          {error && (
            <div className="text-red-500 text-xs font-medium">{error}</div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white text-sm font-semibold rounded-md py-2 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            Sign In
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-[11px] text-gray-400">
          © 2025 - Rikkei Education
        </p>
      </div>
    </div>
  );
}
