import React, { useState, useRef, useEffect } from "react";
import filterSvg from "../assets/filter.svg";
import searchSvg from "../assets/search.svg";
import "../styles/Filters.css";

const FiltersOutstanding = ({
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
    const [selectedRegions, setSelectedRegions] = useState([]);
    const regionDropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (regionDropdownRef.current && !regionDropdownRef.current.contains(event.target)) {
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
        setSelectedRegions(prev => 
            prev.includes(region) 
                ? prev.filter(r => r !== region)
                : [...prev, region]
        );
    };

    return (
        <div className="top-bar">
            {/* <div className="filter-container">
                <div className="filter">
                    <img src={filterSvg} alt="" />
                </div>
                <div className="search-box">
                    <div className="search">
                        <img src={searchSvg} alt="" />
                    </div>
                    <input
                        type="text"
                        className="bar-search-input"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="custom-dropdown" ref={regionDropdownRef}>
                    <button
                        className="filters-dropdown-button"
                        onClick={() => setIsRegionDropdownOpen(!isRegionDropdownOpen)}
                    >
                        {selectedRegions.length === 0
                            ? "All Regions"
                            : selectedRegions.length === 1
                                ? selectedRegions[0]
                                : `${selectedRegions.length} Regions Selected`}
                    </button>
                    {isRegionDropdownOpen && (
                        <div className="dropdown-content">
                            {regions.map((region) => (
                                <div
                                    key={region}
                                    className="dropdown-option"
                                    onClick={() => handleRegionToggle(region)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedRegions.includes(region)}
                                        readOnly
                                    />
                                    <label>{region}</label>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <select
                    className="sort"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                >
                    <option value="">Sort based on..</option>
                    <option value="date">Date</option>
                    <option value="amount">Amount</option>
                </select>
            </div> */}
            <div className="date-container">
                <div className="dates">
                    <label>From:</label>
                    <input
                        type="date"
                        className="date-picker"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                    />
                    <label>To:</label>
                    <input
                        type="date"
                        className="date-picker"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
};

export default FiltersOutstanding;
