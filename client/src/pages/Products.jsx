import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ProductList from "../components/ProductList";
import CreateProduct from "../components/CreateProduct";

const Products = () => {
    const [products, setProducts] = useState([]);
    const [user, setUser] = useState({});
    const [editProduct, setEditProduct] = useState(null);
    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    console.log(token)
    const fetchProducts = async () => {
        const res = await axios.get("http://localhost:3500/api/products/getall", {
            headers: { Authorization: `Bearer ${token}` },
        });
        setProducts(res.data.products);
    };

    const handleLogout = () => {
        localStorage.clear("token");
        navigate("/");
    };

    useEffect(() => {
    const userProfile = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const res = await axios.get("http://127.0.0.1:3500/api/auth/profile", {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log("User fetched:", res.data.user);
            setUser(res.data.user);
            console.log(user)
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };

    userProfile();
}, []);

    useEffect(() => {
        fetchProducts();
    }, []);

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Product Management</h1>
                <p>Welcome Mr. {user.username}</p>
                <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                    Logout
                </button>
            </div>
            <CreateProduct refresh={fetchProducts} editProduct={editProduct} setEditProduct={setEditProduct} />
            <ProductList products={products} refresh={fetchProducts} setEditProduct={setEditProduct} />
        </div>
    );
}

export default Products;