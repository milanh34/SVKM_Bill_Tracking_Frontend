import React, { useState, useEffect, useRef } from 'react';
import Header from '../../components/Header';
import ReportBtns from '../../components/ReportBtns';
import download from "../../assets/download.svg";
import Cookies from "js-cookie";
import axios from 'axios';
import { toast } from 'react-toastify';
import { formsList, formsUpload, formDownload, formDelete } from '../../apis/forms.api';

/**
 * Forms repository (29.09, reply Q2).
 *
 * "The forms will be uploaded by Admin and should be available for downloads
 *  in all the teams in reporting tab. Typically, forms will be 1 or 2 pagers
 *  in word format. Maximum 10-12 forms. Also, no version needed. Latest will
 *  be available to download."
 *
 * Every team sees the list and can download. Admin also gets the upload form
 * and delete buttons; uploading under an existing title replaces that form.
 */
const ACCEPT = ".doc,.docx,.pdf";
const MAX_BYTES = 5 * 1024 * 1024; // mirrors utils/multer.js on the server

const formatSize = (bytes) => {
    if (!bytes && bytes !== 0) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const formatDate = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${dd}-${mm}-${d.getFullYear()}`;
};

/** Pull a message out of an error whose body may be a Blob (downloads). */
const errorMessage = async (error, fallback) => {
    const data = error?.response?.data;
    if (data instanceof Blob) {
        try {
            return JSON.parse(await data.text()).message || fallback;
        } catch {
            return fallback;
        }
    }
    return data?.message || fallback;
};

const Forms = () => {
    const isAdmin = Cookies.get("userRole") === "admin";
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInput = useRef(null);

    const fetchForms = async () => {
        try {
            setLoading(true);
            const response = await axios.get(formsList);
            setForms(response.data?.data || []);
        } catch (error) {
            console.error('Error fetching forms:', error);
            toast.error(await errorMessage(error, "Could not load forms"));
            setForms([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchForms();
    }, []);

    const handleDownload = async (form) => {
        try {
            const response = await axios.get(formDownload(form._id), { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: form.mimeType }));
            const link = document.createElement('a');
            link.href = url;
            link.download = form.fileName;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error downloading form:', error);
            toast.error(await errorMessage(error, `Could not download ${form.title}`));
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        const trimmed = title.trim();
        if (!trimmed) return toast.error("Enter a title for the form");
        if (!file) return toast.error("Choose a file to upload");
        const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
        if (!ACCEPT.split(",").includes(ext)) {
            return toast.error("Only Word (.doc, .docx) or PDF files are accepted");
        }
        if (file.size > MAX_BYTES) return toast.error("File must be 5 MB or smaller");

        const replacing = forms.some((f) => f.title.toLowerCase() === trimmed.toLowerCase());
        if (replacing && !window.confirm(`A form titled "${trimmed}" already exists. Replace it with this file?`)) {
            return;
        }

        try {
            setUploading(true);
            const body = new FormData();
            body.append("title", trimmed);
            body.append("file", file);
            const response = await axios.post(formsUpload, body);
            toast.success(response.data?.message || "Form uploaded");
            setTitle("");
            setFile(null);
            if (fileInput.current) fileInput.current.value = "";
            fetchForms();
        } catch (error) {
            console.error('Error uploading form:', error);
            toast.error(await errorMessage(error, "Could not upload the form"));
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (form) => {
        if (!window.confirm(`Delete the form "${form.title}"? Teams will no longer be able to download it.`)) return;
        try {
            await axios.delete(formDelete(form._id));
            toast.success("Form deleted");
            fetchForms();
        } catch (error) {
            console.error('Error deleting form:', error);
            toast.error(await errorMessage(error, "Could not delete the form"));
        }
    };

    const titleName = "Forms";

    const th = 'sticky top-0 z-[1] border border-black bg-[#f8f9fa] font-bold text-[#333] text-[16px] py-[1.5vh] px-[1vw] text-left';
    const td = 'border border-black py-[1.2vh] px-[1vw] text-[15px]';
    const colCount = isAdmin ? 6 : 5;

    return (
        <div className='mb-[12vh]'>
            <Header />
            <ReportBtns />

            <div className="p-[2vh_2vw] mx-auto font-sans h-[100vh] bg-white text-black">
                <div className="flex justify-between items-center mb-[2vh]">
                    <h2 className='text-[1.9vw] font-semibold text-[#333] m-0'>{titleName}</h2>
                    <span className="text-[15px] text-[#666]">
                        {loading ? "Loading…" : `${forms.length} form${forms.length === 1 ? "" : "s"}`}
                    </span>
                </div>

                {isAdmin && (
                    <form
                        onSubmit={handleUpload}
                        className="flex flex-wrap items-center gap-[1vw] mb-[2vh] p-[1.5vh_1vw] border border-[#ccc] rounded-[0.4vw] bg-[#f8f9fa]"
                    >
                        <label htmlFor="formTitle" className="text-[16px] font-medium text-[#333]">
                            Title
                        </label>
                        <input
                            id="formTitle"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Vendor Undertaking"
                            className="w-[24vw] p-[0.8vh_0.8vw] border border-[#ccc] rounded-[0.4vw] text-[16px] outline-none bg-white"
                        />
                        <input
                            ref={fileInput}
                            type="file"
                            accept={ACCEPT}
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="text-[15px]"
                        />
                        <button
                            type="submit"
                            disabled={uploading}
                            className="bg-[#364cbb] text-white text-[16px] font-medium py-[0.8vh] px-[1.5vw] rounded-[1vw] transition-colors duration-200 hover:bg-[#2a3c9e] disabled:opacity-60"
                        >
                            {uploading ? "Uploading…" : "Upload"}
                        </button>
                        <span className="text-[14px] text-[#666]">
                            Word or PDF, up to 5 MB. Uploading under an existing title replaces that form.
                        </span>
                    </form>
                )}

                <div className="overflow-x-auto shadow-md max-h-[75vh] relative border border-black">
                    <table className='w-full border-collapse bg-white'>
                        <thead>
                            <tr>
                                <th className={th}>Title</th>
                                <th className={th}>File Name</th>
                                <th className={th}>Size</th>
                                <th className={th}>Uploaded On</th>
                                <th className={th}>Download</th>
                                {isAdmin && <th className={th}>Delete</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {forms.length === 0 && !loading ? (
                                <tr>
                                    <td className={td} colSpan={colCount}>
                                        No forms available.
                                    </td>
                                </tr>
                            ) : (
                                forms.map((form) => (
                                    <tr key={form._id}>
                                        <td className={td}>{form.title}</td>
                                        <td className={td}>{form.fileName}</td>
                                        <td className={td}>{formatSize(form.size)}</td>
                                        <td className={td}>{formatDate(form.updatedAt || form.createdAt)}</td>
                                        <td className={td}>
                                            <button
                                                onClick={() => handleDownload(form)}
                                                className="bg-[#F48D02] flex gap-[5px] justify-center items-center text-white text-[15px] font-medium py-[0.5vh] px-[1vw] rounded-[1vw] transition-colors duration-200 hover:bg-[#e6c200]"
                                            >
                                                Download
                                                <img src={download} alt="" />
                                            </button>
                                        </td>
                                        {isAdmin && (
                                            <td className={td}>
                                                <button
                                                    onClick={() => handleDelete(form)}
                                                    className="bg-[#dc3545] text-white text-[15px] font-medium py-[0.5vh] px-[1vw] rounded-[1vw] transition-colors duration-200 hover:bg-[#b02a37]"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        )}
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

export default Forms;
