import { IoFastFoodOutline } from 'react-icons/io5';
import './Loader.css';

const Loader = ({ fullPage = false, text = 'Loading...' }) => {
    return (
        <div className={`modern-loader-container ${fullPage ? 'full-page' : 'inline'}`}>
            <div className="loader-overlay-content">
                <div className="premium-loader-orbit">
                    <div className="orbit-ring ring-1"></div>
                    <div className="orbit-ring ring-2"></div>
                    <div className="orbit-ring ring-3"></div>
                    <div className="loader-center-icon">
                        <IoFastFoodOutline className="pulsing-food-icon" />
                    </div>
                </div>
                {text && <p className="premium-loader-text">{text}</p>}
            </div>
        </div>
    );
};

export default Loader;
