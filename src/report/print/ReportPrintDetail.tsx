import { forwardRef, ReactNode } from "react";

interface ReportPrintDetailProps {
    children: ReactNode;
    title?: string | null;
}

const ReportPrintDetail = forwardRef<HTMLDivElement, ReportPrintDetailProps>(
    ({ children, title }, ref) => {
        return (
            <div ref={ref} className="p-6 bg-white dark:bg-zink-800">
                <div className="text-center mb-4">
                    <div className="flex items-center justify-center mb-2">
                        <img
                            src="/images/gen_dealer.png"
                            alt="School Logo"
                            className="h-15 w-40 mr-4"
                        />
                        <div className="text-center">
                            <h1 className="text-lg font-bold">
                                GLOBAL EQUIPMENT NUSANTARA
                            </h1>
                            <p className="text-sm">
                                Jl. ahmad yani km 7,9 no 8, Pemurus Luar, Kec. Kertak Hanyar, Kota Banjarmasin, Kalimantan Selatan 70246
                            </p>
                            <p className="text-sm">website: www.darulistiqamah.ponpes.id</p>
                        </div>
                    </div>
                    <hr className="border-t-2 border-black" />
                </div>
                <div className="px-8">
                    {title && (
                        <h2 className="text-2xl font-bold text-start mb-4">{title}</h2>
                    )}
                    {children}
                    <div className="mt-8 flex justify-between">
                        <div></div>
                        <div className="text-center">
                            {/* <p>Barabai, 31 Mei 2022</p> */}
                            {/* ambil tanggal otomatis */}
                            <p>
                                Banjarmasin,
                                {new Date().toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                })}
                            </p>
                            <p>Manajer,</p>

                            {/* <div className="mt-2">
                <img
                  src="/images/ttd_stempel.png"
                  alt="Stamp and Signature"
                  className="mx-auto h-32"
                />
              </div> */}
                            <p className="mt-4 font-bold">Ferry</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);

export default ReportPrintDetail;
