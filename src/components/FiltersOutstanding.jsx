import React from "react";
const FiltersOutstanding = ({
    fromDate,
    setFromDate,
    toDate,
    setToDate,
}) => {
    return (
        <div className="flex justify-between mb-6 items-center bg-transparent">
            <div className="w-full flex justify-end z-20 text-black bg-transparent">
                <div className="w-[300px] flex items-center gap-2 bg-transparent">
                    <label className="text-[14px] bg-transparent">From:</label>
                    <input
                        type="date"
                        className="bg-white rounded-md border border-[#cacaca] p-[6px_3px] text-[14px] outline-none min-h-[32px] min-w-[110px] text-center cursor-pointer text-black"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                    />
                    <label className="text-[14px] bg-transparent">To:</label>
                    <input
                        type="date"
                        className="bg-white rounded-md border border-[#cacaca] p-[6px_3px] text-[14px] outline-none min-h-[32px] min-w-[110px] text-center cursor-pointer text-black"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
};

export default FiltersOutstanding;
