import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const BusinessDetails = () => {
    const { id } = useParams();
    const [business, setBusiness] = useState(null);

    useEffect(() => {
        const fetchBusiness = async () => {
            try {
                const response = await axiosInstance.get(`/businesses/${id}`);
                setBusiness(response.data);
            } catch (error) {
                console.error('Failed to fetch business details', error);
            }
        };

        fetchBusiness();
    }, [id]);

    if (!business) return <div>Loading...</div>;

    return (
        <div className="business-details">
            <h1>{business.name}</h1>
            <p>{business.description}</p>
            <h2>Services Offered</h2>
            <ul>
                {business.serviceTypes.map((service) => (
                    <li key={service.id}>
                        {service.name} - ${service.price}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BusinessDetails;
