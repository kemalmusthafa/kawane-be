"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsService = void 0;
class SettingsService {
    async getSettings() {
        // For now, return default settings
        // In a real application, you would store these in a database
        return {
            // General Settings
            siteName: "Kawane Studio",
            siteDescription: "Premium E-commerce Platform",
            siteUrl: "https://kawane-studio.com",
            adminEmail: "admin@kawane.com",
            timezone: "Asia/Jakarta",
            language: "id",
            currency: "IDR",
            // Email Settings
            smtpHost: "smtp.gmail.com",
            smtpPort: "587",
            smtpUsername: "noreply@kawane.com",
            smtpPassword: "********",
            emailFrom: "Kawane Studio <noreply@kawane.com>",
            // Security Settings
            sessionTimeout: 30,
            maxLoginAttempts: 5,
            passwordMinLength: 8,
            twoFactorAuth: true,
            ipWhitelist: "",
            userLoginRateLimit: 1000,
            // Notification Settings
            emailNotifications: true,
            smsNotifications: false,
            pushNotifications: true,
            lowStockAlert: true,
            newOrderAlert: true,
            paymentAlert: true,
            // Payment Settings
            stripeEnabled: true,
            paypalEnabled: false,
            bankTransferEnabled: true,
            codEnabled: true,
            // Shipping Settings
            freeShippingThreshold: 500000,
            defaultShippingCost: 15000,
            shippingZones: "Indonesia",
            // Appearance Settings
            primaryColor: "#3B82F6",
            secondaryColor: "#64748B",
            faviconUrl: "/favicon.ico",
        };
    }
    async updateSettings(settingsData) {
        // For now, just return the updated settings
        // In a real application, you would save these to a database
        return {
            ...this.getSettings(),
            ...settingsData,
        };
    }
}
exports.SettingsService = SettingsService;
