import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {
    const currency = "₹";
    const delivery_fee = 0;
    const backendUrl =
        import.meta.env.VITE_BACKEND_URL;
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
    const addToCart = async(itemId, size, quantity = 1) => {
        if (!size) {
            toast.error("Please select a product size");
            return;
        }

        try {
            const product = products.find((p) => p._id === itemId);
            if (!product) {
                toast.error("Product not found");
                return;
            }

            if (!product.sizes.includes(size)) {
                toast.error("Selected size is not available for this product");
                return;
            }

            const updatedCart = {...cartItems };
            updatedCart[itemId] = updatedCart[itemId] || {};
            updatedCart[itemId][size] = (updatedCart[itemId][size] || 0) + quantity;

            setCartItems(updatedCart);
            localStorage.setItem('cartItems', JSON.stringify(updatedCart));
            toast.success("Added to Cart");
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error("Failed to add item to cart");
        }
    };

    const updateQuantity = async(itemId, size, quantity) => {
        try {
            const updatedCart = {...cartItems };

            if (!updatedCart[itemId]) {
                toast.error("Item not found in cart");
                return;
            }

            if (quantity > 0) {
                // Validate quantity is a positive number
                const numericQuantity = Number(quantity);
                if (isNaN(numericQuantity) || numericQuantity <= 0) {
                    toast.error("Please enter a valid quantity");
                    return;
                }
                updatedCart[itemId] = {...updatedCart[itemId], [size]: numericQuantity };
            } else {
                // Remove the size if quantity is 0 or negative
                if (updatedCart[itemId][size]) {
                    const {
                        [size]: _, ...restSizes
                    } = updatedCart[itemId];

                    if (Object.keys(restSizes).length > 0) {
                        updatedCart[itemId] = restSizes;
                    } else {
                        delete updatedCart[itemId];
                    }
                }
            }

            setCartItems(updatedCart);
            localStorage.setItem('cartItems', JSON.stringify(updatedCart));
        } catch (error) {
            console.error('Error updating cart quantity:', error);
            toast.error("Failed to update quantity");
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
            if (product && product.image && product.image[0]) {
                return product.image[0];
            }
        }
        return null;
    };

    // 🌟 Reviews
    const addReview = async(productId, reviewData) => {
        try {
            const res = await axios.post(`${backendUrl}/api/review/add`, { productId, review: reviewData }, { headers: { token } });

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

    const getProductReviews = async(productId) => {
        try {
            const res = await axios.get(`${backendUrl}/api/review/${productId}`);
            if (res.data.success) {
                setReviews((prev) => ({...prev, [productId]: res.data.reviews }));
            }
        } catch (error) {
            console.error(error);
            toast.error("Error fetching reviews");
        }
    };

    // 📦 Use Static Products Data
    const getProductsData = async() => {
        // Use static demo products instead of API call
        const demoProducts = [{
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

    // � App Init (Static Data)
    useEffect(() => {
        // Load static demo data
        getProductsData();

        // Load token from localStorage
        const storedToken = localStorage.getItem("token");
        if (!token && storedToken) {
            setToken(storedToken);
        }

        // Load cart from localStorage
        const loadCart = () => {
            try {
                const storedCart = localStorage.getItem('cartItems');
                if (storedCart) {
                    setCartItems(JSON.parse(storedCart));
                }
            } catch (error) {
                console.error('Error loading cart from localStorage:', error);
                toast.error('Failed to load cart');
            }
        };

        loadCart();
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

    return ( <
        ShopContext.Provider value = { contextValue } > { children } < /ShopContext.Provider>
    );
};

export default ShopContextProvider;