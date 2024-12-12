import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    return (
        <div className="Dashboard">
            <h1>Owner Dashboard</h1>
            <ul>
                <li><Link to="/services/add">Add Service</Link></li>
                <li><Link to="/services/manage">Manage Services</Link></li>
                <li><Link to="/appointments">View Appointments</Link></li>
            </ul>
        </div>
    );
};

export default Dashboard;