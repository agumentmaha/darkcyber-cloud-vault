import { Cloud, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const LoginPage = () => {
  const handleTelegramLogin = () => {
    // Telegram Login Widget will be integrated here
    // For now, show instructions
    window.open("https://t.me/DarkCyberXBot", "_blank");
  };

  return (
    <div className="min-h-screen bg-background grid-pattern flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center glow-purple">
              <Cloud className="w-6 h-6 text-primary" />
            </div>
            <span className="font-cyber text-xl font-bold">
              Dark<span className="text-primary">Cyber</span>X
            </span>
          </Link>
          <h1 className="text-2xl font-bold font-cyber mb-2">تسجيل الدخول</h1>
          <p className="text-muted-foreground">سجّل دخولك عبر حساب Telegram</p>
        </div>

        <div className="p-8 rounded-2xl border border-border bg-card">
          <Button
            onClick={handleTelegramLogin}
            size="lg"
            className="w-full text-lg py-6 glow-purple font-cyber"
          >
            <Send className="w-5 h-5 ml-2" />
            الدخول عبر Telegram
          </Button>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              بالتسجيل أنت توافق على{" "}
              <Link to="/terms" className="text-primary hover:underline">
                سياسة الاستخدام
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
