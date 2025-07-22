import { Link } from "react-router-dom";
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
  Monitor
} from "lucide-react";

const Home = () => {
  const quickActions = [
    {
      icon: <ClipboardListIcon className="w-8 h-8" />,
      title: "Submit Request",
      description: "Create new tire request",
      link: "/user",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      icon: <TruckIcon className="w-8 h-8" />,
      title: "Register Vehicle",
      description: "Add new vehicle to fleet",
      link: "/vehicle-registration",
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600"
    },
    {
      icon: <BarChart3Icon className="w-8 h-8" />,
      title: "View Reports",
      description: "Access analytics dashboard",
      link: "/login",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    },
    {
      icon: <Settings className="w-8 h-8" />,
      title: "System Admin",
      description: "Manage system settings",
      link: "/login",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600"
    }
  ];

  const systemStats = [
    {
      icon: <Users className="w-6 h-6" />,
      value: "1,247",
      label: "Active Users",
      change: "+12%",
      changeType: "positive",
      color: "text-blue-600"
    },
    {
      icon: <TruckIcon className="w-6 h-6" />,
      value: "856",
      label: "Fleet Vehicles",
      change: "+8%",
      changeType: "positive",
      color: "text-emerald-600"
    },
    {
      icon: <ClipboardListIcon className="w-6 h-6" />,
      value: "342",
      label: "Pending Requests",
      change: "-5%",
      changeType: "negative",
      color: "text-purple-600"
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      value: "98.5%",
      label: "Approval Rate",
      change: "+2%",
      changeType: "positive",
      color: "text-orange-600"
    }
  ];

  const features = [
    {
      icon: <FileText className="w-12 h-12" />,
      title: "Smart Request Management",
      description: "Automated workflow with intelligent routing and real-time status tracking for all tire requests.",
      benefits: ["Automated approvals", "Real-time tracking", "Mobile notifications"]
    },
    {
      icon: <Database className="w-12 h-12" />,
      title: "Inventory Management",
      description: "Complete tire inventory control with predictive analytics and automated reorder points.",
      benefits: ["Stock optimization", "Predictive analytics", "Automated alerts"]
    },
    {
      icon: <Shield className="w-12 h-12" />,
      title: "Security & Compliance",
      description: "Enterprise-grade security with role-based access control and audit trails.",
      benefits: ["Role-based access", "Audit logging", "Data encryption"]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <TruckIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">SLT Mobitel</h1>
                <p className="text-sm text-gray-600">Tire Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">System Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Dashboard Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Fleet Tire Management Dashboard</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Comprehensive tire management solution for modern fleet operations.
              Monitor, manage, and optimize your tire inventory and requests.
            </p>
          </div>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="group bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 ${action.bgColor} rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <div className={action.textColor}>{action.icon}</div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{action.title}</h3>
                <p className="text-blue-100 text-sm">{action.description}</p>
                <div className="mt-4 flex items-center text-white/80 group-hover:text-white transition-colors">
                  <span className="text-sm">Access now</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* System Statistics */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">System Overview</h3>
            <p className="text-lg text-gray-600">Real-time statistics and performance metrics</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {systemStats.map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gray-50 ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <div className={`text-sm font-medium px-2 py-1 rounded-full ${
                    stat.changeType === 'positive'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {stat.change}
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Key Features</h3>
            <p className="text-lg text-gray-600">Comprehensive tools for efficient tire management</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                <div className="text-blue-600 mb-6">{feature.icon}</div>
                <h4 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h4>
                <p className="text-gray-600 mb-6">{feature.description}</p>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 lg:p-12">
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">24/7 Support Available</h3>
              <p className="text-lg text-gray-600">Get help when you need it most</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <PhoneIcon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Phone Support</h4>
                <p className="text-gray-600 mb-3">24/7 emergency support</p>
                <p className="text-2xl font-bold text-blue-600">1717</p>
              </div>

              <div className="text-center">
                <div className="bg-emerald-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MailIcon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Email Support</h4>
                <p className="text-gray-600 mb-3">Technical assistance</p>
                <p className="text-lg font-semibold text-emerald-600">support@mobitel.lk</p>
              </div>

              <div className="text-center">
                <div className="bg-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Monitor className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">System Status</h4>
                <p className="text-gray-600 mb-3">Real-time monitoring</p>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 font-medium">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of organizations using our platform for efficient tire management
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/user"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-lg"
            >
              Submit Your First Request
            </Link>
            <Link
              to="/login"
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-colors"
            >
              Access Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <TruckIcon className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-xl font-bold">SLT Mobitel</h4>
              </div>
              <p className="text-gray-300">
                Professional tire management solutions for modern fleets.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/user" className="text-gray-300 hover:text-white transition-colors">Submit Request</Link></li>
                <li><Link to="/vehicle-registration" className="text-gray-300 hover:text-white transition-colors">Register Vehicle</Link></li>
                <li><Link to="/login" className="text-gray-300 hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <div className="space-y-2">
                <p className="text-gray-300">Phone: 1717</p>
                <p className="text-gray-300">Email: support@mobitel.lk</p>
                <div className="flex items-center space-x-2 mt-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-400 text-sm">System Online</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400">© 2024 SLT Mobitel. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
