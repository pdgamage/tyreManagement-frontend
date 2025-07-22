import { Link } from "react-router-dom";
import tireImage from "../images/car-tire-png-469.png";
import {
  TruckIcon,
  BarChart3Icon,
  ClipboardListIcon,
  PhoneIcon,
  MailIcon,
  ShieldCheckIcon,
  ArrowRight,
  CheckCircle,
  Clock,
  Users,
  Zap,
  Award,
  TrendingUp,
  Settings,
  Globe,
  Star,
  Activity,
  Target
} from "lucide-react";

const Home = () => {
  const features = [
    {
      icon: <ClipboardListIcon size={32} className="text-blue-600" />,
      title: "Request Management",
      description: "Streamlined tire request and approval workflow with real-time tracking",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: <TruckIcon size={32} className="text-emerald-600" />,
      title: "Vehicle Registration",
      description: "Comprehensive vehicle information management and fleet tracking",
      color: "from-emerald-500 to-teal-600"
    },
    {
      icon: <BarChart3Icon size={32} className="text-purple-600" />,
      title: "Analytics & Reports",
      description: "Real-time inventory tracking and comprehensive reporting",
      color: "from-purple-500 to-violet-600"
    },
    {
      icon: <ShieldCheckIcon size={32} className="text-orange-600" />,
      title: "Multi-level Security",
      description: "Secure and efficient approval process with role-based access",
      color: "from-orange-500 to-red-500"
    },
  ];

  const stats = [
    {
      icon: <Users className="w-8 h-8" />,
      number: "500+",
      label: "Active Users",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: <TruckIcon className="w-8 h-8" />,
      number: "1,200+",
      label: "Vehicles Managed",
      color: "from-emerald-500 to-teal-600"
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      number: "5,000+",
      label: "Requests Processed",
      color: "from-purple-500 to-violet-600"
    },
    {
      icon: <Award className="w-8 h-8" />,
      number: "99.9%",
      label: "System Uptime",
      color: "from-orange-500 to-red-500"
    }
  ];

  const benefits = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Process requests in under 24 hours"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Precision Tracking",
      description: "Real-time status updates and notifications"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Enterprise Ready",
      description: "Scalable solution for large fleets"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white py-20 md:py-32 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content Section */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 rounded-full text-blue-200 text-sm font-medium mb-6 backdrop-blur-sm border border-blue-400/20">
                <Star className="w-4 h-4 mr-2" />
                Enterprise Tire Management Solution
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  SLT Mobitel
                </span>
                <br />
                <span className="text-white">Tire Management</span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  System
                </span>
              </h1>

              <p className="text-xl text-blue-100 mb-8 max-w-2xl">
                Transform your fleet operations with our intelligent tire management platform.
                Streamline requests, optimize inventory, and ensure maximum uptime.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/user"
                  className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl flex items-center justify-center"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/vehicle-registration"
                  className="group border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1 backdrop-blur-sm flex items-center justify-center"
                >
                  Register Vehicle
                  <TruckIcon className="w-5 h-5 ml-2 group-hover:scale-110 transition-transform" />
                </Link>
              </div>

              {/* Quick Benefits */}
              <div className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-white/20">
                {benefits.map((benefit, index) => (
                  <div key={index} className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-lg mb-3 backdrop-blur-sm">
                      <div className="text-blue-300">{benefit.icon}</div>
                    </div>
                    <h3 className="font-semibold text-white text-sm mb-1">{benefit.title}</h3>
                    <p className="text-blue-200 text-xs">{benefit.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Image Section */}
            <div className="relative">
              <div className="relative z-10">
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                  <img
                    src={tireImage}
                    alt="Professional Tire Management"
                    className="w-full h-auto max-h-96 object-contain transition-transform duration-500 hover:scale-105 hover:rotate-3"
                  />
                </div>
              </div>

              {/* Floating Stats Cards */}
              <div className="absolute -top-6 -right-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 rounded-2xl shadow-2xl backdrop-blur-sm border border-white/20">
                <div className="flex items-center space-x-3">
                  <Activity className="w-6 h-6" />
                  <div>
                    <p className="text-sm font-medium">System Status</p>
                    <p className="text-xs opacity-90">99.9% Uptime</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 bg-gradient-to-r from-purple-500 to-violet-600 text-white p-4 rounded-2xl shadow-2xl backdrop-blur-sm border border-white/20">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-6 h-6" />
                  <div>
                    <p className="text-sm font-medium">Efficiency</p>
                    <p className="text-xs opacity-90">45% Faster</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-16 -mt-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="group">
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${stat.color} rounded-2xl mb-4 shadow-lg`}>
                    <div className="text-white">{stat.icon}</div>
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</h3>
                  <p className="text-gray-600 font-medium">{stat.label}</p>
                  <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${stat.color} rounded-full transform transition-transform duration-1000 group-hover:scale-x-100 scale-x-75`}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Support Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-white to-blue-50 rounded-3xl shadow-2xl border border-blue-100 overflow-hidden">
            <div className="p-8 lg:p-12">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">24/7 Professional Support</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Our dedicated support team is always ready to assist you with any questions or technical issues.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="group text-center">
                  <div className="bg-gradient-to-r from-blue-500 to-cyan-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300">
                    <PhoneIcon size={32} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Phone Support</h3>
                  <p className="text-gray-600 mb-4">Immediate assistance for urgent matters</p>
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <p className="text-2xl font-bold text-blue-600">1717</p>
                    <p className="text-sm text-blue-500">Available 24/7</p>
                  </div>
                </div>

                <div className="group text-center">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300">
                    <MailIcon size={32} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Email Support</h3>
                  <p className="text-gray-600 mb-4">Detailed technical assistance and documentation</p>
                  <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                    <p className="text-lg font-semibold text-emerald-600">support@mobitel.lk</p>
                    <p className="text-sm text-emerald-500">Response within 2 hours</p>
                  </div>
                </div>

                <div className="group text-center">
                  <div className="bg-gradient-to-r from-purple-500 to-violet-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform duration-300">
                    <Settings size={32} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">System Status</h3>
                  <p className="text-gray-600 mb-4">Real-time system monitoring and updates</p>
                  <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <p className="text-lg font-semibold text-purple-600">All Systems Operational</p>
                    </div>
                    <p className="text-sm text-purple-500">Last updated: Just now</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-600 text-sm font-medium mb-6">
              <Star className="w-4 h-4 mr-2" />
              Powerful Features
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Everything You Need for
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Tire Management</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform provides all the tools and features you need to efficiently manage your fleet's tire operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group relative">
                <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 h-full">
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`}></div>

                  {/* Icon Container */}
                  <div className={`relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <div className="text-white">{feature.icon}</div>
                  </div>

                  {/* Content */}
                  <div className="relative">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-gray-800 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors">
                      {feature.description}
                    </p>
                  </div>

                  {/* Hover Arrow */}
                  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ArrowRight className="w-5 h-5 text-blue-600" />
                  </div>

                  {/* Border Animation */}
                  <div className={`absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                       style={{mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', maskComposite: 'xor'}}>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white shadow-2xl">
              <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Fleet Management?</h3>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Join hundreds of organizations already using our platform to streamline their tire management operations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/user"
                  className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors transform hover:-translate-y-1 shadow-lg"
                >
                  Start Your First Request
                </Link>
                <Link
                  to="/login"
                  className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-colors transform hover:-translate-y-1"
                >
                  Access Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <TruckIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold">SLT Mobitel</h3>
              </div>
              <p className="text-blue-200 mb-6 max-w-md">
                Leading the way in innovative tire management solutions for modern fleets.
                Trusted by organizations across Sri Lanka.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <MailIcon className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <PhoneIcon className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                <li><Link to="/user" className="text-blue-200 hover:text-white transition-colors">Submit Request</Link></li>
                <li><Link to="/vehicle-registration" className="text-blue-200 hover:text-white transition-colors">Register Vehicle</Link></li>
                <li><Link to="/login" className="text-blue-200 hover:text-white transition-colors">Dashboard Login</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Support</h4>
              <ul className="space-y-3">
                <li className="flex items-center space-x-2">
                  <PhoneIcon className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-200">1717 (24/7)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <MailIcon className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-200">support@mobitel.lk</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-200">Mon-Fri 8AM-6PM</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-blue-200 text-sm">
              © 2024 SLT Mobitel. All rights reserved. | Tire Management System v2.0
            </p>
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-blue-200 text-sm">System Status: Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
