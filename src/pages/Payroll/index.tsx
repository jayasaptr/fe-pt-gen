import BreadCrumb from "Common/BreadCrumb";
import DeleteModal from "Common/DeleteModal";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import {
    CheckCircle,
    ImagePlus,
    LucidePrinter,
    Pencil,
    Plus,
    Search,
    Trash2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
// Formik
import * as Yup from "yup";
import { useFormik } from "formik";
import TableContainer from "Common/TableContainer";
import Modal from "Common/Components/Modal";
import { axiosInstance } from "lib/axios";

const Payroll = () => {
    const [data, setData] = useState<any>([]);
    const [eventData, setEventData] = useState<any>();

    const [show, setShow] = useState<boolean>(false);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Delete Modal
    const [deleteModal, setDeleteModal] = useState<boolean>(false);
    const deleteToggle = () => setDeleteModal(!deleteModal);

    // Delete Data
    const onClickDelete = (cell: any) => {
        setDeleteModal(true);
        if (cell.id) {
            setEventData(cell);
        }
    };

    const handleDelete = () => {
        if (eventData) {
            handleDeleteSuratMasuk(eventData.id);
            setDeleteModal(false);
        }
    };
    //

    // Update Data
    const handleUpdateDataClick = (ele: any) => {
        setEventData({ ...ele });
        setIsEdit(true);
        setShow(true);
    };

    // validation
    const validation: any = useFormik({
        // enableReinitialize : use this flag when initial values needs to be changed
        enableReinitialize: true,

        initialValues: {
            id: (eventData && eventData.id) || "",
            employee_id: (eventData && eventData.employee_id) || "",
            pay_period: (eventData && eventData.pay_period) || "",
            basic_salary: (eventData && eventData.basic_salary) || "",
            deductions: (eventData && eventData.deductions) || "",
            bonuses: (eventData && eventData.bonuses) || "",
            paid_at: (eventData && eventData.paid_at) || "",
        },
        validationSchema: Yup.object({
            employee_id: Yup.string().required("Employee ID is required"),
            pay_period: Yup.string().required("Pay Period is required"),
            basic_salary: Yup.number()
                .typeError("Basic Salary must be a number")
                .required("Basic Salary is required"),
            deductions: Yup.number()
                .typeError("Deductions must be a number")
                .required("Deductions is required"),
            bonuses: Yup.number()
                .typeError("Bonuses must be a number")
                .required("Bonuses is required"),
            paid_at: Yup.date().required("Paid At is required"),
        }),

        onSubmit: (values) => {
            if (isEdit) {
                handleUpdateSuratMasuk(values);
            } else {
                handlePostPayroll(values);
            }
            if (isLoading) {
                toggle();
            }
        },
    });

    //
    const toggle = useCallback(() => {
        if (show) {
            setShow(false);
            setEventData("");
            setIsEdit(false);
        } else {
            setShow(true);
            setEventData("");
            validation.resetForm();
        }
    }, [show, validation]);

    const printRef = useRef<HTMLDivElement>(null);

    const [dataEmployee, setDataEmployee] = useState<any>([]);

    const fetchDataEmployee = async () => {
        setLoadingV(true);
        try {
            const userResponse = await axiosInstance.get("/employee", {
                headers: {
                    Authorization: `Bearer ${user.data.token}`,
                },
            });
            setDataEmployee(userResponse.data.data.data);
        } catch (error: any) {
            if (error.response.status === 401) {
                localStorage.removeItem("authUser");
                naviagate("/login");
            }
        } finally {
            setLoadingV(false);
        }
    };

    // columns
    const columns = useMemo(
        () => [
            {
                header: "No",
                accessorKey: "no",
                enableColumnFilter: false,
            },
            {
                header: "Nama",
                accessorKey: "employee_id.name",
                enableColumnFilter: false,
            },
            {
                header: "Basic Salary",
                accessorKey: "basic_salary",
                enableColumnFilter: false,
            },
            {
                header: "Potongan",
                accessorKey: "deductions",
                enableColumnFilter: false,
            },
            {
                header: "Bonus",
                accessorKey: "bonuses",
                enableColumnFilter: false,
            },
            {
                header: "Total Pembayaran",
                accessorKey: "total_paid",
                enableColumnFilter: false,
            },
            {
                header: "Status",
                accessorKey: "status",
                enableColumnFilter: false,
            },
            {
                header: "Action",
                enableColumnFilter: false,
                enableSorting: true,
                cell: (cell: any) => (
                    <div className="flex gap-2">
                        {/* <Link
                            to="#!"
                            className="flex items-center justify-center size-8 transition-all duration-200 ease-linear rounded-md edit-item-btn bg-slate-100 text-slate-500 hover:text-custom-500 hover:bg-custom-100 dark:bg-zink-600 dark:text-zink-200 dark:hover:bg-custom-500/20 dark:hover:text-custom-500"
                            onClick={() => {
                                const data = cell.row.original;

                                handleUpdateDataClick(data);
                            }}
                        >
                            <Pencil className="size-4" />
                        </Link> */}
                        <Link
                            to="#!"
                            className="flex items-center justify-center size-8 transition-all duration-200 ease-linear rounded-md remove-item-btn bg-slate-100 text-slate-500 hover:text-custom-500 hover:bg-custom-100 dark:bg-zink-600 dark:text-zink-200 dark:hover:bg-custom-500/20 dark:hover:text-custom-500"
                            onClick={() => {
                                const data = cell.row.original;
                                onClickDelete(data);
                            }}
                        >
                            <Trash2 className="size-4" />
                        </Link>
                    </div>
                ),
            },
        ],
        []
    );

    const user = JSON.parse(localStorage.getItem("authUser")!);

    const naviagate = useNavigate();

    const fetchDataPayroll = async () => {
        setLoadingV(true);
        try {
            const userResponse = await axiosInstance.get("/payroll", {
                headers: {
                    Authorization: `Bearer ${user.data.token}`,
                },
            });
            setData(userResponse.data.data.data);
        } catch (error: any) {
            if (error.response.status === 401) {
                localStorage.removeItem("authUser");
                naviagate("/login");
            }
        } finally {
            setLoadingV(false);
        }
    };

    const handlePostPayroll = async (data: any) => {
        try {
            setIsLoading(true);
            const formData = new FormData();
            formData.append("employee_id", data.employee_id);
            formData.append("pay_period", data.pay_period);
            formData.append("basic_salary", data.basic_salary);
            formData.append("deductions", data.deductions);
            formData.append("bonuses", data.bonuses);
            formData.append("status", data.status);
            formData.append("paid_at", data.paid_at);
            if (user.data.user.role === "admin") {
                formData.append("status", "paid");
            } else {
                formData.append("status", "unpaid");
            }

            const userResponse = await axiosInstance.post("/payroll", formData, {
                headers: {
                    Authorization: `Bearer ${user.data.token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            if (userResponse.data.success === true) {
                Success("Data  Payroll Berhasil Ditambahkan");
                fetchDataPayroll();
                toggle();
            }
        } catch (error: any) {
            Error("Data  Payroll Gagal Ditambahkan");
            if (error.response.status === 401) {
                localStorage.removeItem("authUser");
                naviagate("/login");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateSuratMasuk = async (data: any) => {
        try {
            setIsLoading(true);
            const formData = new FormData();
            formData.append("employee_id", data.employee_id);
            formData.append("pay_period", data.pay_period);
            formData.append("basic_salary", data.basic_salary);
            formData.append("deductions", data.deductions);
            formData.append("bonuses", data.bonuses);
            formData.append("status", data.status);
            formData.append("paid_at", data.paid_at);
            formData.append("_method", "PUT");

            const userResponse = await axiosInstance.post(
                `/payroll/${data.id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${user.data.token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (userResponse.data.success === true) {
                Success("Data  Payroll Berhasil Diupdate");
                fetchDataPayroll();
                toggle();
            }
        } catch (error: any) {
            Error("Data Payroll Masuk Gagal Diupdate");
            if (error.response.status === 401) {
                localStorage.removeItem("authUser");
                naviagate("/login");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteSuratMasuk = async (id: any) => {
        try {
            setIsLoading(true);
            const userResponse = await axiosInstance.delete(`/payroll/${id}`, {
                headers: { Authorization: `Bearer ${user.data.token}` },
            });

            if (userResponse.data.status === true) {
                Success("Data  Payroll Berhasil Dihapus");
                fetchDataPayroll();
            }
        } catch (error: any) {
            Error("Data Payroll Masuk Gagal Dihapus");
            if (error.response.status === 401) {
                localStorage.removeItem("authUser");
                naviagate("/login");
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDataPayroll();
        fetchDataEmployee();
    }, []);

    const [loadingV, setLoadingV] = useState(false);

    const loadingView = (
        <div className="flex flex-wrap items-center gap-5 px-3 py-2 justify-center">
            <div className="inline-block size-8 border-2 border-green-500 rounded-full animate-spin border-l-transparent"></div>
        </div>
    );

    // const Success = (title: string) =>
    // toast.success(title, {
    //   autoClose: 3000,
    //   theme: "colored",
    //   icon: false,
    //   position: toast.POSITION.TOP_RIGHT,
    //   closeButton: false,
    // });
    const Success = (title?: string) =>
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
        <>
            <BreadCrumb title=" Payroll" pageTitle=" Payroll" />
            <DeleteModal
                show={deleteModal}
                onHide={deleteToggle}
                onDelete={handleDelete}
            />
            <ToastContainer closeButton={false} limit={1} />

            <DeleteModal
                show={deleteModal}
                onHide={deleteToggle}
                onDelete={handleDelete}
            />
            <ToastContainer closeButton={false} limit={1} />
            <div className="card" id="PayrollTable">
                <div className="card-body">
                    <div className="flex items-center gap-3 mb-4">
                        <h6 className="text-15 grow">
                            Payroll (<b className="total-Employs">{data.length}</b>)
                        </h6>
                        <div className="shrink-0">
                            <Link
                                to="#!"
                                data-modal-target="addPayrollModal"
                                type="button"
                                className="text-white btn bg-custom-500 border-custom-500 hover:text-white hover:bg-custom-600 hover:border-custom-600 focus:text-white focus:bg-custom-600 focus:border-custom-600 focus:ring focus:ring-custom-100 active:text-white active:bg-custom-600 active:border-custom-600 active:ring active:ring-custom-100 dark:ring-custom-400/20 add-Payroll"
                                onClick={toggle}
                            >
                                <Plus className="inline-block size-4" />{" "}
                                <span className="align-middle">Add  Payroll</span>
                            </Link>
                        </div>
                    </div>
                    {data && data.length > 0 ? (
                        // for no get from 1 index
                        (data.map((item: any, index: number) => {
                            item.no = index + 1;
                            item.total_harga = item.jumlah * item.harga;
                            return item;
                        }),
                            (
                                <TableContainer
                                    isPagination={true}
                                    columns={columns || []}
                                    data={data || []}
                                    customPageSize={5}
                                    divclassName="-mx-5 overflow-x-auto"
                                    tableclassName="w-full table-fixed"
                                    theadclassName="ltr:text-left rtl:text-right bg-slate-100 dark:bg-zink-600"
                                    thclassName="px-3.5 py-2.5 first:pl-5 last:pr-5 font-semibold border-b border-slate-200 dark:border-zink-500"
                                    tdclassName="px-3.5 py-2.5 first:pl-5 last:pr-5 border-y border-slate-200 dark:border-zink-500 overflow-hidden text-ellipsis whitespace-nowrap"
                                    PaginationClassName="flex flex-col items-center gap-4 px-4 mt-4 md:flex-row"
                                />
                            ))
                    ) : loadingV ? (
                        loadingView
                    ) : (
                        <div className="noresult">
                            <div className="py-6 text-center">
                                <Search className="size-6 mx-auto text-sky-500 fill-sky-100 dark:sky-500/20" />
                                <h5 className="mt-2 mb-1">Sorry! No Result Found</h5>
                                <p className="mb-0 text-slate-500 dark:text-zink-200">
                                    No results found. Please try a different search.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Payroll Modal */}
            <Modal
                show={show}
                onHide={toggle}
                modal-center="true"
                className="fixed flex flex-col transition-all duration-300 ease-in-out left-2/4 z-drawer -translate-x-2/4 -translate-y-2/4"
                dialogClassName="w-screen md:w-[30rem] bg-white shadow rounded-md dark:bg-zink-600"
            >
                <Modal.Header
                    className="flex items-center justify-between p-4 border-b dark:border-zink-500"
                    closeButtonClass="transition-all duration-200 ease-linear text-slate-400 hover:text-red-500"
                >
                    <Modal.Title className="text-16">
                        {!!isEdit ? "Edit  Payroll" : "Add  Payroll"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="max-h-[calc(theme('height.screen')_-_180px)] p-4 overflow-y-auto">
                    <form
                        className="create-form"
                        id="create-form"
                        encType="multipart/form-data"
                        onSubmit={(e) => {
                            e.preventDefault();
                            validation.handleSubmit();
                            return false;
                        }}
                    >
                        <input type="hidden" value="" name="id" id="id" />
                        <input type="hidden" value="add" name="action" id="action" />
                        <input type="hidden" id="id-field" />
                        <div
                            id="alert-error-msg"
                            className="hidden px-4 py-3 text-sm text-red-500 border border-transparent rounded-md bg-red-50 dark:bg-red-500/20"
                        ></div>
                        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                            <div className="xl:col-span-12">
                                <label
                                    htmlFor="employee_id"
                                    className="inline-block mb-2 text-base font-medium"
                                >
                                    Employee
                                </label>
                                <select
                                    id="employee_id"
                                    className="form-select border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200"
                                    name="employee_id"
                                    onChange={(e) => {
                                        validation.handleChange(e);
                                        validation.setFieldValue("employee_id", e.target.value);
                                        validation.setFieldValue("basic_salary", dataEmployee.find((emp: any) => String(emp.id) === e.target.value)?.salary || "");
                                    }}
                                    onBlur={validation.handleBlur}
                                    value={
                                        validation.values.employee_id ||
                                        (eventData && eventData.employee_id) ||
                                        ""
                                    }
                                >
                                    <option value="">Pilih Employee</option>
                                    {dataEmployee.map((item: any, index: number) => (
                                        <option key={index} value={item.id}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                                {validation.touched.employee_id && validation.errors.employee_id ? (
                                    <p className="text-red-400">{validation.errors.employee_id}</p>
                                ) : null}
                            </div>
                            <div className="xl:col-span-12">
                                <label
                                    htmlFor="basic_salary"
                                    className="inline-block mb-2 text-base font-medium"
                                >
                                    Basic Salary
                                </label>
                                <input
                                    type="number"
                                    id="basic_salary"
                                    className="form-input border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200"
                                    placeholder="Basic Salary"
                                    name="basic_salary"
                                    onChange={validation.handleChange}
                                    value={validation.values.basic_salary || ""}
                                />
                                {validation.touched.basic_salary && validation.errors.basic_salary ? (
                                    <p className="text-red-400">{validation.errors.basic_salary}</p>
                                ) : null}
                            </div>
                            <div className="xl:col-span-12">
                                <label
                                    htmlFor="deductions"
                                    className="inline-block mb-2 text-base font-medium"
                                >
                                    Potongan
                                </label>
                                <input
                                    type="number"
                                    id="deductions"
                                    className="form-input border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200"
                                    placeholder="Potongan"
                                    name="deductions"
                                    onChange={validation.handleChange}
                                    value={validation.values.deductions || ""}
                                />
                                {validation.touched.deductions && validation.errors.deductions ? (
                                    <p className="text-red-400">{validation.errors.deductions}</p>
                                ) : null}
                            </div>
                            <div className="xl:col-span-12">
                                <label
                                    htmlFor="bonuses"
                                    className="inline-block mb-2 text-base font-medium"
                                >
                                    Bonus
                                </label>
                                <input
                                    type="number"
                                    id="bonuses"
                                    className="form-input border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200"
                                    placeholder="Bonus"
                                    name="bonuses"
                                    onChange={validation.handleChange}
                                    value={validation.values.bonuses || ""}
                                />
                                {validation.touched.bonuses && validation.errors.bonuses ? (
                                    <p className="text-red-400">{validation.errors.bonuses}</p>
                                ) : null}
                            </div>
                            <div className="xl:col-span-12">
                                <label
                                    htmlFor="pay_period"
                                    className="inline-block mb-2 text-balance font-medium"
                                >
                                    Pay Period
                                </label>
                                <input
                                    type="date"
                                    id="pay_period"
                                    className="form-input border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200"
                                    placeholder="Pay Period"
                                    name="pay_period"
                                    onChange={validation.handleChange}
                                    value={validation.values.pay_period || ""}
                                />
                                {validation.touched.pay_period && validation.errors.pay_period ? (
                                    <p className="text-red-400">{validation.errors.pay_period}</p>
                                ) : null}
                            </div>
                            <div className="xl:col-span-12">
                                <label
                                    htmlFor="paid_at"
                                    className="inline-block mb-2 text-balance font-medium"
                                >
                                    Paid At
                                </label>
                                <input
                                    type="date"
                                    id="paid_at"
                                    className="form-input border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200"
                                    placeholder="Paid At"
                                    name="paid_at"
                                    onChange={validation.handleChange}
                                    value={validation.values.paid_at || ""}
                                />
                                {validation.touched.paid_at && validation.errors.paid_at ? (
                                    <p className="text-red-400">{validation.errors.paid_at}</p>
                                ) : null}
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                type="reset"
                                id="close-modal"
                                data-modal-close="addPayrollModal"
                                className="text-red-500 bg-white btn hover:text-red-500 hover:bg-red-100 focus:text-red-500 focus:bg-red-100 active:text-red-500 active:bg-red-100 dark:bg-zink-600 dark:hover:bg-red-500/10 dark:focus:bg-red-500/10 dark:active:bg-red-500/10"
                                onClick={toggle}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                id="addNew"
                                disabled={isLoading}
                                className="text-white btn bg-custom-500 border-custom-500 hover:text-white hover:bg-custom-600 hover:border-custom-600 focus:text-white focus:bg-custom-600 focus:border-custom-600 focus:ring focus:ring-custom-100 active:text-white active:bg-custom-600 active:border-custom-600 active:ring active:ring-custom-100 dark:ring-custom-400/20"
                            >
                                {isLoading
                                    ? "Loading"
                                    : !!isEdit
                                        ? "Update"
                                        : "Add  Payroll"}
                            </button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default Payroll;
