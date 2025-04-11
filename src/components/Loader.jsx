import React from 'react';

const Loader = ({ text }) => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#011a99]"></div>
      <span className="ml-3 text-lg font-semibold text-gray-600">{text}</span>
    </div>
  );
};

export default Loader;
