import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");           // dùng email thay cho username
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState("");

  const nav = useNavigate();
  const API_URL = "http://localhost:8080/users";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let newErrors: { [key: string]: string } = {};
    setSuccess("");

    if (!email.trim()) newErrors.email = "Vui lòng nhập email ...";
    if (!password.trim()) newErrors.password = "Vui lòng nhập mật khẩu ...";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      // Lấy user theo email
      const res = await axios.get(`${API_URL}?email=${encodeURIComponent(email)}`);
      const user = res.data?.[0];

      if (!user) {
        setErrors({ email: "Email chưa được đăng ký." });
        return;
      }
      if (user.password !== password) {
        setErrors({ password: "Mật khẩu không đúng." });
        return;
      }

      // Thành công
      setSuccess("Đăng nhập thành công!");
      setErrors({});
      // (Tuỳ chọn) lưu user
      localStorage.setItem("auth_user", JSON.stringify({ id: user.id, email: user.email }));

      // Điều hướng sang Home
      nav("/user/home");
    } catch (err) {
      console.error(err);
      setErrors({ form: "Không thể kết nối tới server." });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-center mb-2 flex items-center justify-center gap-2">
          <span role="img" aria-label="lock">🔒</span> Sign In
        </h1>

        {success && <p className="text-green-600 text-center font-medium mb-4">{success}</p>}
        {errors.form && <p className="text-red-600 text-center font-medium mb-4">{errors.form}</p>}

        <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
          {/* Email */}
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email here ..."
              className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
                errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password here ..."
              className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
                errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            className="bg-indigo-600 text-white rounded-lg py-2 hover:bg-indigo-700 transition duration-200"
          >
            Sign In
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          Don’t have account?{" "}
          <Link to="/user/register" className="text-blue-500 hover:underline">
            Sign Up Now
          </Link>
        </p>
      </div>
    </div>
  );
}
