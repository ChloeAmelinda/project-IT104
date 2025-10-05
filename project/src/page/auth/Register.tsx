import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState("");

  const nav = useNavigate();
  const API_URL = "http://localhost:8080/users";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let newErrors: { [key: string]: string } = {};
    setSuccess("");

    // ====== VALIDATE INPUT ======
    if (!email.trim()) {
      newErrors.email = "Email không được bỏ trống.";
    }
    if (!password.trim()) {
      newErrors.password = "Mật khẩu không được bỏ trống.";
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    }
    if (!confirm.trim()) {
      newErrors.confirm = "Vui lòng nhập lại mật khẩu.";
    } else if (password !== confirm) {
      newErrors.confirm = "Mật khẩu không trùng khớp.";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      // ====== CHECK TRÙNG EMAIL ======
      const res = await axios.get(`${API_URL}?email=${email}`);
      if (res.data.length > 0) {
        setErrors({ email: "Email đã được đăng ký trước đó." });
        return;
      }

      // ====== THÊM USER MỚI ======
      const newUser = { email, password };
      await axios.post(API_URL, newUser);

      setSuccess("Đăng ký thành công! ");
      setEmail("");
      setPassword("");
      setConfirm("");
      setErrors({});

      // ====== CHUYỂN SAU 1.5s ======
      setTimeout(() => {
        nav("/user/login"); // hoặc "/signin" nếu bạn dùng router đó
      }, 1500);
    } catch (error) {
      console.error("Lỗi khi đăng ký:", error);
      setErrors({ form: "Không thể kết nối tới server." });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Sign Up</h1>

        {success && (
          <p className="text-green-600 text-center mb-4">{success}</p>
        )}
        {errors.form && (
          <p className="text-red-600 text-center mb-4">{errors.form}</p>
        )}

        <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
          {/* Email */}
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email here..."
              className={`w-full border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
                errors.email ? "focus:ring-red-500" : "focus:ring-blue-500"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 6 chars)..."
              className={`w-full border ${
                errors.password ? "border-red-500" : "border-gray-300"
              } rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
                errors.password ? "focus:ring-red-500" : "focus:ring-blue-500"
              }`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm password..."
              className={`w-full border ${
                errors.confirm ? "border-red-500" : "border-gray-300"
              } rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
                errors.confirm ? "focus:ring-red-500" : "focus:ring-blue-500"
              }`}
            />
            {errors.confirm && (
              <p className="text-red-500 text-sm mt-1">{errors.confirm}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="bg-green-500 text-white rounded-lg py-2 hover:bg-green-600 transition duration-200"
          >
            Sign Up
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <Link to="/user/login" className="text-blue-500 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
