import React from "react";
import "./css/NavCust.css"; // Ensure the correct path

const NavCust = () => {
    return (
        <div className="container">
            <nav className="navbar">
                <div className="nav-item">
                    <div className="nav-title">Home 🏠</div>
                </div>
                <div className="nav-item">
                    <div className="nav-title">Analytics 📊</div>
                </div>
                <div className="nav-item">
                    <div className="nav-title">Search 🔍</div>
                </div>
                <div className="nav-item">
                    <div className="nav-title">Training 📚</div>
                </div>
                <div className="nav-item">
                    <div className="nav-title">Feedback 📝</div>
                </div>
            </nav>
        </div>

    );
};

export default NavCust;
