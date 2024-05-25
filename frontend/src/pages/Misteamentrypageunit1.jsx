import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import axios from 'axios';

function getCurrentDate() {
  const today = new Date();
  today.setDate(today.getDate() - 1); // Subtract one day
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDefaultFormData() {
  return {
    date_column: getCurrentDate(),
    stationname: ''
  };
}

const Misteamentrypageunit1 = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(() => getDefaultFormData());
  const [latestDataExists, setLatestDataExists] = useState(false); // State to track if latest data exists
  const [isLoading, setIsLoading] = useState(true); // State to track loading state
  const [buttonEnabled, setButtonEnabled] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
    } else {
      const decodedToken = jwtDecode(token);
      setFormData(prevState => ({
        ...prevState,
        stationname: decodedToken.stationname
      }));

      // Make the HTTP request to check if latest data exists
      axios.post('http://localhost:5000/api/v1/mis/check', { date_column: formData.date_column, stationname: formData.stationname })
        .then(response => {
          if (response.data.success) {
            // Latest data exists, disable the button
            setLatestDataExists(true);
          } else {
            // Latest data doesn't exist
            setLatestDataExists(false);
          }
          // Loading is complete
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error checking latest data:', error);
          // Loading is complete, but latest data existence is unknown
          setIsLoading(false);
        });
        axios.post('http://localhost:5000/api/v1/admin/checkreject', { date_column: formData.date_column, stationname: formData.stationname })
        .then(response => {
          if (response.data.success) {
            // Latest data exists, disable the button
            setButtonEnabled(true);
          } else {
            // Latest data doesn't exist
            setButtonEnabled(false);
          }
          // Loading is complete
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error checking latest data:', error);
          // Loading is complete, but latest data existence is unknown
          setIsLoading(false);
        });
    }
  }, [navigate, formData.date_column, formData.stationname]);

  const handledataentryClick = async (e) => {
    // Make the API call to check if latest data exists
    axios.post('http://localhost:5000/api/v1/admin/check', { date_column: formData.date_column, stationname: formData.stationname })
      .then(response => {
        if (response.data.success) {
          // Latest data exists, disable the button
          navigate('/dataentrypage');
        } else {
          // Latest data doesn't exist, proceed to data entry page without disabling the button
          setFlagexist(true);
        }
      })
      .catch(error => {
        console.error('Error checking latest data:', error);
        // Proceed to data entry page without disabling the button
        navigate('/dataentrypage');
      });
  };

  const modifyClick = async (e) => {
    axios.post('http://localhost:5000/api/v1/admin/checkreject', { stationname: formData.stationname })
      .then(response2 => {
        if (response2.data.success) {
          // Latest data exists, disable the button
          navigate('/modifydata');
        } else {
          // Latest data doesn't exist, proceed to data entry page without disabling the button
          setButtonEnabled(false);
        }
      })
      .catch(error => {
        console.error('Error checking latest data:', error);
      });
  };

  const uploadpage = () => {
    navigate('/upload');
  };

  const handleLogoutClick = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('formDataUnit1');
    localStorage.removeItem('formDataUnit2');
    window.history.pushState(null, '', '/');
    window.history.forward();
    navigate('/');
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="bg-violet-700 h-screen w-screen flex flex-col justify-start items-center">
      <h1 className="text-5xl font-bold tracking-tighter mt-20">WELCOME to O&E DATA ENTRY PORTAL</h1>
      <h2 className="text-3xl font-bold tracking-tighter mt-10">Choose from the options given below</h2>
      <div className="flex flex-col gap-5 mt-20">
        <button 
           className={`bg-green-500 hover:bg-green-700 text-black font-bold px-40 py-2 rounded ${latestDataExists ? 'opacity-50' : ''}`}
           onClick={handledataentryClick}
           disabled={latestDataExists}
           title={latestDataExists ? "Latest data already entered" : ""}
        >
          Enter latest data
        </button>
        <button className={`bg-green-500 hover:bg-green-700 text-black font-bold px-40 py-2 rounded ${buttonEnabled ? '' : 'opacity-50'}`}
          onClick={modifyClick}
          disabled={!buttonEnabled}>Modify data</button>
        <button className="bg-green-500 hover:bg-green-700 text-black font-bold px-40 py-2 rounded" onClick={uploadpage}>Upload History data</button>
        <button className='bg-red hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-lg' onClick={handleLogoutClick}>LOGOUT</button>
      </div>
    </div>
  );
};

export default Misteamentrypageunit1;
