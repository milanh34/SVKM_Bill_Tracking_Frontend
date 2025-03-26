import React from 'react';
import image from "../../assets/svkmHeader.svg";

const LoginHeader = () => {
  return (
    <div className="relative z-20">
      <div className="w-full bg-transparent">
        <img 
          src={image}
          alt="Header" 
          className="w-full"
        />
      </div>
    </div>
  );
};

export default LoginHeader;
