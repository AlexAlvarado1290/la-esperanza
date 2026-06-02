import { createBrowserRouter, redirect } from "react-router";

function routerBasename(): string | undefined {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return base.length > 0 ? base : undefined;
}
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { UsersList } from "./pages/Users";
import { UserForm } from "./pages/UserForm";
import { ProductsList } from "./pages/Products";
import { ProductForm } from "./pages/ProductForm";
import { ProductDetail } from "./pages/ProductDetail";
import { AgreementsList } from "./pages/Agreements";
import { AgreementDetail } from "./pages/AgreementDetail";
import { Profile } from "./pages/Profile";
import { Reports } from "./pages/Reports";
import { CategoriesList } from "./pages/Categories";
import { UnitsList } from "./pages/Units";
import { DeliveryPointsList } from "./pages/DeliveryPoints";
import { SalesHistory } from "./pages/SalesHistory";

// ProtectedRoute permite invitados (RF02) sólo para el catálogo público.
// Las páginas internas que necesiten rol específico (Users, Categories…)
// usan internamente useRole para mostrar el contenido apropiado.

const routes = [
  { path: "/login", Component: Login },
  {
    element: <ProtectedRoute allowGuest />,
    children: [
      {
        path: "/",
        Component: Layout,
        children: [
          { index: true, loader: () => redirect("/dashboard") },
          { path: "dashboard", Component: Dashboard },
          { path: "profile", Component: Profile },
          {
            path: "products",
            children: [
              { index: true, Component: ProductsList },
              { path: "new", Component: ProductForm },
              { path: ":id", Component: ProductDetail },
              { path: ":id/edit", Component: ProductForm },
            ],
          },
          {
            path: "agreements",
            children: [
              { index: true, Component: AgreementsList },
              { path: ":id", Component: AgreementDetail },
            ],
          },
          { path: "reports", Component: Reports },
          { path: "sales-history", Component: SalesHistory },
          {
            path: "users",
            children: [
              { index: true, Component: UsersList },
              { path: "new", Component: UserForm },
            ],
          },
          { path: "categories", Component: CategoriesList },
          { path: "units", Component: UnitsList },
          { path: "delivery-points", Component: DeliveryPointsList },
        ],
      },
    ],
  },
];

const basename = routerBasename();
export const router = createBrowserRouter(
  routes,
  basename ? { basename } : {},
);
