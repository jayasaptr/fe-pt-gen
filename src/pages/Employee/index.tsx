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

const Employee = () => {
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
            name: (eventData && eventData.name) || "",
            email: (eventData && eventData.email) || "",
            phone: (eventData && eventData.phone) || "",
            position: (eventData && eventData.position) || "",
            salary: (eventData && eventData.salary) || "",
            join_date: (eventData && eventData.join_date) || "",
        },
        validationSchema: Yup.object({
            name: Yup.string().required("Nama is required"),
            email: Yup.string()
                .email("Email is invalid")
                .required("Email is required"),
            phone: Yup.string().required("Phone is required"),
            position: Yup.string().required("Position is required"),
            salary: Yup.number()
                .typeError("Salary must be a number")
                .required("Salary is required"),
            join_date: Yup.date().required("Join Date is required"),
        }),

        onSubmit: (values) => {
            if (isEdit) {
                handleUpdateSuratMasuk(values);
            } else {
                handlePostEmployee(values);
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
                accessorKey: "name",
                enableColumnFilter: false,
            },
            {
                header: "Email",
                accessorKey: "email",
                enableColumnFilter: false,
            },
            {
                header: "phone",
                accessorKey: "phone",
                enableColumnFilter: false,
            },
            {
                header: "Position",
                accessorKey: "position",
                enableColumnFilter: false,
            },
            {
                header: "Salary",
                accessorKey: "salary",
                enableColumnFilter: false,
            },
            {
                header: "Join Date",
                accessorKey: "join_date",
                enableColumnFilter: false,
            },
            {
                header: "Action",
                enableColumnFilter: false,
                enableSorting: true,
                cell: (cell: any) => (
                    <div className="flex gap-2">
                        <Link
                            to="#!"
                            className="flex items-center justify-center size-8 transition-all duration-200 ease-linear rounded-md edit-item-btn bg-slate-100 text-slate-500 hover:text-custom-500 hover:bg-custom-100 dark:bg-zink-600 dark:text-zink-200 dark:hover:bg-custom-500/20 dark:hover:text-custom-500"
                            onClick={() => {
                                const data = cell.row.original;

                                handleUpdateDataClick(data);
                            }}
                        >
                            <Pencil className="size-4" />
                        </Link>
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

    const fetchDataEmployee = async () => {
        setLoadingV(true);
        try {
            const userResponse = await axiosInstance.get("/employee", {
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

    const handlePostEmployee = async (data: any) => {
        try {
            setIsLoading(true);
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("email", data.email);
            formData.append("phone", data.phone);
            formData.append("position", data.position);
            formData.append("salary", data.salary);
            formData.append("join_date", data.join_date);

            const userResponse = await axiosInstance.post("/employee", formData, {
                headers: {
                    Authorization: `Bearer ${user.data.token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            if (userResponse.data.success === true) {
                Success("Data Master Employee Berhasil Ditambahkan");
                fetchDataEmployee();
                toggle();
            }
        } catch (error: any) {
            Error("Data Master Employee Gagal Ditambahkan");
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
            formData.append("name", data.name);
            formData.append("email", data.email);
            formData.append("phone", data.phone);
            formData.append("position", data.position);
            formData.append("salary", data.salary);
            formData.append("join_date", data.join_date);
            formData.append("_method", "PUT");

            const userResponse = await axiosInstance.post(
                `/employee/${data.id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${user.data.token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (userResponse.data.success === true) {
                Success("Data Master Employee Berhasil Diupdate");
                fetchDataEmployee();
                toggle();
            }
        } catch (error: any) {
            Error("Data Employee Masuk Gagal Diupdate");
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
            const userResponse = await axiosInstance.delete(`/employee/${id}`, {
                headers: { Authorization: `Bearer ${user.data.token}` },
            });

            if (userResponse.data.success === true) {
                Success("Data Master Employee Berhasil Dihapus");
                fetchDataEmployee();
            }
        } catch (error: any) {
            Error("Data Employee Masuk Gagal Dihapus");
            if (error.response.status === 401) {
                localStorage.removeItem("authUser");
                naviagate("/login");
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
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
            <BreadCrumb title="Master Employee" pageTitle="Master Employee" />
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
            <div className="card" id="employeeTable">
                <div className="card-body">
                    <div className="flex items-center gap-3 mb-4">
                        <h6 className="text-15 grow">
                            Master Employee (<b className="total-Employs">{data.length}</b>)
                        </h6>
                        <div className="shrink-0">
                            <Link
                                to="#!"
                                data-modal-target="addEmployeeModal"
                                type="button"
                                className="text-white btn bg-custom-500 border-custom-500 hover:text-white hover:bg-custom-600 hover:border-custom-600 focus:text-white focus:bg-custom-600 focus:border-custom-600 focus:ring focus:ring-custom-100 active:text-white active:bg-custom-600 active:border-custom-600 active:ring active:ring-custom-100 dark:ring-custom-400/20 add-employee"
                                onClick={toggle}
                            >
                                <Plus className="inline-block size-4" />{" "}
                                <span className="align-middle">Add Master Employee</span>
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

            {/* Employee Modal */}
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
                        {!!isEdit ? "Edit Master Employee" : "Add Master Employee"}
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
                                    htmlFor="name"
                                    className="inline-block mb-2 text-base font-medium"
                                >
                                    Nama
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    className="form-input border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200"
                                    placeholder="Nama"
                                    name="name"
                                    onChange={validation.handleChange}
                                    value={validation.values.name || ""}
                                />
                                {validation.touched.name && validation.errors.name ? (
                                    <p className="text-red-400">{validation.errors.name}</p>
                                ) : null}
                            </div>
                            <div className="xl:col-span-12">
                                <label
                                    htmlFor="email"
                                    className="inline-block mb-2 text-base font-medium"
                                >
                                    Email
                                </label>
                                <input
                                    type="text"
                                    id="email"
                                    className="form-input border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200"
                                    placeholder="Email"
                                    name="email"
                                    onChange={validation.handleChange}
                                    value={validation.values.email || ""}
                                />
                                {validation.touched.email && validation.errors.email ? (
                                    <p className="text-red-400">{validation.errors.email}</p>
                                ) : null}
                            </div>
                            <div className="xl:col-span-12">
                                <label
                                    htmlFor="phone"
                                    className="inline-block mb-2 text-base font-medium"
                                >
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    className="form-input border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200"
                                    placeholder="Phone"
                                    name="phone"
                                    onChange={validation.handleChange}
                                    value={validation.values.phone || ""}
                                />
                                {validation.touched.phone && validation.errors.phone ? (
                                    <p className="text-red-400">{validation.errors.phone}</p>
                                ) : null}
                            </div>
                            <div className="xl:col-span-12">
                                <label
                                    htmlFor="position"
                                    className="inline-block mb-2 text-base font-medium"
                                >
                                    Position
                                </label>
                                <input
                                    type="text"
                                    id="position"
                                    className="form-input border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200"
                                    placeholder="Position"
                                    name="position"
                                    onChange={validation.handleChange}
                                    value={validation.values.position || ""}
                                />
                                {validation.touched.position && validation.errors.position ? (
                                    <p className="text-red-400">{validation.errors.position}</p>
                                ) : null}
                            </div>
                            <div className="xl:col-span-12">
                                <label
                                    htmlFor="salary"
                                    className="inline-block mb-2 text-base font-medium"
                                >
                                    Sallary
                                </label>
                                <input
                                    type="number"
                                    id="salary"
                                    className="form-input border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200"
                                    placeholder="Sallary"
                                    name="salary"
                                    onChange={validation.handleChange}
                                    value={validation.values.salary || ""}
                                />
                                {validation.touched.salary && validation.errors.salary ? (
                                    <p className="text-red-400">{validation.errors.salary}</p>
                                ) : null}
                            </div>
                            <div className="xl:col-span-12">
                                <label
                                    htmlFor="join_date"
                                    className="inline-block mb-2 text-balance font-medium"
                                >
                                    Join Date
                                </label>
                                <input
                                    type="date"
                                    id="join_date"
                                    className="form-input border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200"
                                    placeholder="Join Date "
                                    name="join_date"
                                    onChange={validation.handleChange}
                                    value={validation.values.join_date || ""}
                                />
                                {validation.touched.join_date && validation.errors.join_date ? (
                                    <p className="text-red-400">{validation.errors.join_date}</p>
                                ) : null}
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                type="reset"
                                id="close-modal"
                                data-modal-close="addEmployeeModal"
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
                                        : "Add Master Employee"}
                            </button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default Employee;
