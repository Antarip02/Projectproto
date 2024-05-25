import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css'; // Import the CSS file
const Home = () => {
  const navigate=useNavigate();
  const handleEnocClick = () => {
    navigate('/enoclogin');
  };

  const handleMisClick = () => {
    navigate('/mislogin');
  };

  const handleAdminClick = () => {
    navigate('/adminlogin');
  };
  return (
     <div className="bg-violet-700 h-screen w-screen flex flex-col justify-start items-center">
        <h1 className=" text-5xl font-bold tracking-tighter mt-20 ">WELCOME TO THE DATA ENTRY AND VISUALIZATION PORTAL</h1>
        <h1 className="text-5xl font-bold tracking-tighter mt-10">Choose Your team</h1>
        <div className="flex flex-col gap-5 mt-20">
        <button className="bg-blue-500 hover:bg-blue-800 text-white px-40 py-2 rounded"  onClick={handleMisClick}>O&E Team</button>
        <button className="bg-blue-500 hover:bg-blue-800 text-white px-40 py-2 rounded" onClick={handleAdminClick}>Site Level1 Approver</button>
        <button className="bg-blue-500 hover:bg-blue-800 text-white px-40 py-2 rounded"  onClick={handleEnocClick}>ENOC Team</button>
      </div>
     </div>
  );
}

export default Home;
