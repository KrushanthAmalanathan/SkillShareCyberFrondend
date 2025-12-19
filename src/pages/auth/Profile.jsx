import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import Dashboard from "../../components/Dashboard";
import { AiOutlineEdit, AiOutlineLogout, AiOutlineCamera } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { UserEndPoint } from "../../utils/ApiRequest";

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [image, setImage] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const response = await axios.get(`${UserEndPoint}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(response.data);
      } catch (err) {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleEditProfile = () => {
    navigate("/profile/edit");
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePicture", file);

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const response = await axios.post(`${UserEndPoint}/upload-profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setProfile((prev) => ({
        ...prev,
        profilePicture: response.data.url,
      }));
    } catch (err) {
      console.error("Error uploading image:", err);
      setError("Failed to upload image.");
    }
  };

  return (
    <Dashboard>
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] ">
        <div className="bg-white p-10 rounded-lg shadow-xl w-[32rem] backdrop-blur-lg">
          <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Profile</h2>

          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : (
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto">
                <img
                  src={profile?.profilePicture || "/default-profile.png"}
                  alt="Profile"
                  className="w-24 h-24 rounded-full mx-auto border-2 border-gray-300 shadow-md object-cover"
                />
                <label className="absolute bottom-0 right-0 bg-gray-200 p-2 rounded-full cursor-pointer shadow-lg">
                  <AiOutlineCamera size={20} />
                  <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                </label>
              </div>

              <h3 className="text-2xl font-semibold mt-4">{profile?.firstName} {profile?.lastName}</h3>
              <p className="text-gray-600">{profile?.email}</p>
              <p className="text-gray-500">Role: {profile?.role}</p>
              <p className="text-gray-500">DOB: {new Date(profile?.dateOfBirth).toLocaleDateString()}</p>

              <div className="mt-6 flex justify-center gap-4">
                <button
                  className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                  // onClick={handleEditProfile}
                >
                  <AiOutlineEdit className="mr-2" /> Edit Profile
                </button>
                <button
                  className="flex items-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                  onClick={handleLogout}
                >
                  <AiOutlineLogout className="mr-2" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Dashboard>
  );
};

export default Profile;