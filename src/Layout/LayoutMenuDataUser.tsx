import {
    BookUser,
    Box,
    BoxesIcon,
    Briefcase,
    CalendarCheck,
    ClipboardEditIcon,
    Contact,
    Container,
    CreditCard,
    LucideBox,
    Mail,
    MessageSquare,
    MonitorDot,
    Package,
    PackageCheckIcon,
    PackageMinusIcon,
    PictureInPicture2,
    PieChart,
    ReceiptText,
    ShoppingCart,
    Tag,
    Truck,
    User,
    UserMinus2,
    UserPlus2Icon,
    Warehouse,
} from "lucide-react";

const menuDataUser: any = [
    {
        label: "menu",
        isTitle: true,
    },
    {
        id: "dashboard",
        label: "Dashboards",
        link: "/#",
        icon: <MonitorDot />,
    },
    {
        label: "Employee",
        isTitle: true,
    },
    {
        id: "Attendance",
        label: "Attendance",
        icon: <CalendarCheck />,
        link: "/attendance",
        parentId: 2,
    },
    {
        label: "Payroll",
        isTitle: true,
    },
    {
        id: "Payroll",
        label: "Payroll",
        icon: <CreditCard />,
        link: "/payroll",
        parentId: 1,
    },

];

export { menuDataUser };
