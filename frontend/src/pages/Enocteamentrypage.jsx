import React, { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const Enocteamentrypage = () => {
  const [formData, setFormData] = useState({
    date_column: '',
    stationname: ''
  });
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [additionalData, setAdditionalData] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  let unitcapacity = 0;
  if (formData.stationname === 'raipur') {
    unitcapacity = 650;
  } else {
    unitcapacity = 600;
  }

  const toggleDropdown = () => {
    setIsDropdownVisible(!isDropdownVisible);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    try {
      const response = await axios.post('http://localhost:5000/api/v1/enoc/fetch', formData);
      setData(response.data.data);
      const response2 = await axios.post('http://localhost:5000/api/v1/enoc/fetch2', formData);
      setAdditionalData(response2.data.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setData(null);
      setError('Error fetching data. Please try again.');
    }
  };

  const downloadExcel = () => {
    const wb = XLSX.utils.book_new(); // Note: Changed from SheetJSStyle to XLSX
    const wsData = [
      ['DGR REPORT', formData.stationname.toUpperCase(), `Date ${formData.date_column}`, ''],
      ['Unit Capacity', `${unitcapacity} MW`, `${unitcapacity} MW`, `${2 * unitcapacity} MW`],
      ['Parameter', 'Unit 1', 'Unit 2', 'Station']
    ];
    
    if (data && additionalData) {
      wsData.push(['Generation', data[0].generation, data[1].generation, additionalData[0].generationcal]);
      wsData.push(['PLF', data[0].plf, data[1].plf, additionalData[0].plfcal]);
      wsData.push(['SOC', data[0].soc, data[1].soc, additionalData[0].soccal]);
      wsData.push(['DMWC', data[0].dmwc, data[1].dmwc, additionalData[0].dmwccal]);
      wsData.push(['O&M Availability', data[0].oandmavailability, data[1].oandmavailability, additionalData[0].oandmcal]);
    }
    
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Merge the cells for the header row
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    
    // Save the Excel file
    XLSX.writeFile(wb, 'filtered_data.xlsx');
    
  }

  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.text(`DGR REPORT ${formData.stationname.toUpperCase()}`, 20, 10);
    doc.text(`Date: ${formData.date_column}`, 20, 20);

    const tableColumn = ['Parameter', 'Unit 1', 'Unit 2', 'Station'];
    const tableRows = [];

    tableRows.push(['Unit Capacity', `${unitcapacity} MW`, `${unitcapacity} MW`, `${2 * unitcapacity} MW`]);

    if (data && additionalData) {
      tableRows.push(['Generation', data[0].generation, data[1].generation, additionalData[0].generationcal]);
      tableRows.push(['PLF', data[0].plf, data[1].plf, additionalData[0].plfcal]);
      tableRows.push(['APC', data[0].apc, data[1].apc, additionalData[0].apccal]);
      tableRows.push(['SOC', data[0].soc, data[1].soc, additionalData[0].soccal]);
      tableRows.push(['DMWC', data[0].dmwc, data[1].dmwc, additionalData[0].dmwccal]);
      tableRows.push(['O&M Availability', data[0].oandmavailability, data[1].oandmavailability, additionalData[0].oandmcal]);
    }

    doc.autoTable(tableColumn, tableRows, { startY: 30 });
    doc.save('filtered_data.pdf');
  };

  return (
    <div className={`bg-violet-700 w-screen flex flex-col justify-start items-center ${(isSubmitted && data) || isDropdownVisible ? 'h-auto' : 'h-screen'}`}>
      <h1 className="text-5xl font-bold tracking-tighter mt-10 text-black">Welcome to the ENOC data visualization portal.</h1>
      <h1 className="text-5xl font-bold tracking-tighter mt-10 text-black"> Choose the date and unit to see the data </h1>

      <form className="bg-slate-200 w-96 rounded-lg shadow-lg mt-10 flex flex-col justify-center items-center" onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
        <label className="font-bold mr-4">
          DATE:<input type="date" required name="date_column" value={formData.date_column} onChange={handleChange} className="border border-gray-300 rounded-md px-4 py-2" />
        </label>
        <label className="font-bold">
          Station:
          <select required name="stationname" value={formData.stationname} onChange={handleChange} className="border border-gray-300 rounded-md px-4 py-2">
            <option value="">Select Station</option>
            <option value="raipur">raipur</option>
            <option value="mahan">mahan</option>
          </select>
        </label>
        <button type="submit" className='bg-blue-500 hover:bg-blue-900 text-white font-bold px-10 py-2 rounded-lg'>GET DATA</button>
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
                <th className='border border-gray-800 pl-10 font-bold text-2xl'>Unit Capacity</th>
                <th className='border border-gray-800 px-10 py-2 font-bold text-2xl'>{unitcapacity}MW</th>
                <th className='border border-gray-800 px-10 py-2 font-bold text-2xl'>{unitcapacity}MW</th>
                <th className='border border-gray-800 px-10 py-2 font-bold text-2xl'>{2 * unitcapacity}MW</th>
              </tr>
              <tr>
                <th className='border border-gray-800 pl-3 font-bold text-2xl'>Parameter</th>
                <th className='border border-gray-800 pr-4 font-bold text-2xl'>Unit 1</th>
                <th className='border border-gray-800 pr-4 font-bold text-2xl'>Unit 2</th>
                <th className='border border-gray-800 px-10 py-2 font-bold text-2xl'>Station</th>
              </tr>
            </thead>
            <tbody className="bg-slate-200">
              <tr>
                <td className="border border-gray-800 font-bold pl-36 text-2xl">Generation</td>
                <td className="border border-gray-800 pr-2 font-bold pl-24">{data && data[0].generation}</td>
                <td className="border border-gray-800 pr-2 font-bold pl-24">{data && data[1].generation}</td>
                <td className="border border-gray-800 pr-2 font-bold pl-24 py-2">{additionalData && additionalData[0] && additionalData[0].generationcal}</td>
              </tr>
              <tr>
                <td className="border border-gray-800 font-bold pl-36 text-2xl">APC</td>
                <td className="border border-gray-800 font-bold pl-24">{data && data[0].apc}</td>
                <td className="border border-gray-800 font-bold pl-24">{data && data[1].apc}</td>
                <td className="border border-gray-800 font-bold pl-24 py-2">{additionalData && additionalData[0] && additionalData[0].apccal}</td>
              </tr>
              <tr>
                <td className="border border-gray-800 font-bold pl-36 text-2xl">PLF</td>
                <td className="border border-gray-800 font-bold pl-24">{data && data[0].plf}</td>
                <td className="border border-gray-800 font-bold pl-24">{data && data[1].plf}</td>
                <td className="border border-gray-800 font-bold pl-24 py-2">{additionalData && additionalData[0] && additionalData[0].plfcal}</td>
              </tr>
              <tr>
                <td className="border border-gray-800 font-bold pl-36 pr-1 text-2xl">SOC</td>
                <td className="border border-gray-800 font-bold pl-24">{data && data[0].soc}</td>
                <td className="border border-gray-800 font-bold pl-24">{data && data[1].soc}</td>
                <td className="border border-gray-800 font-bold pl-24 py-2">{additionalData && additionalData[0] && additionalData[0].soccal}</td>
              </tr>
              <tr>
                <td className="border border-gray-800 font-bold pl-36 text-2xl">DMWC</td>
                <td className="border border-gray-800 font-bold pl-24">{data && data[0].dmwc}</td>
                <td className="border border-gray-800 font-bold pl-24">{data && data[1].dmwc}</td>
                <td className="border border-gray-800 font-bold pl-24 py-2">{additionalData && additionalData[0] && additionalData[0].dmwccal}</td>
              </tr>
              <tr>
                <td className="border border-gray-800 font-bold pl-36 text-2xl">O&M Availability</td>
                <td className="border border-gray-800 font-bold px-24 py-2">{data && data[0].oandmavailability}</td>
                <td className="border border-gray-800 font-bold px-24 py-2">{data && data[1].oandmavailability}</td>
                <td className="border border-gray-800 font-bold px-24 py-2">{additionalData && additionalData[0] && additionalData[0].oandmcal}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      {(data || additionalData || error) && (
        <div className="flex justify-center mt-5 mb-10 gap-4">
          <div className="dropdown relative">
            <button className="bg-green-500 hover:bg-green-700 text-white font-bold px-4 py-2 rounded dropdown-toggle" id="downloadDropdown" aria-haspopup="true" aria-expanded="false" onClick={toggleDropdown}>Download</button>
            <div className="dropdown-menu shadow-lg rounded mt-2 z-20" aria-labelledby="downloadDropdown" style={{ display: isDropdownVisible ? 'block' : 'none' }} id="dropdownMenu">
              <button className="block w-full px-4 py-2 text-black bg-green-500 mb-1 hover:bg-green-700" onClick={downloadExcel}>Download Excel</button>
              <button className="block w-full px-4 py-2 text-black bg-green-500 hover:bg-green-700 mt-2" onClick={downloadPDF}>Download PDF</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Enocteamentrypage;