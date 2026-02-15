import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdBannerProps {
  placement: "download_page" | "dashboard" | "both";
}

const AdBanner = ({ placement }: AdBannerProps) => {
  const [ads, setAds] = useState<any[]>([]);
  const containerRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    const fetchAds = async () => {
      const { data } = await supabase
        .from("ads")
        .select("id, code")
        .eq("status", "active")
        .in("placement", [placement, "both"]);
      setAds(data || []);
    };
    fetchAds();
  }, [placement]);

  useEffect(() => {
    // Re-inject ad HTML so that iframes and scripts load properly
    ads.forEach((ad) => {
      const container = containerRefs.current.get(ad.id);
      if (container) {
        container.innerHTML = "";
        const range = document.createRange();
        range.selectNode(container);
        const fragment = range.createContextualFragment(ad.code);
        container.appendChild(fragment);

        // Fix iframes: ensure proper sizing
        const iframes = container.querySelectorAll("iframe");
        iframes.forEach((iframe) => {
          iframe.style.width = "100%";
          iframe.style.minHeight = "250px";
          iframe.style.height = "250px";
          iframe.style.border = "none";
          iframe.style.display = "block";
        });
      }
    });
  }, [ads]);

  if (ads.length === 0) return null;

  return (
    <div className="space-y-3">
      {ads.map((ad) => (
        <div
          key={ad.id}
          className="w-full overflow-hidden"
          ref={(el) => {
            if (el) containerRefs.current.set(ad.id, el);
          }}
        />
      ))}
    </div>
  );
};

export default AdBanner;
