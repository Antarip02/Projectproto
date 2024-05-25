import React,{useEffect} from 'react'
import { useNavigate } from 'react-router-dom'

const Adminentrypage = () => {
  const navigate=useNavigate();
  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login page if token doesn't exist
      navigate('/');
    }
  }, [navigate])
  const handleverifyClick = () => {
    navigate('/verifydata');
  };
  const modifyClick=()=>{
    navigate('/verifymodifydata');
  }
  const handleLogoutClick = () => {
    localStorage.removeItem('token');
    window.history.pushState(null, '', '/');
    window.history.forward();
    navigate('/'); 
  };
  return (
    <div  className="bg-violet-700 h-screen w-screen flex flex-col justify-start items-center">
    <h1 className=" text-5xl font-bold tracking-tighter mt-20 ">WELCOME TO THE Site Level1 Approver PORTAL </h1>
    <h2 className="text-3xl font-bold tracking-tighter mt-10">Choose from the options given below</h2>
    <button className="bg-green-500 hover:bg-green-700 text-black font-bold px-40 py-2 rounded-lg mt-10 " onClick={handleverifyClick}>VERIFY DATA</button>
    <button className="bg-red hover:bg-rose-700 text-black font-bold px-40 py-2 rounded-lg mt-10" onClick={handleLogoutClick}>LOGOUT</button>
    </div>
  )
}

export default Adminentrypage
