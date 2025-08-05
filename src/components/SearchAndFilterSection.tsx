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
  { value: "all", label: "All Requests", icon: <Filter className="w-5 h-5 text-gray-500" /> },
  { value: "pending", label: "Pending", icon: <Clock className="w-5 h-5 text-yellow-500" /> },
  { value: "approved", label: "Approved", icon: <CheckCircle className="w-5 h-5 text-green-500" /> },
  { value: "complete", label: "Complete", icon: <Smile className="w-5 h-5 text-blue-500" /> },
  { value: "rejected", label: "Rejected", icon: <XCircle className="w-5 h-5 text-red-500" /> }
];

const SearchAndFilterSection: React.FC<SearchAndFilterSectionProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  isStatusDropdownOpen,
  setIsStatusDropdownOpen
}) => {
  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.status-dropdown')) {
        setIsStatusDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsStatusDropdownOpen]);

  const currentStatus = statusOptions.find(opt => opt.value === statusFilter) || statusOptions[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Status Filter */}
      <div className="status-dropdown">
        <label className="block text-sm font-medium text-blue-100 mb-2">
          Filter by Status
        </label>
        <div className="relative">
          <button
            type="button"
            className="relative w-full bg-white/90 border border-blue-300/50 rounded-lg pl-4 pr-10 py-3 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 hover:bg-white/95 transition-colors"
            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
          >
            <span className="flex items-center">
              <span className="flex items-center gap-2">
                {currentStatus.icon}
                <span className="text-gray-900 font-medium">
                  {currentStatus.label}
                </span>
              </span>
            </span>
            <span className="absolute inset-y-0 right-0 flex items-center pr-3">
              {isStatusDropdownOpen ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </span>
          </button>

          {isStatusDropdownOpen && (
            <div className="absolute z-50 mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-100 py-1">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  className={`w-full text-left px-4 py-3 text-sm flex items-center gap-2 hover:bg-blue-50/50 transition-colors ${
                    statusFilter === option.value 
                      ? 'bg-blue-50 text-blue-700 font-medium' 
                      : 'text-gray-700'
                  }`}
                  onClick={() => {
                    setStatusFilter(option.value);
                    setIsStatusDropdownOpen(false);
                  }}
                >
                  {option.icon}
                  <span>{option.label}</span>
                </button>
              ))}
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
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            id="search"
            className="block w-full pl-11 pr-10 py-3 text-sm border border-blue-300/50 rounded-lg bg-white/90 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 hover:bg-white/95 transition-colors"
            placeholder="Search by order #, ID, or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X 
                className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" 
                aria-label="Clear search"
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilterSection;
