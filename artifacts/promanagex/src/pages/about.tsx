import { Building2, Target, Heart, Zap, Globe, Award, Users, ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "wouter";

const team = [
  { name: "Sarah Al-Hassan", role: "CEO & Co-Founder", initials: "SH", color: "bg-blue-600" },
  { name: "Michael Torres", role: "CTO & Co-Founder", initials: "MT", color: "bg-indigo-600" },
  { name: "Aisha Rahman", role: "VP of Product", initials: "AR", color: "bg-purple-600" },
  { name: "James Chen", role: "Head of Engineering", initials: "JC", color: "bg-teal-600" },
  { name: "Fatima Al-Zahra", role: "Head of Customer Success", initials: "FZ", color: "bg-rose-600" },
  { name: "David Okafor", role: "Head of Sales", initials: "DO", color: "bg-amber-600" },
];

const values = [
  { icon: Target, title: "Mission-Driven", desc: "We exist to make workforce management effortless for every operations team, regardless of size." },
  { icon: Heart, title: "Customer First", desc: "Our customers' success is our success. We build features our users actually need." },
  { icon: Zap, title: "Move Fast", desc: "We ship quickly, iterate based on feedback, and continuously improve our platform." },
  { icon: Shield, title: "Trust & Security", desc: "We handle your data with the highest standards of privacy and security compliance." },
];

const stats = [
  { value: "500+", label: "Companies Trust Us" },
  { value: "120K+", label: "Workers Managed" },
  { value: "98%", label: "Customer Satisfaction" },
  { value: "15+", label: "Countries Served" },
];

import { Shield } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">ProManageX</span>
            </div>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/pricing"><span className="text-gray-600 hover:text-gray-900 text-sm cursor-pointer transition-colors">Pricing</span></Link>
            <Link href="/login">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-28">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-blue-400 rounded-full filter blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-indigo-400 rounded-full filter blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 border border-blue-500/30 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Globe className="w-3.5 h-3.5" />
            Our Story
          </div>
          <h1 className="text-5xl font-bold text-white mb-6">
            Building the future of<br />
            <span className="text-blue-400">workforce operations</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Founded in 2021, ProManageX was built by operations veterans who were tired of scattered spreadsheets and disconnected tools. We set out to create the platform we always wished existed.
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{value}</div>
                <div className="text-gray-500 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">We believe operations teams deserve better tools</h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-6">
              Most workforce software was designed for desk workers — not for the people managing contractors in the field, tracking attendance across multiple sites, or handling compliance for hundreds of workers.
            </p>
            <p className="text-gray-500 text-lg leading-relaxed mb-8">
              ProManageX was built from the ground up for construction, facilities management, logistics, and field service companies who need a platform as dynamic as their work.
            </p>
            <div className="space-y-3">
              {[
                "Purpose-built for field and operational teams",
                "Works across multiple work sites and locations",
                "Real-time data you can act on immediately",
                "Compliance and audit tools built in from day one",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">{title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Meet the team</h2>
            <p className="text-gray-500">The people behind ProManageX, passionate about solving real operations challenges</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {team.map(({ name, role, initials, color }) => (
              <div key={name} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm text-center hover:shadow-md transition-shadow">
                <div className={`w-16 h-16 ${color} rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4`}>
                  {initials}
                </div>
                <h3 className="font-semibold text-gray-900">{name}</h3>
                <p className="text-gray-500 text-sm mt-1">{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-white">
            <Award className="w-12 h-12 mx-auto mb-4 text-blue-200" />
            <h2 className="text-3xl font-bold mb-4">Ready to transform your operations?</h2>
            <p className="text-blue-100 mb-8 max-w-xl mx-auto">
              Join 500+ companies that have simplified their workforce management with ProManageX.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/pricing">
                <button className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors flex items-center gap-2 group">
                  View Pricing
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link href="/login">
                <button className="border border-white/30 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors">
                  Get Started Free
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>© {new Date().getFullYear()} ProManageX. Built with passion.</span>
          </div>
          <div className="flex gap-6">
            <Link href="/pricing"><span className="hover:text-gray-600 cursor-pointer transition-colors">Pricing</span></Link>
            <Link href="/login"><span className="hover:text-gray-600 cursor-pointer transition-colors">Sign In</span></Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
