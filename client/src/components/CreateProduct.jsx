import React, { useEffect, useState } from "react";
import axios from "axios";

const CreateProduct = ({ refresh, editProduct, setEditProduct }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (editProduct) {
      setName(editProduct.name);
      setDescription(editProduct.description);
      setPrice(editProduct.price);
      setPreviewUrl(`http://localhost:3500/uploads/${editProduct.image}`);
    }
  }, [editProduct]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    if (image) formData.append("image", image);

    try {
      if (editProduct) {
        await axios.put(
          `http://localhost:3500/api/products/update/${editProduct.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        setEditProduct(null);
      } else {
        await axios.post(
          "http://localhost:3500/api/products/create",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      setName("");
      setDescription("");
      setPrice("");
      setImage(null);
      setPreviewUrl(null);
      refresh();
    } catch (err) {
      console.error("Error submitting product", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">{editProduct ? "Edit" : "Create"} Product</h2>
      <div className="grid gap-4">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          className="border p-2 rounded w-full"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            setImage(e.target.files[0]);
            setPreviewUrl(URL.createObjectURL(e.target.files[0]));
          }}
          className="border p-2 rounded w-full"
        />
        {previewUrl && (
          <img
            src={previewUrl}
            alt="Preview"
            className="w-32 h-32 object-cover rounded border"
          />
        )}
        <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          {editProduct ? "Update" : "Create"} Product
        </button>
      </div>
    </form>
  );
};

export default CreateProduct;
