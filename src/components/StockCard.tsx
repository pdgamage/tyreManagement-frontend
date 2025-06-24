import React from 'react';
interface StockCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}
const StockCard = ({
  title,
  value,
  icon,
  color
}: StockCardProps) => {
  return <div className="bg-white p-6 rounded-lg shadow-md card-transition">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className={`${color} p-2 rounded-full transform transition-transform rotate-hover`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900 animate-slide-in">
        {value}
      </p>
    </div>;
};
export default StockCard;