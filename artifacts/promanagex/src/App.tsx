import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout/Layout";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import UsersPage from "@/pages/users";
import Contractors from "@/pages/contractors";
import Contracts from "@/pages/contracts";
import Attendance from "@/pages/attendance";
import Evaluations from "@/pages/evaluations";
import Violations from "@/pages/violations";
import WorkAreas from "@/pages/work-areas";
import Equipment from "@/pages/equipment";
import Notifications from "@/pages/notifications";
import Reports from "@/pages/reports";
import AuditLogs from "@/pages/audit-logs";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/users" component={UsersPage} />
        <Route path="/contractors" component={Contractors} />
        <Route path="/contracts" component={Contracts} />
        <Route path="/attendance" component={Attendance} />
        <Route path="/evaluations" component={Evaluations} />
        <Route path="/violations" component={Violations} />
        <Route path="/work-areas" component={WorkAreas} />
        <Route path="/equipment" component={Equipment} />
        <Route path="/notifications" component={Notifications} />
        <Route path="/reports" component={Reports} />
        <Route path="/audit-logs" component={AuditLogs} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
