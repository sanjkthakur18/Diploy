import React from "react";
import axios from "axios";

const ProductList = ({ products, refresh, setEditProduct }) => {
    const handleDelete = async (id) => {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:3500/api/products/delete/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        refresh();
    };

    return (
        <div className="bg-white rounded shadow p-4">
            <h2 className="text-xl font-semibold mb-4">Product List</h2>
            <ul className="divide-y">
                {products.map((product) => (
                    <li key={product.id} className="py-3 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <img
                                src={`${product.imageUrl}`}
                                alt={product.name}
                                className="w-20 h-20 object-cover rounded border"
                            />
                            <div>
                                <p className="font-semibold">{product.name}</p>
                                <p className="text-sm text-gray-600">{product.description}</p>
                                <p className="text-sm">₹ {product.price}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                className="text-white bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded"
                                onClick={() => setEditProduct(product)}
                            >
                                Edit
                            </button>
                            <button
                                className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
                                onClick={() => handleDelete(product.id)}
                            >
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ProductList;