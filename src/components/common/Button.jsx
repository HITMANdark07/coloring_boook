import React from "react";


const Button = React.forwardRef((props,ref) => {
    return(
        <button onClick={props.onClick} {...props} className="border-none min-w-max rounded  bg-gray-900 text-white font-semibold px-5 py-3" ref={ref}>
            {props.text ? props.text :  'CLICK ME'}
        </button>
    )
})

export default Button;