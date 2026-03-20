import { createBrowserRouter, redirect } from "react-router";

function routerBasename(): string | undefined {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return base.length > 0 ? base : undefined;
}
import { Layout } from "./components/Layout";
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

const routes = [
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, loader: () => redirect("/dashboard") },
      { path: "dashboard", Component: Dashboard },
      {
        path: "users",
        children: [
          { index: true, Component: UsersList },
          { path: "new", Component: UserForm },
        ],
      },
      {
        path: "products",
        children: [
          { index: true, Component: ProductsList },
          { path: "new", Component: ProductForm },
          { path: ":id", Component: ProductDetail },
        ],
      },
      {
        path: "agreements",
        children: [
          { index: true, Component: AgreementsList },
          { path: ":id", Component: AgreementDetail },
        ],
      },
      { path: "profile", Component: Profile },
      { path: "reports", Component: Reports },
    ],
  },
];

const basename = routerBasename();
export const router = createBrowserRouter(
  routes,
  basename ? { basename } : {},
);