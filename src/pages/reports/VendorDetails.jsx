import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import ReportBtns from '../../components/ReportBtns';
import ReportGlobalFilter from "../../components/reports/ReportGlobalFilter";
import { useReportGlobalFilter } from "../../components/reports/useReportGlobalFilter";
import download from "../../assets/download.svg";
import print from "../../assets/print.svg";
import Cookies from "js-cookie";
import axios from 'axios';
import { vendorDetails } from '../../apis/report.api';
import { handleExportAllReports } from '../../utils/exportDownloadPrintReports';

/**
 * Vendor Details report (observation N-08).
 *
 * "Create new report-Vendor details in which all details of vendors created
 *  should be available. Report functionality for download and print should be
 *  available. This report should be available in all teams"
 *
 * A view over the vendor master rather than over bills, so it carries no
 * region or date filter - only a search box. Every team may open it.
 */
const VendorDetails = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    const fetchVendors = async () => {
        try {
            setLoading(true);
            const params = {};
            if (search.trim()) params.vendorName = search.trim();

            const response = await axios.get(vendorDetails, {
                params,
                headers: { Authorization: `Bearer ${Cookies.get("token")}` },
            });
            setVendors(response.data.report?.data || []);
        } catch (error) {
            console.error('Error fetching vendor details:', error);
            setVendors([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Debounced so typing in the search box does not fire a request a
        // character at a time.
        const t = setTimeout(fetchVendors, 300);
        return () => clearTimeout(t);
    }, [search]);

    const titleName = "Vendor Details";

    const columns = [
        { field: "count", headerName: "Count" },
        { field: "vendorNo", headerName: "Vendor No" },
        { field: "vendorName", headerName: "Vendor Name" },
        { field: "PAN", headerName: "PAN" },
        { field: "GSTNumber", headerName: "GST No" },
        { field: "PANStatus", headerName: "PAN Status" },
        { field: "complianceStatus", headerName: "206AB Compliance" },
        { field: "emailIds", headerName: "Email IDs" },
        { field: "phoneNumbers", headerName: "Phone No" },
        { field: "addl1", headerName: "Additional 1" },
        { field: "addl2", headerName: "Additional 2" },
    ];

    const visibleColumnFields = columns.map((c) => c.field);

    // The reports' global search (29.09, item 12), over any column - PAN, GST,
    // e-mail - on top of the name search above. Vendors carry no region or
    // date, so there is nothing for the Funnel to offer here.
    const globalFilter = useReportGlobalFilter(vendors, { searchFields: visibleColumnFields });
    const filteredVendors = globalFilter.filteredRows;

    const handleTopDownload = async () => {
        await handleExportAllReports(
            filteredVendors.map((v) => v.vendorNo), filteredVendors, columns, visibleColumnFields, titleName, false,
            null, { rowKey: "vendorNo" } // vendors have no Sr No (1.10, item O-16g)
        );
    };

    const handleTopPrint = async () => {
        await handleExportAllReports(
            filteredVendors.map((v) => v.vendorNo), filteredVendors, columns, visibleColumnFields, titleName, true,
            null, { rowKey: "vendorNo" } // vendors have no Sr No (1.10, item O-16g)
        );
    };

    const th = 'sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left';
    const td = 'border border-black py-[1.2vh] px-[1vw] text-[15px]';

    return (
        <div className='mb-[12vh]'>
            <Header />
            <ReportBtns />

            <div className="p-[2vh_2vw] mx-auto font-sans h-[100vh] bg-white text-black">
                <div className="flex justify-between items-center mb-[2vh]">
                    <h2 className='text-[1.9vw] font-semibold text-[#333] m-0 w-[77%]'>{titleName}</h2>
                    <div className="flex gap-[1vw] w-[50%]">
                        <button
                            className="w-[300px] bg-[#208AF0] flex gap-[5px] justify-center items-center text-white text-[18px] font-medium py-[0.8vh] px-[1.5vw] rounded-[1vw] transition-colors duration-200 hover:bg-[#1a6fbf]"
                            onClick={handleTopPrint}
                        >
                            Print
                            <img src={print} />
                        </button>
                        <button
                            className="w-[300px] bg-[#F48D02] flex gap-[5px] justify-center items-center text-white text-[18px] font-medium py-[0.8vh] px-[1.5vw] rounded-[1vw] transition-colors duration-200 hover:bg-[#e6c200]"
                            onClick={handleTopDownload}
                        >
                            Download
                            <img src={download} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-[1vw] mb-[2vh]">
                    <label htmlFor="vendorSearch" className="text-[16px] font-medium text-[#333]">
                        Search
                    </label>
                    <input
                        id="vendorSearch"
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Vendor name or vendor no"
                        className="w-[28vw] p-[0.8vh_0.8vw] border border-[#ccc] rounded-[0.4vw] text-[16px] outline-none bg-white"
                    />
                    <span className="text-[15px] text-[#666]">
                        {loading ? "Loading…" : `${vendors.length} vendor${vendors.length === 1 ? "" : "s"}`}
                    </span>
                </div>

                <ReportGlobalFilter {...globalFilter.props} />

                <div className="overflow-x-auto shadow-md max-h-[75vh] relative border border-black">
                    <table className='w-full border-collapse bg-white'>
                        <thead>
                            <tr>
                                {columns.map((c) => (
                                    <th key={c.field} className={th}>{c.headerName}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVendors.length === 0 && !loading ? (
                                <tr>
                                    <td className={td} colSpan={columns.length}>
                                        No vendors found.
                                    </td>
                                </tr>
                            ) : (
                                filteredVendors.map((vendor) => (
                                    <tr key={vendor.vendorNo}>
                                        {columns.map((c) => (
                                            <td key={c.field} className={td}>
                                                {vendor[c.field] ?? ""}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default VendorDetails;
