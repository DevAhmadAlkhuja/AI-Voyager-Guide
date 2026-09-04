import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import PlanTrip from "./pages/PlanTrip";
import Destinations from "./pages/Destinations";
import DestinationDetail from "./pages/DestinationDetail";
import Activities from "./pages/Activities";
import Login from "./pages/Login";
import Contact from "./pages/Contact";
import Instructions from "./pages/Instructions";
import BudgetTracker from "./pages/BudgetTracker";
import FAQs from "./pages/FAQs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AdminPanel from "./pages/AdminPanel";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminTrips from "./pages/AdminTrips";
import AdminTripBookings from "./pages/AdminTripBookings";
import AdminContactInbox from "./pages/AdminContactInbox";
import AdminDestinationsIndex from "./pages/admin/destinations/Index";
import AdminDestinationsNew from "./pages/admin/destinations/New";
import AdminDestinationsEdit from "./pages/admin/destinations/Edit";
import UserDashboard from "./pages/UserDashboard";
import UserBookings from "./pages/UserBookings";
import UserProfile from "./pages/UserProfile";
import Profile from "./pages/Profile";
import ProfileEdit from "./pages/ProfileEdit";
import TripPlanDetails from "./pages/TripPlanDetails";
import TripPlanEdit from "./pages/TripPlanEdit";
import Search from "./pages/Search";
import NotFound from "./pages/NotFound";
import Chats from "./pages/chat"



const queryClient = new QueryClient();

const App = () => {
  return (
    <>
      {/* n8n Chat */}
      <Chats />

      {/* App */}
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LanguageProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />

              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/plan" element={<PlanTrip />} />
                  <Route path="/destinations" element={<Destinations />} />
                  <Route
                    path="/destinations/:id"
                    element={<DestinationDetail />}
                  />
                  <Route path="/activities" element={<Activities />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/trips" element={<AdminTrips />} />
                  <Route path="/admin/trips/:id/bookings" element={<AdminTripBookings />} />
                  <Route path="/admin/destinations" element={<AdminDestinationsIndex />} />
                  <Route path="/admin/destinations/new" element={<AdminDestinationsNew />} />
                  <Route path="/admin/destinations/:id/edit" element={<AdminDestinationsEdit />} />
                  <Route path="/admin/contact" element={<AdminContactInbox />} />
                  <Route path="/adminpanel" element={<AdminPanel />} />
                  <Route path="/dashboard" element={<UserDashboard />} />
                  <Route path="/dashboard/bookings" element={<UserBookings />} />
                  <Route path="/dashboard/profile" element={<UserProfile />} />
                  <Route path="/dashboard/trip-plans/:id" element={<TripPlanDetails />} />
                  <Route path="/dashboard/trip-plans/:id/edit" element={<TripPlanEdit />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/profile/edit" element={<ProfileEdit />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/instructions" element={<Instructions />} />
                  <Route path="/faqs" element={<FAQs />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/budget" element={<BudgetTracker />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>

            </TooltipProvider>
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </>
  );
};

export default App;