import React, { useState , useEffect } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

const ProfilePage = () => {

  const {value} = useContext(AuthContext); // Fix: get value object first
  const {authUser, updateProfile} = value; // Fix: destructure from value

  const navigate = useNavigate();
  const [selectedImg , setSelectedImg] = useState(null);
  const [fullName, setFullName] = useState(authUser?.fullName || "");
  const [bio, setBio] = useState(authUser?.bio || "");
  const [profilePic, setProfilePic] = useState(authUser?.profilePic || "");

  // Sync form with authUser changes
  useEffect(() => {
    if (authUser) {
      setFullName(authUser.fullName || "");
      setBio(authUser.bio || "");
      setProfilePic(authUser.profilePic || "");
    }
  }, [authUser]);
  const handleSubmit = async(e) => {
    e.preventDefault();

    try {
      console.log("Submitting profile update...");
      console.log("Current authUser:", authUser);
      console.log("Current values:", { fullName, bio, selectedImg: selectedImg ? "image selected" : "no image" });

      if(!selectedImg) {
        console.log("Updating profile without image");
        const updatedUser = await updateProfile({fullName, bio});
        console.log("Profile updated without image:", updatedUser);
        toast.success("Profile updated successfully!");
        navigate("/");
        return;
      }

      console.log("Updating profile with image");
      const reader = new FileReader();
      reader.readAsDataURL(selectedImg);
      reader.onload = async () => {
        const base64Image = reader.result;
        console.log("Image converted to base64, updating profile...");
        const updatedUser = await updateProfile({ profilePic: base64Image, fullName, bio });
        console.log("Profile updated with image:", updatedUser);
        toast.success("Profile updated successfully!");
        navigate('/');
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Failed to update profile");
    }
 }

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imgUrl = URL.createObjectURL(file);
      setSelectedImg(file);
      setProfilePic(imgUrl);
    }
  };

   return (
    <div className="min-h-screen bg-cover bg-no-repeat flex items-center justify-center">
      <div className="w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg">
        <form
          onSubmit={handleSubmit}
          className="text-lg profile-details flex flex-col gap-5 p-10 flex-1"
        >
          <h3 className="text-lg">Profile Details</h3>

          {/* Upload Profile Image */}
          <div className="flex flex-col gap-3 items-center">
            <label htmlFor="avatar" className="cursor-pointer">
              <input
                onChange={(e) => setSelectedImg(e.target.files[0])}
                id="avatar"
                accept=".png, .jpg, .jpeg"
                type="file"
                className="hidden"
              />
              <img
                src={
                  selectedImg
                    ? URL.createObjectURL(selectedImg)
                    : profilePic || assets.avatar_icon
                }
                alt="avatar"
                className={`w-12 h-12 rounded-full ${
                  selectedImg && "avatar-icon"
                }`}
              />
            </label>
            <span>Upload Profile Image</span>
          </div>

          {/* Enter Name */}
          <input
            onChange={(e) => setFullName(e.target.value)}
            type="text"
            required
            placeholder="Enter your name"
            value={fullName}
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
          />

          {/* Enter Bio */}
          <textarea
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write profile bio..."
            value={bio}
            rows={4}
            required
            className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
          ></textarea>

          {/* Save Button */}
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-400 to-violet-600 text-white p-2 rounded-full text-lg cursor-pointer hover:scale-105 transition-all"
          >
            Save
          </button>
        </form>

        {/* Logo / Side Image */}
        <div>
          <img
            className={`max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10
              ${
                  selectedImg && "avatar-icon"
                }`}
            src={authUser?.profilePic || assets.logo_icon}
            alt=""
          />
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;