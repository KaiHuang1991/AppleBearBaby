import React from 'react'
import Title from './Title'
import { babyAssets } from '../src/assets/babyAssets'
import { useNavigate } from 'react-router-dom'

const babyCategories = [
  { id: 1, name: 'Baby Food & Nutrition', image: babyAssets.babyFood, description: 'Organic baby food, formula, and nutritional supplements', route: '/collection?category=baby-food' },
  { id: 2, name: 'Diapers & Hygiene', image: babyAssets.diapers, description: 'Premium diapers, wipes, and hygiene essentials', route: '/collection?category=diapers' },
  { id: 3, name: 'Baby Clothing', image: babyAssets.clothing, description: 'Soft, comfortable baby clothes and accessories', route: '/collection?category=clothing' },
  { id: 4, name: 'Toys & Entertainment', image: babyAssets.toys, description: 'Educational toys and entertainment items', route: '/collection?category=toys' },
  { id: 5, name: 'Baby Care & Safety', image: babyAssets.safety, description: 'Safety products and baby care essentials', route: '/collection?category=safety' },
  { id: 6, name: 'Feeding & Nursing', image: babyAssets.feeding, description: 'Bottles, pacifiers, and feeding accessories', route: '/collection?category=feeding' },
]

const BabyProducts = () => {
  const navigate = useNavigate()

  return (
    <section className='my-14 md:my-20'>
      <Title
        text1='Baby'
        text2='Products'
        subtitle='Safe baby products in wholesale quantities for retailers and daycare centers.'
      />

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8'>
        {babyCategories.map((category) => (
          <div
            key={category.id}
            className='corp-feature-card p-0 overflow-hidden cursor-pointer flex flex-col h-full'
            onClick={() => navigate(category.route)}
          >
            <div className='w-full h-44 sm:h-48 overflow-hidden'>
              <img src={category.image} alt={category.name} className='w-full h-full object-cover hover:scale-105 transition-transform duration-300' />
            </div>
            <div className='p-5 flex flex-col flex-1'>
              <h3 className='font-semibold text-lg text-slate-800 mb-2'>{category.name}</h3>
              <p className='text-sm text-slate-600 mb-4 leading-relaxed flex-grow'>{category.description}</p>
              <button
                type='button'
                className='corp-btn-outline w-full mt-auto'
                onClick={(e) => {
                  e.stopPropagation()
                  navigate(category.route)
                }}
              >
                View Products
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default BabyProducts
