import React, { useState } from "react";
import { FiUserPlus } from "react-icons/fi";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { UserEndPoint } from "../../utils/ApiRequest";

const AddUser = ({ onClose, onUserAdded }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Viewer",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${UserEndPoint}/adduser`,
        formData
      );
      alert(`New user's password: ${data.tempPassword}`);
      onUserAdded?.();
      onClose();
    } catch (error) {
      alert(error.response?.data?.message || "Error creating user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto p-8 border-t-4 border-blue-500">
        <div className="flex items-center mb-6 space-x-2">
          <FiUserPlus className="text-3xl text-blue-500" />
          <h2 className="text-2xl font-semibold">Add New User</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-1 font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              placeholder="Enter user name"
              autoFocus
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              placeholder="Enter email address"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            >
              <option value="SuperAdmin">SuperAdmin</option>
              <option value="Admin">Admin</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>
          <div className="flex justify-end items-center pt-2 space-x-2 border-t pt-5">
            <button
              type="button"
              onClick={onClose}
              className="bg-red-600 hover:bg-red-700 transition transform hover:scale-105 text-white px-4 py-2 rounded-lg font-medium shadow"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 transition transform hover:scale-105 text-white px-4 py-2 rounded-lg font-medium shadow"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;
