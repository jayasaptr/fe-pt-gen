import { Navigate } from "react-router-dom";
export const GuestPage = (props: any) => {
  // get user from local storage
  const user = JSON.parse(localStorage.getItem("authUser")!);

  // cek apakah data user ada
  if (user != null && user.data.user.id) {
    // jika ada redirect ke dashboard
    return <Navigate to="/dashboard" />;
  }

  return props.children;
};
