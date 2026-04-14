
import './App.css'
import Footer from './components/Footer'
import Home from './components/HomePage/Home'
import Login from './components/LoginPage/Login'
import ForgotPassword from './components/LoginPage/ForgotPassword'
import Contact from './components/Restaurant/Contact'
import EditItem from './components/Restaurant/EditItem'
import EditRestaurant from './components/Restaurant/EditRestaurant'

import TotalOrders from './components/Restaurant/TotalOrders'
import Orders from './components/Restaurant/Orders'
import PendingOrders from './components/Restaurant/PendingOrders'
import DeliveredOrders from './components/Restaurant/DeliveredOrders'
import TodayOrders from './components/Restaurant/TodayOrders'
import User from './components/User/User'
import Restaurant from './components/Restaurant/Restaurant'
import RestaurantDashboard from './components/Restaurant/RestaurantDashboard'
import RestaurantItems from './components/Restaurant/RestaurantItems'
import RestaurantLogin from './components/Restaurant/RestaurantLogin'
import OrderHistory from './components/Restaurant/OrderHistory'
import ViewItem from './components/Restaurant/ViewItem'
import Revenue from './components/Restaurant/Revenue'
import TodayRevenue from './components/Restaurant/TodayRevenue'
import RestaurantCoupons from './components/Restaurant/Coupons'
import SignUp from './components/Singup/SignUp'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './components/User/CartContext'

import RestuarentInfo from './components/User/RestuarentInfo'
import MyProfilePage from './components/User/MyProfilePage'
import MyOrders from './components/User/MyOrders'
import Cart from './components/User/Cart'
import CategoryPage from './components/User/CategoryPage'

import PaymentPage from './components/User/PaymentPage'

import { AuthProvider } from './context/AuthContext'

import { RestaurantOrderProvider } from './context/RestaurantOrderContext'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider as DeliveryAuthProvider } from './components/DeliveryPartner/AuthContext'
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
import OrderSummary from './components/User/OrderSummary'
import GoogleMapsLoader from './components/Common/GoogleMapsLoader'

import AdminDashboard from './components/Admin/adminDashBoard'
import Managerestaurants from './components/Admin/Managerestaurants'
import ManageAdmins from './components/Admin/ManageAdmins'
import Payments from './components/Admin/Payments'
import Reviews from './components/Admin/Reviews'
import Riders from './components/Admin/Riders'
import Userdetails from './components/Admin/Userdetails'
import Coupons from './components/Admin/Coupons'
import AdminProtectedRoute from './components/Admin/AdminProtectedRoute'
import LiveChat from './components/User/LiveChat'

import { useEffect } from 'react';

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  return (
    <>

      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <RestaurantOrderProvider>
              <CartProvider>
                <GoogleMapsLoader>
                  <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='/user' element={<User />} />
                    <Route path='/login/user' element={<Login />} />
                    <Route path='/forgot-password' element={<ForgotPassword />} />
                    <Route path='/signup/user' element={<SignUp />} />
                    <Route path='/signup/res' element={<Restaurant />} />
                    <Route path='/res/menu' element={<RestaurantItems />} />
                    <Route path='/contact' element={<Contact />} />
                    <Route path='/login/res' element={<RestaurantLogin />} />
                    <Route path='/res/dash' element={<RestaurantDashboard />} />
                    <Route path='/res/revenue' element={<Revenue />} />
                    <Route path='/res/revenue/today' element={<TodayRevenue />} />
                    <Route path='/res/item/edit/:id' element={<EditItem />} />
                    <Route path='/res/item/view/:id' element={<ViewItem />} />
                    <Route path='/res/details/edit/:id' element={<EditRestaurant />} />
                    <Route path='/res/orders' element={<Orders />} />
                    <Route path='/res/order' element={<TotalOrders />} />
                    <Route path='/res/orders/pending' element={<PendingOrders />} />
                    <Route path='/res/orders/delivered' element={<DeliveredOrders />} />
                    <Route path='/res/orders/today' element={<TodayOrders />} />
                    <Route path='/res/order-history' element={<OrderHistory />} />
                    <Route path='/res/coupons' element={<RestaurantCoupons />} />

                    <Route path="/restaurant/:id" element={<RestuarentInfo />} />
                    <Route path="/profile" element={<MyProfilePage />} />
                    <Route path="/orders" element={<MyOrders />} />
                    <Route path="/cart" id="user-cart" element={<Cart />} />
                    <Route path="/category/:categoryName" id="category-page" element={<CategoryPage />} />
                    <Route path="/payment" id="payment-page" element={<PaymentPage />} />
                    <Route path="/order-summary/:id" element={<OrderSummary />} />
                    <Route path="/live-chat" element={<LiveChat />} />

                    {/* Delivery Partner Routes */}
                    <Route element={<DeliveryAuthProvider><DeliveryLayout /></DeliveryAuthProvider>}>
                      <Route path="/delivery" element={<DeliveryProtectedRoute />}>
                        <Route path="dash" element={<DeliveryDashboard />} />
                        <Route path="earnings" element={<DeliveryEarnings />} />
                        <Route path="profile" element={<DeliveryProfile />} />
                        <Route path="order/:id" element={<DeliveryOrderDetails />} />
                        <Route path="vehicle" element={<VehicleDetails />} />
                        <Route path="kycdocuments" element={<KycDetails />} />
                        <Route path="history" element={<DeliveryOrderHistory />} />
                        <Route path="details" element={<Details />} />
                        <Route path="documents" element={<Documents />} />

                      </Route>
                      <Route path="/delivery/login" element={<DeliveryLogin />} />
                      <Route path="/delivery/register" element={<DeliveryRegister />} />

                    </Route>

                    {/* Admin Routes */}
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
                </GoogleMapsLoader>
              </CartProvider>
            </RestaurantOrderProvider>
          </AuthProvider>
        </ToastProvider>
        {/* <Footer /> */}
      </BrowserRouter>

    </>
  )
}

export default App
