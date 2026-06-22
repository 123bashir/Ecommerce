import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import Dashboard from "./routes/dashboard";
import About from "./routes/about";
import Cart from "./routes/cart";
import Contact from "./routes/contact";
import ShopList from "./routes/shoplist";
import Faq from "./routes/faq";
import AllOrders from "./routes/allOrders";
import CustomerProfile from "./routes/customerProfile";
import Checkout from "./routes/checkout";
import Login from "./routes/login";
import Register from "./routes/register";
import ProductDetail from "./routes/productDetail";
import NotFound from "./routes/notfound";
import PaymentCompletion from "./routes/paymentCompletion";



function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial app load
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const router = createBrowserRouter([
    { path: "/", element: <Dashboard /> },
    { path: "/about", element: <About /> },
    { path: "/faq", element: <Faq /> },
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    { path: "/contact", element: <Contact /> },
    { path: "/shop-list", element: <ShopList /> },
    { path: "/shop-grids", element: <ShopList /> },
    { path: "/product-grids", element: <ShopList /> },
    { path: "/cart", element: <Cart /> },
    { path: "/product/:id", element: <ProductDetail /> },

    // Protected Routes
    { path: "/checkout", element: <Checkout /> },
    { path: "/payment-completion", element: <PaymentCompletion /> },
    { path: "/allOrders", element: <AllOrders /> },
    { path: "/customerProfile", element: <CustomerProfile /> },
    // { path: "/dashboard", element: <ProtectedRoute element={<Dashboard />} /> }, // Removed as per request

    {
      path: "*",
      element: <NotFound />,
    },
  ]);

  return (
    <>
      {loading && (
        <div className="soft-loader">
          <div className="loader-content">
            <div className="loader-circle"></div>
            <div className="loader-circle"></div>
            <div className="loader-circle"></div>
            <div className="loader-shadow"></div>
          </div>
          <style>{`
            .soft-loader {
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: #fff;
              z-index: 9999;
              display: flex;
              align-items: center;
              justify-content: center;
              animation: fadeOut 0.5s ease 1.2s forwards;
            }
            .loader-content {
              position: relative;
              width: 200px;
              height: 60px;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            .loader-circle {
              width: 20px;
              height: 20px;
              position: absolute;
              border-radius: 50%;
              background-color: #667eea;
              left: 15%;
              transform-origin: 50%;
              animation: circle 0.5s alternate infinite ease;
            }
            .loader-circle:nth-child(2) {
              left: 45%;
              animation-delay: .2s;
            }
            .loader-circle:nth-child(3) {
              left: auto;
              right: 15%;
              animation-delay: .3s;
            }
            .loader-shadow {
              width: 20px;
              height: 4px;
              border-radius: 50%;
              background-color: rgba(0,0,0,0.1);
              position: absolute;
              top: 62px;
              transform-origin: 50%;
              z-index: -1;
              left: 15%;
              filter: blur(1px);
              animation: shadow 0.5s alternate infinite ease;
            }
            @keyframes circle {
              0% { top: 60px; height: 5px; border-radius: 50px 50px 25px 25px; transform: scaleX(1.7); }
              40% { height: 20px; border-radius: 50%; transform: scaleX(1); }
              100% { top: 0%; }
            }
            @keyframes shadow {
              0% { transform: scaleX(1.5); }
              40% { transform: scaleX(1); opacity: .7; }
              100% { transform: scaleX(.2); opacity: .4; }
            }
            @keyframes fadeOut { to { opacity: 0; visibility: hidden; } }
          `}</style>
        </div>
      )}
      <RouterProvider router={router} />
    </>
  );
}

export default App;
