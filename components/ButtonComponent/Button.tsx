import React from 'react'

const Button = (props: { label: string }) => {
    return (
        <button className='bg-blue-500 text-white p-2 rounded-lg' >{props.label}</button>
    )
}

export default Button