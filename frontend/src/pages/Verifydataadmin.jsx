import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Corrected import statement

const CustomPopup = ({ message, onCancel, onConfirm }) => (
  <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white rounded-lg p-8 max-w-md">
      <p className="font-extrabold text-lg mb-4">{message}</p>
      <div className="flex justify-center">
        <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mr-4" onClick={onConfirm}>Yes</button>
        <button className="bg-red hover:bg-rose-800 text-white px-4 py-2 rounded" onClick={onCancel}>No</button>
      </div>
    </div>
  </div>
);

const Verifydataadmin = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [formData, setFormData] = useState({
    date_column: '',
    stationname: ''
  });
  const [data, setData] = useState(null);
  const [additionalData, setAdditionalData] = useState(null);
  const [error, setError] = useState(null);
  const [decodedToken, setDecodedToken] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const [flag1, setFlag1] = useState(null);
  const [flag2, setFlag2] = useState(null);
  const [modificationRequired, setModificationRequired] = useState(false);
  const navigate = useNavigate();

  const getYesterdayDate = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const year = yesterday.getFullYear();
    const month = String(yesterday.getMonth() + 1).padStart(2, '0');
    const day = String(yesterday.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  let unitcapacity = 0;
  if (formData.stationname === 'raipur') {
    unitcapacity = 650;
  } else {
    unitcapacity = 600;
  }

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      setDecodedToken(decoded);
      setFormData(prevState => ({
        ...prevState,
        stationname: decoded.stationname,
      }));
    }

    // Add flag1 and flag2 to the dependency array
  }, [flag1, flag2]);

  useEffect(() => {
    if (formData.date_column && formData.stationname) {
      handleSubmit(); // Call handleSubmit directly instead of checking for fetchData
    }
  }, [formData.date_column, formData.stationname, flag1, flag2]); // Update dependency array

  const handleSubmit = async (e) => {
    setIsSubmitted(true);
    try {
      const response = await axios.post('http://localhost:5000/api/v1/admin/fetchdatadateunit', formData);
      setData(response.data.data);

      const response2 = await axios.post('http://localhost:5000/api/v1/admin/fetch2', formData);
      setAdditionalData(response2.data.data);

      const flag1 = response.data.data[0].flag;
      const flag2 = response2.data.flag;

      setFlag1(flag1); // Update flag1 state
      setFlag2(flag2); // Update flag2 state

      if (flag1 === 'SENOC' && flag2 === 'VERIFIED') {
        setButtonsDisabled(true);
      } else if (flag1 === 'SENOC' || flag2 === 'VERIFIED') { // Check if either flag is 'SENOC' or 'VERIFIED'
        setButtonsDisabled(true);
      } else {
        setButtonsDisabled(false);
      }

      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setData(null);
      setAdditionalData(null);
      setError('Error fetching data. Please try again.');
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleOpenPopup = () => {
    if (!buttonsDisabled) {
      setShowPopup(true);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleSendDataToENOC = async () => {
    try {
      // Send data to ENOC database
      const response1 = await axios.post('http://localhost:5000/api/v1/enoc/datainsert', formData);
      console.log('Response from admin database:', response1.data);
      // Update admin database
      const response2 = await axios.post('http://localhost:5000/api/v1/admin/updatedb', formData);
      console.log('Response from admin database:', response2.data);
  
      // Update calculated values
      const response3 = await axios.post('http://localhost:5000/api/v1/admin/updatedb2', formData);
      console.log('Response from updatedb2:', response3.data);
  
      // Check if there's any data left after sending to ENOC
      navigate('/adminentrypage');
    } catch (error) {
      console.error('Error sending data to ENOC:', error);
    }
  };
  const handleIncorrectData = async () => {
    try {
      // Handle incorrect data
      const responsee=await axios.post('http://localhost:5000/api/v1/admin/delete1',formData)
      console.log(responsee);
      const responseee=await axios.post('http://localhost:5000/api/v1/admin/delete2',formData)
      console.log(responseee);
      const response=await axios.post('http://localhost:5000/api/v1/admin/updatereject',formData);
      console.log(response);
      navigate(`/message?rejectedDate=${formData.date_column}`);
    } catch (error) {
      // Handle error
      console.error('Error rejecting data', error);
    }
  };
  console.log(buttonsDisabled);
  console.log(flag1);
  console.log(flag2);
  return (
    <div className={`bg-violet-700 w-screen flex flex-col justify-start items-center ${isSubmitted && data ? 'h-auto' : 'h-screen'}`}>
      <h1 className="text-5xl font-bold tracking-tighter mt-10">Welcome to the data verification portal. Choose the date and unit to verify</h1>
      
      <form className="bg-slate-200 w-96 rounded-lg shadow-lg mt-5 flex flex-col justify-center items-center" onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
        <label className="font-bold mr-4">
          DATE:<input type="date" required name="date_column" value={formData.date_column} onChange={handleChange} className="border border-gray-300 rounded-md px-4 py-2" />
        </label>
        <label className="font-bold">
          Station:<input type="text" required name="unit" value={formData.stationname} onChange={handleChange} className="border border-gray-300 rounded-md px-4 py-2" />
        </label>
        <button type="submit" className='bg-blue-500 hover:bg-blue-900 text-black font-bold px-20 py-2 rounded-lg'>GET DATA</button>
      </form>

      {error && <p className="bg-slate-200 text-red-500 mt-4">{error}</p>}

      {(data || additionalData) && (
        <div className="bg-white mt-5 p-4 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Filtered Data</h2>
          <table className="border-collapse border border-gray-800 mt-5">
            <thead className="bg-slate-200">
              <tr>
                <th className="border border-gray-800 px-40 py-2 font-bold text-5xl " colSpan={4}>DGR REPORT {formData && formData.stationname.toUpperCase()}  Date {formData && formData.date_column}</th>
              </tr>
            </thead>
            <thead className='bg-slate-200'>
              <tr>
                <th className='border border-gray-800 pl-3.5 font-bold text-2xl'>Unit Capacity</th>
                <th className='border border-gray-800 px-10 py-2 font-bold text-2xl'>{unitcapacity}MW</th>
                <th className='border border-gray-800 px-10 py-2 font-bold text-2xl'>{unitcapacity}MW</th>
                <th className='border border-gray-800 px-10 py-2 font-bold text-2xl'>{2 * unitcapacity}MW</th>
              </tr>
            </thead>
            <thead className='bg-slate-200'>
              <tr>
                <th className='border border-gray-800 pl-3 pr-8 font-bold text-2xl'>Parameters</th>
                <th className='border border-gray-800 pr-4 font-bold text-2xl'>UNIT 1</th>
                <th className='border border-gray-800 pr-4 font-bold text-2xl'>UNIT 2</th>
                <th className='border border-gray-800 px-10 py-2 font-bold text-2xl'>STATION</th>
              </tr>
            </thead>
            <tbody className='bg-slate-200'>
              <tr >
                <td className="border border-gray-800 font-bold pl-40 text-2xl">Generation(MU)</td>
                <td className="border border-gray-800 font-bold px-20 py-2">{data && data[0].generation}</td>
                <td className="border border-gray-800 font-bold px-20 py-2">{data && data[1].generation}</td>
                <td className="border border-gray-800 font-bold px-20 py-2">{additionalData && additionalData[0] && additionalData[0].generationcal}</td>
              </tr>
              <tr>
                <td className="border border-gray-800 font-bold pl-40 text-2xl">PLF(%)</td>
                <td className="border border-gray-800 font-bold px-20 py-2">{data && data[0].plf}</td>
                <td className="border border-gray-800 font-bold px-20 py-2">{data && data[1].plf}</td>
                <td className="border border-gray-800 font-bold px-20 py-2">{additionalData && additionalData[0] && additionalData[0].plfcal}</td>
              </tr>
              <tr>
                <td className="border border-gray-800 font-bold pl-40 text-2xl">SOC(ml/Kwhr)</td>
                <td className="border border-gray-800 font-bold px-20 py-2">{data && data[0].soc}</td>
                <td className="border border-gray-800 font-bold px-20 py-2">{data && data[1].soc}</td>
                <td className="border border-gray-800 font-bold px-20 py-2">{additionalData && additionalData[0] && additionalData[0].soccal}</td>
              </tr>
              <tr>
                <td className="border border-gray-800 font-bold pl-40 text-2xl">APC(MU)</td>
                <td className="border border-gray-800 font-bold px-20 py-2">{data && data[0].apc}</td>
                <td className="border border-gray-800 font-bold px-20 py-2">{data && data[1].apc}</td>
                <td className="border border-gray-800 font-bold px-20 py-2">{additionalData && additionalData[0] && additionalData[0].apccal}</td>
              </tr>
              <tr>
                <td className="border border-gray-800 font-bold pl-40 text-2xl">DMWC(ml/Kwhr)</td>
                <td className="border border-gray-800 font-bold px-20 py-2">{data && data[0].dmwc}</td>
                <td className="border border-gray-800 font-bold px-20 py-2">{data && data[1].dmwc}</td>
                <td className="border border-gray-800 font-bold px-20 py-2">{additionalData && additionalData[0] && additionalData[0].dmwccal}</td>
              </tr>
              <tr>
                <td className="border border-gray-800 font-bold pl-40 text-2xl">O&M Availability(%)</td>
                <td className="border border-gray-800 font-bold px-20 py-2">{data && data[0].oandmavailability}</td>
                <td className="border border-gray-800 font-bold px-20 py-2">{data && data[1].oandmavailability}</td>
                <td className="border border-gray-800 font-bold px-20 py-2">{additionalData && additionalData[0] && additionalData[0].oandmcal}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      {(data || additionalData || error) && (
        <div className="flex justify-center mt-5 mb-10">
          <button className={`bg-red hover:bg-rose-700 text-white font-bold px-5 py-2 rounded mr-4 ${buttonsDisabled ? 'opacity-50' : ''}`} 
          onClick={handleIncorrectData} 
          disabled={buttonsDisabled} 
          title={buttonsDisabled ? "Data already verified" : ""}  
          >Reject</button>
          <button 
             className={`bg-green-500 hover:bg-green-700 text-white font-bold px-4 py-2 rounded ${buttonsDisabled ? 'opacity-50' : ''}`} 
             onClick={buttonsDisabled ? handleClosePopup : handleOpenPopup} 
             disabled={buttonsDisabled} 
             title={buttonsDisabled ? "Data already verified" : ""}
          >
          Approve
          </button>
        </div>
      )}
      {showPopup && (
        <CustomPopup
          message="Do you want to send the data to ENOC?"
          onCancel={handleClosePopup}
          onConfirm={() => {
            handleClosePopup();
            handleSendDataToENOC();
          }}
        />
      )}
    </div>
  );
};

export default Verifydataadmin;