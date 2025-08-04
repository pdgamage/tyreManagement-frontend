{/* Date Range Filter */}
        <div className="mb-6 bg-white rounded-xl shadow-md p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Filter className="w-5 h-5 mr-2 text-blue-600" />
            Date Range Filter
          </h3>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">Start Date</label>
                <input
                  type="date"
                  className="block px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                  value={startDate}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    setStartDate(newDate);
                    setIsDateFilterActive(false);
                    if (endDate && new Date(endDate) < new Date(newDate)) {
                      setEndDate(newDate);
                    }
                  }}
                  max={endDate || undefined}
                />
              </div>
              <span className="text-gray-500 self-end mb-2">to</span>
              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-1">End Date</label>
                <input
                  type="date"
                  className="block px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                  value={endDate}
                  onChange={(e) => {
                    const newDate = e.target.value;
                    setEndDate(newDate);
                    setIsDateFilterActive(false);
                    if (startDate && new Date(startDate) > new Date(newDate)) {
                      setStartDate(newDate);
                    }
                  }}
                  min={startDate || undefined}
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (startDate && endDate) {
                      console.log('Applying date filter:', { startDate, endDate });
                      setIsDateFilterActive(true);
                      fetchAllRequests();
                    }
                  }}
                  disabled={!startDate || !endDate}
                  className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply Date Filter
                </button>
                {isDateFilterActive && (
                  <button
                    onClick={() => {
                      setStartDate("");
                      setEndDate("");
                      setIsDateFilterActive(false);
                      if (selectedVehicle) {
                        fetchRequests(selectedVehicle);
                      } else {
                        setRequests([]);
                        setFilteredRequests([]);
                      }
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Clear Date Filter
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Stats */}
        {selectedVehicle && requests.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {/* Your dashboard stats content here */}
          </div>
        )}
