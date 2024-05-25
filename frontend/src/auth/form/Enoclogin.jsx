import React,{useState} from 'react'
import axios from 'axios'
import {useNavigate} from'react-router-dom'

const Enoclogin = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [employeePassword, setEmployeePassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Make an HTTP POST request to your backend endpoint for authentication
        const response = await axios.post('http://localhost:5000/api/v1/enoc/login', {
        employeeid: employeeId,
        employeepass: employeePassword
      });
      if (response.data.success) {
        // Redirect to admin entry page if login successful
        navigate('/enocteamentrypage');
      } else {
        setError('Incorrect employee ID or password. Please try again.');
      }
    } catch (error) {
      console.error('Authentication failed:', error.response.data.message);
      setError('Incorrect employee ID or password. Please try again.');
     }
  };

  return (
    <div className="bg-violet-700 h-screen w-screen flex flex-col justify-start items-center">
       <h1 className=" text-5xl font-bold tracking-tighter mt-20 ">Welcome to the ENOC team verification portal</h1>
       <h2 className="text-2xl font-bold tracking-tighter mt-10">Please enter your employee id and password to verify yourself</h2>
       <form className="flex flex-col gap-10 mt-10" onSubmit={handleSubmit}>
       <label htmlFor="employeeId" className="font-bold">Employee ID:</label>
        <input
          type="text"
          placeholder="Employee ID"
          className="bg-white border border-gray-300 rounded-md px-40 py-2 "
          onChange={(e) => setEmployeeId(e.target.value)}
        />
        <label htmlFor="employeePassword" className="font-bold">Password:</label>
        <input
          type="password"
          placeholder="Password"
          className="bg-white border border-gray-300 rounded-md px-40 py-2  mt-5"
          onChange={(e) => setEmployeePassword(e.target.value)}
        />
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded mt-10">
            Enter
        </button>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  )
}

export default Enoclogin
