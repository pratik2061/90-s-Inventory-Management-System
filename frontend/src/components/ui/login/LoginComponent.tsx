import React, { useState } from "react";
import { Eye, EyeOff, ShieldCheck } from "lucide-react"; // Added Shield icon for vintage vibe
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
    // Base background: Darkest Forest Green
    <div className="min-h-screen flex items-center justify-center bg-[#161d19] px-4">
      {/* Login Card: Deep Slate-Green */}
      <div className="max-w-md w-full space-y-8 bg-[#1e2923] p-10 rounded-3xl border border-[#2d3a32] shadow-2xl relative overflow-hidden">
        {/* Subtle decorative "glow" in the corner */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-200/5 blur-3xl rounded-full" />

        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-[#161d19] rounded-2xl border border-[#2d3a32]">
              <ShieldCheck className="size-8 text-amber-200" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-amber-200 tracking-tighter">
            90's ADMIN
          </h2>
          <p className="text-[#6d7e74] text-sm font-medium uppercase tracking-[0.2em]">
            Secure Access Portal
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-5">
            {/* Username Field */}
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-bold text-[#6d7e74] uppercase tracking-widest mb-2 ml-1"
              >
                Identification
              </label>
              <input
                id="username"
                type="text"
                required
                className="mt-1 block w-full px-4 py-3 bg-[#161d19] border border-[#2d3a32] rounded-xl text-[#e2e8f0] placeholder:text-[#4a5a51] focus:outline-none focus:ring-2 focus:ring-amber-200/20 focus:border-amber-200/50 transition-all duration-200 font-medium"
                placeholder="User ID"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* Password Field with Toggle */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-[#6d7e74] uppercase tracking-widest mb-2 ml-1"
              >
                Access Key
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full px-4 py-3 bg-[#161d19] border border-[#2d3a32] rounded-xl text-[#e2e8f0] placeholder:text-[#4a5a51] focus:outline-none focus:ring-2 focus:ring-amber-200/20 focus:border-amber-200/50 transition-all duration-200 font-mono"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[#4a5a51] hover:text-amber-200 transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff size={18} strokeWidth={2} />
                  ) : (
                    <Eye size={18} strokeWidth={2} />
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-black uppercase tracking-widest text-[#161d19] bg-amber-200 hover:bg-amber-300 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-200 focus:ring-offset-[#1e2923] transition-all duration-200"
          >
            Authorize Entry
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
