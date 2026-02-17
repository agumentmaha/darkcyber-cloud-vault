import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";

const HeadAdInjector = () => {
    const location = useLocation();

    useEffect(() => {
        // Skip if in admin panel
        if (location.pathname.startsWith('/admin')) {
            console.log("Admin panel detected, skipping head ad injection.");
            return;
        }

        const injectAds = async () => {
            const { data: ads } = await supabase
                .from("ads")
                .select("id, code, ad_type")
                .eq("status", "active")
                .eq("placement", "global_head");

            if (ads && ads.length > 0) {
                ads.forEach(ad => {
                    // Check if already injected
                    if (document.getElementById(`ad-script-${ad.id}`)) return;

                    if (ad.ad_type === "meta") {
                        const temp = document.createElement('div');
                        temp.innerHTML = ad.code.trim();
                        const meta = temp.firstChild as HTMLElement;
                        if (meta) {
                            meta.id = `ad-script-${ad.id}`;
                            document.head.appendChild(meta);
                        }
                    } else {
                        const range = document.createRange();
                        const fragment = range.createContextualFragment(ad.code);
                        // Add ID to scripts for tracking if possible, or just inject
                        Array.from(fragment.children).forEach(child => {
                            (child as HTMLElement).id = `ad-script-${ad.id}`;
                            document.head.appendChild(child);
                        });
                    }
                });
            }
        };

        injectAds();
    }, []);

    return null;
};

export default HeadAdInjector;
