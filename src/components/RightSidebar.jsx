import React from 'react'
import { useContext , useState , useEffect} from 'react';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';
import assets, { imagesDummyData } from '../assets/assets'
const RightSidebar = () => {

  const { selectedUser , messages} = useContext(ChatContext);
  const {value} = useContext(AuthContext); // Fix: get value object first
  const {logout, onlineUsers} = value; // Fix: destructure from value
  const [msgImages , setMsgImages] = useState([]);


  useEffect(() => {
    console.log("Messages for media display:", messages);
    const images = messages.filter((msg) => msg.image && msg.image.trim() !== "").map((msg) => msg.image);
    console.log("Filtered images:", images);
    setMsgImages(images);
  }, [messages]);



  return selectedUser && (
    <div className={`bg-[#8185B2]/10 text-white w-full relative overflow-y-scroll ${selectedUser ? "max-md:hidden" : ""}`}>
       <div className='pt-16 flex flex-col items-center gap-2 text-xs font-light'>

        <img src={selectedUser?.profilePic || assets.avatar_icon} alt="" className='w-20 aspect-[1/1] rounded-full' />
        <h1 className = 'px-10 text-xl font-medium mx-auto flex items-center gap-2'>
          {onlineUsers.includes(selectedUser._id) &&
          <p className='w-2 h-2 rounded-full bg-green-500'></p>}

          {selectedUser.fullName}</h1>
          <p className='px-10 mx-auto text-center'>{selectedUser.bio || "No bio available"}</p>

       </div>

       <hr className="border-[#ffffff50] my-4"/>
        <div className='px-5 text-xs'>
          <p className='font-medium mb-2'>
               Media ({msgImages.length})
          </p>

          {msgImages.length > 0 ? (
            <div className='mt-2 max-h-[200px] overflow-y-scroll grid grid-cols-3 gap-4 opacity-80 '>
              {msgImages.map((url , index)=>(
                <div key = {index} onClick={()=>window.open(url)} className='cursor-pointer rounded'>
                      <img src= {url} alt ="" className='h-full rounded-md'/>
                </div>
              ))}
            </div>
          ) : (
            <p className='text-gray-400 mt-2'>No media shared yet</p>
          )}
        </div>
        <button onClick={()=>logout()}
         className='absolute bottom-5 left-1/2 tranform-translate-x-1/2 
        bg-gradient-to-r from-purple-400 to-voilet-600 text-white border-none
        text-md font-light py-2 px-10 rounded-full cursor-pointer'>
          Logout
        </button>
    </div>
  )
}

export default RightSidebar