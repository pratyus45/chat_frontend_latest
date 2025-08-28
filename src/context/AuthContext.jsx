import { createContext } from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
const backendUrl = import.meta.env.VITE_BACKEND_URL;


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  //Check is User is Authenticated or not

  const checkAuth = async () => {
    try {
      setIsLoading(true); // Start loading
      // Ensure token is set for this request
      const config = {
        headers: {
          token: token || localStorage.getItem("token"),
        },
      };
      const { data } = await axios.get("/api/auth/check", config);
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      // Clear invalid token
      localStorage.removeItem("token");
      setToken(null);
    } finally {
      setIsLoading(false); // Stop loading regardless of outcome
    }
  };

  // Login function to handle user authentication and socket connection
  const login = async (state, credentials) => {
    try {
      console.log(state, credentials);
      console.log(backendUrl)
      const { data } = await axios.post(`${backendUrl}/api/auth/${state}`, credentials);
      console.log("data",data)
      if (data.success) {
        setAuthUser(data.userData); // Fix: use data.user instead of data.userData
        connectSocket(data.userData); // Fix: use data.user instead of data.userData
        axios.defaults.headers.common["token"] = data.token;
        setToken(data.token);
        localStorage.setItem("token", data.token);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  // Logout function to handle user logout and socket disconnection
  const logout = async () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    axios.defaults.headers.common["token"] = null;
    toast.success("Logged out successfully");
    if (socket) {
      socket.disconnect();
    }
  };

  //Update profile function to handle user profile updates
  const updateProfile = async (body) => {
    try {
      console.log("Sending profile update:", body);
      console.log("Current authUser before update:", authUser);
      const { data } = await axios.put("/api/auth/update-profile", body);
      console.log("Profile update response:", data);

      if (data.success) {
        console.log("Setting new authUser:", data.user);
        setAuthUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user)); // Store updated user
        console.log("AuthUser updated successfully:", data.user);
        toast.success(data.message);
        return data.user; // Return the updated user
      } else {
        console.error("Profile update failed:", data.message);
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.message || "Failed to update profile");
    }
  };

  //connect socket fuction to handle socket connection and online users updates
  const connectSocket = (userData) => {
    if (!userData) return;

    // Disconnect existing socket if any
    if (socket?.connected) {
      socket.disconnect();
    }

    try {
      const newSocket = io(backendUrl, {
        query: {
          userId: userData._id,
        },
        transports: ["websocket", "polling"], // Add transport options
        upgrade: true,
        rememberUpgrade: true,
        timeout: 20000,
        forceNew: true,
      });

      // Add connection event handlers
      newSocket.on("connect", () => {
        console.log(
          "Successfully connected to socket server with ID:",
          newSocket.id
        );
        console.log("Current user ID being sent:", userData._id);
      });

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      newSocket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
      });

      newSocket.on("getOnlineUsers", (userIds) => {
        console.log("Received online users:", userIds);
        console.log("Current onlineUsers before update:", onlineUsers);
        setOnlineUsers(userIds);
        console.log("Updated onlineUsers:", userIds);
      });

      // Handle connection success
      setTimeout(() => {
        console.log("Testing socket connection...");
      }, 1000);

      setSocket(newSocket);
    } catch (error) {
      console.error("Failed to create socket connection:", error);
    }
  };

  useEffect(() => {
    // Check for token in localStorage on mount
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      // Set token in state and axios headers
      setToken(storedToken);
      axios.defaults.headers.common["token"] = storedToken;

      // Verify the token with the server
      checkAuth();
    } else {
      setIsLoading(false); // No token, stop loading
    }
  }, []); // Empty dependency array - only run on mount

  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile,
    isLoading,
  };

  return (
    <AuthContext.Provider value={{ value }}>{children}</AuthContext.Provider>
  );
};
