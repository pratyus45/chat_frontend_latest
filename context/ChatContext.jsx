import { createContext , useContext , useEffect, useCallback } from "react";
import { useState } from "react";
import { AuthContext } from "./AuthContext";
import axios from "axios";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    
    const [messages, setMessages] = useState([]);
    const [users , setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});
    const {value: authContextValue} = useContext(AuthContext); // Fix: rename to avoid conflict
    const {socket} = authContextValue; // Fix: use renamed variable

    //function to get all users for sidebar 

    const getUsers = async () => {
        try {
            console.log("Fetching users for sidebar...");
            const {data} = await axios.get("/api/messages/users");
            console.log("API Response:", data);

            if(data.success) {
                console.log("Setting users:", data.users);
                setUsers(data.users);
                setUnseenMessages(data.unseenMessages);
            } else {
                console.error("API returned success: false", data.message);
            }

        }catch (error) {
            console.error("Error fetching users:", error);
            console.error("Error response:", error.response?.data);
            toast.error(error.message || "Failed to fetch users");
        }
    }

    // Memoize getMessages function to prevent infinite re-renders
    const getMessages = useCallback(async (userId) => {
        try {
            console.log("Fetching messages for user:", userId);
            const {data} = await axios.get(`/api/messages/${userId}`);
            console.log("Messages API Response:", data);

            if(data.success) {
                setMessages(data.messages);
                // Keep the full user object, not just the ID
                // setSelectedUser(userId); // Don't overwrite with ID
                console.log("Messages loaded for user:", selectedUser);
            }

        }catch (error) {
            console.error("Error fetching messages:", error);
            console.error("Error response:", error.response?.data);
            toast.error(error.message || "Failed to fetch messages");
        }
    }, [selectedUser]); // Only re-create when selectedUser changes

    const sendMessage = async (messageData) => {
        try {
            console.log("Sending message to user:", selectedUser);
            console.log("Message data:", messageData);

            if (!selectedUser || !selectedUser._id) {
                console.error("No selected user or user ID available");
                toast.error("No user selected");
                return;
            }

            const {data} = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);
            console.log("Send message response:", data);

            if(data.success && data.newMessage) {
                // Validate the message object before adding
                if (data.newMessage.senderId && data.newMessage._id) {
                    setMessages((prevMessages) => {
                        // Check if message already exists to prevent duplicates
                        const exists = prevMessages.some(msg => msg._id === data.newMessage._id);
                        if (exists) {
                            console.log("Message already exists, skipping duplicate");
                            return prevMessages;
                        }
                        return [...prevMessages, data.newMessage];
                    });
                    console.log("Message sent and added successfully");
                } else {
                    console.error("Invalid message object received:", data.newMessage);
                    toast.error("Message sent but display failed");
                }
            } else {
                console.error("Send message failed:", data?.message || "Unknown error");
                toast.success(data?.message || "Failed to send message");
            }
        }catch (error) {
            console.error("Error sending message:", error);
            console.error("Error response:", error.response?.data);
            toast.error(error.message || "Failed to send message");
        }
    }


    const subscribeToMessages = async () => {
        if (!socket) return;
    
        socket.on("newMessage", (newMessage) => {
            console.log("Received new message via socket:", newMessage);
    
            // Validate the incoming message
            if (!newMessage || !newMessage.senderId || !newMessage._id) {
                console.error("Invalid message received via socket:", newMessage);
                return;
            }
    
            if (selectedUser && newMessage.senderId === selectedUser._id) {
                newMessage.seen = true;
                setMessages((prevMessages) => {
                    // Check if message already exists
                    const exists = prevMessages.some(msg => msg._id === newMessage._id);
                    if (exists) {
                        console.log("Socket message already exists, skipping duplicate");
                        return prevMessages;
                    }
                    return [...prevMessages, newMessage];
                });
    
                // Mark message as seen
                axios.put(`/api/messages/mark/${newMessage._id}`).catch(err =>
                    console.error("Failed to mark message as seen:", err)
                );
            } else if (newMessage.senderId !== authUser?._id) {
                // Handle notifications for other users
                setUnseenMessages((prevUnseenMessages) => ({
                    ...prevUnseenMessages,
                    [newMessage.senderId]: (prevUnseenMessages[newMessage.senderId] || 0) + 1
                }));
            }
        });
    };

    


const unsubscribeFromMessages = () => {
    if (!socket) return; // Fix: return if no socket
    socket.off("newMessage"); // Fix: only call off if socket exists
}

useEffect(() => {
    subscribeToMessages();
    return () => {
        unsubscribeFromMessages();
    };


},[socket , selectedUser]);

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
    }

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
}