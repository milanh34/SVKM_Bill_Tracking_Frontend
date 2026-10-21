import axios from "axios";
import { toast } from "react-toastify";
import { attachmentUrl } from "../apis/bills.api";

/**
 * Open a bill attachment in a new tab.
 *
 * SVKM's S3 buckets are private (21.10), so the URL stored at upload no
 * longer opens. The server signs a link valid for a few minutes, and that is
 * what the tab loads. The tab is opened during the click itself, so the
 * browser does not block it as a pop-up, and pointed at the link once the
 * server answers.
 */
export const openAttachment = async (file) => {
  const tab = window.open("", "_blank");
  try {
    const res = await axios.get(attachmentUrl, { params: { file } });
    if (tab) {
      tab.opener = null;
      tab.location.href = res.data.url;
    } else {
      window.location.assign(res.data.url);
    }
  } catch (err) {
    if (tab) tab.close();
    toast.error(err.response?.data?.message || "Could not open the attachment");
  }
};
