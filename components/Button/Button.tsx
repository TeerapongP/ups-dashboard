import React from 'react'

const Button = (props: { label: any }) => {
    return (
        <button className='bg-blue-500 text-white p-2 rounded-md'>{props.label}</button>
    )
}

export default Button