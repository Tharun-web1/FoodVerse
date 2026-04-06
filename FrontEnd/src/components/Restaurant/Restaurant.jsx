import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import GoogleMapsLoader from "../Common/GoogleMapsLoader";
import GoogleAutocompleteInput from "../Common/GoogleAutocompleteInput";
import "../RestaurantCss/AddRestaurant.css";
import { API_BASE_URL } from "../../api/api";



export default function Restaurant() {
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
    password: "",
    username: "",
    closingTime: "",
    openingTime: "",
    role: "RESTAURANT",
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

  const [isLoading, setIsLoading] = useState(false);

  const handlePlaceSelected = (place) => {
    setFormData(prev => ({
      ...prev,
      location: place.formatted_address,
      r_lat: place.lat.toString(),
      r_lon: place.lng.toString()
    }));
  };



  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };



  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    const file = selectedFiles[0];
    if (file) {
      setFiles((prev) => ({
        ...prev,
        [name]: file,
      }));
      setPreviews((prev) => ({
        ...prev,
        [name]: URL.createObjectURL(file),
      }));
    }
  };

  const uploadImage = async (url, file) => {
    const fd = new FormData();
    fd.append("image", file);

    const token = localStorage.getItem("restaurant_token");
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    await axios.post(url, fd, { headers });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/auth/signup`,
        formData
      );

      const restaurantId = res.data.id;
      if (!restaurantId) {
        throw new Error("Restaurant ID not returned");
      }

      if (files.restaurantImage) {
        await uploadImage(
          `${API_BASE_URL}/restaurants/${restaurantId}/image`,
          files.restaurantImage
        );
      }

      if (files.logoImage) {
        await uploadImage(
          `${API_BASE_URL}/restaurants/logoimage/${restaurantId}`,
          files.logoImage
        );
      }

      if (files.tinImage) {
        await uploadImage(
          `${API_BASE_URL}/restaurants/tindoc/${restaurantId}`,
          files.tinImage
        );
      }

      if (files.licenceImage) {
        await uploadImage(
          `${API_BASE_URL}/restaurants/licencedoc/${restaurantId}`,
          files.licenceImage
        );
      }

      alert("✅ Restaurant registered successfully");
      navigate("/login/res");
    } catch (err) {
      console.error("Registration error:", err);
      alert(err.message || "❌ Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <GoogleMapsLoader>
        <div className="restaurant-container mt-2">
          <div className="restaurant-card mt-5">
            <h3 className="text-center mb-3">🍽 Restaurant Registration</h3>

            <form onSubmit={handleSubmit}>
              <h6 className="section-title">Restaurant Details</h6>

              <label>Username</label>
              <input className="form-control mb-2" name="username" placeholder="Username" onChange={handleChange} value={formData.username} />

              <label>Restaurant Name</label>
              <input className="form-control mb-2" name="name" placeholder="Restaurant Name" onChange={handleChange} value={formData.name} />

              <label>Address</label>
              <GoogleAutocompleteInput
                value={formData.location}
                onChange={(val) => setFormData(prev => ({ ...prev, location: val }))}
                onPlaceSelected={handlePlaceSelected}
                placeholder="Search address"
                className="form-control mb-2"
              />

              <h6 className="section-title mt-3">Restaurant Timings</h6>
              <div className="row">
                <div className="col">
                  <label>Open Time</label>
                  <input className="form-control mb-2" name="openingTime" type="time" placeholder="Open Time" onChange={handleChange} value={formData.openingTime} />
                </div>
                <div className="col">
                  <label>Close Time</label>
                  <input className="form-control mb-2" name="closingTime" type="time" placeholder="Close Time" onChange={handleChange} value={formData.closingTime} />
                </div>
              </div>

              <h6 className="section-title mt-3">Delivery Timings</h6>
              <div className="row">
                <div className="col">
                  <label>Min Delivery Time</label>
                  <input className="form-control mb-2" name="r_min" type="number" placeholder="Min Time" onChange={handleChange} value={formData.r_min} />
                </div>
                <div className="col">
                  <label>Max Delivery Time</label>
                  <input className="form-control mb-2" name="r_max" type="number" placeholder="Max Time" onChange={handleChange} value={formData.r_max} />
                </div>
              </div>

              <label>Cuisine</label>
              <input className="form-control mb-2" name="r_cuisine" placeholder="Cuisine" onChange={handleChange} value={formData.r_cuisine} />

              <label>Zone</label>
              <input className="form-control mb-2" name="r_zone" placeholder="Zone" onChange={handleChange} value={formData.r_zone} />

              <div className="row mt-2">
                <div className="col">
                  <label>Latitude</label>
                  <input className="form-control mb-2" name="r_lat" placeholder="Latitude" onChange={handleChange} value={formData.r_lat} />
                </div>
                <div className="col">
                  <label>Longitude</label>
                  <input className="form-control mb-2" name="r_lon" placeholder="Longitude" onChange={handleChange} value={formData.r_lon} />
                </div>
              </div>

              <h6 className="section-title mt-3">Restaurant Images</h6>
              <label>Cover Image</label>
              <input type="file" name="restaurantImage" className="form-control mb-2" onChange={handleFileChange} accept="image/*" />
              {previews.restaurantImage && (
                <div className="mb-2 text-center">
                  <img src={previews.restaurantImage} alt="Cover Preview" style={{ maxWidth: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }} />
                </div>
              )}

              <label>Logo Image</label>
              <input type="file" name="logoImage" className="form-control mb-2" onChange={handleFileChange} accept="image/*" />
              {previews.logoImage && (
                <div className="mb-2 text-center">
                  <img src={previews.logoImage} alt="Logo Preview" style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '50%', border: '1px solid #ddd' }} />
                </div>
              )}

              <h6 className="section-title mt-3">Owner Details</h6>
              <label>First Name</label>
              <input className="form-control mb-2" name="r_fName" placeholder="First Name" onChange={handleChange} value={formData.r_fName} />
              <label>Last Name</label>
              <input className="form-control mb-2" name="r_lName" placeholder="Last Name" onChange={handleChange} value={formData.r_lName} />
              <label>Phone Number</label>
              <input className="form-control mb-2" name="phnno" placeholder="Phone Number" onChange={handleChange} value={formData.phnno} />

              <h6 className="section-title mt-3">Business Details</h6>
              <label>TIN Number</label>
              <input className="form-control mb-2" name="r_tin" placeholder="TIN Number" onChange={handleChange} value={formData.r_tin} />
              <label>TIN Expiry Date</label>
              <input type="date" className="form-control mb-2" name="r_exp" onChange={handleChange} value={formData.r_exp} />

              <label>TIN Document</label>
              <input type="file" name="tinImage" className="form-control mb-2" onChange={handleFileChange} accept="image/*,application/pdf" />
              {previews.tinImage && (
                <div className="mb-2 text-center">
                  <img src={previews.tinImage} alt="TIN Preview" style={{ maxWidth: '100%', height: '100px', objectFit: 'contain' }} />
                </div>
              )}

              <label>Labour License Number</label>
              <input className="form-control mb-2" name="r_llNo" placeholder="Labour License Number" onChange={handleChange} value={formData.r_llNo} />
              <label>License Expiry Date</label>
              <input type="date" className="form-control mb-2" name="r_llExp" onChange={handleChange} value={formData.r_llExp} />

              <label>Labour License Document</label>
              <input type="file" name="licenceImage" className="form-control mb-2" onChange={handleFileChange} accept="image/*,application/pdf" />
              {previews.licenceImage && (
                <div className="mb-2 text-center">
                  <img src={previews.licenceImage} alt="License Preview" style={{ maxWidth: '100%', height: '100px', objectFit: 'contain' }} />
                </div>
              )}

              <h6 className="section-title mt-3">Security</h6>
              <label>Email</label>
              <input type="email" className="form-control mb-2" name="mail" placeholder="Email" onChange={handleChange} value={formData.mail} />
              <label>Password</label>
              <input type="password" className="form-control mb-3" name="password" placeholder="Password" onChange={handleChange} value={formData.password} />

              <button className="btn btn-primary w-100" disabled={isLoading}>
                {isLoading ? (
                  <span>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Registering...
                  </span>
                ) : (
                  "Register Restaurant"
                )}
              </button>

              <p className="text-center mt-2">
                Already have an account?{" "}
                <Link to="/login/res" className="text-primary">
                  Login Here
                </Link>
              </p>
            </form>
          </div>
        </div>
      </GoogleMapsLoader>
    </>
  );
}
