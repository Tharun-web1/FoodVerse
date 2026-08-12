import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import EditProfile from "../User/EditProfile";
import MyAddress from "../User/MyAddress";
import MyOrders from "../User/MyOrders";
import MyWishlist from "../User/MyWishlist";
import MyWallet from "../User/MyWallet";
import ProfileSidebar from "../User/ProfileSidebar";
import "../UserCss/MyProfilePage.css";
import Navbar from "../User/Navbar";
import FloatingMap from "./FloatingMap";
import { useTranslation } from "react-i18next";

const MyProfilePage = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const getTabFromPath = () => {
    if (location.pathname.includes('/address')) return 'address';
    if (location.pathname.includes('/orders')) return 'orders';
    if (location.pathname.includes('/wishlist')) return 'wishlist';
    if (location.pathname.includes('/wallet')) return 'wallet';
    if (location.pathname.includes('/details')) return 'profile';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath());

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [location.pathname]);

  return (
    <>
      <Navbar />
      <div className="my-profile-page address-only-view">
        <div className="profile-content">
          {activeTab === "overview" && <ProfileSidebar isOpen={true} onClose={() => {}} />}
          {activeTab === "profile" && <EditProfile />}
          {activeTab === "address" && <MyAddress />}
          {activeTab === "orders" && <MyOrders isProfile={true} />}
          {activeTab === "wishlist" && <MyWishlist isProfile={true} />}
          {activeTab === "wallet" && <MyWallet isProfile={true} />}
        </div>
      </div>
      <FloatingMap />
    </>
  );
};

export default MyProfilePage;
