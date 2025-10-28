import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {
  const currency = "₹";
  const delivery_fee = 0;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const url = backendUrl || "http://localhost:4000"
  // 🔄 States
  const [token, setToken] = useState("");
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [reviews, setReviews] = useState({});
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);

  // 🌟 Wishlist - Load & Save
  useEffect(() => {
    const stored = localStorage.getItem("wishlist");
    if (stored) setWishlist(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (id) => {
    if (!wishlist.includes(id)) {
      setWishlist((prev) => [...prev, id]);
      toast.success("Added to Wishlist");
    }
  };

  const removeFromWishlist = (id) => {
    setWishlist((prev) => prev.filter((itemId) => itemId !== id));
    toast.info("Removed from Wishlist");
  };

  // 🛒 Cart Management
  const addToCart = async (itemId, size, quantity = 1) => {
    if (!size) return toast.error("Select Product Size");

    const updatedCart = JSON.parse(JSON.stringify(cartItems));
    updatedCart[itemId] = updatedCart[itemId] || {};
    updatedCart[itemId][size] = (updatedCart[itemId][size] || 0) + quantity;

    setCartItems(updatedCart);
    
    // Save to localStorage instead of API
    try {
      localStorage.setItem('cartItems', JSON.stringify(updatedCart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }

    toast.success("Added to Cart");
  };

  const updateQuantity = async (itemId, size, quantity) => {
    const updatedCart = JSON.parse(JSON.stringify(cartItems));

    if (updatedCart[itemId]) {
      if (quantity > 0) {
        updatedCart[itemId][size] = quantity;
      } else {
        delete updatedCart[itemId][size];
        if (Object.keys(updatedCart[itemId]).length === 0) {
          delete updatedCart[itemId];
        }
      }
    }

    setCartItems(updatedCart);

    // Save to localStorage instead of API
    try {
      localStorage.setItem('cartItems', JSON.stringify(updatedCart));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  };

  const getCartCount = () =>
    Object.values(cartItems).reduce(
      (count, sizes) =>
        count + Object.values(sizes).reduce((sum, qty) => sum + qty, 0),
      0
    );

  const getCartAmount = () => {
    return Object.entries(cartItems).reduce((total, [itemId, sizes]) => {
      const product = products.find((p) => p._id === itemId);
      if (!product) return total;
      const itemTotal = Object.values(sizes).reduce(
        (sum, qty) => sum + product.price * qty,
        0
      );
      return total + itemTotal;
    }, 0);
  };

  const getFirstCartItemImage = () => {
    for (const itemId of Object.keys(cartItems)) {
      const product = products.find((p) => p._id === itemId);
      if (product?.image) return product.image;
    }
    return null;
  };

  // 🌟 Reviews
  const addReview = async (productId, reviewData) => {
    try {
      const res = await axios.post(
        `${backendUrl}/api/review/add`,
        { productId, review: reviewData },
        { headers: { token } }
      );

      if (res.data.success) {
        toast.success("Review added!");
        getProductReviews(productId);
      } else {
        toast.error(res.data.message || "Review failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Review error");
    }
  };

  const getProductReviews = async (productId) => {
    try {
      const res = await axios.get(`${backendUrl}/api/review/${productId}`);
      if (res.data.success) {
        setReviews((prev) => ({ ...prev, [productId]: res.data.reviews }));
      }
    } catch (error) {
      console.error(error);
      toast.error("Error fetching reviews");
    }
  };

  // 📦 Use Static Products Data
  const getProductsData = async () => {
    // Use static demo products instead of API call
    const demoProducts = [
      {
        _id: "demo1",
        name: "Demo Product 1",
        price: 999,
        image: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
        category: "Demo",
        sizes: ["S", "M", "L"],
        description: "Demo product for testing"
      },
      {
        _id: "demo2", 
        name: "Demo Product 2",
        price: 1299,
        image: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"],
        category: "Demo",
        sizes: ["S", "M", "L"],
        description: "Another demo product"
      }
    ];
    
    setProducts(demoProducts);
  };

  // 🛒 Use Local Cart Storage
  const getUserCart = async (authToken) => {
    // Use localStorage for cart instead of API
    try {
      const storedCart = localStorage.getItem('cartItems');
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      setCartItems({});
    }
  };

  // 🚀 App Init (Static Data)
  useEffect(() => {
    // Load static demo data
    getProductsData();
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!token && storedToken) setToken(storedToken);
  }, []);

  useEffect(() => {
    if (token) getUserCart(token);
  }, [token]);

  // 🧠 Context Value
  const contextValue = {
    currency,
    delivery_fee,
    backendUrl,
    navigate,
    token,
    setToken,
    products,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    addToCart,
    updateQuantity,
    getCartCount,
    getCartAmount,
    setCartItems,
    getFirstCartItemImage,
    wishlist,
    addToWishlist,
    removeFromWishlist,
    reviews,
    addReview,
    getProductReviews,
    promoCode,
    setPromoCode,
    discount,
    setDiscount,
  };

  return (
    <ShopContext.Provider value={contextValue}>{children}</ShopContext.Provider>
  );
};

export default ShopContextProvider;





