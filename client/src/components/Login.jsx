import React, { useContext, useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import { motion } from 'framer-motion'
import axios from 'axios'
import { toast } from 'react-toastify'

const Login = () => {
  const [state, setState] = useState('Login') // or "Sign Up"
  const { setShowLogin, backendUrl, setToken, setUser } = useContext(AppContext)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const onSubmitHandler = async (e) => {
    e.preventDefault()

    try {
      if (state === 'Login') {
        console.log("🟢 Sending login request", { email, password })
        const { data } = await axios.post(`${backendUrl}/api/user/login`, {
          email,
          password
        })

        if (data.success) {
          setToken(data.token)
          setUser(data.user)
          localStorage.setItem('token', data.token)
          setShowLogin(false)
          toast.success("Login successful!")
        } else {
          toast.error(data.message)
        }
      } else {
        console.log("🟢 Sending register request", { name, email, password })
        const { data } = await axios.post(`${backendUrl}/api/user/register`, {
          name,
          email,
          password
        })

        if (data.success) {
          setToken(data.token)
          setUser(data.user)
          localStorage.setItem('token', data.token)
          setShowLogin(false)
          toast.success("Account created successfully!")
        } else {
          toast.error(data.message)
        }
      }
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || 'Something went wrong'
      console.error('❌ Error:', message)
      toast.error(message)
    }
  }

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  return (
    <div className='fixed top-0 left-0 right-0 bottom-0 z-10 backdrop-blur-sm bg-black/30 flex justify-center items-center'>
      <motion.form
        onSubmit={onSubmitHandler}
        initial={{ opacity: 0.2, y: 50 }}
        transition={{ duration: 0.3 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className='relative bg-white p-10 rounded-xl text-slate-500 w-full max-w-sm'
      >
        <h1 className='text-center text-2xl text-neutral-700 font-medium'>{state}</h1>
        <p className='text-sm text-center mb-4'>Welcome! Please {state.toLowerCase()} to continue</p>

        {/* Name field (only for Sign Up) */}
        {state !== 'Login' && (
          <div className='border px-6 py-2 flex items-center gap-2 rounded-full mt-4'>
            <img src={assets.profile_icon} alt='Profile' width={20} />
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              type='text'
              className='outline-none text-sm w-full'
              placeholder='Full Name'
              required={state !== 'Login'}
            />
          </div>
        )}

        {/* Email field */}
        <div className='border px-6 py-2 flex items-center gap-2 rounded-full mt-4'>
          <img src={assets.email_icon} alt='Email' />
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            type='email'
            className='outline-none text-sm w-full'
            placeholder='Email Id'
            required
          />
        </div>

        {/* Password field */}
        <div className='border px-6 py-2 flex items-center gap-2 rounded-full mt-4'>
          <img src={assets.lock_icon} alt='Lock' />
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            type='password'
            className='outline-none text-sm w-full'
            placeholder='Password'
            required
          />
        </div>

        <p className='text-sm text-red-600 my-4 cursor-pointer'>Forgot password?</p>

        {/* Submit Button */}
        <button className='bg-blue-600 w-full text-white py-2 rounded-full'>
          {state === 'Login' ? 'Login' : 'Create Account'}
        </button>

        {/* Toggle between Login / Sign Up */}
        {state === 'Login' ? (
          <p className='mt-5 text-center'>
            Don’t have an account?{' '}
            <span className='text-yellow-600 cursor-pointer' onClick={() => setState('Sign Up')}>
              Sign Up
            </span>
          </p>
        ) : (
          <p className='mt-5 text-center'>
            Already have an account?{' '}
            <span className='text-yellow-600 cursor-pointer' onClick={() => setState('Login')}>
              Login
            </span>
          </p>
        )}

        {/* Close Icon */}
        <img
          onClick={() => setShowLogin(false)}
          src={assets.cross_icon}
          alt='Close'
          className='absolute top-5 right-5 cursor-pointer'
        />
      </motion.form>
    </div>
  )
}

export default Login
