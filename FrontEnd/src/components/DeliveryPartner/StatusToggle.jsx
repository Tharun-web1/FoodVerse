import './StatusToggle.css';

const StatusToggle = ({ isOnline, onToggle }) => {
    return (
        <div className="status-toggle-container">
            <span className={`status-label ${!isOnline ? 'active' : ''}`}>Offline</span>
            <label className="switch">
                <input type="checkbox" checked={isOnline} onChange={onToggle} />
                <span className="slider round"></span>
            </label>
            <span className={`status-label ${isOnline ? 'active' : ''}`}>Online</span>
        </div>
    );
};

export default StatusToggle;
