import React from "react";
import { useContext } from "react";
import { useState ,useEffect } from "react";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";

const Sidebar = () => {
   
  const {getUsers, setSelectedUser, selectedUser,
    users , unseenMessages , setUnseenMessages} = useContext(ChatContext);

  const {value} = useContext(AuthContext); // Fix: get value object first
  const {logout, onlineUsers} = value; // Fix: destructure from value

  const [input  , setInput] = useState(false);

  const navigate = useNavigate();

  const filteredUsers = input ? users.filter((users)=>users.fullName.toLowerCase().includes(input.toLowerCase())) : users;

  useEffect(() => {
    console.log("Sidebar useEffect triggered, calling getUsers");
    getUsers();
 }, [onlineUsers]);

  return (
    <div
    className={`bg-[#8185B2]/10 h-full p-6 rounded-r-xl overflow-y-scroll
  text-white ${selectedUser ? "max-md:hidden" : " "}`}
  >
    {/* Header Section with Logo and Menu */}
    <div className="pb-8 mb-6">
      <div className="flex justify-between items-center">
        <img src={assets.logo} alt="logo" className="max-w-40" />
        <div className="relative py-2 group">
          <img
            src={assets.menu_icon}
            alt="Menu"
            className="max-h-5 cursor-pointer"
          />
          <div
            className="absolute top-full right-0 z-10 w-32 p-5 rounded-md bg-[#282142]
border border-gray-600 text-gray-100 hidden group-hover:block"
          >
            <p
              onClick={() => navigate("/profile")}
              className="cursor-pointer text-sm"
            >
               Edit Profile
            </p>
            <hr className="my-2 border-t border-gray-500" />
            <p onClick={()=> logout()} className="cursor-pointer text-sm">Logout</p>
            
          </div>
        </div>
      </div>

      {/* Search Bar with better spacing */}
      <div
        className="bg-[#282142] rounded-full flex items-center gap-3 py-4 px-5
           mt-12 shadow-lg border border-gray-600/30 hover:border-gray-500/50 transition-all duration-300"
      >
        <img src={assets.search_icon} alt="Search" className="w-4 h-4 opacity-70" />
        <input onChange={(e)=> setInput(e.target.value)}
          type="text"
          className="bg-transparent border-none outline-none text-white text-sm placeholder-[#c8c8c8] flex-1
              placeholder:text-sm placeholder:font-light focus:placeholder:opacity-50 transition-all duration-200"
          placeholder="Search users..."
        />
      </div>
    </div>

    {/* Users List with proper spacing */}
    <div className="flex flex-col gap-2">
      {filteredUsers.map((user, index) => (
        <div
        onClick={() => {
          console.log("Setting selected user:", user);
          setSelectedUser(user); // Set the full user object
          setUnseenMessages((prev) => ({
            ...prev,
            [user._id]: 0,
          }));
        }}
          key={index}
          className={`relative flex items-center gap-3 p-3 pl-4 rounded-xl
      cursor-pointer max-sm:text-sm hover:bg-[#282142]/30 transition-all duration-200 ${
        selectedUser?._id === user._id && "bg-[#282142]/60 shadow-md"
      }`}
        >
          <img
            src={user?.profilePic || assets.avatar_icon}
            alt=""
            className="w-[38px] aspect-[1/1] rounded-full border border-gray-600/30"
          />
          <div className="flex flex-col leading-5 flex-1 min-w-0">
            <p className="font-medium truncate">{user.fullName}</p>

            {
            onlineUsers.includes(user._id)
            ? (
              <span className="text-green-400 text-xs font-light">Online</span>
            ) : (
              <span className="text-neutral-400 text-xs font-light">Offline</span>
            )}
          </div>
          {unseenMessages[user._id]>0 && (
            <p
              className="absolute top-3 right-3 text-xs h-5 w-5
            flex justify-center items-center rounded-full bg-violet-500/80 text-white font-medium shadow-sm"
            >
              {unseenMessages[user._id]}
            </p>
          )}
        </div>
      ))}
    </div>
  </div>
  );
};

export default Sidebar;