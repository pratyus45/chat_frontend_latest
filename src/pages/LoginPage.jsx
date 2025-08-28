import React from 'react'
import assets from '../assets/assets'
import { useState} from 'react'
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react'
import { AuthContext } from '../../context/AuthContext'
const LoginPage = () => {
  
  const[currState, setCurrState] = useState("SignUp")
  const[fullName, setFullName] = useState("")
  const[email, setEmail] = useState("")
  const[password, setPassword] = useState("")
  const[bio, setBio] = useState("")
  const[isDataSubmitted , setisDataSubmitted] = useState(false)

  const {value} = useContext(AuthContext); // Fix: access value object
  const {login} = value; // Fix: get login from value
  const navigate = useNavigate();
  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if(currState === "SignUp" && !isDataSubmitted){
      setisDataSubmitted(true)
      return;
    }
    
  await login(currState === "SignUp" ? "signup" : 'login' , {fullName, email, password, bio}); // Fix: remove space in comparison
  toast.success("Login successful");
   navigate("/");
   

  }
  return (
   <div className='min-h-screen bg-cover bg-center flex items-center justify-center
gap-8 sm:justify-evenly max:sm:flex-col backdrop-blur-2xl'>

      
     {/*-----left------- */}

     <img src={assets.logo_big} alt="" className='w-[min(25vw, 180px)] max-w-[180px]' />

      
      {/*-----right------- */}

      <form onSubmit = {onSubmitHandler} className='border-2 bg-white/8 text-white border-gray-500 p-6
      flex flex-col gap-6 rounded-lg shadow-lg'>
           
         <h2 className='font-medium text-2xl flex justify-between items-center '>
          {currState}
          {isDataSubmitted && <img onClick={()=> setisDataSubmitted(false)} src={assets.arrow_icon} alt=""  className='w-5 cursor-pointer'/>
          }
          
         </h2>
              
           {currState === "SignUp"  && !isDataSubmitted &&(
              <input onChange={(e) => setFullName(e.target.value)} value={fullName}
              type="text" className='p-2 border border-gray-500 rounded-md
              focus:ouline-none' placeholder="FullName" required />
           )}

           {!isDataSubmitted && (
            <>
             <input onChange={(e) => setEmail(e.target.value)} value={email}
              type="email"  placeholder='Enter your email' required className='p-2 border
              border-gray-500 rounded-md focus:outline-none focus:ring-2
              focus:ring-indigo-500'/>
                <input onChange={(e) => setPassword(e.target.value)} value={password}
              type="password"  placeholder='Enter password' required className='p-2 border
              border-gray-500 rounded-md focus:outline-none focus:ring-2
              focus:ring-indigo-500'/>
            </>
           )}
       
{isDataSubmitted && currState === "SignUp" && (
  <textarea
    onChange={(e) => setBio(e.target.value)}
    value={bio}
    rows={4}
    placeholder="Enter your bio"
    className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
    required
  />
)}

<button type='submit' className='py-3 bg-gradient-to-r from-purple-400
to-voilet-600 text-white rounded-md cursor-pointer'>
  {currState === "SignUp"
    ? (isDataSubmitted ? "Set Bio" : "Create Account")
    : "Login Now"}
</button>

         
          <div className='flex items-center gap-2 text-sm text-gray-500'  >
                <input type="checkbox" />
                <p>Agree to the terms of use & privacy policy.</p>
          </div>

            <div className='flex flex-col gap-2'>
              {currState === "SignUp" ? (
                 <p className='text-sm text-gray-600'>Already have an account ? <span 
                 onClick={() => {setCurrState("Login"); setisDataSubmitted(false)}} className='
                 font-medium text-indigo-500 cursor-pointer'>Login here
                  </span></p>
              ):(
               <p className='text-sm text-gray-600'>Create an account <span onClick={() => setCurrState("SignUp")} 
               className='font-medium text-indigo-500 cursor-pointer'>Click here</span></p>
              )}
            </div>



      </form>

    </div>
  )
}

export default LoginPage