import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Mislogin = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [employeePassword, setEmployeePassword] = useState('');
  const [station, setStation] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Make an HTTP POST request to your backend endpoint for authentication
      const response = await axios.post('http://localhost:5000/api/v1/mis/login', {
        employeeid: employeeId,
        employeepass: employeePassword,
        stationname: station
      });
      if (response.data.success) {
        // Redirect to admin entry page if login successful
        const token = response.data.token;
        localStorage.setItem('token', token);
        navigate('/misteamentrypageunit'); // Redirect to the desired page
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
      <h1 className="text-5xl font-bold tracking-tighter mt-20">Welcome to the O&E PORTAL</h1>
      <h2 className="text-2xl font-bold tracking-tighter mt-10">Please enter your station, employee id and password to verify yourself</h2>
      <form className="flex flex-col gap-6 mt-10" onSubmit={handleSubmit}>
        <label htmlFor="station" className="font-bold">Station:</label>
        <select
          className="bg-white border border-gray-300 rounded-md px-40 py-2"
          value={station} // Set value to selected station
          onChange={(e) => setStation(e.target.value)} // Update station state on change
        >
          <option value="">Select Station</option>
          <option value="Raipur">Raipur</option>
          <option value="Mahan">Mahan</option>
        </select>
        <label htmlFor="employeeId" className="font-bold">Employee ID:</label>
        <input
          type="text"
          id="employeeId"
          placeholder="Employee ID"
          className="bg-white border border-gray-300 rounded-md px-40 py-2"
          onChange={(e) => setEmployeeId(e.target.value)}
        />
        <label htmlFor="employeePassword" className="font-bold">Password:</label>
        <input
          type="password"
          id="employeePassword"
          placeholder="Password"
          className="bg-white border border-gray-300 rounded-md px-40 py-2"
          onChange={(e) => setEmployeePassword(e.target.value)}
        />
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded mt-10">
          Enter
        </button>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default Mislogin;
