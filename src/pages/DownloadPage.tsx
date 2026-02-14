import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Download, FileIcon, Cloud, Shield, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const DownloadPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [downloading, setDownloading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFile = async () => {
      if (!slug) return;
      const { data, error: fetchError } = await supabase
        .from("files")
        .select("filename, size, mime_type, unique_slug")
        .eq("unique_slug", slug)
        .eq("is_blocked", false)
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
      const { data, error: fnError } = await supabase.functions.invoke("get-download-link", {
        body: null,
        headers: {},
      });

      // Use query params approach
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-download-link?slug=${slug}`,
        { headers: { "apikey": import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } }
      );
      const result = await res.json();

      if (result.url) {
        window.open(result.url, "_blank");
      } else {
        setError(result.error || "فشل في الحصول على رابط التحميل");
      }
    } catch (err) {
      setError("حدث خطأ أثناء التحميل");
    } finally {
      setDownloading(false);
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
          <div className="p-3 rounded-xl border border-border bg-muted/30 text-center">
            <p className="text-xs text-muted-foreground">إعلان</p>
          </div>

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

                <Button
                  size="lg"
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full text-lg py-6 glow-purple font-cyber"
                >
                  {downloading ? (
                    <><Loader2 className="w-5 h-5 ml-2 animate-spin" /> جارٍ التحضير...</>
                  ) : (
                    <><Download className="w-5 h-5 ml-2" /> تحميل الملف</>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                  <Shield className="w-3 h-3" />
                  <span>تحميل آمن عبر Telegram CDN</span>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <div className="p-3 rounded-xl border border-border bg-muted/30 text-center">
            <p className="text-xs text-muted-foreground">إعلان</p>
          </div>

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
