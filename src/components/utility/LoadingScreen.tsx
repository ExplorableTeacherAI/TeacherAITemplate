import { useEffect } from "react";
import "./LoadingScreen.css";

export const LoadingScreen = () => {
    // Lock body scroll while loading
    useEffect(() => {
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []);

    return (
        <div className="loading-screen">
            <div className="loading-container">
                {/* Animated logo */}
                <div className="logo-wrapper">
                    <img
                        src={`${import.meta.env.BASE_URL}logo-1.svg`}
                        alt="Loading"
                        className="loading-logo"
                    />
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;
