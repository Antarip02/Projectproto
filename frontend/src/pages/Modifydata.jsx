import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

function getDefaultFormData() {
    return {
        date_column: getCurrentDate(),
        generation: '',
        plf: '',
        apc: '',
        dmwc: '',
        soc: '',
        oandmavailability: '',
        unit: '',
        stationname: '',
    };
}

function getCurrentDate() {
    const today = new Date();
    today.setDate(today.getDate() - 1); // Subtract one day
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const Modifydata = () => {
    const [formDataUnit1, setFormDataUnit1] = useState(getDefaultFormData());
    const [formDataUnit2, setFormDataUnit2] = useState(getDefaultFormData());
    const [fetchingData, setFetchingData] = useState(false); // Flag to track fetching state
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setFormDataUnit1(prevState => ({
                    ...prevState,
                    stationname: decoded.stationname,
                    email: decoded.email,
                    unit: 'unit 1'
                }));
                setFormDataUnit2(prevState => ({
                    ...prevState,
                    stationname: decoded.stationname,
                    email: decoded.email,
                    unit: 'unit 2'
                }));
            } catch (error) {
                console.error('Error decoding token:', error);
            }
        }
    }, []);

    const fetchMessage = () => {
        console.log('Fetching message with:', formDataUnit1.date_column, formDataUnit1.stationname);

        // Make an HTTP request to fetch the message
        fetch('http://localhost:5000/api/v1/mis/fetchhmessage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                date_column: formDataUnit1.date_column,
                stationname: formDataUnit1.stationname,
            }),
        })
            .then(response => response.json())
            .then(responseData => {
                if (responseData.success) {
                    if (responseData.data && responseData.data.message) {
                        setMessage(responseData.data.message);
                    } else {
                        setMessage('No message found');
                    }
                } else {
                    console.error('Error fetching message:', responseData.message);
                }
            })
            .catch(error => {
                console.error('Error fetching message:', error);
            });
    };

    useEffect(() => {
        if (formDataUnit1.date_column && formDataUnit1.stationname) {
            fetchMessage();
        }
    }, [formDataUnit1.date_column, formDataUnit1.stationname]);

    useEffect(() => {
        if (!fetchingData && !formDataUnit1.generation) {
            fetchData('unit1', formDataUnit1, setFormDataUnit1);
        }
    }, [formDataUnit1, fetchingData]);

    useEffect(() => {
        if (!fetchingData && !formDataUnit2.generation) {
            fetchData('unit2', formDataUnit2, setFormDataUnit2);
        }
    }, [formDataUnit2, fetchingData]);

    const fetchData = (unit, formData, setFormData) => {
        setFetchingData(true);
        fetch('http://localhost:5000/api/v1/mis/fetchdata', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                date_column: formData.date_column,
                stationname: formData.stationname,
                unit: formData.unit
            })
        })
            .then(response => response.json())
            .then(responseData => {
                if (responseData.success) {
                    const fetchedData = responseData.data[0]; // Assuming only one object is returned
                    setFormData(prevState => ({
                        ...prevState,
                        generation: fetchedData.generation,
                        plf: fetchedData.plf,
                        apc: fetchedData.apc,
                        dmwc: fetchedData.dmwc,
                        soc: fetchedData.soc,
                        oandmavailability: fetchedData.oandmavailability
                    }));
                } else {
                    console.error('Error fetching data:', responseData.message);
                }
                setFetchingData(false);
            })
            .catch(error => {
                console.error(`Error fetching ${unit} data:`, error);
                setFetchingData(false);
            });
    };

    const handleChange = (e, unit) => {
        const { name, value } = e.target;
        if (unit === 'unit1') {
            const updatedFormDataUnit1 = {
                ...formDataUnit1,
                [name]: value
            };
            setFormDataUnit1(updatedFormDataUnit1);

            // Update date for Unit 2 when date is changed in Unit 1
            if (name === 'date_column') {
                const updatedFormDataUnit2 = {
                    ...formDataUnit2,
                    [name]: value,
                    stationname: updatedFormDataUnit1.stationname // Ensure stationname is synced with Unit 1
                };
                setFormDataUnit2(updatedFormDataUnit2);
                // Fetch data for Unit 2 with the updated date
                fetchData('unit2', updatedFormDataUnit2, setFormDataUnit2);
            }
        } else if (unit === 'unit2') {
            setFormDataUnit2(prevState => ({
                ...prevState,
                [name]: value
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        navigate('/modifytable');
    };

    useEffect(() => {
        localStorage.setItem('formDataUnit1', JSON.stringify(formDataUnit1));
        localStorage.setItem('formDataUnit2', JSON.stringify(formDataUnit2));
    }, [formDataUnit1, formDataUnit2]);

    return (
        <div className="bg-violet-700 h-screen flex flex-col justify-start items-center">
            <h2 className="text-3xl font-bold tracking-tighter mt-5">MIS TEAM UNIT DATA MODIFICATION PORTAL. Please modify latest data.</h2>
            {message && 
            <div className="bg-slate-200 text-red-600 mt-10">
                <label className="font-bold mr-2 w-36">Remarks:</label>
                {message}
            </div>
            }
            <div className="flex">
                <form className="bg-slate-200 w-full h-auto rounded-lg shadow-lg mt-10 flex flex-col justify-center items-center" onSubmit={handleSubmit}>
                    <div className="w-full max-w-4xl">
                        <div className="flex items-center mb-2 justify-center">
                            <label className="font-bold mr-2 w-36">DATE:</label>
                            <input type="date" required name="date_column" value={formDataUnit1.date_column} onChange={(e) => handleChange(e, 'unit1')} className="border border-gray-300 rounded-md px-3 py-2" />
                        </div>
                        <div className="flex items-center mb-2 justify-center">
                            <label className="font-bold mr-2 w-36">Station:</label>
                            <input type="text" required name="stationname" value={formDataUnit1.stationname} readOnly className="border border-gray-300 rounded-md px-3 py-2 w-15" />
                        </div>
                    </div>
                    <div className="flex">
                        <div className="w-1/2 max-w-4xl">
                            <h3 className="text-xl font-bold mb-4 mt-5 text-center">Unit 1</h3>
                            <div className="flex flex-col">
                                <div className="flex items-center mb-2">
                                    <label className="font-bold mr-1 ml-3 w-36">Generation(MU):</label>
                                    <input type="number" required name="generation" value={formDataUnit1.generation} onChange={(e) => handleChange(e, 'unit1')} className="border border-gray-300 rounded-md px-3 py-2" />
                                </div>
                                <div className="flex items-center mb-2">
                                    <label className="font-bold mr-1 ml-3 w-36">PLF(%):</label>
                                    <input type="number" required name="plf" value={formDataUnit1.plf} onChange={(e) => handleChange(e, 'unit1')} className="border border-gray-300 rounded-md px-3 py-2" />
                                </div>
                                <div className="flex items-center mb-2">
                                    <label className="font-bold mr-1 ml-3 w-36">APC(MU):</label>
                                    <input type="number" required name="apc" value={formDataUnit1.apc} onChange={(e) => handleChange(e, 'unit1')} className="border border-gray-300 rounded-md px-3 py-2" />
                                </div>
                                <div className="flex items-center mb-2">
                                    <label className="font-bold mr-1 ml-3 w-36">DMWC(%MCR):</label>
                                    <input type="number" required name="dmwc" value={formDataUnit1.dmwc} onChange={(e) => handleChange(e, 'unit1')} className="border border-gray-300 rounded-md px-3 py-2" />
                                </div>
                                <div className="flex items-center mb-2">
                                    <label className="font-bold mr-1 ml-3 w-36">SOC(ml/Kwhr):</label>
                                    <input type="number" required name="soc" value={formDataUnit1.soc} onChange={(e) => handleChange(e, 'unit1')} className="border border-gray-300 rounded-md px-3 py-2" />
                                </div>
                                <div className="flex items-center mb-2">
                                    <label className="font-bold mr-1 ml-3 w-36">O&M Avail:</label>
                                    <input type="number" required name="oandmavailability" value={formDataUnit1.oandmavailability} onChange={(e) => handleChange(e, 'unit1')} className="border border-gray-300 rounded-md px-3 py-2" />
                                </div>
                            </div>
                        </div>
                        <div className="w-1/2 max-w-4xl mr-5">
                            <h3 className="text-xl font-bold mb-4 mt-5 text-center">Unit 2</h3>
                            <div className="flex flex-col">
                                <div className="flex items-center mb-2">
                                    <label className="font-bold mr-1 ml-3 w-36"></label>
                                    <input type="number" required name="generation" value={formDataUnit2.generation} onChange={(e) => handleChange(e, 'unit2')} className="border border-gray-300 rounded-md px-3 py-2" />
                                </div>
                                <div className="flex items-center mb-2">
                                    <label className="font-bold mr-1 ml-3 w-36"></label>
                                    <input type="number" required name="plf" value={formDataUnit2.plf} onChange={(e) => handleChange(e, 'unit2')} className="border border-gray-300 rounded-md px-3 py-2" />
                                </div>
                                <div className="flex items-center mb-2">
                                    <label className="font-bold mr-1 ml-3 w-36"></label>
                                    <input type="number" required name="apc" value={formDataUnit2.apc} onChange={(e) => handleChange(e, 'unit2')} className="border border-gray-300 rounded-md px-3 py-2" />
                                </div>
                                <div className="flex items-center mb-2">
                                    <label className="font-bold mr-1 ml-3 w-36"></label>
                                    <input type="number" required name="dmwc" value={formDataUnit2.dmwc} onChange={(e) => handleChange(e, 'unit2')} className="border border-gray-300 rounded-md px-3 py-2" />
                                </div>
                                <div className="flex items-center mb-2">
                                    <label className="font-bold mr-1 ml-3 w-36"></label>
                                    <input type="number" required name="soc" value={formDataUnit2.soc} onChange={(e) => handleChange(e, 'unit2')} className="border border-gray-300 rounded-md px-3 py-2" />
                                </div>
                                <div className="flex items-center mb-2">
                                    <label className="font-bold mr-1 ml-3 w-36"></label>
                                    <input type="number" required name="oandmavailability" value={formDataUnit2.oandmavailability} onChange={(e) => handleChange(e, 'unit2')} className="border border-gray-300 rounded-md px-3 py-2" />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center mt-5">
                        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Next Page</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Modifydata;
