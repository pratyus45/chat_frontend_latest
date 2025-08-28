import React, { useContext, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";

const ChatContainer = () => {

  const {messages , selectedUser , setSelectedUser , sendMessage , getMessages} = useContext(ChatContext);
  const {value} = useContext(AuthContext); // Fix: get value object first
  const {authUser, onlineUsers} = value; // Fix: destructure from value

  const scrollEnd = useRef();

  const [input , setInput] = useState('');
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if(input.trim() === "") return; // Fix: remove extra space
    await sendMessage({
      text: input.trim()
    });
    setInput("");
  };

  //handle sending an image
  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")){ // Fix: startsWith instead of startWith
      toast.error("Please select a valid image file.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({
        image: reader.result
      });
    }
    reader.readAsDataURL(file);
    e.target.value = ""; // Reset the input value to allow re-uploading the same
  }

  useEffect(() => {
    if (selectedUser && selectedUser._id) {
      console.log("Selected user:", selectedUser);
      console.log("Selected user ID:", selectedUser._id);
      getMessages(selectedUser._id);
    } else {
      console.log("Selected user is undefined or missing _id:", selectedUser);
    }
  }, [selectedUser?._id, getMessages]); // Fix: Use optional chaining and memoized function

  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);



  return selectedUser ? (
    <div
      className="h-full overflow-scroll relative backdrop-blur-lg bg-[url('/bgImage.jpg')] bg-cover bg-center"
    >
      {/* header */}
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt={selectedUser.fullName}
          className="w-8 h-8 rounded-full object-cover"
        />
        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser.fullName}
          {onlineUsers.includes(selectedUser._id) && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
        </p>
        <img
          onClick={() => setSelectedUser(null)}
          src={assets.arrow_icon}
          alt="Back"
          className="max-md:hidden max-w-7"
        />
        <img src={assets.help_icon} alt="Help" className="max-md:hidden max-w-5" />
      </div>

           {/* chat area */}
           <div className="flex flex-col h-[calc(100%-120px)] overflow-y-scroll p-3 pb-6">
        {messages && messages.length > 0 ? (
          messages
            .filter(msg => msg && msg.senderId && msg._id) // Filter out invalid messages
            .map((msg, index) => (
            <div
              key={msg._id || index}
              className={`flex items-end gap-2 justify-end ${
                msg.senderId !== authUser?._id && "flex-row-reverse"
              }`}
            >
              {msg.image ? (
                <img
                  src={msg.image}
                  alt=""
                  className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8"
                />
              ) : (
                <p
                  className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break-all bg-violet-500/30 text-white ${
                    msg.senderId === authUser?._id
                      ? "rounded-br-none"
                      : "rounded-bl-none"
                  }`}
                >
                  {msg.text || "Invalid message"}
                </p>
              )}

              <div className="text-center text-xs">
                <img
                  src={
                    msg.senderId === authUser?._id ? authUser?.profilePic ||
                       assets.avatar_icon
                      : selectedUser?.profilePic || assets.avatar_icon
                  }
                  alt=""
                  className="w-7 rounded-full"
                />
                <p className="text-gray-500">
                  {msg.createdAt ? formatMessageTime(msg.createdAt) : ""}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-white/70">
            <p className="text-lg mb-2">No messages yet</p>
            <p className="text-sm">Start a conversation!</p>
          </div>
        )}
        <div ref={scrollEnd}></div>
      </div>
      
      {/* bottom area */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-4 p-4">
        <div className="flex-1 flex items-center bg-gray-100/10 px-4 py-2 rounded-full">
          <input onChange={(e)=>setInput(e.target.value)} value={input}
            onKeyDown={(e) => e.key === "Enter" ? handleSendMessage(e) : null

          }
            type="text"
            placeholder="Send a message"
            className="flex-1 text-sm px-2 border-none rounded-lg outline-none
      text-white placeholder-gray-400"
          />
          <input onChange={handleSendImage}
          type="file" id="image" accept="image/png, image/jpeg" hidden />
          <label htmlFor="image">
            <img
              src={assets.gallery_icon}
              alt=""
              className="w-6 mr-1 cursor-pointer opacity-80 hover:opacity-100 transition"
            />
          </label>
        </div>
        <img onClick={handleSendMessage}
          src={assets.send_button}
          alt=""
          className="w-8 cursor-pointer hover:scale-105 transition"
        />
      </div>
    </div>
  ) : (
    <div
      className="flex flex-col items-center justify-center gap-2 text-gray-500
    bg-white/10 max-md:hidden"
    >
      <img src={assets.logo_icon} className="max-w-16" alt="" />
      <p className="text-lg font-medium text-white">
        Chat anytime , anywhere with anyone.
      </p>
    </div>
  );
}

export default ChatContainer;