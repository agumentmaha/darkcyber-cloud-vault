import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdBannerProps {
  placement: "download_page" | "dashboard" | "both";
}

const AdBanner = ({ placement }: AdBannerProps) => {
  const [ads, setAds] = useState<any[]>([]);

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

  if (ads.length === 0) return null;

  return (
    <div className="space-y-3">
      {ads.map((ad) => (
        <div
          key={ad.id}
          className="rounded-xl border border-border bg-muted/30 overflow-hidden"
          dangerouslySetInnerHTML={{ __html: ad.code }}
        />
      ))}
    </div>
  );
};

export default AdBanner;
