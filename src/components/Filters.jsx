import React from "react";
import filterSvg from "../assets/filter.svg";
import searchSvg from "../assets/search.svg";
import "../styles/Filters.css";

const Filters = ({
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
}) => {
    return (
        <div className="top-bar">
            {(searchQuery && sortBy) ?
                <div className="filter-container">
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
                    <select
                        className="sort"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="">Sort based on..</option>
                        <option value="date">Date</option>
                        <option value="amount">Amount</option>
                    </select>
                </div>
                : <div />}
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

export default Filters;