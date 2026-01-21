// app/config/permissions.ts

export const Permissions = {
    unsophisticated: {
        CUSTOMER: [
            "viewProducts",
            "placeOrder",
            "trackOrder",
            "manageProfile",
            "order:create",
            "order:read",
            "cart:read",
            "cart:update",
        ],
        SELLER: [
            "addProduct",
            "editProduct",
            "viewOrders",
            "manageInventory",
            "setPricing",
            "order:create",
            "order:read",
            "seller:read",
            "cart:read",
            "cart:update",
        ],
        CUSTOMER_CARE: [
            "viewProducts",
            "trackOrder",
            "manageProfile",
            "viewTickets",
            "respondTickets",
            "order:read",
        ],
    },
    sophisticated: {
        ADMIN: ["*", "admin:read", "admin:write", "role:switch"], // full access for admin users
        // Sophisticated users can switch roles if they have the permission explicitly
    },
};
