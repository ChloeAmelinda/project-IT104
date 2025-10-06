import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

type Errors = { [key: string]: string };

export default function Register() {
  const [name, setName] = useState("");             // 🔹 NEW
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState(""); // "male" | "female" | "other"
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [success, setSuccess] = useState("");

  const nav = useNavigate();
  const API_URL = "http://localhost:8080/users";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let newErrors: Errors = {};
    setSuccess("");

    // ====== VALIDATE INPUT ======
    if (!name.trim()) {
      newErrors.name = "Họ tên không được bỏ trống.";
    } else if (name.trim().length < 2) {
      newErrors.name = "Họ tên phải có ít nhất 2 ký tự.";
    } else if (!/^[A-Za-zÀ-ỹ0-9\s.'-]{2,60}$/.test(name.trim())) {
      newErrors.name = "Họ tên chứa ký tự không hợp lệ.";
    }

    if (!email.trim()) {
      newErrors.email = "Email không được bỏ trống.";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Email không hợp lệ.";
    }

    if (!phone.trim()) {
      newErrors.phone = "Số điện thoại không được bỏ trống.";
    } else if (!/^\d{9,11}$/.test(phone)) {
      newErrors.phone = "Số điện thoại phải gồm 9–11 chữ số.";
    }

    if (!gender) {
      newErrors.gender = "Vui lòng chọn giới tính.";
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
      const res = await axios.get(`${API_URL}?email=${encodeURIComponent(email)}`);
      if (Array.isArray(res.data) && res.data.length > 0) {
        setErrors({ email: "Email đã được đăng ký trước đó." });
        return;
      }

      // (Tuỳ chọn) CHECK TRÙNG PHONE
      const resPhone = await axios.get(`${API_URL}?phone=${encodeURIComponent(phone)}`);
      if (Array.isArray(resPhone.data) && resPhone.data.length > 0) {
        setErrors({ phone: "Số điện thoại đã được sử dụng." });
        return;
      }

      // ====== THÊM USER MỚI (status: true) ======
      const newUser = {
        name: name.trim(), // 🔹 NEW
        email,
        phone,
        gender,           // "male" | "female" | "other"
        password,
        status: true      // hoạt động
        // createdAt: new Date().toISOString(),
      };
      await axios.post(API_URL, newUser);

      setSuccess("Đăng ký thành công!");
      setName("");        // 🔹 NEW
      setEmail("");
      setPhone("");
      setGender("");
      setPassword("");
      setConfirm("");
      setErrors({});

      setTimeout(() => {
        nav("/user/login");
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

        {success && <p className="text-green-600 text-center mb-4">{success}</p>}
        {errors.form && <p className="text-red-600 text-center mb-4">{errors.form}</p>}

        <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
          {/* Name */}
          <div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name..."
              className={`w-full border ${
                errors.name ? "border-red-500" : "border-gray-300"
              } rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
                errors.name ? "focus:ring-red-500" : "focus:ring-blue-500"
              }`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

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
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone (9–11 digits)..."
              className={`w-full border ${
                errors.phone ? "border-red-500" : "border-gray-300"
              } rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
                errors.phone ? "focus:ring-red-500" : "focus:ring-blue-500"
              }`}
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          {/* Gender */}
          <div>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className={`w-full border ${
                errors.gender ? "border-red-500" : "border-gray-300"
              } rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 ${
                errors.gender ? "focus:ring-red-500" : "focus:ring-blue-500"
              }`}
            >
              <option value="" disabled>-- Select gender --</option>
              <option value="male">Male / Nam</option>
              <option value="female">Female / Nữ</option>
              <option value="other">Other / Khác</option>
            </select>
            {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
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
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
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
            {errors.confirm && <p className="text-red-500 text-sm mt-1">{errors.confirm}</p>}
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
