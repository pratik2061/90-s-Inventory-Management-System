import React, { useState } from "react";
// Assuming you have lucide-react installed: npm install lucide-react
import { Eye, EyeOff } from "lucide-react";
import { api } from "@/utils/api/ApiInstance";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface response {
  data: { message: string };
}
interface errorresponse {
  response: { data: { message: string } };
}
const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const login = async (username: string, password: string) => {
    try {
      const res = (await api.post("/login", {
        username,
        password,
      })) as response;
      toast.success(`${res.data.message}`);
      navigate("/");
    } catch (error) {
      const err = error as errorresponse;
      toast.error(`${err.response.data.message}`);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    login(username, password);
    setPassword("");
    setUsername("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-sm border border-slate-100">
        <div className="text-center">
          <h2 className="text-3xl font-light text-slate-800 tracking-tight">
            Welcome 90's Admin
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Username Field */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-slate-700 ml-1"
              >
                UserName
              </label>
              <input
                id="username"
                type="text"
                required
                className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                placeholder="username..here"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* Password Field with Toggle */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 ml-1"
              >
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  // Dynamic type based on state
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button" // Important: keep this as "button" so it doesn't submit the form
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff size={20} strokeWidth={1.5} />
                  ) : (
                    <Eye size={20} strokeWidth={1.5} />
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 cursor-pointer border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all duration-200"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
