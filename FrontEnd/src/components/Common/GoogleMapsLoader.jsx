import { useJsApiLoader } from '@react-google-maps/api';
import Loader from './Loader';

const libraries = ['places', 'geometry'];

const GoogleMapsLoader = ({ children }) => {
    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: libraries
    });

    if (loadError) {
        return <div className="p-3 text-danger">Error loading Google Maps</div>;
    }

    if (!isLoaded) {
        return <Loader fullPage text="Preparing your experience..." />;
    }

    return children;
};

export default GoogleMapsLoader;
