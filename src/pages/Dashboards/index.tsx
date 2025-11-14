import BreadCrumb from 'Common/BreadCrumb';
import React, { useEffect, useState } from 'react';

// Icons
import { axiosInstance } from 'lib/axios';
import { CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import Cashflow from './CashFlow';
import SalesMonth from './SalesMonth';
import TopSellingProducts from './TopSellingProducts';


const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("authUser")!);
  const [loadingV, setLoadingV] = useState(false);
  const [data, setData] = useState<any>();
  const naviagate = useNavigate();
  const [filter, setFilter] = useState<String>("yearly")

  const fetchDataDashboard = async () => {
    setLoadingV(true);
    try {

      let userResponse;

      if (user.data.user.role === "user") {
        userResponse = await axiosInstance.get("/dashboard", {
          headers: {
            Authorization: `Bearer ${user.data.token}`,
          },
        });
        console.log("🚀 ~ fetchDataDashboard ~ userResponse:", userResponse.data)
      } else {
        userResponse = await axiosInstance.get("/dashboard-admin", {
          headers: {
            Authorization: `Bearer ${user.data.token}`,
          },
          params: {
            filter: filter
          }
        });
        console.log("🚀 ~ fetchDataDashboard ~ userResponse:", userResponse.data)
      }
      setData(userResponse.data);
    } catch (error: any) {
      if (error.response.status === 401) {
        localStorage.removeItem("authUser");
        naviagate("/login");
      }
    } finally {
      setLoadingV(false);
    }
  };

  useEffect(() => {
    fetchDataDashboard();
  }, []);

  const [isLoading, setIsLoading] = useState(false);

  const handlePostAbsent = async (data: any) => {
    try {
      setIsLoading(true);

      // Ambil waktu UTC sekarang dan tambahkan offset WITA (8 jam)
      const now = new Date();
      const witaOffset = 8 * 60; // dalam menit
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const witaDate = new Date(utc + witaOffset * 60000);

      // Format manual waktu: YYYY-MM-DD HH:mm:ss
      const pad = (n: number): string => String(n).padStart(2, '0');
      const currentTime = `${witaDate.getFullYear()}-${pad(witaDate.getMonth() + 1)}-${pad(witaDate.getDate())} ${pad(witaDate.getHours())}:${pad(witaDate.getMinutes())}:${pad(witaDate.getSeconds())}`;

      // Format tanggal: YYYY-MM-DD
      const today = `${witaDate.getFullYear()}-${pad(witaDate.getMonth() + 1)}-${pad(witaDate.getDate())}`;

      const formData = new FormData();
      formData.append("employee_id", user.data.user.employee_id);
      formData.append("date", today);

      if (data?.attendance && data.attendance.check_in_time !== null && data.attendance.check_in_time !== undefined) {
        // Sudah check-in, lakukan check-out (PUT)
        formData.append("check_out_time", currentTime);
        formData.append("_method", "PUT");

        const userResponse = await axiosInstance.post(`/attendance/${data.attendance.attendance_id}`, formData, {
          headers: {
            Authorization: `Bearer ${user.data.token}`,
            "Content-Type": "multipart/form-data",
          },
        });

        if (userResponse.data.status === true) {
          Success("Absen Keluar Berhasil Ditambahkan");
          fetchDataDashboard();
        }
      } else {
        // Belum check-in, lakukan check-in (POST)
        formData.append("check_in_time", currentTime);

        const userResponse = await axiosInstance.post("/attendance", formData, {
          headers: {
            Authorization: `Bearer ${user.data.token}`,
            "Content-Type": "multipart/form-data",
          },
        });

        if (userResponse.data.status === true) {
          Success("Absen Masuk Berhasil Ditambahkan");
          fetchDataDashboard();
        }
      }
    } catch (error: any) {
      Error("Absen Gagal Ditambahkan");
      if (error.response.status === 401) {
        localStorage.removeItem("authUser");
        naviagate("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const Success = (title: string) =>
    toast.success(title, {
      autoClose: 3000,
      theme: "colored",
      icon: false,
      position: toast.POSITION.TOP_RIGHT,
      closeButton: false,
    });

  const Error = (title: string) =>
    toast.error(title, {
      autoClose: 3000,
      theme: "colored",
      icon: false,
      position: toast.POSITION.TOP_RIGHT,
      closeButton: false,
    });

  return (
    <React.Fragment>
      <BreadCrumb title={`Dashboard (${user.data.user.role})`} pageTitle='Dashboard' />
      <ToastContainer closeButton={false} limit={1} />
      {user.data.user.role === "user" && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-12">
          <div className="xl:col-span-3">
            <div className="card flex flex-col h-full justify-between">
              <div className="card-body flex items-center gap-4">
                <div className="flex items-center justify-center w-16 h-16 text-green-500 bg-green-100 rounded-md text-2xl dark:bg-green-500/20 shrink-0">
                  <CalendarDays />
                </div>
                <div className="flex-1">
                  <h5 className="mb-1 text-lg font-semibold">Abseni Hari Ini</h5>
                  <p className="text-slate-500 dark:text-zink-200 text-sm">Jam Masuk : {
                    loadingV ? "Loading..." : data?.attendance.check_in_time || ""
                  }</p>
                  <p className="text-slate-500 dark:text-zink-200 text-sm">Jam Keluar :
                    {loadingV ? "Loading..." : data?.attendance.check_out_time || ""}
                  </p>
                </div>
              </div>
              <div className="p-4 pt-0">
                <button
                  type="button"
                  disabled={loadingV || isLoading}
                  onClick={() => handlePostAbsent(data)}
                  id="addNew"
                  className="w-full text-white btn bg-custom-500 border-custom-500 hover:bg-custom-600 hover:border-custom-600 focus:ring focus:ring-custom-100 dark:ring-custom-400/20"
                >
                  Absen {
                    data?.attendance.check_in_time !== null
                      ? "Keluar"
                      : "Masuk"
                  }

                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {
        user.data.user.role === "admin" && (
          <div>
            <div className="">
              <TopSellingProducts data={data} />
              <SalesMonth data={data} />
            </div>

            <Cashflow data={data} />
          </div>
        )
      }
    </React.Fragment>
  );
};

export default Dashboard;
