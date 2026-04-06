import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate, useParams, Link } from "react-router-dom";
import Navbar from "../Restaurant/Navbar";
import GoogleMapsLoader from "../Common/GoogleMapsLoader";
import GoogleAutocompleteInput from "../Common/GoogleAutocompleteInput";
import "../RestaurantCss/AddRestaurant.css";

export default function EditRestaurant() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    r_min: "",
    r_max: "",
    r_cuisine: "",
    r_zone: "",
    r_lat: "",
    r_lon: "",
    r_fName: "",
    r_lName: "",
    r_tin: "",
    r_exp: "",
    r_llNo: "",
    r_llExp: "",
    phnno: "",
    mail: "",
    openingTime: "",
    closingTime: ""
  });

  const [files, setFiles] = useState({
    restaurantImage: null,
    logoImage: null,
    tinImage: null,
    licenceImage: null,
  });

  const [previews, setPreviews] = useState({
    restaurantImage: null,
    logoImage: null,
    tinImage: null,
    licenceImage: null,
  });

  const [loading, setLoading] = useState(false);

  const handlePlaceSelected = (place) => {
    setFormData(prev => ({
      ...prev,
      location: place.formatted_address,
      r_lat: place.lat.toString(),
      r_lon: place.lng.toString()
    }));
  };

  useEffect(() => {
    if (!id) return;

    api.get(`/restaurants/${id}`)
      .then((res) => setFormData(res.data))
      .catch((err) => {
        console.error(err);
        alert("❌ Failed to load restaurant details");
      });
  }, [id]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    if (!file) return;

    setFiles((prev) => ({ ...prev, [name]: file }));
    setPreviews((prev) => ({
      ...prev,
      [name]: URL.createObjectURL(file),
    }));
  };

  const uploadImage = async (url, file) => {
    const fd = new FormData();
    fd.append("image", file);

    await api.post(url, fd);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.put('/restaurants/profile', formData);

      if (files.restaurantImage)
        await uploadImage(`/restaurants/${id}/image`, files.restaurantImage);

      if (files.logoImage)
        await uploadImage(`/restaurants/logoimage/${id}`, files.logoImage);

      if (files.tinImage)
        await uploadImage(`/restaurants/tindoc/${id}`, files.tinImage);

      if (files.licenceImage)
        await uploadImage(`/restaurants/licencedoc/${id}`, files.licenceImage);

      alert("✅ Restaurant updated successfully");
      navigate("/res/dash");
    } catch (err) {
      console.error(err);
      alert("❌ Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <GoogleMapsLoader>
        <div className="restaurant-container mt-2">
        <div className="restaurant-card mt-5">
          <h3 className="text-center mb-3">✏️ Edit Restaurant</h3>

          <form onSubmit={handleSubmit}>
            <label htmlFor="">Restaurant Name</label>
            <input
              className="form-control mb-2"
              name="name"
              value={formData.name || ""}
              placeholder="Restaurant Name"
              onChange={handleChange}
            />

            <label htmlFor="">Restaurant Address</label>
            <GoogleAutocompleteInput 
              value={formData.location || ""} 
              onChange={(val) => setFormData(prev => ({ ...prev, location: val }))}
              onPlaceSelected={handlePlaceSelected}
              placeholder="Search address"
              className="form-control mb-2"
            />

            <h6 className="section-title mt-3">Delivery Timings</h6>
            <div className="row">
              <div className="col">
                <label>Min Delivery Time</label>
                <input
                  className="form-control mb-2"
                  name="r_min"
                  type="number"
                  value={formData.r_min || ""}
                  placeholder="Min Time for Delivery"
                  onChange={handleChange}
                />
              </div>
              <div className="col">
                <label>Max Delivery Time</label>
                <input className="form-control mb-2" name="r_max" type="number" value={formData.r_max || ""} placeholder="Max Time for Delivery" onChange={handleChange} />
              </div>
            </div>

            <h6 className="section-title mt-3">Restaurant Timings</h6>
            <div className="row">
              <div className="col">
                <label>Open Time</label>
                <input className="form-control mb-2" name="openingTime" type="time" placeholder="Opening-Time" onChange={handleChange} value={formData.openingTime || ""} />
              </div>
              <div className="col">
                <label>Close Time</label>
                <input className="form-control mb-2" name="closingTime" type="time" placeholder="closing-Time" onChange={handleChange} value={formData.closingTime || ""} />
              </div>
            </div>

            <label>Cuisine</label>
            <input className="form-control mb-2" name="r_cuisine" value={formData.r_cuisine || ""} placeholder="Cuisine" onChange={handleChange} />

            <label>Zone</label>
            <input className="form-control mb-2" name="r_zone" value={formData.r_zone || ""} placeholder="Zone" onChange={handleChange} />

            <h6 className="section-title mt-3">Owner Details</h6>
            <label>First Name</label>
            <input className="form-control mb-2" name="r_fName" value={formData.r_fName || ""} placeholder="First Name" onChange={handleChange} />
            <label>Last Name</label>
            <input className="form-control mb-2" name="r_lName" value={formData.r_lName || ""} placeholder="Last Name" onChange={handleChange} />
            <label>Phone Number</label>
            <input className="form-control mb-2" name="phnno" value={formData.phnno || ""} placeholder="Phone Number" onChange={handleChange} />

            <h6 className="section-title mt-3">Business Details</h6>
            <label>TIN Number</label>
            <input className="form-control mb-2" name="r_tin" value={formData.r_tin || ""} placeholder="TIN Number" onChange={handleChange} />
            <label>TIN Expiry Date</label>
            <input type="date" className="form-control mb-2" name="r_exp" value={formData.r_exp || ""} onChange={handleChange} />

            <label>Labour License Number</label>
            <input className="form-control mb-2" name="r_llNo" value={formData.r_llNo || ""} placeholder="Labour License Number" onChange={handleChange} />
            <label>License Expiry Date</label>
            <input type="date" className="form-control mb-2" name="r_llExp" value={formData.r_llExp || ""} onChange={handleChange} />

            <h6 className="section-title mt-3">Update Images </h6>
            <label>Cover Image</label>
            <input type="file" name="restaurantImage" className="form-control mb-2" onChange={handleFileChange} />
            <label>Logo Image</label>
            <input type="file" name="logoImage" className="form-control mb-2" onChange={handleFileChange} />

            <label>Licence Image</label>
            <input type="file" name="licenceImage" className="form-control mb-2" onChange={handleFileChange} />
            <label>Tin Image</label>
            <input type="file" name="tinImage" className="form-control mb-2" onChange={handleFileChange} />

            <button className="btn btn-success w-100" disabled={loading}>
              {loading ? "Updating..." : "Update Restaurant"}
            </button>

            <Link className="btn btn-secondary w-100 mt-2" to="/res/dash">
              Back
            </Link>
          </form>
        </div>
      </div>
      </GoogleMapsLoader>
    </>
  );
}
