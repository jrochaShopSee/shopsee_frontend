// app/shared/navigation/AdminNavFinal.tsx
import React from "react";

interface AdminNavFinalProps {
    apiBaseUrl?: string;
    showLogo?: boolean;
    logoSrc?: string;
}

const AdminNavFinal: React.FC<AdminNavFinalProps> = ({ apiBaseUrl = "", showLogo = true, logoSrc = "/img/logo/favicon.png" }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [menuItems, setMenuItems] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [expandedItem, setExpandedItem] = React.useState<number | null>(null);

    React.useEffect(() => {
        const fetchMenuItems = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${apiBaseUrl}/api/MenuItems`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setMenuItems(data);
                setError(null);
            } catch (err) {
                console.error("Error fetching menu items:", err);
                setError("Failed to load menu items");
            } finally {
                setLoading(false);
            }
        };

        fetchMenuItems();
    }, [apiBaseUrl]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleMenuItemClick = (item: any) => {
        if (item.ChildMenuItems && item.ChildMenuItems.length > 0) {
            setExpandedItem(expandedItem === item.MenuItemId ? null : item.MenuItemId);
        } else if (item.Url && item.Url !== "javascript: void(0);") {
            window.location.href = item.Url;
        }
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleChildMenuItemClick = (childItem: any) => {
        if (childItem.Url && childItem.Url !== "javascript: void(0);") {
            window.location.href = childItem.Url;
        }
    };

    const handleMouseLeave = () => {
        // Close submenu when mouse leaves the entire nav area
        setExpandedItem(null);
    };

    if (loading) {
        return React.createElement(
            "div",
            {
                style: {
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "200px",
                    color: "#ffffff",
                },
            },
            React.createElement(
                "div",
                { style: { textAlign: "center" } },
                React.createElement("div", {
                    style: {
                        width: "24px",
                        height: "24px",
                        border: "3px solid rgba(255, 255, 255, 0.3)",
                        borderTop: "3px solid #ffffff",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                        margin: "0 auto 15px auto",
                    },
                }),
                React.createElement(
                    "p",
                    {
                        style: {
                            color: "#ffffff",
                            fontSize: "12px",
                            margin: 0,
                        },
                    },
                    "Loading..."
                )
            )
        );
    }

    if (error) {
        return React.createElement(
            "div",
            {
                style: {
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "200px",
                    color: "#ffffff",
                    padding: "20px",
                    textAlign: "center",
                },
            },
            React.createElement("i", {
                className: "fas fa-exclamation-triangle",
                style: { fontSize: "20px", marginBottom: "8px", color: "#ffab91" },
            }),
            React.createElement(
                "p",
                {
                    style: {
                        fontSize: "12px",
                        margin: "0 0 8px 0",
                    },
                },
                "Nav Error"
            ),
            React.createElement(
                "p",
                {
                    style: {
                        fontSize: "10px",
                        opacity: 0.8,
                        margin: 0,
                    },
                },
                error
            )
        );
    }

    return React.createElement(
        "div",
        {
            className: "admin-nav-container",
            style: {
                display: "flex",
                flexDirection: "column",
                height: "100%",
                width: "100%",
                position: "relative",
            },
            onMouseLeave: handleMouseLeave,
        },
        React.createElement(
            "style",
            null,
            `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .admin-nav-container {
                background-color: #603493;
            }
            
            .admin-nav-logo {
                width: 100%;
                height: 60px;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: rgba(255, 255, 255, 0.1);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                flex-shrink: 0;
            }
            
            .admin-nav-logo img {
                width: 32px;
                height: 32px;
                border-radius: 4px;
                background-color: #ffffff;
                padding: 2px;
            }
            
            .admin-nav-content {
                flex: 1;
                display: flex;
                flex-direction: column;
                min-height: 0;
            }
            
            .admin-nav-scroll {
                flex: 1;
                overflow-y: auto;
                overflow-x: hidden;
                padding: 10px 0;
            }
            
            .admin-nav-scroll::-webkit-scrollbar {
                width: 4px;
            }
            
            .admin-nav-scroll::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.1);
            }
            
            .admin-nav-scroll::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.3);
                border-radius: 2px;
            }
            
            .admin-nav-scroll::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.5);
            }
            
            .admin-nav-list {
                list-style: none;
                padding: 0;
                margin: 0;
                min-height: fit-content;
            }
            
            .admin-nav-item {
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 50px;
                height: 50px;
                margin: 8px auto;
                cursor: pointer;
                transition: all 0.3s ease;
                border-radius: 8px;
                color: #ffffff;
                background: rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .admin-nav-item:hover {
                background: rgba(255, 255, 255, 0.2);
                transform: translateX(5px) scale(1.05);
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
            }
            
            .admin-nav-item.active {
                background: rgba(255, 255, 255, 0.25);
                box-shadow: 0 6px 25px rgba(0, 0, 0, 0.3);
                border-color: rgba(255, 255, 255, 0.3);
            }
            
            .admin-nav-icon {
                font-size: 18px;
                color: #ffffff;
                transition: all 0.3s ease;
            }
            
            .admin-nav-item:hover .admin-nav-icon {
                color: #ffffff;
                transform: scale(1.1);
            }
            
            .admin-nav-tooltip {
                position: absolute;
                left: 65px;
                top: 50%;
                transform: translateY(-50%);
                background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.8));
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 500;
                white-space: nowrap;
                z-index: 1000;
                opacity: 0;
                pointer-events: none;
                transition: all 0.3s ease;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .admin-nav-tooltip::before {
                content: '';
                position: absolute;
                top: 50%;
                left: -6px;
                transform: translateY(-50%);
                border: 6px solid transparent;
                border-right-color: rgba(0, 0, 0, 0.9);
            }
            
            .admin-nav-item:hover .admin-nav-tooltip {
                opacity: 1;
                transform: translateY(-50%) translateX(5px);
            }
            
            .admin-nav-submenu {
                position: fixed;
                left: 70px;
                top: 0;
                width: 250px;
                height: 100vh;
                background: #ffffff;
                border-right: 1px solid rgba(0, 0, 0, 0.1);
                box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
                z-index: 999;
                opacity: 0;
                transform: translateX(-250px);
                transition: all 0.3s ease;
                pointer-events: none;
                overflow-y: auto;
                padding: 20px 0;
            }
            
            .admin-nav-submenu.show {
                opacity: 1;
                transform: translateX(0);
                pointer-events: auto;
            }
            
            .admin-nav-submenu-header {
                padding: 0 20px 15px 20px;
                border-bottom: 1px solid rgba(0, 0, 0, 0.1);
                margin-bottom: 10px;
            }
            
            .admin-nav-submenu-title {
                font-size: 16px;
                font-weight: 600;
                color: #333333;
                margin: 0;
            }
            
            .admin-nav-submenu-item {
                display: block;
                width: 100%;
                padding: 12px 20px;
                color: #666666;
                text-decoration: none;
                transition: all 0.2s ease;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                border: none;
                background: none;
            }
            
            .admin-nav-submenu-item:hover {
                background: #f8f9fa;
                color: #603493;
                padding-left: 30px;
            }
            `
        ),
        // Logo section (conditional)
        showLogo &&
            React.createElement(
                "div",
                { className: "admin-nav-logo" },
                React.createElement("img", {
                    src: logoSrc,
                    alt: "Logo",
                })
            ),
        // Navigation content
        React.createElement(
            "div",
            { className: "admin-nav-content" },
            React.createElement(
                "div",
                { className: "admin-nav-scroll" },
                React.createElement(
                    "ul",
                    { className: "admin-nav-list" },
                    menuItems.map((item, index) =>
                        React.createElement(
                            "li",
                            {
                                key: item.MenuItemId || index,
                                style: { position: "relative" },
                            },
                            React.createElement(
                                "div",
                                {
                                    className: `admin-nav-item ${expandedItem === item.MenuItemId ? "active" : ""}`,
                                    onClick: () => handleMenuItemClick(item),
                                    title: item.MenuTitle,
                                },
                                React.createElement("i", {
                                    className: `fas ${item.IconClass} admin-nav-icon`,
                                }),
                                React.createElement("div", { className: "admin-nav-tooltip" }, item.MenuTitle)
                            ),
                            item.ChildMenuItems &&
                                item.ChildMenuItems.length > 0 &&
                                React.createElement(
                                    "div",
                                    {
                                        className: `admin-nav-submenu ${expandedItem === item.MenuItemId ? "show" : ""}`,
                                    },
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    item.ChildMenuItems.map((childItem: any, childIndex: number) =>
                                        React.createElement(
                                            "div",
                                            {
                                                key: childItem.MenuItemId || childIndex,
                                                className: "admin-nav-submenu-item",
                                                onClick: () => handleChildMenuItemClick(childItem),
                                            },
                                            childItem.MenuTitle
                                        )
                                    )
                                )
                        )
                    )
                )
            )
        )
    );
};

// Ensure the component is available globally for UMD
if (typeof window !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).AdminNavFinal = AdminNavFinal;
}

export default AdminNavFinal;
