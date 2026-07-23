//return current day's date in yyyy/mm/dd format for html input
export const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const date = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${date}`
};

export const getDefaultFromDateString = () => {
    return "2020-01-01";
};