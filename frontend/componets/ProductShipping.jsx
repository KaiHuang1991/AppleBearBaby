import React from 'react'
import { Link } from 'react-router-dom'
import { BULK_OPTIONS, RETURN_POLICY_DAYS, SAMPLE_CARRIERS } from '../src/commercePolicy'
import '../styles/ProductDescription.css'

const IconParcel = () => (
  <svg className='product-ship-icon' width='40' height='40' viewBox='0 0 48 48' fill='none' aria-hidden='true'>
    <rect x='8' y='14' width='32' height='24' rx='3' stroke='currentColor' strokeWidth='1.8' />
    <path d='M8 22h32M24 14v24M16 14l8-6 8 6' stroke='currentColor' strokeWidth='1.8' strokeLinejoin='round' />
  </svg>
)

const IconShip = () => (
  <svg className='product-ship-icon' width='40' height='40' viewBox='0 0 48 48' fill='none' aria-hidden='true'>
    <path d='M8 30l4 8h24l4-8H8z' stroke='currentColor' strokeWidth='1.8' strokeLinejoin='round' />
    <path d='M12 30V18h16l6 12' stroke='currentColor' strokeWidth='1.8' strokeLinejoin='round' />
    <path d='M20 18V12h8v6' stroke='currentColor' strokeWidth='1.8' />
    <path d='M6 38c4 3 10 4 18 4s14-1 18-4' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round' />
  </svg>
)

const ProductShipping = ({ compact = false }) => {
  return (
    <section className={`product-shipping ${compact ? 'product-shipping--compact' : ''}`} aria-labelledby='product-shipping-title'>
      <div className='product-shipping-pattern' aria-hidden='true' />
      <div className='product-shipping-head'>
        <p className='product-shipping-kicker'>Factory logistics</p>
        <h2 id='product-shipping-title' className='product-shipping-title'>
          Shipping for samples and bulk
        </h2>
        <p className='product-shipping-lead'>
          Freight is quoted with your inquiry. Samples go by postal or international courier. Bulk moves by sea, or by the China forwarder you appoint.
        </p>
      </div>

      <div className='product-shipping-grid'>
        <article className='product-ship-card product-ship-card--sample'>
          <div className='product-ship-card-top'>
            <span className='product-ship-badge'>Samples</span>
            <IconParcel />
          </div>
          <h3>China Post, Alibaba express, DHL / FedEx / TNT</h3>
          <p>
            Small trial orders usually ship as a China Post small packet, Alibaba online express, or an international courier such as DHL, FedEx, or TNT. We confirm the lane after you share destination and urgency.
          </p>
          <ul>
            {SAMPLE_CARRIERS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className='product-ship-card product-ship-card--bulk'>
          <div className='product-ship-card-top'>
            <span className='product-ship-badge product-ship-badge--bulk'>Bulk / OEM</span>
            <IconShip />
          </div>
          <h3>FCL, LCL, or your China forwarder</h3>
          <p>
            Production lots typically go FCL or LCL by sea. You may also appoint your own China freight forwarder for air, rail, or sea. The factory can deliver to the warehouse or port they name.
          </p>
          <ul>
            {BULK_OPTIONS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </div>

      <div id='returns' className='product-shipping-return'>
        <p>
          <strong>Quality returns:</strong> factory defects can be raised within {RETURN_POLICY_DAYS} days of arrival. Custom OEM, printed, or made-to-order goods are not returnable for a change of mind. Return freight is quoted case by case.
        </p>
        <Link to='/shipping' className='product-shipping-link'>
          Full shipping &amp; return policy
        </Link>
        {' · '}
        <Link to='/shipping#track' className='product-shipping-link'>
          Track shipment
        </Link>
      </div>
    </section>
  )
}

export default ProductShipping
