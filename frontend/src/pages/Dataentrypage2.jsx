import React,{useState} from 'react'
import { useNavigate} from 'react-router-dom';
import axios from 'axios';

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
const Dataentrypage2 = () => {
    const [showPopup, setShowPopup] = useState(false);
    const formData1 = JSON.parse(localStorage.getItem('formDataUnit1'));
    const formData2 = JSON.parse(localStorage.getItem('formDataUnit2'));
    const stationname= formData1 ? formData1.stationname : '';
    const generation1 = formData1 ? parseFloat(formData1.generation.replace(",", ".")) : 0;
    const generation2 = formData2 ? parseFloat(formData2.generation.replace(",", ".")) : 0;
    const totalGeneration = (generation1 + generation2).toFixed(2);
    const oandmAvailability1 = formData1 ? parseFloat(formData1.oandmavailability) : 0;
    const oandmAvailability2 = formData2 ? parseFloat(formData2.oandmavailability) : 0;
    const avgOandMAvailability = ((oandmAvailability1 + oandmAvailability2) / 2).toFixed(2);
    const apc1 = formData1 ? parseFloat(formData1.apc.replace(",", ".")) : 0;
    const apc2 = formData2 ? parseFloat(formData2.apc.replace(",", ".")) : 0;
    const totalapc = (apc1 + apc2).toFixed(2);
    const dmwc1=formData1 ? parseFloat(formData1.dmwc) : 0;
    const dmwc2=formData2 ? parseFloat(formData2.dmwc) : 0;
    const avgdmwc= ((dmwc1 + dmwc2) / 2).toFixed(2);
    const soc1=formData1 ? parseFloat(formData1.soc) : 0;
    const soc2=formData2 ? parseFloat(formData2.soc) : 0;
    const sumsoc=(soc1+soc2).toFixed(2);
    const finalsoc=(sumsoc/totalGeneration).toFixed(2);
    let unitcapacity=0;
    let mhw=0;
    let mu=0;
    if(stationname=='raipur')
    {
        unitcapacity=685;
        mhw=unitcapacity*24;
        mu=mhw/1000;
    }
    else
    {
        unitcapacity=600;
        mhw=unitcapacity*24;
        mu=mhw/1000;
    }
    const navigate = useNavigate();
    const calculateplf=((totalGeneration/(mu*2))*100).toFixed(2);
    const handlePrevious = () => {
        navigate('/dataentrypage'); // Navigates to the previous page
    };
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        setShowPopup(true); // Show the custom popup
    };
    const handleConfirm = async (e) => {
      e.preventDefault(); // Prevent default form submission behavior
      try {
        const formdata1 = {
            generation: formData1.generation,
            plf: formData1.plf,
            apc: formData1.apc,
            dmwc: formData1.dmwc,
            soc: formData1.soc,
            oandmavailability: formData1.oandmavailability,
            date_column: formData1.date_column,
            stationname: formData1.stationname,
            unit: formData1.unit
            // Add other form data fields as needed
          };
          const formdata2 ={
            generation: formData2.generation,
            plf: formData2.plf,
            apc: formData2.apc,
            dmwc: formData2.dmwc,
            soc: formData2.soc,
            oandmavailability: formData2.oandmavailability,
            date_column: formData2.date_column,
            stationname: formData2.stationname,
            unit: formData2.unit
            // Add other form data fields as needed
          };
          const response={
            generationcal:totalGeneration,
            plfcal:calculateplf,
            apccal:totalapc,
            soccal:finalsoc,
            dmwccal:avgdmwc,
            oandmcal:avgOandMAvailability,
            stationname:formData1.stationname,
            date_column:formData1.date_column
          }
          // Assuming both requests are successful, navigate to the desired page
          const adminEndpoint = 'http://localhost:5000/api/v1/admin/admindb';
          const calculateendpoint='http://localhost:5000/api/v1/mis/data-entry2';
          let stationEndpoint;

            if (formData1.stationname === 'raipur') {
                stationEndpoint = 'http://localhost:5000/api/v1/mis/data-entry1';
            } else if (formData1.stationname === 'mahan') {
                stationEndpoint = 'http://localhost:5000/api/v1/mis/data-entry1';
            } else {
                console.error('Invalid station name');
                return; // Stop further execution if the station name is invalid
            }
            const response1 = await axios.post(stationEndpoint, formData1);
            const response2 = await axios.post(stationEndpoint, formData2);
            const adminResponse1 = await axios.post(adminEndpoint, formData1);
            const adminResponse2 = await axios.post(adminEndpoint, formData2);
            const calculation=await axios.post(calculateendpoint,response);
            console.log(response2);
            console.log(response1);
            console.log(adminResponse1);
            console.log(adminResponse2);
            console.log(calculation);
            localStorage.removeItem('formDataUnit1');
            localStorage.removeItem('formDataUnit2');
            navigate('/misteamentrypageunit');   
          console.log()   
      } catch (error) {
         console.log(error);
      }
    };
    const handleCancel = () => {
        setShowPopup(false); // Hide the custom popup
    };
    const renderParameterRows = () => {
      return (
          <>
              <tr>
                  <td className='border border-gray-800 pl-40  font-bold text-2xl '>Generation(MU)</td>
                  <td className='border border-gray-800 px-20 py-2 text-xl'>{formData1 ? formData1.generation : ''}</td>
                  <td className='border border-gray-800 px-20 py-2 text-xl'>{formData2 ? formData2.generation : ''}</td>
                  <td className='border border-gray-800 px-20 py-2 text-xl'>{totalGeneration}</td>
              </tr>
              <tr>
                  <td className='border border-gray-800 pl-40 font-bold text-2xl'>PLF(%)</td>
                  <td className='border border-gray-800 px-20 py-2 text-xl'>{formData1 ? formData1.plf : ''}</td>
                  <td className='border border-gray-800 px-20 py-2 text-xl'>{formData2 ? formData2.plf : ''}</td>
                  <td className='border border-gray-800 px-20 py-2 text-xl'>{calculateplf}</td>
              </tr>
              <tr>
                  <td className='border border-gray-800 pl-40  font-bold text-2xl'>APC(MU)</td>
                  <td className='border border-gray-800 px-20 py-2 text-xl'>{formData1 ? formData1.apc : ''}</td>
                  <td className='border border-gray-800 px-20 py-2 text-xl'>{formData2 ? formData2.apc : ''}</td>
                  <td className='border border-gray-800 px-20 py-2 text-xl'>{totalapc}</td>
              </tr>
              <tr>
                  <td className='border border-gray-800 pl-40 font-bold text-2xl'>DMWC(%MCR)</td>
                  <td className='border border-gray-800 px-20 py-2 text-xl'>{formData1 ? formData1.dmwc : ''}</td>
                  <td className='border border-gray-800 px-20 py-2 text-xl'>{formData2 ? formData2.dmwc : ''}</td>
                  <td className='border border-gray-800 px-20 py-2 text-xl'>{avgdmwc}</td>
              </tr>
              <tr>
                  <td className='border border-gray-800 pl-40 text-left font-bold text-2xl'>SOC(ml/Kwhr)</td>
                  <td className='border border-gray-800 px-20 py-2 text-xl'>{formData1 ? formData1.soc : ''}</td>
                  <td className='border border-gray-800 px-20 py-2 text-xl'>{formData2 ? formData2.soc : ''}</td>
                  <td className='border border-gray-800 px-20 py-2 text-xl'>{finalsoc}</td>
              </tr>
              <tr>
                  <td className='border border-gray-800 pl-40 font-bold text-2xl'>O&M Availability(%)</td>
                  <td className='border border-gray-800 px-20 py-2 text-xl'>{formData1 ? formData1.oandmavailability : ''}</td>
                  <td className='border border-gray-800 px-20 py-2 text-xl'>{formData2 ? formData2.oandmavailability : ''}</td>
                  <td className='border border-gray-800 px-20 py-2 text-xl'>{avgOandMAvailability}</td>
              </tr>
          </>
      );
  };

  return (
      <div className="bg-violet-700 h-screen flex flex-col justify-start items-center">
          <table className="border-collapse border border-gray-800 mt-20">
              <thead className="bg-slate-200">
                  <tr>
                      <th className="border border-gray-800 px-40 py-2 font-bold text-5xl " colSpan={4}>DGR REPORT {formData1 && formData1.stationname.toUpperCase()}  Date {formData1 && formData1.date_column}</th>
                  </tr>
              </thead>
              <thead className='bg-slate-200'>
                  <tr>
                      <th className='border border-gray-800 pl-8 font-bold text-2xl'>Unit Capacity</th>
                      <th className='border border-gray-800 px-10 py-2 font-bold text-2xl'>{unitcapacity}MW</th>
                      <th className='border border-gray-800 px-10 py-2 font-bold text-2xl'>{unitcapacity}MW</th>
                      <th className='border border-gray-800 px-10 py-2 font-bold text-2xl'>{2*unitcapacity}MW</th>
                  </tr>
              </thead>
              <thead className='bg-slate-200'>
                  <tr>
                      <th className='border border-gray-800 pl-2 font-bold text-2xl'>Parameters</th>
                      <th className='border border-gray-800 px-10 py-2 font-bold text-2xl'>UNIT 1</th>
                      <th className='border border-gray-800 px-10 py-2 font-bold text-2xl'>UNIT 2</th>
                      <th className='border border-gray-800 px-10 py-2 font-bold text-2xl'>STATION</th>
                  </tr>
              </thead>
              <tbody className="bg-slate-200">
                  {renderParameterRows()}
              </tbody>
          </table>
          <div className="flex mt-6">
                <button className='bg-red hover:bg-rose-800 rounded-lg px-20 py-4 mr-4 font-bold text-2xl' onClick={handlePrevious}>Prev</button>
                <button className='bg-green-500 hover:bg-green-800 rounded-lg px-20 py-4 font-bold text-2xl' onClick={handleSubmit}>Submit</button>
          </div>
          {showPopup && (
         <CustomPopup
           message="Do you want to submit the data?"
           onCancel={handleCancel}
           onConfirm={handleConfirm}
           />
          )}
      </div>
  );
}

export default Dataentrypage2;