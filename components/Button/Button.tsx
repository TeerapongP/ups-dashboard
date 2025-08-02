import React from 'react'

const Button = (props: { label: any, onClick: any }) => {
    return (
        <button className='bg-blue-500 text-white p-2 rounded-md' onClick={props.onClick}>{props.label}</button>
    )
}

export default Button