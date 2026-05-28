import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title'
import ProductItem from './ProductItem'
import { useNavigate } from 'react-router-dom'

const HotSale = () => {
    const navigate = useNavigate()
    const {products} = useContext(ShopContext)
    const [hotProducts, setHotProducts] = useState([])
    
    useEffect(() => {
        // 根据询盘数量排序（假设产品有inquiryCount字段）
        // 如果没有inquiryCount，使用bestseller和date作为排序依据
        const sorted = [...products]
            .sort((a, b) => {
                // 优先按inquiryCount排序（如果存在）
                if (a.inquiryCount && b.inquiryCount) {
                    return b.inquiryCount - a.inquiryCount
                }
                // 其次按bestseller排序
                if (a.bestseller && !b.bestseller) return -1
                if (!a.bestseller && b.bestseller) return 1
                // 最后按日期排序（最新的优先）
                return b.date - a.date
            })
            .slice(0, 8)
        
        setHotProducts(sorted)
    }, [products])

    const handleViewAllProducts = () => {
        navigate('/collection')
    }

    return (
    <div className='my-10 relative'>
        {/* Red/Orange Background decoration for HOT theme */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-red-50/50 rounded-3xl"></div>
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-orange-200/30 rounded-full gentle-float"></div>
        <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-red-200/30 rounded-full gentle-bounce"></div>
        
        <div className='relative z-10'>
            <div className='text-center py-8 px-4 sm:px-8'>
                <div className='flex items-center justify-center mb-4'>
                    <span className='text-3xl mr-4 gentle-bounce'>🔥</span>
                    <Title text1="HOT" text2="SALE"/>
                    <span className='text-3xl ml-4 gentle-float'>⭐</span>
                </div>
                <p className='max-w-3xl mx-auto text-xs sm:text-sm md:text-base text-gray-600'>
                Most popular products based on customer inquiries and orders. Get the best-selling items at competitive wholesale prices!
                </p>
                
                {/* Stats */}
                <div className='flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-6'>
                    <div className='flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-full shadow-sm'>
                        <span className='text-2xl'>🔥</span>
                        <span className='text-sm font-semibold text-gray-700'>Trending Now</span>
                    </div>
                    <div className='flex items-center gap-2 bg-red-100 px-4 py-2 rounded-full shadow-sm'>
                        <span className='text-2xl'>📊</span>
                        <span className='text-sm font-semibold text-gray-700'>Top Inquiries</span>
                    </div>
                    <div className='flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-full shadow-sm'>
                        <span className='text-2xl'>💰</span>
                        <span className='text-sm font-semibold text-gray-700'>Best Value</span>
                    </div>
                </div>
            </div>
            
            {/* Products grid */}
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 gap-y-6 sm:gap-y-8 px-2 sm:px-4 w-full max-w-3xl lg:max-w-none mx-auto'>
                {
                    hotProducts.map((item,index)=>(
                        <ProductItem key={index} id={item._id} image={item.image} name={item.name} price={item.price}/>
                    ))
                }
            </div>
            
            {/* View All Button */}
            <div className='text-center mt-8'>
                <button 
                    className='cartoon-btn px-8 py-3 text-white font-bold text-lg'
                    onClick={handleViewAllProducts}
                >
                    View All Hot Sale Products 🔥
                </button>
            </div>
        </div>
    </div>
  )
}

export default HotSale

