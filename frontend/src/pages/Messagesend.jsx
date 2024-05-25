import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode to decode the token

const Messagesend = () => {
  const [feedback, setFeedback] = useState('');
  const [rejectedDate, setRejectedDate] = useState('');
  const [stationName, setStationName] = useState('');
  const location = useLocation();
  const navigate=useNavigate();
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      setStationName(decoded.stationname); // Extract station name from the decoded token
    }

    const params = new URLSearchParams(location.search);
    const date = params.get('rejectedDate');
    setRejectedDate(date);
  }, [location]);

  const handleChange = (event) => {
    setFeedback(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      // Make an HTTP POST request to the sendmessage API endpoint
      await axios.post('http://localhost:5000/api/v1/admin/sendmessage', {
        date_column: rejectedDate,
        stationname: stationName,
        messagesent: feedback
      });
      // If the request is successful, log a success message
      console.log('Feedback submitted successfully');
      navigate('/adminentrypage');
      // You can add further logic here, such as showing a success message to the user
    } catch (error) {
      // If there's an error, log the error message
      console.error('Error submitting feedback:', error);
      // You can add further logic here, such as showing an error message to the user
    }
  };

  return (
    <div className="bg-violet-700 h-screen flex flex-col justify-start items-center">
       <h1 className="text-5xl font-bold tracking-tighter mt-10"> Please Send Your Feedback On What To Change</h1>
       <form onSubmit={handleSubmit} className="mt-4">
        <div className="mb-4">
          <label htmlFor="rejectedDate" className="text-xl font-semibold">Rejected Date:</label>
          <input type="text" id="rejectedDate" name="rejectedDate" value={rejectedDate} disabled className="mt-2 p-2 w-full max-w-md border border-gray-300 rounded-lg bg-white text-black" />
        </div>
        <div className="mb-4">
          <label htmlFor="stationName" className="text-xl font-semibold">Station Name:</label>
          <input type="text" id="stationName" name="stationName" value={stationName} disabled className="mt-2 p-2 w-full max-w-md border border-gray-300 rounded-lg bg-white text-black" />
        </div>
        <textarea
          value={feedback}
          onChange={handleChange}
          className="mt-4 p-2 w-full max-w-md border border-gray-300 rounded-lg bg-white text-black"
          rows={10}
          placeholder="Type your feedback here..."
        />
        <button type="submit" className="mt-5 bg-blue-500 text-black font-semibold py-2 px-4 rounded-lg shadow-md cursor-pointer hover:bg-blue-800 transition-colors">
          Send Feedback
        </button>
      </form>
    </div>
  );
};

export default Messagesend;
