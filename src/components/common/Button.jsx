import React from "react";


const Button = React.forwardRef((props,ref) => {
    return(
        <button onClick={props.onClick} className="border-none rounded  bg-gray-900 text-white font-semibold px-5 py-3" ref={ref}>
            {props.text ? props.text :  'CLICK ME'}
        </button>
    )
})

export default Button;