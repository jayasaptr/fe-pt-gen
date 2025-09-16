import BreadCrumb from "Common/BreadCrumb";
import DeleteModal from "Common/DeleteModal";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { useFormik } from "formik";
import TableContainer from "Common/TableContainer";
import Modal from "Common/Components/Modal";
import { axiosInstance } from "lib/axios";

// ========================
// Types
// ========================
interface ServiceItem {
    id: number | string;
    unit_name: string;
    deskripsi_kerusakan: string;
    nama_pemilik: string;
    tanggal_perbaikan: string; // ISO date string (yyyy-MM-dd)
    jumlah?: number; // optional if backend supplies it
    harga?: number; // optional if backend supplies it
}

interface ApiResponse<T> {
    success: boolean;
    data: {
        data: T;
    };
}

// ========================
// Toast helpers
// ========================
const toastSuccess = (title?: string) =>
    toast.success(title, {
        autoClose: 3000,
        theme: "colored",
        icon: false,
        position: toast.POSITION.TOP_RIGHT,
        closeButton: false,
    });

const toastError = (title?: string) =>
    toast.error(title, {
        autoClose: 3000,
        theme: "colored",
        icon: false,
        position: toast.POSITION.TOP_RIGHT,
        closeButton: false,
    });

// ========================
// Component
// ========================
export default function Service() {
    const navigate = useNavigate();
    const [items, setItems] = useState<ServiceItem[]>([]);
    const [selected, setSelected] = useState<ServiceItem | null>(null);

    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isTableLoading, setIsTableLoading] = useState(false);

    // Delete Modal
    const [deleteOpen, setDeleteOpen] = useState(false);
    const deleteToggle = () => setDeleteOpen((s) => !s);

    const printRef = useRef<HTMLDivElement>(null);

    // ========================
    // Auth helper
    // ========================
    const getAuthHeaders = () => {
        const raw = localStorage.getItem("authUser");
        if (!raw) return {} as Record<string, string>;
        try {
            const parsed = JSON.parse(raw);
            const token = parsed?.data?.token;
            return token ? { Authorization: `Bearer ${token}` } : {};
        } catch (e) {
            return {} as Record<string, string>;
        }
    };

    const handleUnauthorized = () => {
        localStorage.removeItem("authUser");
        navigate("/login");
    };

    // ========================
    // Fetch
    // ========================
    const fetchServices = useCallback(async () => {
        setIsTableLoading(true);
        try {
            const res = await axiosInstance.get<ApiResponse<ServiceItem[]>>("/service", {
                headers: { ...getAuthHeaders() },
            });
            setItems(res.data.data.data || []);
        } catch (error: any) {
            if (error?.response?.status === 401) handleUnauthorized();
            else toastError("Gagal memuat data Service");
        } finally {
            setIsTableLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    // ========================
    // Formik
    // ========================
    const formik = useFormik<ServiceItem>({
        enableReinitialize: true,
        initialValues: {
            id: selected?.id ?? "",
            unit_name: selected?.unit_name ?? "",
            deskripsi_kerusakan: selected?.deskripsi_kerusakan ?? "",
            nama_pemilik: selected?.nama_pemilik ?? "",
            tanggal_perbaikan: selected?.tanggal_perbaikan ?? "",
        },
        validationSchema: Yup.object({
            unit_name: Yup.string().required("Nama Unit wajib diisi"),
            deskripsi_kerusakan: Yup.string().required("Deskripsi Kerusakan wajib diisi"),
            nama_pemilik: Yup.string().required("Nama Pemilik wajib diisi"),
            // pakai string agar fleksibel dengan format dari backend
            tanggal_perbaikan: Yup.string().required("Tanggal Perbaikan wajib diisi"),
        }),
        onSubmit: async (values) => {
            setIsSubmitting(true);
            try {
                if (isEdit) await updateService(values);
                else await createService(values);
                await fetchServices();
                closeModal();
            } catch (_) {
                // error handled in each action
            } finally {
                setIsSubmitting(false);
            }
        },
    });

    // ========================
    // CRUD actions
    // ========================
    const createService = async (data: ServiceItem) => {
        try {
            const formData = new FormData();
            formData.append("unit_name", data.unit_name);
            formData.append("deskripsi_kerusakan", data.deskripsi_kerusakan);
            formData.append("nama_pemilik", data.nama_pemilik);
            formData.append("tanggal_perbaikan", data.tanggal_perbaikan);

            const res = await axiosInstance.post<ApiResponse<unknown>>("/service", formData, {
                headers: { ...getAuthHeaders(), "Content-Type": "multipart/form-data" },
            });

            if (res.data.success) toastSuccess("Data Master Service Berhasil Ditambahkan");
            else toastError("Data Master Service Gagal Ditambahkan");
        } catch (error: any) {
            if (error?.response?.status === 401) handleUnauthorized();
            else toastError("Data Master Service Gagal Ditambahkan");
            throw error;
        }
    };

    const updateService = async (data: ServiceItem) => {
        try {
            const formData = new FormData();
            formData.append("unit_name", data.unit_name);
            formData.append("deskripsi_kerusakan", data.deskripsi_kerusakan);
            formData.append("nama_pemilik", data.nama_pemilik);
            formData.append("tanggal_perbaikan", data.tanggal_perbaikan);
            formData.append("_method", "PUT");

            const res = await axiosInstance.post<ApiResponse<unknown>>(
                `/service/${data.id}`,
                formData,
                { headers: { ...getAuthHeaders(), "Content-Type": "multipart/form-data" } }
            );

            if (res.data.success) toastSuccess("Data Master Service Berhasil Diupdate");
            else toastError("Data Service Masuk Gagal Diupdate");
        } catch (error: any) {
            if (error?.response?.status === 401) handleUnauthorized();
            else toastError("Data Service Masuk Gagal Diupdate");
            throw error;
        }
    };

    const deleteService = async (id: ServiceItem["id"]) => {
        try {
            const res = await axiosInstance.delete<ApiResponse<unknown>>(`/service/${id}`, {
                headers: { ...getAuthHeaders() },
            });
            if (res.data.success) {
                toastSuccess("Data Master Service Berhasil Dihapus");
                await fetchServices();
            } else {
                toastError("Data Service Masuk Gagal Dihapus");
            }
        } catch (error: any) {
            if (error?.response?.status === 401) handleUnauthorized();
            else toastError("Data Service Masuk Gagal Dihapus");
        }
    };

    // ========================
    // UI handlers
    // ========================
    const openCreate = () => {
        setIsEdit(false);
        setSelected(null);
        setShowModal(true);
    };

    const openEdit = (row: ServiceItem) => {
        setIsEdit(true);
        setSelected(row);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelected(null);
        setIsEdit(false);
        formik.resetForm();
    };

    const confirmDelete = (row: ServiceItem) => {
        setSelected(row);
        setDeleteOpen(true);
    };

    const handleDeleteConfirmed = async () => {
        if (!selected) return;
        setDeleteOpen(false);
        await deleteService(selected.id);
        setSelected(null);
    };

    // ========================
    // Derived rows (avoid mutating original items)
    // ========================
    const rows = useMemo(() => {
        return items.map((item, idx) => ({
            ...item,
            no: idx + 1,
            total_harga:
                typeof item.jumlah === "number" && typeof item.harga === "number"
                    ? item.jumlah * item.harga
                    : undefined,
        }));
    }, [items]);

    // ========================
    // Table columns
    // ========================
    const columns = useMemo(
        () => [
            { header: "No", accessorKey: "no" },
            { header: "Unit Name", accessorKey: "unit_name" },
            { header: "Deskripsi Kerusakan", accessorKey: "deskripsi_kerusakan" },
            { header: "Nama Pemilik", accessorKey: "nama_pemilik" },
            { header: "Tanggal Perbaikan", accessorKey: "tanggal_perbaikan" },
            {
                header: "Action",
                enableColumnFilter: false,
                enableSorting: false,
                cell: (cell: any) => {
                    const data: ServiceItem = cell.row.original;
                    return (
                        <div className="flex gap-2">
                            <Link
                                to="#!"
                                className="flex items-center justify-center size-8 transition-all duration-200 ease-linear rounded-md edit-item-btn bg-slate-100 text-slate-500 hover:text-custom-500 hover:bg-custom-100 dark:bg-zink-600 dark:text-zink-200 dark:hover:bg-custom-500/20 dark:hover:text-custom-500"
                                onClick={() => openEdit(data)}
                            >
                                <Pencil className="size-4" />
                            </Link>
                            <Link
                                to="#!"
                                className="flex items-center justify-center size-8 transition-all duration-200 ease-linear rounded-md remove-item-btn bg-slate-100 text-slate-500 hover:text-custom-500 hover:bg-custom-100 dark:bg-zink-600 dark:text-zink-200 dark:hover:bg-custom-500/20 dark:hover:text-custom-500"
                                onClick={() => confirmDelete(data)}
                            >
                                <Trash2 className="size-4" />
                            </Link>
                        </div>
                    );
                },
            },
        ],
        []
    );

    return (
        <>
            <BreadCrumb title="Master Service" pageTitle="Master Service" />

            {/* Single Delete Modal */}
            <DeleteModal show={deleteOpen} onHide={deleteToggle} onDelete={handleDeleteConfirmed} />

            {/* Single ToastContainer */}
            <ToastContainer closeButton={false} limit={1} />

            <div className="card" id="employeeTable">
                <div className="card-body">
                    <div className="flex items-center gap-3 mb-4">
                        <h6 className="text-15 grow">
                            Master Service (<b className="total-Employs">{items.length}</b>)
                        </h6>
                        <div className="shrink-0">
                            <button
                                type="button"
                                className="text-white btn bg-custom-500 border-custom-500 hover:text-white hover:bg-custom-600 hover:border-custom-600 focus:text-white focus:bg-custom-600 focus:border-custom-600 focus:ring focus:ring-custom-100 active:text-white active:bg-custom-600 active:border-custom-600 active:ring active:ring-custom-100 dark:ring-custom-400/20 add-employee"
                                onClick={openCreate}
                            >
                                <Plus className="inline-block size-4" /> <span className="align-middle">Add Master Service</span>
                            </button>
                        </div>
                    </div>

                    {rows.length > 0 ? (
                        <TableContainer
                            isPagination
                            columns={columns || []}
                            data={rows || []}
                            customPageSize={5}
                            divclassName="-mx-5 overflow-x-auto"
                            tableclassName="w-full table-fixed"
                            theadclassName="ltr:text-left rtl:text-right bg-slate-100 dark:bg-zink-600"
                            thclassName="px-3.5 py-2.5 first:pl-5 last:pr-5 font-semibold border-b border-slate-200 dark:border-zink-500"
                            tdclassName="px-3.5 py-2.5 first:pl-5 last:pr-5 border-y border-slate-200 dark:border-zink-500 overflow-hidden text-ellipsis whitespace-nowrap"
                            PaginationClassName="flex flex-col items-center gap-4 px-4 mt-4 md:flex-row"
                        />
                    ) : isTableLoading ? (
                        <div className="flex flex-wrap items-center gap-5 px-3 py-2 justify-center">
                            <div className="inline-block size-8 border-2 border-green-500 rounded-full animate-spin border-l-transparent"></div>
                        </div>
                    ) : (
                        <div className="noresult">
                            <div className="py-6 text-center">
                                <Search className="size-6 mx-auto text-sky-500 fill-sky-100 dark:sky-500/20" />
                                <h5 className="mt-2 mb-1">Sorry! No Result Found</h5>
                                <p className="mb-0 text-slate-500 dark:text-zink-200">No results found. Please try a different search.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            <Modal
                show={showModal}
                onHide={closeModal}
                modal-center="true"
                className="fixed flex flex-col transition-all duration-300 ease-in-out left-2/4 z-drawer -translate-x-2/4 -translate-y-2/4"
                dialogClassName="w-screen md:w-[30rem] bg-white shadow rounded-md dark:bg-zink-600"
            >
                <Modal.Header
                    className="flex items-center justify-between p-4 border-b dark:border-zink-500"
                    closeButtonClass="transition-all duration-200 ease-linear text-slate-400 hover:text-red-500"
                >
                    <Modal.Title className="text-16">{isEdit ? "Edit Master Service" : "Add Master Service"}</Modal.Title>
                </Modal.Header>

                <Modal.Body className="max-h-[calc(theme('height.screen')_-_180px)] p-4 overflow-y-auto">
                    <form
                        className="create-form"
                        id="create-form"
                        encType="multipart/form-data"
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (!isSubmitting) formik.handleSubmit();
                        }}
                    >
                        <input type="hidden" name="id" value={formik.values.id} />

                        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
                            <div className="xl:col-span-12">
                                <label htmlFor="unit_name" className="inline-block mb-2 text-base font-medium">
                                    Unit Name
                                </label>
                                <input
                                    type="text"
                                    id="unit_name"
                                    name="unit_name"
                                    className="form-input border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200"
                                    placeholder="Unit Name"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.unit_name}
                                />
                                {formik.touched.unit_name && formik.errors.unit_name ? (
                                    <p className="text-red-400">{formik.errors.unit_name}</p>
                                ) : null}
                            </div>

                            <div className="xl:col-span-12">
                                <label htmlFor="deskripsi_kerusakan" className="inline-block mb-2 text-base font-medium">
                                    Deskripsi Kerusakan
                                </label>
                                <input
                                    type="text"
                                    id="deskripsi_kerusakan"
                                    name="deskripsi_kerusakan"
                                    className="form-input border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200"
                                    placeholder="Deskripsi Kerusakan"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.deskripsi_kerusakan}
                                />
                                {formik.touched.deskripsi_kerusakan && formik.errors.deskripsi_kerusakan ? (
                                    <p className="text-red-400">{formik.errors.deskripsi_kerusakan}</p>
                                ) : null}
                            </div>

                            <div className="xl:col-span-12">
                                <label htmlFor="nama_pemilik" className="inline-block mb-2 text-base font-medium">
                                    Nama Pemilik
                                </label>
                                <input
                                    type="text"
                                    id="nama_pemilik"
                                    name="nama_pemilik"
                                    className="form-input border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200"
                                    placeholder="Nama Pemilik"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.nama_pemilik}
                                />
                                {formik.touched.nama_pemilik && formik.errors.nama_pemilik ? (
                                    <p className="text-red-400">{formik.errors.nama_pemilik}</p>
                                ) : null}
                            </div>

                            <div className="xl:col-span-12">
                                <label htmlFor="tanggal_perbaikan" className="inline-block mb-2 text-base font-medium">
                                    Tanggal Perbaikan
                                </label>
                                <input
                                    type="date"
                                    id="tanggal_perbaikan"
                                    name="tanggal_perbaikan"
                                    className="form-input border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200"
                                    placeholder="Tanggal Perbaikan"
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    value={formik.values.tanggal_perbaikan}
                                />
                                {formik.touched.tanggal_perbaikan && formik.errors.tanggal_perbaikan ? (
                                    <p className="text-red-400">{formik.errors.tanggal_perbaikan}</p>
                                ) : null}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                type="button"
                                className="text-red-500 bg-white btn hover:text-red-500 hover:bg-red-100 focus:text-red-500 focus:bg-red-100 active:text-red-500 active:bg-red-100 dark:bg-zink-600 dark:hover:bg-red-500/10 dark:focus:bg-red-500/10 dark:active:bg-red-500/10"
                                onClick={closeModal}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="text-white btn bg-custom-500 border-custom-500 hover:text-white hover:bg-custom-600 hover:border-custom-600 focus:text-white focus:bg-custom-600 focus:border-custom-600 focus:ring focus:ring-custom-100 active:text-white active:bg-custom-600 active:border-custom-600 active:ring active:ring-custom-100 dark:ring-custom-400/20"
                            >
                                {isSubmitting ? "Loading" : isEdit ? "Update" : "Add Master Service"}
                            </button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>
        </>
    );
}
