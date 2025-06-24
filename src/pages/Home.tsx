import React from 'react';
import { Link } from 'react-router-dom';
import tireImage from '../images/car-tire-png-469.png';
import { UserIcon, ShieldIcon, WrenchIcon, ShoppingCartIcon, TruckIcon, BarChart3Icon, ClipboardListIcon, PhoneIcon, MailIcon, ShieldCheckIcon, CheckCircleIcon, TimerIcon, TrendingUpIcon, SettingsIcon, AlertTriangleIcon } from 'lucide-react';

const Home = () => {
  const features = [{
    icon: <ClipboardListIcon size={32} className="text-blue-600" />,
    title: 'Request Management',
    description: 'Streamlined tire request and approval workflow'
  }, {
    icon: <TruckIcon size={32} className="text-green-600" />,
    title: 'Vehicle Registration',
    description: 'Comprehensive vehicle information management'
  }, {
    icon: <BarChart3Icon size={32} className="text-purple-600" />,
    title: 'Stock Management',
    description: 'Real-time inventory tracking and management'
  }, {
    icon: <ShieldCheckIcon size={32} className="text-red-600" />,
    title: 'Multi-level Approval',
    description: 'Secure and efficient approval process'
  }];

  const benefits = [{
    icon: <div size={48} className="text-blue-500" />,
    title: 'Improved Efficiency',
    description: 'Reduce tire replacement downtime by 45%'
  }, {
    icon: <TrendingUpIcon size={48} className="text-green-500" />,
    title: 'Cost Reduction',
    description: 'Save up to 30% on tire management costs'
  }, {
    icon: <SettingsIcon size={48} className="text-purple-500" />,
    title: 'Better Maintenance',
    description: 'Proactive tire maintenance scheduling'
  }, {
    icon: <AlertTriangleIcon size={48} className="text-amber-500" />,
    title: 'Risk Prevention',
    description: 'Early warning system for tire issues'
  }];

  const highlights = [{
    title: 'Quick Processing',
    description: 'Most requests processed within 24 hours',
    icon: <TimerIcon size={24} className="text-blue-600" />
  }, {
    title: 'High Approval Rate',
    description: '95% of valid requests approved',
    icon: <CheckCircleIcon size={24} className="text-green-600" />
  }, {
    title: 'Real-time Tracking',
    description: 'Track your request status instantly',
    icon: <TruckIcon size={24} className="text-purple-600" />
  }];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16 md:py-24 rounded-2xl overflow-hidden">
  <div className="absolute inset-0 bg-pattern opacity-10"></div>
  <div className="relative max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center">
    {/* Tire image on left - shows on medium screens and up */}
    <div className="hidden md:block w-full md:w-2/5 lg:w-1/3 pr-0 md:pr-8 mb-8 md:mb-0">
      <img 
        src={tireImage} 
        alt="Tire System" 
        className="w-full h-auto max-h-72 object-contain transition-transform duration-300 hover:scale-105"
      />
    </div>
    
    {/* Content section */}
    <div className="w-full md:w-3/5 lg:w-2/3 text-center md:text-left">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6">
        SLT Mobitel Tire Management System
      </h1>
      <p className="text-lg md:text-xl text-blue-100 mb-6 md:mb-8">
        Streamline your fleet's tire management with our comprehensive solution
      </p>
      <div className="flex flex-col sm:flex-row justify-center md:justify-start items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <Link 
          to="/user" 
          className="bg-white text-blue-900 px-6 py-2 sm:px-8 sm:py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors w-full sm:w-auto transform hover:-translate-y-1"
        >
          Submit Tire Request
        </Link>
        <Link 
          to="/vehicle-registration" 
          className="border-2 border-white text-white px-6 py-2 sm:px-8 sm:py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors w-full sm:w-auto transform hover:-translate-y-1"
        >
          Register Vehicle
        </Link>
      </div>
    </div>
  </div>
  
  {/* Mobile tire image - shows on small screens only */}
  <div className="md:hidden w-full mt-8 px-8">
    <img 
      src={tireImage} 
      alt="Tire System" 
      className="w-full h-auto max-h-48 mx-auto object-contain"
    />
  </div>
</section>

      {/* Quick Support Section */}
      <section className="bg-white rounded-lg shadow-lg p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <PhoneIcon size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold">24/7 Support</h3>
              <p className="text-gray-600">1717</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-full">
              <MailIcon size={24} className="text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold">Email Support</h3>
              <p className="text-gray-600">support@mobitel.lk</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <ClipboardListIcon size={24} className="text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold">Quick Access</h3>
              <p className="text-gray-600">Simple request process</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 card-transition">
              <div className="mb-6">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 bg-gray-50 rounded-xl">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            System Benefits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-md text-center card-transition">
                <div className="flex justify-center mb-6">{benefit.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Highlights */}
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Service Highlights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {highlights.map((highlight, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md flex items-start space-x-4 card-transition">
                <div className="bg-gray-50 p-3 rounded-full">
                  {highlight.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    {highlight.title}
                  </h3>
                  <p className="text-gray-600">{highlight.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-blue-50 py-16 rounded-xl">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            System Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md text-center transform hover:scale-105 transition-transform">
              <p className="text-4xl font-bold text-blue-600 mb-2">150+</p>
              <p className="text-gray-600">Vehicles Managed</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md text-center transform hover:scale-105 transition-transform">
              <p className="text-4xl font-bold text-green-600 mb-2">1,000+</p>
              <p className="text-gray-600">Requests Processed</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md text-center transform hover:scale-105 transition-transform">
              <p className="text-4xl font-bold text-purple-600 mb-2">5,000+</p>
              <p className="text-gray-600">Tires in Stock</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md text-center transform hover:scale-105 transition-transform">
              <p className="text-4xl font-bold text-red-600 mb-2">99.9%</p>
              <p className="text-gray-600">System Uptime</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;