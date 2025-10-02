import React, { useState } from "react";
import { Link } from "react-router-dom";
export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setSuccess("Sign In Successfully");
      setUsername("");
      setPassword("");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-center mb-2 flex items-center justify-center gap-2">
          <span role="img" aria-label="lock">🔒</span> Sign In
        </h1>

        {success && (
          <p className="text-green-600 text-center font-medium mb-4">
            {success}
          </p>
        )}

        <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username here ..."
              className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
                errors.username
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password here ..."
              className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
                errors.password
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
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
