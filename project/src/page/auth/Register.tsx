import React, { useState } from "react";
import { Link } from "react-router-dom";  // dùng Link thay vì Navigate

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let newErrors: { [key: string]: string } = {};
    setSuccess("");

    if (!username.trim()) {
      newErrors.username = "Please enter your username ...";
    }
    if (!password.trim()) {
      newErrors.password = "Please enter your password ...";
    }
    if (!confirm.trim()) {
      newErrors.confirm = "Please enter your confirm password ...";
    } else if (password !== confirm) {
      newErrors.confirm = "Passwords do not match ...";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setSuccess("Sign Up Successfully");
      // ở đây bạn có thể lưu user vào localStorage hoặc gọi API
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Sign Up</h1>

        {success && (
          <p className="text-green-600 text-center mb-4">{success}</p>
        )}

        <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
          {/* Username */}
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username here..."
              className={`w-full border ${
                errors.username ? "border-red-500" : "border-gray-300"
              } rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
                errors.username ? "focus:ring-red-500" : "focus:ring-blue-500"
              }`}
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password here..."
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

          {/* Confirm */}
          <div>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm password here..."
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

          <button
            type="submit"
            className="bg-green-500 text-white rounded-lg py-2 hover:bg-green-600 transition duration-200"
          >
            Sign Up
          </button>
        </form>

        <p className="text-sm text-center mt-4">
          You have account?{" "}
          <Link to="/user/login" className="text-blue-500 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
