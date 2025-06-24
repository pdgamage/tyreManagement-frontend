import React, { useState } from 'react';
import { BarChart3Icon, PackageIcon, AlertTriangleIcon, TruckIcon } from 'lucide-react';
interface StockItem {
  id: string;
  tireSize: string;
  brand: string;
  quantity: number;
  minimumStock: number;
  location: string;
  lastUpdated: string;
}
const mockStock: StockItem[] = [{
  id: '1',
  tireSize: '275/70R22.5',
  brand: 'Michelin',
  quantity: 15,
  minimumStock: 10,
  location: 'Warehouse A',
  lastUpdated: '2023-07-15'
}, {
  id: '2',
  tireSize: '295/75R22.5',
  brand: 'Bridgestone',
  quantity: 8,
  minimumStock: 12,
  location: 'Warehouse B',
  lastUpdated: '2023-07-14'
}];
const StockManagement = () => {
  const [stock] = useState<StockItem[]>(mockStock);
  const [filter, setFilter] = useState('');
  const filteredStock = stock.filter(item => item.tireSize.toLowerCase().includes(filter.toLowerCase()) || item.brand.toLowerCase().includes(filter.toLowerCase()) || item.location.toLowerCase().includes(filter.toLowerCase()));
  const StockCard = ({
    title,
    value,
    icon,
    color
  }: {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
  }) => <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className={`${color} p-2 rounded-full`}>{icon}</div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>;
  return <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StockCard title="Total Stock" value={stock.reduce((acc, item) => acc + item.quantity, 0)} icon={<PackageIcon size={24} className="text-blue-600" />} color="bg-blue-100" />
        <StockCard title="Low Stock Items" value={stock.filter(item => item.quantity < item.minimumStock).length} icon={<AlertTriangleIcon size={24} className="text-yellow-600" />} color="bg-yellow-100" />
        <StockCard title="Warehouses" value={new Set(stock.map(item => item.location)).size} icon={<TruckIcon size={24} className="text-green-600" />} color="bg-green-100" />
        <StockCard title="Tire Sizes" value={new Set(stock.map(item => item.tireSize)).size} icon={<BarChart3Icon size={24} className="text-purple-600" />} color="bg-purple-100" />
      </div>
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              Stock Inventory
            </h2>
            <input type="text" placeholder="Search stock..." className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={filter} onChange={e => setFilter(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tire Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Brand
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStock.map(item => <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.tireSize}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.brand}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.quantity < item.minimumStock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {item.quantity < item.minimumStock ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.lastUpdated}
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>;
};
export default StockManagement;