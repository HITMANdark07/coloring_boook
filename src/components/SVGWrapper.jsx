import React from "react";

const SVGWrapper = ({children}) => {
    return(
        <div className="flex flex-row justify-center">
            {children}
        </div>
    )
}

export default SVGWrapper;