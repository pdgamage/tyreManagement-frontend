import { Link } from "react-router-dom";
import tireImage from "../images/car-tire-png-469.png";
import {
  TruckIcon,
  ClipboardListIcon,
  PhoneIcon,
  MailIcon,
  ArrowRight,
  CheckCircle,
  Users,
  FileText,
  Shield,
  Database,
  Monitor,
  Star,
  Zap,
  Award,
  TrendingUp,
  Activity,
  Clock,
  Globe,
  Target
} from "lucide-react";

const Home = () => {
  const heroFeatures = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Process requests in under 24 hours"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Reliable",
      description: "Enterprise-grade security"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Precision Tracking",
      description: "Real-time status updates"
    }
  ];







  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Stunning Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-3 py-1.5 bg-blue-500/20 rounded-full text-blue-200 text-xs font-medium mb-6 backdrop-blur-sm border border-blue-400/30">
                <Star className="w-3 h-3 mr-2" />
                Enterprise Tire Management Platform
              </div>

              <h1 className="text-3xl lg:text-5xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
                  SLT Mobitel
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  Tyre Management
                </span>
              </h1>

              <p className="text-lg lg:text-xl text-blue-100 mb-8 max-w-xl leading-relaxed">
                Transform your fleet operations with intelligent automation, real-time monitoring, and enterprise-grade security.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Link
                  to="/user"
                  className="group bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white px-8 py-3 rounded-xl font-bold text-base hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl flex items-center justify-center"
                >
                  Get Started Now
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/vehicle-registration"
                  className="group border-2 border-white/40 text-white px-8 py-3 rounded-xl font-bold text-base hover:bg-white/10 hover:border-white/60 transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-sm flex items-center justify-center"
                >
                  Register Vehicle
                  <TruckIcon className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
                </Link>
              </div>

              {/* Hero Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {heroFeatures.map((feature, index) => (
                  <div key={index} className="text-center lg:text-left">
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-white/10 rounded-xl mb-3 backdrop-blur-sm border border-white/20">
                      <div className="text-blue-300 text-sm">{feature.icon}</div>
                    </div>
                    <h3 className="font-bold text-white mb-1 text-sm">{feature.title}</h3>
                    <p className="text-blue-200 text-xs">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Image Section */}
            <div className="relative">
              <div className="relative z-10">
                <div className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/30 shadow-xl">
                  <img
                    src={tireImage}
                    alt="Professional Tire Management"
                    className="w-full h-auto max-h-64 object-contain transition-transform duration-700 hover:scale-105 hover:rotate-3"
                  />
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 rounded-2xl shadow-xl backdrop-blur-sm border border-white/30 transform rotate-2">
                <div className="flex items-center space-x-2">
                  <Activity className="w-6 h-6" />
                  <div>
                    <p className="font-bold text-base">99.9%</p>
                    <p className="text-xs opacity-90">Uptime</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-purple-500 to-violet-600 text-white p-4 rounded-2xl shadow-xl backdrop-blur-sm border border-white/30 transform -rotate-2">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-6 h-6" />
                  <div>
                    <p className="font-bold text-base">45%</p>
                    <p className="text-xs opacity-90">Faster</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>







      {/* Support Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              24/7 <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Support</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our dedicated team is always ready to help you succeed
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 text-center">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <PhoneIcon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Phone Support</h3>
              <p className="text-gray-600 mb-6">24/7 emergency assistance for critical issues</p>
              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                <p className="text-3xl font-bold text-blue-600 mb-2">1717</p>
                <p className="text-blue-500 font-medium">Always Available</p>
              </div>
            </div>

            <div className="group bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 text-center">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <MailIcon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Email Support</h3>
              <p className="text-gray-600 mb-6">Detailed technical assistance and documentation</p>
              <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-200">
                <p className="text-lg font-bold text-emerald-600 mb-2">support@mobitel.lk</p>
                <p className="text-emerald-500 font-medium">Response within 2 hours</p>
              </div>
            </div>

            <div className="group bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 text-center">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Monitor className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">System Status</h3>
              <p className="text-gray-600 mb-6">Real-time monitoring and health checks</p>
              <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
                <div className="flex items-center justify-center space-x-3 mb-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-lg font-bold text-purple-600">All Systems Operational</p>
                </div>
                <p className="text-purple-500 font-medium">99.9% Uptime</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold mb-8">
            Ready to <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Transform</span> Your Fleet?
          </h2>
          <p className="text-2xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed">
            Hundreds of organizations rely on us to make tire management easier and more efficient.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link
              to="/user"
              className="group bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white px-12 py-6 rounded-2xl font-bold text-xl hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl flex items-center justify-center"
            >
              Start Your Journey
              <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
            </Link>

            <Link
              to="/login"
              className="group border-2 border-white/40 text-white px-12 py-6 rounded-2xl font-bold text-xl hover:bg-white/10 hover:border-white/60 transition-all duration-300 transform hover:-translate-y-2 backdrop-blur-sm flex items-center justify-center"
            >
              Access Dashboard
              <Monitor className="w-6 h-6 ml-3 group-hover:scale-110 transition-transform" />
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-white/20">
            <div className="text-center">
              <p className="text-3xl font-bold text-white mb-2">500+</p>
              <p className="text-blue-200">Happy Clients</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white mb-2">99.9%</p>
              <p className="text-blue-200">Uptime</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white mb-2">24/7</p>
              <p className="text-blue-200">Support</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white mb-2">5★</p>
              <p className="text-blue-200">Rating</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
