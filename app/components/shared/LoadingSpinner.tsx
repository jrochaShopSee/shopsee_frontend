import React from "react";
import favIconPng from "../../images/logo/favicon.png";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
}

export const LoadingSpinner = ({}: LoadingSpinnerProps = {}) => {
    return (
        <div id="loading-spinner" className="lds-dual-ring-absolute-fe">
            <div className="loading-spinner-logo">
                <div className="lds-dual-ring-g"></div>
                <img src={favIconPng.src} alt="loading logo image" />
            </div>
        </div>
    );
};
