import React from 'react';
import { Outlet } from 'react-router-dom';
import './DeliveryTheme.css';
import RiderFloatingMap from './RiderFloatingMap';

const DeliveryLayout = () => {
    return (
        <div className="delivery-body">
            <Outlet />
            <RiderFloatingMap />
        </div>
    );
};

export default DeliveryLayout;
