import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { billCategories } from "../../../apis/master.api";

/**
 * Bill Category options for the grid's pencil edit (16.10, items 3-4).
 *
 * Fetched here rather than passed down like natureOfWorkOptions, so the grid
 * component itself needs no change. One request per page load, shared by
 * every cell, and only once a Bill Category cell is actually being edited.
 */
let cached = null;

const loadOptions = () => {
  if (!cached) {
    cached = axios
      .get(billCategories, { headers: { Authorization: `Bearer ${Cookies.get("token")}` } })
      .then((res) =>
        (res.data || [])
          .slice()
          .sort((a, b) => String(a.name).localeCompare(String(b.name), undefined, { sensitivity: "base" }))
      )
      .catch((err) => {
        cached = null; // try again next time
        console.error("Error fetching bill categories:", err);
        return [];
      });
  }
  return cached;
};

export const useBillCategoryOptions = (enabled) => {
  const [options, setOptions] = useState([]);
  useEffect(() => {
    if (!enabled) return undefined;
    let alive = true;
    loadOptions().then((list) => alive && setOptions(list));
    return () => {
      alive = false;
    };
  }, [enabled]);
  return options;
};

export default useBillCategoryOptions;
