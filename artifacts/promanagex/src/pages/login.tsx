import { Building2, Shield, BarChart3, Users, ArrowRight } from "lucide-react";

export default function Login() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex">
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400 rounded-full filter blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-400 rounded-full filter blur-3xl" />
        </div>

        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">ProManageX</span>
        </div>

        <div className="relative">
          <h1 className="text-5xl font-bold text-white leading-tight mb-6">
            Workforce Management,<br />
            <span className="text-blue-400">Reimagined</span>
          </h1>
          <p className="text-slate-300 text-lg mb-10 leading-relaxed">
            Manage contractors, track attendance, monitor KPIs, and streamline operations — all in one powerful platform.
          </p>

          <div className="grid grid-cols-1 gap-4">
            {[
              { icon: Users, title: "Team Management", desc: "Full contractor & employee lifecycle control" },
              { icon: BarChart3, title: "Real-time Analytics", desc: "Live dashboards and performance insights" },
              { icon: Shield, title: "Compliance & Safety", desc: "Violation tracking and audit logs" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4 bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{title}</p>
                  <p className="text-slate-400 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-slate-500 text-sm">
          © {new Date().getFullYear()} ProManageX. All rights reserved.
        </p>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-10">
            <div className="flex items-center gap-2 mb-8 lg:hidden">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">ProManageX</span>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h2>
              <p className="text-gray-500">Sign in to access your workspace</p>
            </div>

            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg shadow-blue-200 hover:shadow-blue-300 group"
            >
              <Building2 className="w-5 h-5" />
              Sign in with Replit
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                By signing in, you agree to our{" "}
                <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>
                {" "}and{" "}
                <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
              </p>
            </div>

            <div className="mt-6 flex justify-center gap-6 text-sm">
              <a href="/pricing" className="text-gray-500 hover:text-blue-600 transition-colors">Pricing</a>
              <a href="/about" className="text-gray-500 hover:text-blue-600 transition-colors">About Us</a>
              <a href="mailto:sales@promanagex.com" className="text-gray-500 hover:text-blue-600 transition-colors">Contact</a>
            </div>
          </div>

          <p className="text-center text-slate-400 text-xs mt-6">
            Need access?{" "}
            <a href="/pricing" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
              Contact our sales team →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
