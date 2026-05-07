import { Building2, Check, ArrowRight, Phone, Mail, MessageSquare, Zap, Shield, BarChart3, Users, Globe, HeadphonesIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

const plans = [
  {
    name: "Starter",
    price: 299,
    period: "month",
    description: "Perfect for small teams getting started with workforce management.",
    color: "border-gray-200",
    badge: null,
    features: [
      "Up to 50 employees",
      "Basic attendance tracking",
      "Contractor management",
      "Standard reports",
      "Email support",
      "2 admin accounts",
    ],
    cta: "Get Started",
    ctaStyle: "border border-gray-300 text-gray-700 hover:bg-gray-50",
  },
  {
    name: "Professional",
    price: 799,
    period: "month",
    description: "For growing companies that need advanced analytics and compliance tools.",
    color: "border-blue-500 ring-2 ring-blue-500",
    badge: "Most Popular",
    features: [
      "Up to 250 employees",
      "Advanced KPI tracking",
      "Full contractor lifecycle",
      "Custom reports & exports",
      "Violation management",
      "Priority support",
      "10 admin accounts",
      "API access",
    ],
    cta: "Talk to Sales",
    ctaStyle: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200",
  },
  {
    name: "Enterprise",
    price: null,
    period: null,
    description: "Tailored solutions for large organizations with complex requirements.",
    color: "border-gray-200",
    badge: null,
    features: [
      "Unlimited employees",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantee (99.9%)",
      "On-premise deployment option",
      "Advanced audit logs",
      "Custom workflows",
      "24/7 premium support",
      "Training & onboarding",
    ],
    cta: "Contact Sales",
    ctaStyle: "border border-gray-300 text-gray-700 hover:bg-gray-50",
  },
];

const features = [
  { icon: Users, title: "Workforce Management", desc: "Full employee & contractor lifecycle from onboarding to offboarding" },
  { icon: BarChart3, title: "Real-time Analytics", desc: "Live dashboards with attendance trends, KPIs, and performance insights" },
  { icon: Shield, title: "Compliance & Safety", desc: "Violation tracking, penalty management, and complete audit trails" },
  { icon: Zap, title: "Smart Automation", desc: "Automated notifications, contract renewal alerts, and reporting" },
  { icon: Globe, title: "Multi-site Support", desc: "Manage multiple work areas and locations from one platform" },
  { icon: HeadphonesIcon, title: "Dedicated Support", desc: "Expert onboarding, training, and ongoing customer success" },
];

export default function Pricing() {
  const [contactForm, setContactForm] = useState({ name: "", email: "", company: "", message: "", plan: "Professional" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

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
            <Link href="/about"><span className="text-gray-600 hover:text-gray-900 text-sm cursor-pointer transition-colors">About</span></Link>
            <Link href="/login">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
          <Zap className="w-3.5 h-3.5" />
          Simple, transparent pricing
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Plans that scale<br />
          <span className="text-blue-600">with your team</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Choose the plan that fits your organization. All plans include a 14-day free trial. No credit card required.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div key={plan.name} className={`relative rounded-2xl border-2 p-8 ${plan.color} flex flex-col`}>
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-600 text-white text-xs font-semibold px-4 py-1 rounded-full">
                    {plan.badge}
                  </span>
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-500 text-sm">{plan.description}</p>
              </div>

              <div className="mb-8">
                {plan.price ? (
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-400 mb-1">/{plan.period}</span>
                  </div>
                ) : (
                  <div className="text-4xl font-bold text-gray-900">Custom</div>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
                className={`w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 group ${plan.ctaStyle}`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Everything you need to manage your workforce</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Built for construction, facilities, and field operations teams that demand reliability</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-20 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Talk to our sales team</h2>
            <p className="text-gray-500 text-lg mb-8 leading-relaxed">
              Get a personalized demo and find the right plan for your organization. Our experts are ready to help you get started.
            </p>

            <div className="space-y-5">
              {[
                { icon: Phone, label: "Call us", value: "+1 (555) 000-0000", sub: "Mon–Fri, 9am–6pm EST" },
                { icon: Mail, label: "Email us", value: "sales@promanagex.com", sub: "We reply within 24 hours" },
                { icon: MessageSquare, label: "Live chat", value: "Start a conversation", sub: "Available on the platform" },
              ].map(({ icon: Icon, label, value, sub }) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{label}</p>
                    <p className="text-gray-900 font-semibold">{value}</p>
                    <p className="text-gray-400 text-xs">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Message sent!</h3>
                <p className="text-gray-500">Our sales team will reach out within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Request a demo</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                    <input
                      required
                      value={contactForm.name}
                      onChange={e => setContactForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Company *</label>
                    <input
                      required
                      value={contactForm.company}
                      onChange={e => setContactForm(p => ({ ...p, company: e.target.value }))}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Acme Corp"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Work Email *</label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={e => setContactForm(p => ({ ...p, email: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="john@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Interested Plan</label>
                  <select
                    value={contactForm.plan}
                    onChange={e => setContactForm(p => ({ ...p, plan: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option>Starter</option>
                    <option>Professional</option>
                    <option>Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
                  <textarea
                    rows={4}
                    value={contactForm.message}
                    onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Tell us about your team size and requirements..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 group"
                >
                  Send Request
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>© {new Date().getFullYear()} ProManageX</span>
          </div>
          <div className="flex gap-6">
            <Link href="/about"><span className="hover:text-gray-600 cursor-pointer transition-colors">About</span></Link>
            <Link href="/login"><span className="hover:text-gray-600 cursor-pointer transition-colors">Sign In</span></Link>
            <a href="mailto:sales@promanagex.com" className="hover:text-gray-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
