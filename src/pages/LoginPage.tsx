import { useEffect, useRef, useState } from "react";
import { Cloud, Send, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const BOT_USERNAME = "BotTelegramcloudbot";

const LoginPage = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [loggingIn, setLoggingIn] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && !isLoading) {
      navigate("/dashboard");
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    (window as any).onTelegramAuth = async (tgUser: any) => {
      console.log("Telegram auth data received:", tgUser);
      setLoggingIn(true);
      try {
        console.log("Invoking telegram-auth edge function...");
        const { data, error: invokeError } = await supabase.functions.invoke("telegram-auth", {
          body: tgUser,
        });

        if (invokeError) {
          console.error("Function invocation error:", invokeError);
          throw new Error(invokeError.message || "Failed to call auth function");
        }

        if (!data || !data.session) {
          console.error("Auth function returned no session:", data);
          throw new Error("لم يتم استلام جلسة صالحة من السيرفر.");
        }

        console.log("Session received. Setting session in Supabase...");
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });

        if (sessionError) {
          console.error("setSession error:", sessionError);
          throw sessionError;
        }

        console.log("Session set successfully! Navigating to dashboard...");
        toast({ title: "تم تسجيل الدخول بنجاح! ✅" });
        navigate("/dashboard");
      } catch (err: any) {
        console.error("Complete Login Flow Error:", err);
        toast({
          title: "خطأ في تسجيل الدخول",
          description: err.message || "حدث خطأ غير متوقع",
          variant: "destructive",
        });
      } finally {
        setLoggingIn(false);
      }
    };

    if (widgetRef.current && !widgetRef.current.querySelector("script")) {
      const script = document.createElement("script");
      script.src = "https://telegram.org/js/telegram-widget.js?22";
      script.async = true;
      script.setAttribute("data-telegram-login", BOT_USERNAME);
      script.setAttribute("data-size", "large");
      script.setAttribute("data-radius", "12");
      script.setAttribute("data-onauth", "onTelegramAuth(user)");
      script.setAttribute("data-request-access", "write");
      widgetRef.current.appendChild(script);
    }

    return () => {
      delete (window as any).onTelegramAuth;
    };
  }, []);

  const handleAdminLogin = async () => {
    if (!adminEmail || !adminPassword) return;
    setLoggingIn(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword,
      });
      if (error) throw error;
      toast({ title: "تم تسجيل دخول الأدمن بنجاح! ✅" });
      navigate("/dashboard");
    } catch (err: any) {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: err.message || "بيانات غير صحيحة",
        variant: "destructive",
      });
    } finally {
      setLoggingIn(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
          {loggingIn ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground">جارٍ تسجيل الدخول...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <div ref={widgetRef} className="flex justify-center" />

              <div className="w-full border-t border-border" />

              {!showAdmin ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdmin(true)}
                  className="text-xs text-muted-foreground hover:text-primary gap-1"
                >
                  <ShieldCheck className="w-3 h-3" />
                  دخول الأدمن
                </Button>
              ) : (
                <div className="w-full space-y-3">
                  <Input
                    type="email"
                    placeholder="البريد الإلكتروني"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    dir="ltr"
                  />
                  <Input
                    type="password"
                    placeholder="كلمة المرور"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    dir="ltr"
                  />
                  <Button onClick={handleAdminLogin} className="w-full glow-purple">
                    <ShieldCheck className="w-4 h-4 ml-2" />
                    تسجيل دخول الأدمن
                  </Button>
                </div>
              )}

              <p className="text-xs text-muted-foreground text-center">
                اضغط على زر Telegram أعلاه لتسجيل الدخول.
                <br />
                سيتم ربط حسابك في Telegram بحسابك في المنصة.
              </p>
            </div>
          )}

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
