import React, { useRef, useState } from "react";
import BreadCrumb from "Common/BreadCrumb";
import Layout from "Layout";
import { column } from "pages/Components/Table/ReactTable";
import TableContainer from "Common/TableContainer";
import { basic } from "Common/data";
import { axiosInstance } from "lib/axios";
import { useNavigate } from "react-router-dom";
import Flatpickr from "react-flatpickr";
import ReportPrint from "./print/ReportPrint";
import ReactToPrint, { useReactToPrint } from "react-to-print";
import { Printer, Search } from "lucide-react";
import ReportPrintDetail from "./print/ReportPrintDetail";

const ReportPenjualan = () => {
    const [showDateFilter, setShowDateFilter] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState<any>(null);

    const handleDetailPrint = useReactToPrint({
        content: () => printRefDetail.current,
        onAfterPrint: () => {
            console.log("Print completed");
        },
        onBeforeGetContent: () => {
            console.log("Preparing to print detail");
        },
    });



    const columns: column[] = React.useMemo(
        () => [
            // no
            {
                header: "No",
                accessorKey: "no",
                enableColumnFilter: false,
                enableSorting: false,
                cell: (info: any) => info.row.index + 1,
            },
            {
                header: "Customer",
                accessorKey: "customer",
                enableColumnFilter: false,
                enableSorting: true,
            },
            {
                header: "Tanggal",
                accessorKey: "date",
                enableColumnFilter: false,
                enableSorting: true,
            },
            {
                header: "Total Harga",
                accessorKey: "total",
                enableColumnFilter: false,
                enableSorting: true,
            },
            {
                header: () => <span className="action-column">Action</span>,
                accessorKey: "action",
                enableColumnFilter: false,
                enableSorting: true,
                cell: (cell: any) => (
                    <div className="flex gap-3 action-column">
                        {/* action print */}
                        {/* <ReactToPrint
                            trigger={() => (
                                <button
                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-2 rounded"
                                    title="Print"
                                    onClick={() => {
                                        console.log("cell.row.original", cell.row.original)
                                        setSelectedDetail(cell.row.original)
                                    }}
                                >
                                    <Printer />
                                </button>
                            )}
                            content={() => printRefDetail.current}
                        /> */}
                        <button
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-2 rounded"
                            title="Print"
                            onClick={() => {
                                console.log("cell.row.original", cell.row.original)
                                setSelectedDetail(cell.row.original);
                                setTimeout(() => {
                                    handleDetailPrint();
                                }, 100);
                            }}
                        >
                            <Printer />
                        </button>
                    </div>
                ),
            },
        ],
        []
    );

    const [dataDetail, setDataDetail] = useState([]);

    const columnsDetail: column[] = React.useMemo(
        () => [
            // no
            {
                header: "No",
                accessorKey: "no",
                enableColumnFilter: false,
                enableSorting: false,
                cell: (info: any) => info.row.index + 1,
            },
            {
                header: "Supplier",
                accessorKey: "supplier",
                enableColumnFilter: false,
                enableSorting: true,
            },
            {
                header: "Tanggal",
                accessorKey: "date",
                enableColumnFilter: false,
                enableSorting: true,
            },
            {
                header: "Total Harga",
                accessorKey: "total",
                enableColumnFilter: false,
                enableSorting: true,
            },
            {
                header: () => <span className="action-column">Action</span>,
                accessorKey: "action",
                enableColumnFilter: false,
                enableSorting: true,
                cell: (cell: any) => (
                    <div className="flex gap-3 action-column">
                        {/* action print */}
                        <ReactToPrint
                            trigger={() => (
                                <button
                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-2 rounded"
                                    title="Print"
                                    onClick={() => {

                                        console.log("cell.row.original", cell.row.original)
                                        setDataDetail(cell.row.original)
                                    }}
                                >
                                    <Printer />
                                </button>
                            )}
                            content={() => printRefDetail.current}
                        />
                    </div>
                ),
            },
        ],
        []
    );



    const user = JSON.parse(localStorage.getItem("authUser")!);

    const naviagate = useNavigate();

    const [date, setDate] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [search, setSearch] = useState("");
    const [data, setData] = useState([]);

    const [loadingV, setLoadingV] = useState(false);

    const [idKondisi, setIdKondisi] = useState<any>("");

    const fetchDataBarangMasuk = async () => {
        setLoadingV(true);
        try {
            const userResponse = await axiosInstance.get("/report/penjualan", {
                headers: {
                    Authorization: `Bearer ${user.data.token}`,
                },
                params: {
                    // start_date: startDate,
                    // end_date: endDate,
                    // status: idKondisi,
                    // category: "barang",
                    search: search
                },
            });
            const normalizedData = userResponse.data.data.map((row: any) => ({
                ...row,
                items: Array.isArray(row.items) ? row.items : Object.values(row.items)
            }));
            console.log("normalizedData", normalizedData);
            setData(userResponse.data.data);
            setDataDetail(normalizedData);
        } catch (error: any) {
            if (error.response.status === 401) {
                localStorage.removeItem("authUser");
                naviagate("/login");
            }
        } finally {
            setLoadingV(false);
        }
    };

    const printRef = useRef<HTMLDivElement>(null);
    const printRefDetail = useRef<HTMLDivElement>(null);

    const loadingView = (
        <div className="flex flex-wrap items-center gap-5 px-3 py-2 justify-center">
            <div className="inline-block size-8 border-2 border-green-500 rounded-full animate-spin border-l-transparent"></div>
        </div>
    );

    React.useEffect(() => {
        fetchDataBarangMasuk();
    }, [search]);

    return (
        <>
            <BreadCrumb
                title="Report Penjualan"
                pageTitle="Report Penjualan"
            />
            <div className="card">
                <div className="card-body">
                    <div className="flex gap-2 mb-4 justify-end">
                        {/* <select
              id="id_category"
              className="form-select border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200"
              name="id_category"
              onChange={(e) => {
                setIdKondisi(e.target.value);
              }}
              value={idKondisi || ""} // set default value
            >
              <option value="">Semua Status</option>
              <option value="proses">Pending</option>
              <option value="disetuji">Approve</option>
            </select> */}
                        <div className="relative">
                            {/* <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => setShowDateFilter(!showDateFilter)}
              >
                Pilih Tanggal
              </button> */}

                            {/* <div className="flex flex-row gap-2">
                <Flatpickr
                  options={{
                    dateFormat: "Y-m-d",
                  }}
                  placeholder="Start Date"
                  onChange={(date) =>
                    setStartDate(date[0].toISOString().split("T")[0])
                  }
                  className="form-input border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200"
                />
                <Flatpickr
                  options={{
                    dateFormat: "Y-m-d",
                  }}
                  placeholder="End Date"
                  onChange={(date) =>
                    setEndDate(date[0].toISOString().split("T")[0])
                  }
                  className="form-input border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200"
                />
              </div> */}
                            {/* {showDateFilter && (
                <div className="absolute mt-2 w-48 bg-white border border-gray-300 rounded shadow-lg p-2">
                  <input
                    type="date"
                    className="w-full p-2 border border-gray-300 rounded"
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
              )} */}
                            <div className="relative grow">
                                <input type="text" className="ltr:pl-8 rtl:pr-8 search form-input border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200" placeholder="Search for ..." autoComplete="off" onChange={(e) => setSearch(e.target.value)} />
                                <Search className="inline-block size-4 absolute ltr:left-2.5 rtl:right-2.5 top-2.5 text-slate-500 dark:text-zink-200 fill-slate-100 dark:fill-zink-600"></Search>
                            </div>
                        </div>
                        <ReactToPrint
                            trigger={() => (
                                <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-6 rounded">
                                    Print
                                </button>
                            )}
                            content={() => printRef.current}
                        />
                    </div>
                    {loadingV ? (
                        loadingView
                    ) : (
                        <TableContainer
                            isPagination={true}
                            isTfoot={true}
                            isSelect={false}
                            isGlobalFilter={false}
                            columns={columns || []}
                            data={
                                data.map((item: any) => {
                                    return {
                                        ...item,
                                        jumlah: item.jumlah,
                                        harga: item.harga,
                                        total_harga: item.jumlah * item.harga,
                                    };
                                }) || []
                            }
                            customPageSize={10}
                            divclassName="my-2 col-span-12 overflow-x-auto lg:col-span-12"
                            tableclassName="display dataTable w-full text-sm align-middle whitespace-nowrap"
                            theadclassName="border-b border-slate-200 dark:border-zink-500"
                            trclassName="group-[.stripe]:even:bg-slate-50 group-[.stripe]:dark:even:bg-zink-600 transition-all duration-150 ease-linear group-[.hover]:hover:bg-slate-50 dark:group-[.hover]:hover:bg-zink-600 [&.selected]:bg-custom-500 dark:[&.selected]:bg-custom-500 [&.selected]:text-custom-50 dark:[&.selected]:text-custom-50"
                            thclassName="p-3 group-[.bordered]:border group-[.bordered]:border-slate-200 group-[.bordered]:dark:border-zink-500 sorting px-3 py-4 text-slate-900 bg-slate-200/50 font-semibold text-left dark:text-zink-50 dark:bg-zink-600 dark:group-[.bordered]:border-zink-500"
                            tdclassName="p-3 group-[.bordered]:border group-[.bordered]:border-slate-200 group-[.bordered]:dark:border-zink-500"
                            PaginationClassName="flex flex-col items-center mt-5 md:flex-row"
                        />
                    )}
                </div>
            </div>

            <div style={{ display: "none" }}>
                <ReportPrint ref={printRef} title="Report Penjualan">
                    <TableContainer
                        isPagination={false}
                        isTfoot={false}
                        isSelect={false}
                        isGlobalFilter={false}
                        columns={columns || []}
                        data={
                            data.map((item: any) => {
                                return {
                                    ...item,
                                    jumlah: item.jumlah,
                                    harga: item.harga,
                                    total_harga: item.jumlah * item.harga,
                                };
                            }) || []
                        }
                        divclassName="my-2 col-span-12 overflow-x-auto lg:col-span-12 border border-gray-300"
                        tableclassName="display dataTable w-full text-sm align-middle whitespace-nowrap"
                        theadclassName="border-b border-slate-200 dark:border-zink-500"
                        trclassName="group-[.stripe]:even:bg-slate-50 group-[.stripe]:dark:even:bg-zink-600 transition-all duration-150 ease-linear group-[.hover]:hover:bg-slate-50 dark:group-[.hover]:hover:bg-zink-600 [&.selected]:bg-custom-500 dark:[&.selected]:bg-custom-500 [&.selected]:text-custom-50 dark:[&.selected]:text-custom-50"
                        thclassName="p-3 group-[.bordered]:border group-[.bordered]:border-slate-200 group-[.bordered]:dark:border-zink-500 sorting px-3 py-4 text-slate-900 bg-slate-200/50 font-semibold text-left dark:text-zink-50 dark:bg-zink-600 dark:group-[.bordered]:border-zink-500"
                        tdclassName="p-3 group-[.bordered]:border group-[.bordered]:border-slate-200 group-[.bordered]:dark:border-zink-500"
                        PaginationClassName="flex flex-col items-center mt-5 md:flex-row"
                    />
                </ReportPrint>
                <ReportPrintDetail ref={printRefDetail} title="Report Penjualan Detail">
                    <div className="my-4 border-b py-2">
                        <div className="flex justify-between">
                            <div>
                                <p><strong>Customer:</strong> {selectedDetail?.customer || ''}</p>
                                <p><strong>Tanggal:</strong> {selectedDetail?.date || ''}</p>
                            </div>
                            <div>
                                <p><strong>Total Pembelian:</strong> {selectedDetail?.total || ''}</p>
                            </div>
                        </div>
                    </div>
                    <TableContainer
                        isPagination={false}
                        isTfoot={false}
                        isSelect={false}
                        isGlobalFilter={false}

                        columns={[
                            {
                                header: "No",
                                accessorKey: "no",
                                accessorFn: (row: any, index: number) => index + 1, // Gunakan accessorFn
                                cell: (info: any) => info.getValue(), // Ambil nilai dari accessorFn
                                enableSorting: true,
                                enableColumnFilter: false,
                            },
                            {
                                header: "Nama Produk",
                                accessorKey: "product_name",
                                enableSorting: true,
                                enableColumnFilter: false,
                            },
                            {
                                header: "Jumlah",
                                accessorKey: "quantity",
                                enableSorting: true,
                                enableColumnFilter: false,
                            },
                            {
                                header: "Harga",
                                accessorKey: "price",
                                enableSorting: true,
                                enableColumnFilter: false,
                            },
                            {
                                header: "Total",
                                accessorKey: "subtotal",
                                enableSorting: true,
                                enableColumnFilter: false,
                            },
                        ]}
                        data={selectedDetail?.items || []}
                        divclassName="my-2 col-span-12 overflow-x-auto lg:col-span-12 border border-gray-300"
                        tableclassName="display dataTable w-full text-sm align-middle whitespace-nowrap"
                        theadclassName="border-b border-slate-200 dark:border-zink-500"
                        trclassName="group-[.stripe]:even:bg-slate-50 group-[.stripe]:dark:even:bg-zink-600 transition-all duration-150 ease-linear group-[.hover]:hover:bg-slate-50 dark:group-[.hover]:hover:bg-zink-600 [&.selected]:bg-custom-500 dark:[&.selected]:bg-custom-500 [&.selected]:text-custom-50 dark:[&.selected]:text-custom-50"
                        thclassName="p-3 group-[.bordered]:border group-[.bordered]:border-slate-200 group-[.bordered]:dark:border-zink-500 sorting px-3 py-4 text-slate-900 bg-slate-200/50 font-semibold text-left dark:text-zink-50 dark:bg-zink-600 dark:group-[.bordered]:border-zink-500"
                        tdclassName="p-3 group-[.bordered]:border group-[.bordered]:border-slate-200 group-[.bordered]:dark:border-zink-500"
                        PaginationClassName="flex flex-col items-center mt-5 md:flex-row"
                    />

                </ReportPrintDetail>
            </div>
        </>
    );
};

export default ReportPenjualan;
