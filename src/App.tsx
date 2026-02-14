import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import TermsPage from "./pages/TermsPage";
import DownloadPage from "./pages/DownloadPage";
import DashboardLayout from "./components/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import MyFilesPage from "./pages/dashboard/MyFilesPage";
import UploadPage from "./pages/dashboard/UploadPage";
import AdminLayout from "./components/AdminLayout";
import AdminStats from "./pages/admin/AdminStats";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminFiles from "./pages/admin/AdminFiles";
import AdminAds from "./pages/admin/AdminAds";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/d/:slug" element={<DownloadPage />} />
            
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="files" element={<MyFilesPage />} />
              <Route path="upload" element={<UploadPage />} />
            </Route>

            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminStats />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="files" element={<AdminFiles />} />
              <Route path="ads" element={<AdminAds />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
