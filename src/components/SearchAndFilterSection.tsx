import React from 'react';
import { Search, Filter, Clock, CheckCircle, Smile, XCircle, ChevronUp, ChevronDown, X } from 'lucide-react';

interface SearchAndFilterSectionProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  isStatusDropdownOpen: boolean;
  setIsStatusDropdownOpen: (value: boolean) => void;
}

const statusOptions = [
  { value: "all", label: "All Statuses", icon: <Filter className="w-4 h-4 text-gray-500" /> },
  { value: "pending", label: "Pending", icon: <Clock className="w-4 h-4 text-yellow-500" /> },
  { value: "approved", label: "Approved", icon: <CheckCircle className="w-4 h-4 text-green-500" /> },
  { value: "complete", label: "Complete", icon: <Smile className="w-4 h-4 text-blue-500" /> },
  { value: "rejected", label: "Rejected", icon: <XCircle className="w-4 h-4 text-red-500" /> }
];

const SearchAndFilterSection: React.FC<SearchAndFilterSectionProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  isStatusDropdownOpen,
  setIsStatusDropdownOpen
}) => {
  return (
    <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-xl p-5 shadow-lg border border-white/20">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-blue-100 mb-2">
              Filter by Status
            </label>
            <div className="relative">
              <button
                type="button"
                className="relative w-full bg-white/90 border border-blue-300/50 rounded-lg shadow-sm pl-3 pr-10 py-2.5 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 flex items-center"
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              >
                <span className="flex items-center">
                  {statusFilter === "all" ? (
                    <Filter className="h-4 w-4 text-gray-500 mr-2" />
                  ) : (
                    statusOptions.find(opt => opt.value === statusFilter)?.icon
                  )}
                  <span className="text-gray-900 ml-2">
                    {statusOptions.find(opt => opt.value === statusFilter)?.label || "All Statuses"}
                  </span>
                </span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2">
                  {isStatusDropdownOpen ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </span>
              </button>
              
              {isStatusDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg">
                  <div className="py-1">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        className={`w-full text-left px-4 py-2 text-sm flex items-center hover:bg-gray-100 ${
                          statusFilter === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                        }`}
                        onClick={() => {
                          setStatusFilter(option.value);
                          setIsStatusDropdownOpen(false);
                        }}
                      >
                        {option.icon}
                        <span className="ml-2">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Search Requests */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-blue-100 mb-2">
              Search Requests
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                id="search"
                className="block w-full pl-10 pr-12 py-2.5 text-sm border border-blue-300/50 rounded-lg bg-white/90 text-gray-900 shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                placeholder="Search by order #, ID, or supplier"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilterSection;
