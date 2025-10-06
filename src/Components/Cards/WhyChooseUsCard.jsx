import React from 'react'
import style from '../../Styles/Cards/WhyChooseUs.module.css'

export default function WhyChooseUsCard(
    image,
    title,
    alternativeText,
    description
) {
  return (
    <div className={styled.WhyChooseUsCard}>
      <h2 className={style.WhyChooseUsCardTitle}>{title}</h2>
      
      <img 
        src={image} 
        alt={alternativeText} 
        className={style.WhyChooseUsCardIcon}
        />
      
      <p className={style.WhyChooseUsCardDescription} >{description}</p>
    </div>
  )
}
