import React, { useState } from "react";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { api } from "@/utils/api/ApiInstance";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export interface response {
  data: { message: string };
}
export interface errorresponse {
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

      toast.success(res.data.message);
      navigate("/");
    } catch (error) {
      const err = error as errorresponse;
      toast.error(err.response.data.message);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    login(username, password);
    setUsername("");
    setPassword("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8faf9] px-4">
      {/* Login Card */}
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl border border-[#e2e8e4] shadow-xl relative overflow-hidden">
        {/* Soft accent glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-200/30 blur-3xl rounded-full" />

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-amber-100 rounded-2xl">
              <ShieldCheck className="size-8 text-amber-600" />
            </div>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-amber-600">
            90's ADMIN
          </h2>

          <p className="text-[#6b7280] text-sm font-medium uppercase tracking-[0.2em]">
            Secure Access Portal
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-5">
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-bold text-[#6b7280] uppercase tracking-widest mb-2 ml-1"
              >
                Identification
              </label>
              <input
                id="username"
                type="text"
                required
                className="block w-full px-4 py-3 bg-[#f8faf9] border border-[#e2e8e4] rounded-xl text-[#1f2937] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all font-medium"
                placeholder="User ID"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-[#6b7280] uppercase tracking-widest mb-2 ml-1"
              >
                Access Key
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full px-4 py-3 bg-[#f8faf9] border border-[#e2e8e4] rounded-xl text-[#1f2937] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all font-mono"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[#9ca3af] hover:text-amber-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full flex justify-center py-4 px-4 rounded-2xl text-sm font-black uppercase tracking-widest text-white bg-amber-500 hover:bg-amber-600 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all shadow-md shadow-amber-200/40"
          >
            Authorize Entry
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
