import Home from "./routes/Home.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HostedCheckout from "./routes/HostedCheckout.tsx";
import Success from "./routes/Success.tsx";
import Failure from "./routes/Failure.tsx";
import IntegratedCheckout from "./routes/IntegratedCheckout.tsx";
import NewSubscription from "./components/NewSubscription.tsx";
import CancelSubscription from "./components/CancelSubscriptions.tsx";
import SubscriptionWithTrial from "./components/SubscriptionWithTrial.tsx";
import ViewInvoices from "./routes/ViewInvoices.tsx";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/hosted-checkout",
      element: <HostedCheckout />,
    },
    {
      path: "/integrated-checkout",
      element: <IntegratedCheckout />,
    },
    {
      path: "/new-subscription",
      element: <NewSubscription />,
    },
    {
      path: "/cancel-subscription",
      element: <CancelSubscription />,
    },
    {
        path: "/subscription-with-trial",
        element: <SubscriptionWithTrial />,
    },
    {
            path: "/view-invoices",
            element: <ViewInvoices />,
        },
    {
      path: "/success",
      element: <Success />,
    },
    {
      path: "/failure",
      element: <Failure />,
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
