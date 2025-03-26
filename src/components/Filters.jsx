import React, { useState, useRef, useEffect } from "react";
import filterSvg from "../assets/filter.svg";
import searchSvg from "../assets/search.svg";

const Filters = ({
  searchQuery,
  setSearchQuery,
  regions,
  selectedRegion,
  setSelectedRegion,
  sortBy,
  setSortBy,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
}) => {
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
  const [selectedRegions, setSelectedRegions] = useState(
    selectedRegion ? [selectedRegion] : []
  );
  const regionDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        regionDropdownRef.current &&
        !regionDropdownRef.current.contains(event.target)
      ) {
        setIsRegionDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setSelectedRegion(selectedRegions);
  }, [selectedRegions, setSelectedRegion]);

  const handleRegionToggle = (region) => {
    setSelectedRegions((prev) => {
      if (prev.includes(region)) {
        return prev.filter((r) => r !== region);
      } else {
        return [...prev, region];
      }
    });
  };

  const handleSelectAllRegions = () => {
    if (selectedRegions.length === regions.length) {
      setSelectedRegions([]);
    } else {
      setSelectedRegions([...regions]);
    }
  };

  const handleFromDateChange = (e) => {
    setFromDate(e.target.value);
  };

  const handleToDateChange = (e) => {
    setToDate(e.target.value);
  };

  return (
    <div className="flex flex-wrap justify-between mb-6 pl-16 md:pl-8 sm:pl-4 items-center bg-transparent gap-2">
      <div className="flex gap-3 items-center z-20 bg-transparent w-full lg:w-2/3 md:w-3/5">
        {/* Filter button */}
        <div className="bg-white rounded-md border border-[#cacaca] cursor-pointer flex items-center justify-center min-w-[40px] p-[9px] hover:border-[#c0c0c0] hover:bg-[#fafafa]">
          <img src={filterSvg} alt="" />
        </div>
        
        {/* Search box */}
        <div className="flex bg-white min-h-[32px] min-w-[65%] rounded-md border border-[#cacaca] p-1 hover:border-[#c0c0c0] hover:bg-[#fafafa]">
          <div className="text-center w-8">
            <img src={searchSvg} alt="" />
          </div>
          <input
            type="text"
            className="bg-transparent border-none outline-none text-sm w-full text-black pr-1"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Region dropdown */}
        <div className="relative min-w-[40%] z-[100] bg-transparent" ref={regionDropdownRef}>
          <button
            className="bg-white rounded-md border border-[#e2e2e2] m-0 py-2 px-4 text-sm cursor-pointer outline-none shadow-sm min-h-[34px] w-full text-left transition-all duration-200 text-[#333] appearance-none pr-8"
            onClick={() => setIsRegionDropdownOpen(!isRegionDropdownOpen)}
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23666666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 12px center"
            }}
          >
            {selectedRegions.length === 0
              ? "All Regions"
              : selectedRegions.length === 1
              ? selectedRegions[0]
              : `${selectedRegions.length} Regions Selected`}
          </button>

          {isRegionDropdownOpen && (
            <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-[#cacaca] rounded-lg p-1.5 shadow-md max-h-[250px] overflow-y-auto z-[101]">
              <div 
                className="flex items-center py-1.5 px-3 gap-2.5 cursor-pointer transition-colors duration-200 rounded hover:bg-[#e1e1e1]"
                onClick={handleSelectAllRegions}
              >
                <input
                  type="checkbox"
                  checked={
                    selectedRegions.length === regions.length &&
                    regions.length > 0
                  }
                  readOnly
                  className="cursor-pointer w-4 h-4 rounded border border-[#d1d5db]"
                  style={{
                    opacity: selectedRegions.length === regions.length && regions.length > 0 ? 1 : 0.5,
                    filter: selectedRegions.length === regions.length && regions.length > 0 ? "invert(10%)" : "invert(100%)"
                  }}
                />
                <label className="cursor-pointer text-sm text-[#333] select-none bg-transparent">Select All</label>
              </div>
              {regions.map((region) => (
                <div
                  key={region}
                  className="flex items-center py-1.5 px-3 gap-2.5 cursor-pointer transition-colors duration-200 rounded hover:bg-[#e1e1e1]"
                  onClick={() => handleRegionToggle(region)}
                >
                  <input
                    type="checkbox"
                    checked={selectedRegions.includes(region)}
                    readOnly
                    className="cursor-pointer w-4 h-4 rounded border border-[#d1d5db]"
                    style={{
                      opacity: selectedRegions.includes(region) ? 1 : 0.5,
                      filter: selectedRegions.includes(region) ? "invert(10%)" : "invert(100%)"
                    }}
                  />
                  <label className="cursor-pointer text-sm text-[#333] select-none bg-transparent">{region}</label>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Sort dropdown */}
        <select
          className="bg-white rounded-md border border-[#e2e2e2] m-0 py-2 px-4 text-sm cursor-pointer outline-none shadow-sm min-h-[34px] min-w-[45%] transition-all duration-200 text-[#333] appearance-none pr-8 hover:border-[#c0c0c0] hover:bg-[#fafafa]"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23666666' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 12px center"
          }}
        >
          <option value="">Sort based on..</option>
          <option value="status">Status</option>
          <option value="amount">COP Amount</option>
          <option value="date">Date</option>
        </select>
      </div>
      
      {/* Date pickers */}
      <div className="w-full lg:w-auto flex justify-end z-10 text-black bg-transparent mt-2 lg:mt-0">
        <div className="w-full sm:w-[300px] flex items-center gap-2 bg-transparent flex-wrap sm:flex-nowrap">
          <label className="text-sm bg-transparent">From:</label>
          <input
            type="date"
            className="bg-white rounded-md border border-[#cacaca] py-1.5 px-0.5 text-sm outline-none min-h-[32px] min-w-[110px] text-center cursor-pointer text-black"
            value={fromDate}
            onChange={handleFromDateChange}
          />
          <label className="text-sm bg-transparent">To:</label>
          <input
            type="date"
            className="bg-white rounded-md border border-[#cacaca] py-1.5 px-0.5 text-sm outline-none min-h-[32px] min-w-[110px] text-center cursor-pointer text-black"
            value={toDate}
            onChange={handleToDateChange}
          />
        </div>
      </div>
    </div>
  );
};

export default Filters;