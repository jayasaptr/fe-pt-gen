// dashboard

import UserProfile from "pages/Authentication/UserProfile";
import Login from "pages/Authentication/Login";
import Logout from "pages/Authentication/LogOut";
import Register from "pages/Authentication/Register";
import MasterBarang from "pages/MasterBarang";
import MasterUser from "pages/MasterUser";
import ReportPerbaikanBarang from "report/ReportPemasok";
import ReportPelanggan from "report/ReportPelanggan";
import ReportMutasiBarang from "report/ReportMutasiBarang";
import ReportStokBarangTersedia from "report/ReportStokBarangTersedia";
import ReportStokBarangHabis from "report/ReportStokBarangHabis";
import CategoryBarang from "pages/CategoryBarang";
import Supplier from "pages/Supplier";
import Customer from "pages/Customer";
import PurchasePage from "pages/Purchase";
import PurchaseItemPage from "pages/Purchase/PurchaseItem";
import SalesPage from "pages/Sales";
import SalesItemPage from "pages/Sales/SalesItem";
import Employee from "pages/Employee";
import Attendance from "pages/Attendance";
import Payroll from "pages/Payroll";
import Dashboard from "pages/Dashboards/Ecommerce";

interface RouteObject {
  path: string;
  component: React.ComponentType<any>; // Use React.ComponentType to specify the type of the component
  exact?: boolean;
}

const authProtectedRoutes: Array<RouteObject> = [
  // Dashboard
  { path: "/", component: Dashboard },
  { path: "/dashboard", component: Dashboard },

  // profile
  { path: "/user-profile", component: UserProfile },
  { path: "/master-user", component: MasterUser },
  { path: "/kategori-barang", component: CategoryBarang },
  { path: "/master-barang", component: MasterBarang },
  { path: "/supplier", component: Supplier },
  { path: "/customer", component: Customer },
  { path: "/purchase", component: PurchasePage },
  { path: "/purchase/:id/purchase-item", component: PurchaseItemPage },
  { path: "/sales", component: SalesPage },
  { path: "/sales/:id/sales-item", component: SalesItemPage },
  { path: "/employee", component: Employee },
  { path: "/attendance", component: Attendance },
  { path: "/payroll", component: Payroll },
  { path: "/report-pemasok", component: ReportPerbaikanBarang },
  { path: "/report-pelanggan", component: ReportPelanggan },
  { path: "/report-mutasi", component: ReportMutasiBarang },
  { path: "/report-barang-tersedia", component: ReportStokBarangTersedia },
  { path: "/report-barang-habis", component: ReportStokBarangHabis },
];

const publicRoutes = [
  // authentication
  { path: "/login", component: Login },
  { path: "/logout", component: Logout },
  { path: "/register", component: Register },
];

export { authProtectedRoutes, publicRoutes };
