import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'

// User Components
import Home from './components/HomePage/Home'
import User from './components/User/User'
import Login from './components/LoginPage/Login'
import ForgotPassword from './components/LoginPage/ForgotPassword'
import SignUp from './components/Singup/SignUp'
import RestuarentInfo from './components/User/RestuarentInfo'
import MyProfilePage from './components/User/MyProfilePage'
import MyOrders from './components/User/MyOrders'
import Cart from './components/User/Cart'
import CategoryPage from './components/User/CategoryPage'
import OffersPage from './components/User/OffersPage'
import MyWishlist from './components/User/MyWishlist'
import MyWallet from './components/User/MyWallet'
import HiddenRestaurants from './components/User/HiddenRestaurants'
import ReferAndEarn from './components/User/ReferAndEarn'
import VouchersAndCoupons from './components/User/VouchersAndCoupons'
import TermsAndConditions from './components/User/TermsAndConditions'
import PrivacyPolicy from './components/User/PrivacyPolicy'
import HelpSupport from './components/User/HelpSupport'
import BitezyOne from './components/User/BitezyOne'
import PaymentPage from './components/User/PaymentPage'
import OrderSummary from './components/User/OrderSummary'
import LiveChat from './components/User/LiveChat'
import FloatingCart from './components/User/FloatingCart'

// Restaurant Partner Components
import Restaurant from './components/Restaurant/Restaurant'
import RestaurantLogin from './components/Restaurant/RestaurantLogin'
import RestaurantDashboard from './components/Restaurant/RestaurantDashboard'
import RestaurantItems from './components/Restaurant/RestaurantItems'
import EditItem from './components/Restaurant/EditItem'
import ViewItem from './components/Restaurant/ViewItem'
import EditRestaurant from './components/Restaurant/EditRestaurant'
import Orders from './components/Restaurant/Orders'
import TotalOrders from './components/Restaurant/TotalOrders'
import PendingOrders from './components/Restaurant/PendingOrders'
import DeliveredOrders from './components/Restaurant/DeliveredOrders'
import TodayOrders from './components/Restaurant/TodayOrders'
import OrderHistory from './components/Restaurant/OrderHistory'
import Revenue from './components/Restaurant/Revenue'
import TodayRevenue from './components/Restaurant/TodayRevenue'
import RestaurantCoupons from './components/Restaurant/Coupons'
import Contact from './components/Restaurant/Contact'

// Delivery Partner Components
import DeliveryDashboard from './components/DeliveryPartner/Dashboard'
import DeliveryLogin from './components/DeliveryPartner/Login'
import DeliveryRegister from './components/DeliveryPartner/Register'
import DeliveryEarnings from './components/DeliveryPartner/Earnings'
import DeliveryOrderDetails from './components/DeliveryPartner/OrderDetails'
import DeliveryProfile from './components/DeliveryPartner/Profile'
import VehicleDetails from './components/DeliveryPartner/VehicleDetails'
import KycDetails from './components/DeliveryPartner/KycDetails'
import DeliveryOrderHistory from './components/DeliveryPartner/OrderHistory'
import DeliveryProtectedRoute from './components/DeliveryPartner/ProtectedRoute'
import DeliveryLayout from './components/DeliveryPartner/DeliveryLayout'
import Details from './components/DeliveryPartner/Details'
import Documents from './components/DeliveryPartner/Documents'

// Admin Components
import AdminDashboard from './components/Admin/adminDashBoard'
import Managerestaurants from './components/Admin/Managerestaurants'
import ManageAdmins from './components/Admin/ManageAdmins'
import Payments from './components/Admin/Payments'
import Reviews from './components/Admin/Reviews'
import Riders from './components/Admin/Riders'
import Userdetails from './components/Admin/Userdetails'
import Coupons from './components/Admin/Coupons'
import AdminProtectedRoute from './components/Admin/AdminProtectedRoute'

// Context & Utility Providers
import { CartProvider } from './components/User/CartContext'
import { AuthProvider } from './context/AuthContext'
import { RestaurantOrderProvider } from './context/RestaurantOrderContext'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider as DeliveryAuthProvider } from './components/DeliveryPartner/AuthContext'
import GoogleMapsLoader from './components/Common/GoogleMapsLoader'

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <RestaurantOrderProvider>
            <CartProvider>
              <GoogleMapsLoader>
                <Routes>
                  {/* ================= USER / CUSTOMER DOMAIN ================= */}
                  <Route path='/' element={<Home />} />
                  <Route path='/user' element={<User />} />
                  <Route path='/login/user' element={<Login />} />
                  <Route path='/signup/user' element={<SignUp />} />
                  <Route path='/forgot-password' element={<ForgotPassword />} />
                  <Route path="/cart" id="user-cart" element={<Cart />} />
                  <Route path="/category/:categoryName" id="category-page" element={<CategoryPage />} />
                  <Route path="/payment" id="payment-page" element={<PaymentPage />} />
                  <Route path="/order-summary/:id" element={<OrderSummary />} />
                  <Route path="/offers" element={<OffersPage />} />
                  <Route path="/offers/:offerType" element={<OffersPage />} />
                  <Route path="/live-chat" element={<LiveChat />} />
                  <Route path="/contact" element={<Contact />} />

                  {/* Hierarchical Profile Sub-Domain */}
                  <Route path="/profile" element={<MyProfilePage />} />
                  <Route path="/profile/details" element={<MyProfilePage />} />
                  <Route path="/profile/address" element={<MyProfilePage />} />
                  <Route path="/profile/orders" element={<MyOrders />} />
                  <Route path="/profile/wishlist" element={<MyWishlist />} />
                  <Route path="/profile/wallet" element={<MyWallet />} />
                  <Route path="/profile/vouchers-coupons" element={<VouchersAndCoupons />} />
                  <Route path="/profile/hidden-restaurants" element={<HiddenRestaurants />} />
                  <Route path="/profile/refer-earn" element={<ReferAndEarn />} />
                  <Route path="/profile/terms" element={<TermsAndConditions />} />
                  <Route path="/profile/privacy" element={<PrivacyPolicy />} />
                  <Route path="/profile/help" element={<HelpSupport />} />
                  <Route path="/profile/bitezy-one" element={<BitezyOne />} />

                  {/* Customer Direct Aliases */}
                  <Route path="/orders" element={<MyOrders />} />
                  <Route path="/wishlist" element={<MyWishlist />} />
                  <Route path="/wallet" element={<MyWallet />} />
                  <Route path="/hidden-restaurants" element={<HiddenRestaurants />} />
                  <Route path="/refer-earn" element={<ReferAndEarn />} />
                  <Route path="/vouchers-coupons" element={<VouchersAndCoupons />} />
                  <Route path="/help" element={<HelpSupport />} />
                  <Route path="/help-support" element={<HelpSupport />} />
                  <Route path="/bitezy-one" element={<BitezyOne />} />
                  <Route path="/subscription" element={<BitezyOne />} />
                  <Route path="/terms" element={<TermsAndConditions />} />
                  <Route path="/terms-conditions" element={<TermsAndConditions />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />

                  {/* ================= RESTAURANT PARTNER DOMAIN ================= */}
                  <Route path="/restaurant/login" element={<RestaurantLogin />} />
                  <Route path="/restaurant/signup" element={<Restaurant />} />
                  <Route path="/restaurant/dashboard" element={<RestaurantDashboard />} />
                  <Route path="/restaurant/menu" element={<RestaurantItems />} />
                  <Route path="/restaurant/items/view/:id" element={<ViewItem />} />
                  <Route path="/restaurant/items/edit/:id" element={<EditItem />} />
                  <Route path="/restaurant/details/edit/:id" element={<EditRestaurant />} />
                  <Route path="/restaurant/orders" element={<Orders />} />
                  <Route path="/restaurant/orders/total" element={<TotalOrders />} />
                  <Route path="/restaurant/orders/pending" element={<PendingOrders />} />
                  <Route path="/restaurant/orders/delivered" element={<DeliveredOrders />} />
                  <Route path="/restaurant/orders/today" element={<TodayOrders />} />
                  <Route path="/restaurant/orders/history" element={<OrderHistory />} />
                  <Route path="/restaurant/revenue" element={<Revenue />} />
                  <Route path="/restaurant/revenue/today" element={<TodayRevenue />} />
                  <Route path="/restaurant/coupons" element={<RestaurantCoupons />} />
                  <Route path="/restaurant/:id" element={<RestuarentInfo />} />

                  {/* ================= DELIVERY PARTNER DOMAIN ================= */}
                  <Route element={<DeliveryAuthProvider><DeliveryLayout /></DeliveryAuthProvider>}>
                    <Route path="/delivery-partner/login" element={<DeliveryLogin />} />
                    <Route path="/delivery-partner/register" element={<DeliveryRegister />} />
                    <Route path="/delivery-partner" element={<DeliveryProtectedRoute />}>
                      <Route path="dashboard" element={<DeliveryDashboard />} />
                      <Route path="dash" element={<DeliveryDashboard />} />
                      <Route path="earnings" element={<DeliveryEarnings />} />
                      <Route path="profile" element={<DeliveryProfile />} />
                      <Route path="order/:id" element={<DeliveryOrderDetails />} />
                      <Route path="vehicle" element={<VehicleDetails />} />
                      <Route path="kyc-documents" element={<KycDetails />} />
                      <Route path="kycdocuments" element={<KycDetails />} />
                      <Route path="history" element={<DeliveryOrderHistory />} />
                      <Route path="details" element={<Details />} />
                      <Route path="documents" element={<Documents />} />
                    </Route>
                    {/* Alias for /delivery */}
                    <Route path="/delivery/login" element={<DeliveryLogin />} />
                    <Route path="/delivery/register" element={<DeliveryRegister />} />
                    <Route path="/delivery" element={<DeliveryProtectedRoute />}>
                      <Route path="dashboard" element={<DeliveryDashboard />} />
                    </Route>
                  </Route>

                  {/* ================= ADMIN PORTAL DOMAIN ================= */}
                  <Route element={<AdminProtectedRoute />}>
                    <Route path="/admin" element={<AdminDashboard />}>
                      <Route path="users" element={<Userdetails />} />
                      <Route path="restaurants" element={<Managerestaurants />} />
                      <Route path="riders" element={<Riders />} />
                      <Route path="payments" element={<Payments />} />
                      <Route path="reviews" element={<Reviews />} />
                      <Route path="admins" element={<ManageAdmins />} />
                      <Route path="coupons" element={<Coupons />} />
                    </Route>
                  </Route>
                </Routes>
                <FloatingCart />
              </GoogleMapsLoader>
            </CartProvider>
          </RestaurantOrderProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
