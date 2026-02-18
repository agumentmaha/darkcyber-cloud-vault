import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Download, FileIcon, Cloud, Shield, Loader2, AlertTriangle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import AdBanner from "@/components/AdBanner";

const DownloadPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [downloading, setDownloading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // Show In-App Interstitial ad
    if (typeof (window as any).show_10611492 === "function") {
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
    }
  }, []);

  useEffect(() => {
    const fetchFile = async () => {
      if (!slug) return;
      const { data, error: fetchError } = await supabase
        .from("files")
        .select("filename, size, mime_type, unique_slug")
        .eq("unique_slug", slug)
        .maybeSingle();

      if (fetchError || !data) {
        setError("الملف غير موجود أو تم حذفه");
      } else {
        setFile(data);
      }
      setLoading(false);
    };
    fetchFile();
  }, [slug]);

  const handleDownload = async () => {
    if (!slug) return;
    setDownloading(true);
    try {
      // The function now streams the file directly via MTKruto.
      // We navigate to the function URL with the apikey in query params to bypass Telegram Bot API's 20MB limit.
      const downloadUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-download-link?slug=${slug}&apikey=${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`;

      // Trigger download by opening the URL
      window.location.href = downloadUrl;
    } catch (err) {
      setError("حدث خطأ أثناء التحميل");
    } finally {
      // We set a timeout here because location changes don't usually capture the 'finish' of a binary stream start
      setTimeout(() => setDownloading(false), 3000);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(2) + " GB";
    return (bytes / 1048576).toFixed(2) + " MB";
  };

  return (
    <div className="min-h-screen bg-background grid-pattern flex flex-col">
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center h-16 px-4">
          <a href="/" className="flex items-center gap-2">
            <Cloud className="w-6 h-6 text-primary" />
            <span className="font-cyber text-lg font-bold">
              Dark<span className="text-primary">Cyber</span>X
            </span>
          </a>
        </div>
      </nav>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <AdBanner placement="download_page" />

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <Card className="border-destructive/30 bg-card">
              <CardContent className="p-8 text-center">
                <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
                <p className="text-destructive font-bold">{error}</p>
              </CardContent>
            </Card>
          ) : file ? (
            <Card className="border-primary/30 bg-card">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
                  <FileIcon className="w-8 h-8 text-primary" />
                </div>

                <h1 className="text-xl font-bold font-cyber mb-2">{file.filename}</h1>
                <p className="text-muted-foreground text-sm mb-1">الحجم: {formatSize(file.size)}</p>
                <p className="text-muted-foreground text-sm mb-8">النوع: {file.mime_type || "غير معروف"}</p>

                <div className="space-y-3">
                  {file.size > 20 * 1024 * 1024 ? (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-4 text-amber-500 text-sm flex items-start gap-3 text-right" dir="rtl">
                      <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                      <p>هذا الملف حجمه كبير ({formatSize(file.size)}). التحميل المباشر قد لا ينجح أحياناً بسبب قيود تقنية. ننصح باستخدام بوت التيليجرام لضمان استلام الملف.</p>
                    </div>
                  ) : null}

                  <div className="grid gap-4">
                    <Button
                      size="lg"
                      onClick={handleDownload}
                      disabled={downloading}
                      className="w-full text-lg py-6 glow-purple font-cyber"
                    >
                      {downloading ? (
                        <><Loader2 className="w-5 h-5 ml-2 animate-spin" /> جارٍ التحضير...</>
                      ) : (
                        <><Download className="w-5 h-5 ml-2" /> تحميل مباشر (20MB كحد أقصى)</>
                      )}
                    </Button>

                    <a
                      href={`https://t.me/BotTelegramcloudbot?start=${file.unique_slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button
                        size="lg"
                        variant="outline"
                        className="w-full text-lg py-6 border-primary/50 hover:bg-primary/10 font-cyber"
                      >
                        <Cloud className="w-5 h-5 ml-2" /> استلام عبر تيليجرام (حتى 2GB)
                      </Button>
                    </a>
                  </div>

                  <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                    <Shield className="w-3 h-3" />
                    <span>تحميل آمن عبر Telegram CDN</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <AdBanner placement="download_page" />

          <p className="text-center text-xs text-muted-foreground">
            تم الرفع عبر{" "}
            <a href="/" className="text-primary hover:underline">DarkCyberX Cloud</a>
          </p>
        </div>
      </main>
    </div>
  );
};

export default DownloadPage;
