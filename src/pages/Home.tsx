import { Link } from "react-router-dom";
import tireImage from "../images/car-tire-png-469.png";
import {
  TruckIcon,
  BarChart3Icon,
  ClipboardListIcon,
  PhoneIcon,
  MailIcon,
  ArrowRight,
  CheckCircle,
  Users,
  Settings,
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
  Sparkles,
  Target,
  Gauge
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

  const quickActions = [
    {
      icon: <ClipboardListIcon className="w-8 h-8" />,
      title: "Submit Tire Request",
      description: "Create and track new tire requests",
      link: "/user",
      gradient: "from-blue-500 via-blue-600 to-blue-700",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      icon: <TruckIcon className="w-8 h-8" />,
      title: "Register Vehicle",
      description: "Add vehicles to your fleet",
      link: "/vehicle-registration",
      gradient: "from-emerald-500 via-emerald-600 to-emerald-700",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600"
    },
    {
      icon: <BarChart3Icon className="w-8 h-8" />,
      title: "Analytics Dashboard",
      description: "View reports and insights",
      link: "/login",
      gradient: "from-purple-500 via-purple-600 to-purple-700",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600"
    },
    {
      icon: <Settings className="w-8 h-8" />,
      title: "System Settings",
      description: "Manage system configuration",
      link: "/login",
      gradient: "from-orange-500 via-orange-600 to-orange-700",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600"
    }
  ];

  const stats = [
    {
      icon: <Users className="w-8 h-8" />,
      number: "1,247",
      label: "Active Users",
      trend: "+12%",
      trendUp: true,
      color: "blue"
    },
    {
      icon: <TruckIcon className="w-8 h-8" />,
      number: "856",
      label: "Fleet Vehicles",
      trend: "+8%",
      trendUp: true,
      color: "emerald"
    },
    {
      icon: <Activity className="w-8 h-8" />,
      number: "342",
      label: "Active Requests",
      trend: "+15%",
      trendUp: true,
      color: "purple"
    },
    {
      icon: <Award className="w-8 h-8" />,
      number: "99.2%",
      label: "Success Rate",
      trend: "+2%",
      trendUp: true,
      color: "orange"
    }
  ];

  const features = [
    {
      icon: <Sparkles className="w-12 h-12" />,
      title: "Smart Automation",
      description: "AI-powered request processing with intelligent routing and automated approvals",
      color: "blue"
    },
    {
      icon: <Gauge className="w-12 h-12" />,
      title: "Real-time Monitoring",
      description: "Live dashboard with instant notifications and comprehensive tracking",
      color: "emerald"
    },
    {
      icon: <Shield className="w-12 h-12" />,
      title: "Enterprise Security",
      description: "Bank-level security with role-based access and complete audit trails",
      color: "purple"
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

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 rounded-full text-blue-200 text-sm font-medium mb-8 backdrop-blur-sm border border-blue-400/30">
                <Star className="w-4 h-4 mr-2" />
                Enterprise Tire Management Platform
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold mb-8 leading-tight">
                <span className="bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-transparent">
                  SLT Mobitel
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  Tire Management
                </span>
              </h1>

              <p className="text-xl lg:text-2xl text-blue-100 mb-10 max-w-2xl leading-relaxed">
                Transform your fleet operations with intelligent automation, real-time monitoring, and enterprise-grade security.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start mb-12">
                <Link
                  to="/user"
                  className="group bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl flex items-center justify-center"
                >
                  Get Started Now
                  <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-2 transition-transform" />
                </Link>

                <Link
                  to="/vehicle-registration"
                  className="group border-2 border-white/40 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white/10 hover:border-white/60 transition-all duration-300 transform hover:-translate-y-2 backdrop-blur-sm flex items-center justify-center"
                >
                  Register Vehicle
                  <TruckIcon className="w-6 h-6 ml-3 group-hover:scale-110 transition-transform" />
                </Link>
              </div>

              {/* Hero Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {heroFeatures.map((feature, index) => (
                  <div key={index} className="text-center lg:text-left">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 rounded-2xl mb-4 backdrop-blur-sm border border-white/20">
                      <div className="text-blue-300">{feature.icon}</div>
                    </div>
                    <h3 className="font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-blue-200 text-sm">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Image Section */}
            <div className="relative">
              <div className="relative z-10">
                <div className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/30 shadow-2xl">
                  <img
                    src={tireImage}
                    alt="Professional Tire Management"
                    className="w-full h-auto max-h-96 object-contain transition-transform duration-700 hover:scale-110 hover:rotate-6"
                  />
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-8 -right-8 bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-6 rounded-3xl shadow-2xl backdrop-blur-sm border border-white/30 transform rotate-3">
                <div className="flex items-center space-x-3">
                  <Activity className="w-8 h-8" />
                  <div>
                    <p className="font-bold text-lg">99.9%</p>
                    <p className="text-sm opacity-90">Uptime</p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-8 -left-8 bg-gradient-to-r from-purple-500 to-violet-600 text-white p-6 rounded-3xl shadow-2xl backdrop-blur-sm border border-white/30 transform -rotate-3">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-8 h-8" />
                  <div>
                    <p className="font-bold text-lg">45%</p>
                    <p className="text-sm opacity-90">Faster</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="py-20 -mt-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="group relative bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${action.gradient} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`}></div>

                <div className="relative">
                  <div className={`inline-flex items-center justify-center w-20 h-20 ${action.iconBg} rounded-3xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <div className={action.iconColor}>{action.icon}</div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-gray-800">{action.title}</h3>
                  <p className="text-gray-600 mb-6 group-hover:text-gray-700">{action.description}</p>

                  <div className="flex items-center text-blue-600 group-hover:text-blue-700 font-semibold">
                    <span>Get Started</span>
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>

                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Real-time <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Performance</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Monitor your fleet's performance with live statistics and comprehensive analytics
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="group relative bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
                <div className={`absolute inset-0 bg-gradient-to-r ${
                  stat.color === 'blue' ? 'from-blue-500 to-cyan-600' :
                  stat.color === 'emerald' ? 'from-emerald-500 to-teal-600' :
                  stat.color === 'purple' ? 'from-purple-500 to-violet-600' :
                  'from-orange-500 to-red-500'
                } opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`}></div>

                <div className="relative">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-6 group-hover:scale-110 transition-transform duration-300 ${
                    stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                    stat.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                    stat.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    {stat.icon}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-4xl font-bold text-gray-900">{stat.number}</h3>
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      stat.trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {stat.trend}
                    </div>
                  </div>

                  <p className="text-gray-600 font-medium">{stat.label}</p>

                  <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 group-hover:w-full ${
                      stat.color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-cyan-600 w-3/4' :
                      stat.color === 'emerald' ? 'bg-gradient-to-r from-emerald-500 to-teal-600 w-4/5' :
                      stat.color === 'purple' ? 'bg-gradient-to-r from-purple-500 to-violet-600 w-2/3' :
                      'bg-gradient-to-r from-orange-500 to-red-500 w-5/6'
                    }`}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Powerful <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Features</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage your fleet's tire operations efficiently and effectively
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <div key={index} className="group relative text-center">
                <div className="relative bg-white rounded-3xl p-10 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4">
                  <div className={`absolute inset-0 bg-gradient-to-r ${
                    feature.color === 'blue' ? 'from-blue-500 to-cyan-600' :
                    feature.color === 'emerald' ? 'from-emerald-500 to-teal-600' :
                    'from-purple-500 to-violet-600'
                  } opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-500`}></div>

                  <div className="relative">
                    <div className={`inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-8 group-hover:scale-110 transition-transform duration-300 ${
                      feature.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                      feature.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      {feature.icon}
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-6 group-hover:text-gray-800">{feature.title}</h3>
                    <p className="text-gray-600 text-lg leading-relaxed group-hover:text-gray-700">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
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
            Join hundreds of organizations already using our platform to streamline their tire management operations and boost efficiency.
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
