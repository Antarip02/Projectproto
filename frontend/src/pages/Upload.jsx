import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { useNavigate} from 'react-router-dom';
import axios from 'axios';
import { parse, format } from 'date-fns';

const CustomPopup = ({ message, onCancel, onConfirm }) => (
  <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white rounded-lg p-8 max-w-md">
      <p className=" font-extrabold text-lg mb-4">{message}</p>
      <div className="flex justify-center">
        <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mr-4" onClick={onConfirm}>Yes</button>
        <button className="bg-red hover:bg-rose-800 text-white px-4 py-2 rounded" onClick={onCancel}>No</button>
      </div>
    </div>
  </div>
); 

const Upload = () => {
  const [fileData, setFileData] = useState(null);
  const [fileName, setFileName] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const navigate=useNavigate();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file || !(file instanceof Blob)) return;

    setFileName(file.name); // Save the file name

    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0]; // Assuming data is in the first sheet
      const worksheet = workbook.Sheets[sheetName];
      console.log('Worksheet range:', worksheet['!ref']);

      // Define the range from D5 to F67
      const range = "D5:F67";
      const jsonSheet = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: range });

      setFileData(jsonSheet);
      console.log('File data:', jsonSheet); // Log the file data
    };

    reader.readAsArrayBuffer(file);
  };

  const parseFileName = (fileName) => {
    console.log('Parsing file name:', fileName);
    const regex = /^(\d{2}-\w{3}-\d{4})\s.*-(.*?)(?:_|\.|$)/;
    const match = fileName.match(regex);
    if (match && match.length > 2) {
      const dateStr = match[1];
      const station = match[2];
      // Convert the date string to YYYY-MM-DD format
      const parsedDate = parse(dateStr, 'dd-MMM-yyyy', new Date());
      const formattedDate = format(parsedDate, 'yyyy-MM-dd');
      return { date: formattedDate, station: station };
    }
    console.warn('Filename does not match expected pattern:', fileName);
    return { date: '-', station: '-' };
  };

  const parseData = () => {
    if (!fileData) return null;

    const { date, station } = parseFileName(fileName);

    const roundToTwo = (num) => (isNaN(num) ? '-' : parseFloat(num).toFixed(2));

    const getValue = (row, col) => roundToTwo(fileData[row] ? fileData[row][col] : '-');

    // Constructing the data object
    const data = {
      date: date,
      station: station,
      Generation: {
        unit1: getValue(0, 0),
        unit2: getValue(0, 1),
        station: getValue(0, 2),
      },
      PLF: {
        unit1: getValue(1, 0),
        unit2: getValue(1, 1),
        station: getValue(1, 2),
      },
      APC: {
        unit1: getValue(2, 0),
        unit2: getValue(2, 1),
        station: getValue(2, 2),
      },
      SOC: {
        unit1: getValue(8, 0),
        unit2: getValue(8, 1),
        station: getValue(8, 2),
      },
      DMWaterConsumption: {
        unit1: getValue(9, 0),
        unit2: getValue(9, 1),
        station: getValue(9, 2),
      },
      OAndMAvailability: {
        unit1: getValue(10, 0),
        unit2: getValue(10, 1),
        station: getValue(10, 2),
      },
    };

    console.log('Parsed data:', data); // Log the parsed data
    return data;
  };

  const renderTable = () => {
    const data = parseData();
    if (!data) return null;
    const unitCapacity = data.station === 'RAIPUR' ? 650 : 600;
    return (
      <>
        <h1 className="text-4xl font-bold mt-10 mb-5">DGR REPORT {data.station} Date {data.date}</h1>
        <table className="border-collapse border border-gray-800 mt-5">
          <thead className="bg-slate-200">
            <tr>
              <th className="border border-gray-800 px-10 py-2 text-2xl">UNIT CAPACITY</th>
              <th className="border border-gray-800 px-10 py-2 text-2xl">{unitCapacity}MW</th>
              <th className="border border-gray-800 px-10 py-2 text-2xl">{unitCapacity}MW</th>
              <th className="border border-gray-800 px-10 py-2 text-2xl">{unitCapacity*2}MW</th>
            </tr>
            <tr>
              <th className="border border-gray-800 px-10 py-2 font-bold text-2xl">Parameter</th>
              <th className="border border-gray-800 px-10 py-2 font-bold text-2xl">Unit 1</th>
              <th className="border border-gray-800 px-10 py-2 font-bold text-2xl">Unit 2</th>
              <th className="border border-gray-800 px-10 py-2 font-bold text-2xl">Station</th>
            </tr>
          </thead>
          <tbody className="bg-slate-200">
            {['Generation', 'APC', 'PLF', 'SOC', 'DMWaterConsumption', 'OAndMAvailability'].map((param) => (
              <tr key={param}>
                <td className="border border-gray-800 px-10 py-2 text-2xl">{param}</td>
                <td className="border border-gray-800 px-10 py-2 text-xl">{data[param].unit1 || '-'}</td>
                <td className="border border-gray-800 px-10 py-2 text-xl">{data[param].unit2 || '-'}</td>
                <td className="border border-gray-800 px-10 py-2 text-xl">{data[param].station || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </>
    );
  };
  const isTableRendered = renderTable() !== null;
  const handleSubmit = () => {
    setShowPopup(true); // Show the confirmation popup
  };
  const handleConfirm = async () => {
    try {
      const parsedData = parseData(); // Get the parsed data from fileData
      console.log('Parsed data:', parsedData);
  
      if (!parsedData) {
        console.error('Parsed data is empty.');
        return;
      }
      
      console.log('Generation:', parsedData['Generation']);
      
      const unitdata1 = {
        generation: parsedData['Generation'].unit1,
        plf: parsedData['PLF'].unit1,
        apc: parsedData['APC'].unit1,
        soc: parsedData['SOC'].unit1,
        dmwc: parsedData['DMWaterConsumption'].unit1,
        oandmavailability: parsedData['OAndMAvailability'].unit1,
        stationname: parsedData.station,
        unit: 'unit 1',
        date_column: parsedData.date
      };
  
      const unitdata2 = {
        generation: parsedData['Generation'].unit2,
        plf: parsedData['PLF'].unit2,
        apc: parsedData['APC'].unit2,
        soc: parsedData['SOC'].unit2,
        dmwc: parsedData['DMWaterConsumption'].unit2,
        oandmavailability: parsedData['OAndMAvailability'].unit2,
        stationname: parsedData.station,
        unit: 'unit 2',
        date_column: parsedData.date
      };
  
      const calculated = {
        generationcal: parsedData['Generation'].station,
        plfcal:parsedData['PLF'].station,
        apccal: parsedData['APC'].station,
        soccal: parsedData['SOC'].station,
        dmwccal: parsedData['DMWaterConsumption'].station,
        oandmcal: parsedData['OAndMAvailability'].station,
        stationname: parsedData.station,
        date_column: parsedData.date
      };
  
      // Your API call logic here...
      const adminEndpoint = 'http://localhost:5000/api/v1/admin/admindb';
      const calculateendpoint = 'http://localhost:5000/api/v1/mis/data-entry2';
      const stationEndpoint = 'http://localhost:5000/api/v1/mis/data-entry1';
      const response1 = await axios.post(stationEndpoint, unitdata1);
      const response2 = await axios.post(stationEndpoint, unitdata2);
      const adminResponse1 = await axios.post(adminEndpoint, unitdata1);
      const adminResponse2 = await axios.post(adminEndpoint, unitdata2);
      const calculation = await axios.post(calculateendpoint, calculated);
      console.log(calculation);
      // After successful API call:
      navigate('/misteamentrypageunit'); // Navigate to success page
    } catch (error) {
      console.error('Error:', error);
      // Handle error if needed
    }
  };
  const handleCancel = () => {
    setShowPopup(false); // Hide the popup
  };
  return (
    <div className="bg-violet-700 min-h-screen flex flex-col justify-start items-center p-8">
      <h1 className="text-5xl font-bold tracking-tighter mt-20 mb-10">WELCOME to O&E History data entry portal</h1>
      <h2 className="text-3xl font-bold tracking-tighter mb-4">Click the button below to upload your file:</h2>
      <label htmlFor="file-upload" className="bg-white text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-200 transition-colors">
        Select a file
      </label>
      <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
      {renderTable()}
      {isTableRendered && (
        <div className="flex mt-6">
          <button className='bg-green-500 hover:bg-green-800 rounded-lg px-20 py-4 font-bold text-2xl' onClick={handleSubmit}>Submit</button>
        </div>
      )}
      {showPopup && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md">
            <p className=" font-extrabold text-lg mb-4">Do you want to submit the data?</p>
            <div className="flex justify-center">
              <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mr-4" onClick={handleConfirm}>Yes</button>
              <button className="bg-red hover:bg-rose-800 text-white px-4 py-2 rounded" onClick={handleCancel}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
     
  );
};

export default Upload;