import React, { useEffect, useState } from 'react'
import NavBar from '../components/NavBar'
import SideBar from '../components/SideBar'
import { Route, Routes } from 'react-router-dom'
import Add from '../pages/Add'
import List from '../pages/List'
import Inquiries from '../pages/Inquiries'
import Blogs from '../pages/Blogs'
import AddBlog from '../pages/AddBlog'
import Categories from '../pages/Categories'
import Hero from '../pages/Hero'
import Login from '../components/Login'
import {ToastContainer} from 'react-toastify'
import Single from '../pages/Single'
export const  backendUrl = import.meta.env.VITE_BACKEND_URL
export const currency = "$"
const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token')?localStorage.getItem('token'):'')
  useEffect(()=>{
    localStorage.setItem("token",token)
  },[token])
  return (
    <div className='bg-gray-50 min-h-screen'>
      <ToastContainer/>
      {token === '' ? <Login setToken={setToken} /> :
        <>
          <NavBar setToken={setToken}/>
          <hr />
          <div className='flex w-full'>
            <SideBar />
            <div className='w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base'>
              <Routes>
                <Route path='/' element={<Blogs token = {token}/>} />
                <Route path='/add' element={<Add token = {token} backendUrl={backendUrl}/>} />
                <Route path='/list' element={<List token = {token} backendUrl={backendUrl}/>} />
                <Route path='/inquiries' element={<Inquiries token = {token}/>} />
                <Route path='/categories' element={<Categories token={token} backendUrl={backendUrl} />} />
                <Route path='/hero' element={<Hero token={token} backendUrl={backendUrl} />} />
                <Route path='/blogs' element={<Blogs token = {token}/>} />
                <Route path='/add-blog' element={<AddBlog token = {token}/>} />
                <Route path='/edit-blog/:id' element={<AddBlog token = {token}/>} />
                <Route path='/single/:productId' element ={<Single token={token} backendUrl={backendUrl}/>}/>
              </Routes>
            </div>
          </div>
        </>
      }

    </div>
  )
}

export default App
