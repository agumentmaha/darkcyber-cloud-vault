import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const MonetagAdManager = () => {
    const location = useLocation();

    useEffect(() => {
        // Skip if in admin panel
        if (location.pathname.startsWith('/admin')) {
            console.log("Admin panel detected, skipping Monetag initialization.");
            return;
        }

        // Initialize In-App Interstitial
        // Checking if the SDK function exists before calling
        const initAds = () => {
            if (typeof (window as any).show_10611492 === "function") {
                console.log("Initializing Monetag In-App Interstitial...");
                (window as any).show_10611492({
                    type: 'inApp',
                    inAppSettings: {
                        frequency: 2,
                        capping: 0.1,
                        interval: 30,
                        timeout: 5,
                        everyPage: false
                    }
                });
            } else {
                // Retry after a short delay if SDK not yet loaded
                setTimeout(initAds, 1000);
            }
        };

        initAds();
    }, []);

    return null;
};

/**
 * Global helpers to trigger rewarded ads from any component
 */
export const showRewardedInterstitial = () => {
    if (typeof (window as any).show_10611492 === "function") {
        return (window as any).show_10611492().then(() => {
            console.log("Rewarded interstitial finished");
        });
    }
    return Promise.reject("SDK not loaded");
};

export const showRewardedPopup = () => {
    if (typeof (window as any).show_10611492 === "function") {
        return (window as any).show_10611492('pop').then(() => {
            console.log("Rewarded popup finished");
        }).catch((e: any) => {
            console.error("Rewarded popup error", e);
        });
    }
    return Promise.reject("SDK not loaded");
};

export default MonetagAdManager;
