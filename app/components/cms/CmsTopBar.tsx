"use client";
import { IUserInfo } from "@/app/types/UserInfoProps";
import React, { useState } from "react";
import { logout } from "@/app/utils";

interface CmsTopBarProps {
    userInfo: IUserInfo;
    onToggleMobileNav: () => void;
}

const CmsTopBar: React.FC<CmsTopBarProps> = ({ userInfo, onToggleMobileNav }) => {
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = () => {
        logout();
    };

    const getUserInitial = () => {
        return userInfo.userName ? userInfo.userName.charAt(0).toUpperCase() : "U";
    };

    return (
        <header className="fixed top-0 left-16 right-0 h-15 bg-white border-b border-gray-200 z-50 flex items-center px-5 shadow-sm">
            <style jsx>{`
                .top-bar {
                    position: fixed;
                    top: 0;
                    left: 70px;
                    right: 0;
                    height: 60px;
                    background-color: #ffffff;
                    border-bottom: 1px solid #e0e0e0;
                    z-index: 999;
                    display: flex;
                    align-items: center;
                    padding: 0 20px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }

                .left-nav-toggle {
                    display: none;
                }

                @media (max-width: 768px) {
                    .left-nav-toggle {
                        display: block;
                        margin-right: 15px;
                    }

                    .top-bar {
                        left: 0;
                    }
                }

                .top-right-nav {
                    margin-left: auto;
                    margin-bottom: 0;
                    display: flex;
                    list-style: none;
                    gap: 15px;
                    align-items: center;
                }

                .icon-dropdown a {
                    color: #666;
                    font-size: 18px;
                    padding: 8px;
                    transition: color 0.2s ease;
                }

                .icon-dropdown a:hover {
                    color: #603493;
                }

                .dropdown {
                    position: relative;
                }

                .dropdown-menu {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    background: white;
                    border: 1px solid #e0e0e0;
                    border-radius: 6px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                    min-width: 200px;
                    z-index: 1000;
                    opacity: 0;
                    transform: translateY(-10px);
                    transition: all 0.2s ease;
                    pointer-events: none;
                }

                .dropdown-menu.show {
                    opacity: 1;
                    transform: translateY(0);
                    pointer-events: auto;
                }

                .dropdown-menu a,
                .dropdown-menu button {
                    display: block;
                    width: 100%;
                    padding: 10px 15px;
                    color: #333;
                    text-decoration: none;
                    border: none;
                    background: none;
                    text-align: left;
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                }

                .dropdown-menu a:hover,
                .dropdown-menu button:hover {
                    background-color: #f8f9fa;
                    color: #603493;
                }

                .dropdown-menu .divider {
                    height: 1px;
                    background-color: #e0e0e0;
                    margin: 5px 0;
                }

                .circle-avatar {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background-color: #603493;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    font-size: 14px;
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                }

                .circle-avatar:hover {
                    background-color: #7c4dff;
                }

                .notification-dropdown {
                    width: 300px;
                    max-height: 400px;
                    overflow-y: auto;
                }

                .notification-list {
                    padding: 15px;
                    text-align: center;
                    color: #666;
                    font-size: 14px;
                }

                @media (max-width: 768px) {
                    .hidden-xs {
                        display: none !important;
                    }
                }
            `}</style>

            {/* Mobile Menu Toggle */}
            <div className="left-nav-toggle md:hidden" title="Open or close admin menu">
                <button onClick={onToggleMobileNav} className="p-2 text-gray-700">
                    <i className="fas fa-bars"></i>
                </button>
            </div>

            {/* Right Navigation */}
            {userInfo.authenticated && (
                <ul className="top-right-nav">
                    {/* User Network */}
                    <li className="dropdown hidden-xs icon-dropdown">
                        <a href="/cms/admin/network" title="User Network">
                            <i className="fas fa-users"></i>
                        </a>
                    </li>

                    {/* Chat */}
                    <li className="dropdown icon-dropdown">
                        <a href="/cms/chat" title="Chat">
                            <i className="fas fa-comments"></i>
                        </a>
                    </li>

                    {/* Help/FAQ */}
                    <li className="dropdown hidden-xs icon-dropdown">
                        <a href="/faq" title="Help">
                            <i className="fas fa-question-circle"></i>
                        </a>
                    </li>

                    {/* Notifications */}
                    <li className="dropdown hidden-xs icon-dropdown">
                        <div className="relative">
                            <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 text-gray-600 hover:text-purple-600" title="Notifications">
                                <i className="fas fa-bell"></i>
                            </button>
                            <div className={`dropdown-menu notification-dropdown ${showNotifications ? "show" : ""}`}>
                                <div className="notification-list">
                                    <p>No new notifications</p>
                                </div>
                            </div>
                        </div>
                    </li>

                    {/* User Menu - FIXED: Removed nested <li> elements */}
                    <li className="dropdown avtar-dropdown">
                        <div className="relative">
                            <button onClick={() => setShowUserMenu(!showUserMenu)} className="circle-avatar" title={userInfo.userName}>
                                {getUserInitial()}
                            </button>
                            <div className={`dropdown-menu ${showUserMenu ? "show" : ""}`}>
                                <a href="/cms/admin/profile">
                                    <i className="fas fa-user mr-2"></i> My Profile
                                </a>
                                <a href="/cms/support">
                                    <i className="fa fa-headset mr-2"></i> Support
                                </a>
                                <div className="divider"></div>
                                <button onClick={handleLogout}>
                                    <i className="fas fa-sign-out-alt mr-2"></i> Logout
                                </button>
                            </div>
                        </div>
                    </li>
                </ul>
            )}
        </header>
    );
};

export default CmsTopBar;
