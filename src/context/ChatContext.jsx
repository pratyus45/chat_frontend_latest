import { createContext, useContext, useEffect, useCallback, useState } from "react";
import { AuthContext } from "./AuthContext";
import axios from "axios";
import toast from "react-hot-toast";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  // ✅ Fix: Correct destructuring from AuthContext
  const { authUser, socket } = useContext(AuthContext);

  // ================================
  // 📌 Get all users
  // ================================
  const getUsers = async () => {
    try {
      console.log("Fetching users for sidebar...");
      console.log("back",backendUrl)
      const { data } = await axios.get(`${backendUrl}/api/messages/users`, {
        withCredentials: true, // important if backend uses cookies
      });
      console.log("API Response:", data);

      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages);
      } else {
        console.error("API returned success: false", data.message);
        toast.error(data.message || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // ================================
  // 📌 Get messages with a user
  // ================================
  const getMessages = useCallback(
    async (userId) => {
      try {
        console.log("Fetching messages for user:", userId);
        const { data } = await axios.get(`${backendUrl}/api/messages/${userId}`, {
          withCredentials: true,
        });
        console.log("Messages API Response:", data);

        if (data.success) {
          setMessages(data.messages);
          console.log("Messages loaded for user:", userId);
        } else {
          toast.error(data.message || "Failed to fetch messages");
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error(error.response?.data?.message || error.message);
      }
    },
    [] // no need to depend on selectedUser
  );

  // ================================
  // 📌 Send a message
  // ================================
  const sendMessage = async (messageData) => {
    try {
      if (!selectedUser || !selectedUser._id) {
        toast.error("No user selected");
        return;
      }

      console.log("Sending message to:", selectedUser._id, "Data:", messageData);

      const { data } = await axios.post(
        `${backendUrl}/api/messages/send/${selectedUser._id}`,
        messageData,
        { withCredentials: true }
      );

      if (data.success && data.newMessage) {
        setMessages((prevMessages) => {
          const exists = prevMessages.some((msg) => msg._id === data.newMessage._id);
          return exists ? prevMessages : [...prevMessages, data.newMessage];
        });
      } else {
        toast.error(data.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // ================================
  // 📌 Subscribe to socket messages
  // ================================
  const subscribeToMessages = () => {
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      console.log("Received new message via socket:", newMessage);

      if (!newMessage || !newMessage.senderId || !newMessage._id) {
        console.error("Invalid socket message:", newMessage);
        return;
      }

      if (selectedUser && newMessage.senderId === selectedUser._id) {
        // ✅ If current chat is open
        newMessage.seen = true;
        setMessages((prev) => {
          const exists = prev.some((msg) => msg._id === newMessage._id);
          return exists ? prev : [...prev, newMessage];
        });

        axios
          .put(`${backendUrl}/api/messages/mark/${newMessage._id}`, {}, { withCredentials: true })
          .catch((err) => console.error("Failed to mark message as seen:", err));
      } else if (newMessage.senderId !== authUser?._id) {
        // ✅ If message is from other user
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1,
        }));
      }
    });
  };

  const unsubscribeFromMessages = () => {
    if (socket) socket.off("newMessage");
  };

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [socket, selectedUser]);

  // ================================
  // 📌 Context value
  // ================================
  const value = {
    messages,
    users,
    selectedUser,
    unseenMessages,
    getUsers,
    getMessages,
    sendMessage,
    setSelectedUser,
    setUnseenMessages,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
