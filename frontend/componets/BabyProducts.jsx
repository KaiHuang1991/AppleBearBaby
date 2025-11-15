import React from 'react'
import Title from './Title'
import { babyAssets } from '../src/assets/babyAssets'
import { useNavigate } from 'react-router-dom'

const BabyProducts = () => {
  const navigate = useNavigate()

  const babyCategories = [
    {
      id: 1,
      name: "Baby Food & Nutrition",
      icon: "🍼",
      image: babyAssets.babyFood,
      description: "Organic baby food, formula, and nutritional supplements",
      color: "from-blue-200 to-blue-300",
      bgColor: "bg-blue-100",
      route: "/collection?category=baby-food"
    },
    {
      id: 2,
      name: "Diapers & Hygiene",
      icon: "👶",
      image: babyAssets.diapers,
      description: "Premium diapers, wipes, and hygiene essentials",
      color: "from-cyan-200 to-cyan-300",
      bgColor: "bg-cyan-100",
      route: "/collection?category=diapers"
    },
    {
      id: 3,
      name: "Baby Clothing",
      icon: "👕",
      image: babyAssets.clothing,
      description: "Soft, comfortable baby clothes and accessories",
      color: "from-blue-300 to-blue-400",
      bgColor: "bg-blue-50",
      route: "/collection?category=clothing"
    },
    {
      id: 4,
      name: "Toys & Entertainment",
      icon: "🧸",
      image: babyAssets.toys,
      description: "Educational toys and entertainment items",
      color: "from-cyan-300 to-cyan-400",
      bgColor: "bg-cyan-50",
      route: "/collection?category=toys"
    },
    {
      id: 5,
      name: "Baby Care & Safety",
      icon: "🛡️",
      image: babyAssets.safety,
      description: "Safety products and baby care essentials",
      color: "from-blue-400 to-blue-500",
      bgColor: "bg-blue-100",
      route: "/collection?category=safety"
    },
    {
      id: 6,
      name: "Feeding & Nursing",
      icon: "🥄",
      image: babyAssets.feeding,
      description: "Bottles, pacifiers, and feeding accessories",
      color: "from-cyan-400 to-cyan-500",
      bgColor: "bg-cyan-100",
      route: "/collection?category=feeding"
    }
  ]

  const handleCategoryClick = (route) => {
    navigate(route)
  }

  return (
    <div className='my-16 relative'>
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 rounded-3xl"></div>
      <div className="absolute top-0 left-1/4 w-32 h-32 bg-blue-200/30 rounded-full gentle-float"></div>
      <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-cyan-200/30 rounded-full gentle-bounce"></div>
      
      <div className='relative z-10'>
        <div className='text-center py-8 px-4 sm:px-8'>
          <div className='flex items-center justify-center mb-4'>
            <span className='text-3xl mr-4 gentle-bounce'>👶</span>
            <Title text1="BABY" text2="PRODUCTS"/>
            <span className='text-3xl ml-4 gentle-float'>🍼</span>
          </div>
          <p className='max-w-3xl mx-auto text-xs sm:text-sm md:text-base text-gray-600 mt-4'>
            Adorable and safe baby products for your little ones. Wholesale quantities available for retailers and daycare centers.
          </p>
        </div>
        
        {/* Baby Product Categories */}
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mt-4 sm:mt-8 px-1 sm:px-0'>
          {babyCategories.map((category, index) => (
            <div 
              key={category.id}
              className='cartoon-card p-6 text-center cursor-pointer hover:scale-[1.02] transition-all duration-300 flex flex-col h-full'
              onClick={() => handleCategoryClick(category.route)}
            >
              {/* Real photo - Appropriately Sized */}
              <div className='w-full h-40 sm:h-48 md:h-56 mx-auto mb-4 rounded-2xl overflow-hidden shadow-md flex-shrink-0'>
                <img src={category.image} alt={category.name} className='w-full h-full object-cover hover:scale-110 transition-transform duration-300' />
              </div>
              
              <h3 className='font-bold text-lg sm:text-xl mb-2 text-gray-800'>{category.name}</h3>
              <p className='text-sm sm:text-base text-gray-600 mb-4 leading-relaxed line-clamp-2 flex-grow'>{category.description}</p>
              
              <div className='flex flex-wrap items-center justify-center gap-2 mb-4'>
                <span className='text-xs sm:text-sm bg-blue-100 text-blue-600 px-3 py-1.5 rounded-full font-semibold'>💖 Safe</span>
                <span className='text-xs sm:text-sm bg-cyan-100 text-cyan-600 px-3 py-1.5 rounded-full font-semibold'>🌟 Quality</span>
                <span className='text-xs sm:text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full font-semibold'>🚚 Fast</span>
              </div>
              
              <button 
                className='cartoon-btn px-6 py-2.5 text-white font-bold text-sm sm:text-base hover:scale-105 transition-transform duration-300 w-full mt-auto'
                onClick={(e) => {
                  e.stopPropagation()
                  handleCategoryClick(category.route)
                }}
              >
                View Products 🛒
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default BabyProducts 