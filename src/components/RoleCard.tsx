import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRightIcon } from 'lucide-react';
interface RoleCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  requiresLogin?: boolean;
}
const RoleCard = ({
  title,
  description,
  icon,
  path,
  requiresLogin = true
}: RoleCardProps) => {
  const navigate = useNavigate();
  const handleClick = () => {
    if (requiresLogin) {
      navigate('/login'); // Changed from /register/:path to /login
    } else {
      navigate(`/${path}`);
    }
  };
  return <div className={`bg-white rounded-xl shadow-md p-8 cursor-pointer card-transition ${requiresLogin ? 'border-gray-100' : 'border-blue-500'} border-2`} onClick={handleClick}>
      <div className="flex flex-col items-center">
        <div className={`text-blue-600 mb-6 transform transition-transform rotate-hover ${requiresLogin ? 'opacity-80' : 'opacity-100'}`}>
          {icon}
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-3">{title}</h2>
        <p className="text-gray-600 text-center mb-6">{description}</p>
        <button className={`flex items-center space-x-2 px-6 py-3 rounded-lg button-pop ${requiresLogin ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-blue-600 text-white hover:bg-blue-700 shine'}`}>
          <span>{requiresLogin ? 'Login Required' : 'Quick Access'}</span>
          <ArrowRightIcon size={16} className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>;
};
export default RoleCard;