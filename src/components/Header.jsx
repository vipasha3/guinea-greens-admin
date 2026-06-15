import React from 'react';

const Header = () => {
  return (
    <div className="h-16 bg-white shadow-sm flex items-center justify-between px-8">
      <h2 className="text-xl font-semibold">Operations Dashboard</h2>
      <div className="text-sm">Admin Jane D.</div>
    </div>
  );
};

export default Header;