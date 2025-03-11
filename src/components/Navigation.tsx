import React from "react";

const Navigation: React.FC = () => {
  return (
    <nav className="bg-gray-800 text-yellow-500 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">NoBPM MUTES EDITOR</div>
        <div className="flex space-x-4">
          <a href="/" className="hover:text-gray-400">
            Mutes Editor
          </a>
          <a href="/contact" className="hover:text-gray-400">
            Contact
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
