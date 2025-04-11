import React from "react";
import filterSvg from "../assets/filter.svg";
import searchSvg from "../assets/search.svg";

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
        <div className="flex justify-between mb-3 items-center bg-transparent md:flex-nowrap md:gap-[2vh] md:pl-8">
            {(searchQuery && sortBy) ? (
                <div className="flex gap-3 items-center z-[21] bg-transparent w-[66%] md:w-[60%]">
                    <div className="bg-white rounded-md border border-[#cacaca] cursor-pointer flex items-center justify-center min-w-[40px] p-[9px_12px] hover:border-[#c0c0c0] hover:bg-[#fafafa]">
                        <img src={filterSvg} alt="" />
                    </div>
                    <div className="flex bg-white min-h-[32px] min-w-[65%] rounded-md border border-[#cacaca] p-1 hover:border-[#c0c0c0] hover:bg-[#fafafa]">
                        <div className="text-center w-8">
                            <img src={searchSvg} alt="" />
                        </div>
                        <input
                            type="text"
                            className="bg-transparent border-none outline-none text-[14px] w-full text-black pr-1 placeholder:text-[#cacaca]"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select
                        className="bg-white rounded-md border border-[#e2e2e2] m-0 p-[8px_16px] text-[14px] cursor-pointer outline-none shadow-sm min-h-[34px] min-w-[45%] transition-all duration-200 text-[#333] appearance-none bg-[url('data:image/svg+xml,%3Csvg width=\'10\' height=\'6\' viewBox=\'0 0 10 6\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M1 1L5 5L9 1\' stroke=\'%23666666\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E')] bg-no-repeat bg-[right_12px_center] pr-8 hover:border-[#c0c0c0] hover:bg-[#fafafa]"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="">Sort based on..</option>
                        <option value="date">Date</option>
                        <option value="amount">Amount</option>
                    </select>
                </div>
            ) : <div />}
            <div className="w-full flex justify-end z-20 text-black bg-transparent">
                <div className="w-[300px] flex items-center gap-2 bg-transparent">
                    <label className="text-[14px] bg-transparent">From:</label>
                    <input
                        type="date"
                        className="bg-white rounded-md border border-[#cacaca] p-[6px_3px] text-[14px] outline-none min-h-[32px] min-w-[110px] text-center cursor-pointer text-black [&::-webkit-calendar-picker-indicator]:bg-[#cacaca]"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                    />
                    <label className="text-[14px] bg-transparent">To:</label>
                    <input
                        type="date"
                        className="bg-white rounded-md border border-[#cacaca] p-[6px_3px] text-[14px] outline-none min-h-[32px] min-w-[110px] text-center cursor-pointer text-black [&::-webkit-calendar-picker-indicator]:bg-[#cacaca]"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
};

export default Filters;