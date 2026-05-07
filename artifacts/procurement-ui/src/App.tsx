import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Indents from "@/pages/indents";
import IndentNew from "@/pages/indent-new";
import IndentDetail from "@/pages/indent-detail";
import RateContracts from "@/pages/rate-contracts";
import RateContractNew from "@/pages/rate-contract-new";
import RateContractDetail from "@/pages/rate-contract-detail";
import PurchaseOrders from "@/pages/purchase-orders";
import PurchaseOrderNew from "@/pages/purchase-order-new";
import PurchaseOrderDetail from "@/pages/purchase-order-detail";
import Tenders from "@/pages/tenders";
import TenderDetail from "@/pages/tender-detail";
import TenderWorkbench from "@/pages/tender-workbench";
import Deliveries from "@/pages/deliveries";
import DeliveryDetail from "@/pages/delivery-detail";
import Vendors from "@/pages/vendors";
import VendorNew from "@/pages/vendor-new";
import VendorDetail from "@/pages/vendor-detail";
import Institutions from "@/pages/institutions";
import Equipment from "@/pages/equipment";
import Reports from "@/pages/reports";
import Budget from "@/pages/budget";
import ApprovalInbox from "@/pages/approval-inbox";
import GRN from "@/pages/grn";
import Invoices from "@/pages/invoices";
import Payments from "@/pages/payments";
import Consolidation from "@/pages/consolidation";
import ApprovalHierarchy from "@/pages/approval-hierarchy";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

function Router() {
  const [location] = useLocation();
  if (location === "/login") {
    return (
      <Switch>
        <Route path="/login" component={Login} />
      </Switch>
    );
  }
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/indents/new" component={IndentNew} />
        <Route path="/indents/:id" component={IndentDetail} />
        <Route path="/indents" component={Indents} />
        <Route path="/consolidation" component={Consolidation} />
        <Route path="/rate-contracts/new" component={RateContractNew} />
        <Route path="/rate-contracts/:id" component={RateContractDetail} />
        <Route path="/rate-contracts" component={RateContracts} />
        <Route path="/purchase-orders/new" component={PurchaseOrderNew} />
        <Route path="/purchase-orders/:id" component={PurchaseOrderDetail} />
        <Route path="/purchase-orders" component={PurchaseOrders} />
        <Route path="/tenders/workbench" component={TenderWorkbench} />
        <Route path="/tenders/:id" component={TenderDetail} />
        <Route path="/tenders" component={Tenders} />
        <Route path="/deliveries/:id" component={DeliveryDetail} />
        <Route path="/deliveries" component={Deliveries} />
        <Route path="/grn" component={GRN} />
        <Route path="/invoices" component={Invoices} />
        <Route path="/payments" component={Payments} />
        <Route path="/budget" component={Budget} />
        <Route path="/approval-inbox" component={ApprovalInbox} />
        <Route path="/vendors/new" component={VendorNew} />
        <Route path="/vendors/:id" component={VendorDetail} />
        <Route path="/vendors" component={Vendors} />
        <Route path="/institutions" component={Institutions} />
        <Route path="/equipment" component={Equipment} />
        <Route path="/reports" component={Reports} />
        <Route path="/approval-hierarchy" component={ApprovalHierarchy} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
