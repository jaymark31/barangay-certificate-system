import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { ResidentLayout } from "./layouts/ResidentLayout";
import { AdminLayout } from "./layouts/AdminLayout";
import ResidentDashboard from "./pages/resident/Dashboard";
import NewRequest from "./pages/resident/NewRequest";
import RequestHistory from "./pages/resident/RequestHistory";
import Profile from "./pages/resident/Profile";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminRequests from "./pages/admin/Requests";
import AdminResidents from "./pages/admin/Residents";
import AdminCertificates from "./pages/admin/CertificateTypes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Resident Routes */}
            <Route path="/resident" element={<ResidentLayout />}>
              <Route path="dashboard" element={<ResidentDashboard />} />
              <Route path="new-request" element={<NewRequest />} />
              <Route path="history" element={<RequestHistory />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="requests" element={<AdminRequests />} />
              <Route path="residents" element={<AdminResidents />} />
              <Route path="certificates" element={<AdminCertificates />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
