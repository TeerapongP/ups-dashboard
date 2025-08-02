import React from 'react'

const Button = (props: { label: any, onClick: any, disabled: boolean }) => {
    return (
        <button className='bg-blue-500 text-white p-2 rounded-md' onClick={props.onClick} disabled={props.disabled} type='button' aria-label={props.label}>{props.label}</button>
    )
}

export default Button