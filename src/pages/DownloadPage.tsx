import { useState } from "react";
import { useParams } from "react-router-dom";
import { Download, FileIcon, Cloud, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const DownloadPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [downloading, setDownloading] = useState(false);

  // TODO: Fetch file info from DB using slug
  const file = {
    filename: "example-file.zip",
    size: 52428800,
    mime_type: "application/zip",
  };

  const handleDownload = async () => {
    setDownloading(true);
    // TODO: Call edge function to get Telegram CDN link
    setTimeout(() => setDownloading(false), 2000);
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
          {/* Ad space top */}
          <div className="p-3 rounded-xl border border-border bg-muted/30 text-center">
            <p className="text-xs text-muted-foreground">إعلان</p>
          </div>

          <Card className="border-primary/30 bg-card">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
                <FileIcon className="w-8 h-8 text-primary" />
              </div>

              <h1 className="text-xl font-bold font-cyber mb-2">{file.filename}</h1>
              <p className="text-muted-foreground text-sm mb-1">الحجم: {formatSize(file.size)}</p>
              <p className="text-muted-foreground text-sm mb-8">النوع: {file.mime_type}</p>

              <Button
                size="lg"
                onClick={handleDownload}
                disabled={downloading}
                className="w-full text-lg py-6 glow-purple font-cyber"
              >
                {downloading ? (
                  "جارٍ التحضير..."
                ) : (
                  <>
                    <Download className="w-5 h-5 ml-2" />
                    تحميل الملف
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                <Shield className="w-3 h-3" />
                <span>تحميل آمن عبر Telegram CDN</span>
              </div>
            </CardContent>
          </Card>

          {/* Ad space bottom */}
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
