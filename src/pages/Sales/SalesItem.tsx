import BreadCrumb from "Common/BreadCrumb";
import DeleteModal from "Common/DeleteModal";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ToastContainer, ToastPosition, toast } from "react-toastify";
import { Check, Eye, ImagePlus, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
// Formik
import * as Yup from "yup";
import { useFormik } from "formik";
import TableContainer from "Common/TableContainer";
import Modal from "Common/Components/Modal";
import { axiosInstance } from "lib/axios";

const SalesItemPage = () => {
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
            handleDeleteDataSales(eventData.id);
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
            product_id: (eventData && eventData.product_id) || "",
            quantity: (eventData && eventData.quantity) || "",
            price: (eventData && eventData.price) || "",
        },
        validationSchema: Yup.object({
            product_id: Yup.string().required("Barang harus diisi!"),
            quantity: Yup.string().required("Jumlah Masuk harus diisi!"),
            price: Yup.string().required("Harga Satuan harus diisi!"),
        }),

        onSubmit: (values) => {
            console.log("🚀 ~ BarangPage ~ values:", values);
            if (isEdit) {
                handleUpdateSales(values);
            } else {
                handlePostSales(values);
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

    // columns
    const columns = useMemo(
        () => [
            {
                header: "Nama Barang",
                accessorKey: "product_id.name",
                enableColumnFilter: false,
            },
            {
                header: "SKU",
                accessorKey: "product_id.sku",
                enableColumnFilter: false,
            },
            {
                header: "Jumlah",
                accessorKey: "quantity",
                enableColumnFilter: false,
            },
            {
                header: "Total Harga",
                accessorKey: "subtotal",
                enableColumnFilter: false,
            },
            {
                header: "Action",
                enableColumnFilter: false,
                enableSorting: true,
                cell: (cell: any) => (
                    <div className="flex gap-3">
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

    const { id: sales_id } = useParams<{ id: string }>();

    const fetchDataSales = async () => {
        setLoadingV(true);
        try {

            const userResponse = await axiosInstance.get("/sales-items", {
                headers: {
                    Authorization: `Bearer ${user.data.token}`,
                },
                params: {
                    sales_id: sales_id || "",
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

    const [dataPemasok, setDataPemasok] = useState<any>([]);
    const [dataBarang, setDataBarang] = useState<any>([]);

    const fetchDataPemasok = async () => {
        setLoadingV(true);
        try {
            const userResponse = await axiosInstance.get("/pemasok", {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
            setDataPemasok(userResponse.data.data.data);
        } catch (error: any) {
            if (error.response.status === 401) {
                localStorage.removeItem("authUser");
                naviagate("/login");
            }
        } finally {
            setLoadingV(false);
        }
    };

    const fetchDataBarang = async () => {
        setLoadingV(true);
        try {
            const userResponse = await axiosInstance.get("/products", {
                headers: {
                    Authorization: `Bearer ${user.data.token}`,
                },
            });
            setDataBarang(userResponse.data.data.data);
        } catch (error: any) {
            if (error.response.status === 401) {
                localStorage.removeItem("authUser");
                naviagate("/login");
            }
        } finally {
            setLoadingV(false);
        }
    };

    const handlePostSales = async (data: any) => {
        try {
            setIsLoading(true);
            const formData = new FormData();
            formData.append("sales_id", sales_id || "");
            formData.append("product_id", data.product_id);
            formData.append("quantity", data.quantity);
            formData.append("price", data.price);

            const userResponse = await axiosInstance.post("/sales-items", formData, {
                headers: {
                    Authorization: `Bearer ${user.data.token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            if (userResponse.data.success === true) {
                Success("Data Sales Masuk Berhasil Ditambahkan");
                fetchDataSales();
                toggle();
            }
        } catch (error: any) {
            Error(error.response.data.message ?? "Data Sales Masuk Gagal Ditambahkan");
            if (error.response.status === 401) {
                localStorage.removeItem("authUser");
                naviagate("/login");
            }
        } finally {
            setIsLoading(false);
        }
    };


    const handleUpdateSales = async (data: any) => {
        try {
            setIsLoading(true);
            const formData = new FormData();
            formData.append("sales_id", sales_id || "");
            formData.append("product_id", data.product_id);
            formData.append("quantity", data.quantity);
            formData.append("price", data.price);
            formData.append("_method", "PUT");

            const userResponse = await axiosInstance.post(
                `/sales-items/${data.id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${user.data.token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (userResponse.data.success === true) {
                Success("Data Sales Masuk Berhasil Diupdate");
                fetchDataSales();
                toggle();
            }
        } catch (error: any) {
            Error("Data Sales Masuk Gagal Diupdate");
            if (error.response.status === 401) {
                localStorage.removeItem("authUser");
                naviagate("/login");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteDataSales = async (id: any) => {
        try {
            setIsLoading(true);
            const userResponse = await axiosInstance.delete(`/sales-items/${id}`, {
                headers: {
                    Authorization: `Bearer ${user.data.token}`,
                },
            });

            if (userResponse.data.success === true) {
                Success("Data Sales Masuk Berhasil Dihapus");
                fetchDataSales();
            }
        } catch (error: any) {
            Error("Data Sales Masuk Gagal Dihapus");
            if (error.response.status === 401) {
                localStorage.removeItem("authUser");
                naviagate("/login");
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDataSales();
        fetchDataPemasok();
        fetchDataBarang();
    }, []);

    const [loadingV, setLoadingV] = useState(false);

    const loadingView = (
        <div className="flex flex-wrap items-center gap-5 px-3 py-2 justify-center">
            <div className="inline-block size-8 border-2 border-green-500 rounded-full animate-spin border-l-transparent"></div>
        </div>
    );

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
        <>
            <BreadCrumb title="Data Sales Item" pageTitle="Data Sales" />
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
                            Sales Item (<b className="total-Employs">{data.length}</b>)
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
                                <span className="align-middle">Add Sales Item</span>
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
                                    tableclassName="w-full whitespace-nowrap"
                                    theadclassName="ltr:text-left rtl:text-right bg-slate-100 dark:bg-zink-600"
                                    thclassName="px-3.5 py-2.5 first:pl-5 last:pr-5 font-semibold border-b border-slate-200 dark:border-zink-500"
                                    tdclassName="px-3.5 py-2.5 first:pl-5 last:pr-5 border-y border-slate-200 dark:border-zink-500"
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
                        {!!isEdit ? "Edit Barang" : "Add Barang Masuk"}
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
                                    htmlFor="product_id"
                                    className="inline-block mb-2 text-base font-medium"
                                >
                                    Barang
                                </label>
                                <select
                                    id="product_id"
                                    className="form-select border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200"
                                    name="product_id"
                                    onChange={(e) => {
                                        validation.handleChange(e);
                                        validation.setFieldValue("product_id", e.target.value);
                                        // masukkan harga kedalam price dari product yang dipilih
                                        const selectedProduct = dataBarang.find(
                                            (item: any) => item.id === Number(e.target.value)
                                        );
                                        console.log("Selected Product:", selectedProduct);
                                        if (selectedProduct) {
                                            validation.setFieldValue("price", selectedProduct.price);
                                        }
                                    }}
                                    onBlur={validation.handleBlur}
                                    value={
                                        validation.values.product_id ||
                                        (eventData && eventData.product_id) ||
                                        ""
                                    }
                                >
                                    <option value="">Pilih Barang</option>
                                    {dataBarang.map((item: any, index: number) => (
                                        <option key={index} value={item.id}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                                {validation.touched.product_id && validation.errors.product_id ? (
                                    <p className="text-red-400">{validation.errors.product_id}</p>
                                ) : null}
                            </div>
                            <div className="xl:col-span-12">
                                <label
                                    htmlFor="quantity"
                                    className="inline-block mb-2 text-base font-medium"
                                >
                                    Jumlah Keluar
                                </label>
                                <input
                                    type="number"
                                    id="quantity"
                                    className="form-input border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200"
                                    placeholder="Jumlah Keluar"
                                    name="quantity"
                                    onChange={validation.handleChange}
                                    value={validation.values.quantity || ""}
                                />
                                {validation.touched.quantity &&
                                    validation.errors.quantity ? (
                                    <p className="text-red-400">
                                        {validation.errors.quantity}
                                    </p>
                                ) : null}
                            </div>
                            <div className="xl:col-span-12">
                                <label
                                    htmlFor="price"
                                    className="inline-block mb-2 text-base font-medium"
                                >
                                    Harga Satuan
                                </label>
                                <input
                                    type="number"
                                    id="price"
                                    className="form-input border-slate-200 dark:border-zink-500 focus:outline-none focus:border-custom-500 disabled:bg-slate-100 dark:disabled:bg-zink-600 disabled:border-slate-300 dark:disabled:border-zink-500 dark:disabled:text-zink-200 disabled:text-slate-500 dark:text-zink-100 dark:bg-zink-700 dark:focus:border-custom-800 placeholder:text-slate-400 dark:placeholder:text-zink-200"
                                    placeholder="Harga Satuan"
                                    name="price"
                                    onChange={validation.handleChange}
                                    value={validation.values.price || ""}
                                />
                                {validation.touched.price &&
                                    validation.errors.price ? (
                                    <p className="text-red-400">
                                        {validation.errors.price}
                                    </p>
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
                                        : "Add Barang Masuk"}
                            </button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default SalesItemPage;
