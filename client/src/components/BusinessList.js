import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const BusinessList = () => {
    const [businesses, setBusinesses] = useState([]);

    useEffect(() => {
        const fetchBusinesses = async () => {
            try {
                const response = await axiosInstance.get('/businesses');
                setBusinesses(response.data);
            } catch (error) {
                console.error('Failed to fetch businesses', error);
            }
        };

        fetchBusinesses();
    }, []);

    return (
        <div className="business-list">
            <h1>Available Businesses</h1>
            <ul>
                {businesses.map((business) => (
                    <li key={business.id}>
                        <Link to={`/businesses/${business.id}`}>{business.name}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BusinessList;
