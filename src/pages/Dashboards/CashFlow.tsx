// src/pages/Dashboard/Cashflow.tsx
import React from "react";
import { MoreVertical } from "lucide-react";
import CountUp from "react-countup";
import { Dropdown } from "Common/Components/Dropdown";
import { Link } from "react-router-dom";
import { CashflowChart } from "./CashFlowChart";

const Cashflow = ({ data }: any) => {
  const cashflow = data?.cashflow ?? [];

  const totalIn = cashflow.reduce(
    (sum: number, item: any) => sum + Number(item.total_sales ?? 0),
    0
  );
  const totalOut = cashflow.reduce(
    (sum: number, item: any) => sum + Number(item.total_purchase ?? 0),
    0
  );
  const net = totalIn - totalOut;

  return (
    <React.Fragment>
      <div className="col-span-12 card lg:col-span-6 2xl:col-span-3">
        <div className="card-body">
          <div className="flex items-center mb-3">
            <h6 className="grow text-15">Cashflow In / Out</h6>
            <Dropdown className="relative shrink-0">
              <Dropdown.Trigger
                type="button"
                className="flex items-center justify-center size-[30px] p-0 bg-white text-slate-500 btn hover:text-slate-500 hover:bg-slate-100 focus:text-slate-500 focus:bg-slate-100 active:text-slate-500 active:bg-slate-100 dark:bg-zink-700 dark:hover:bg-slate-500/10 dark:focus:bg-slate-500/10 dark:active:bg-slate-500/10 dropdown-toggle"
                id="cashflowDropdown"
                data-bs-toggle="dropdown"
              >
                <MoreVertical className="inline-block size-4" />
              </Dropdown.Trigger>

              <Dropdown.Content
                placement="right-end"
                className="absolute z-50 py-2 mt-1 ltr:text-left rtl:text-right list-none bg-white rounded-md shadow-md dropdown-menu min-w-[10rem] dark:bg-zink-600"
                aria-labelledby="cashflowDropdown"
              >
                <li>
                  <Link className="block px-4 py-1.5 text-base transition-all duration-200 ease-linear text-slate-600 dropdown-item hover:bg-slate-100 hover:text-slate-500 focus:bg-slate-100 focus:text-slate-500 dark:text-zink-100 dark:hover:bg-zink-500 dark:hover:text-zink-200 dark:focus:bg-zink-500 dark:focus:text-zink-200" to="#!">
                    Weekly
                  </Link>
                </li>
                <li>
                  <Link className="block px-4 py-1.5 text-base transition-all duration-200 ease-linear text-slate-600 dropdown-item hover:bg-slate-100 hover:text-slate-500 focus:bg-slate-100 focus:text-slate-500 dark:text-zink-100 dark:hover:bg-zink-500 dark:hover:text-zink-200 dark:focus:bg-zink-500 dark:focus:text-zink-200" to="#!">
                    Monthly
                  </Link>
                </li>
                <li>
                  <Link className="block px-4 py-1.5 text-base transition-all duration-200 ease-linear text-slate-600 dropdown-item hover:bg-slate-100 hover:text-slate-500 focus:bg-slate-100 focus:text-slate-500 dark:text-zink-100 dark:hover:bg-zink-500 dark:hover:text-zink-200 dark:focus:bg-zink-500 dark:focus:text-zink-200" to="#!">
                    Yearly
                  </Link>
                </li>
              </Dropdown.Content>
            </Dropdown>
          </div>

          <div className="flex items-center gap-3 my-3">
            <div className="grow">
              <p className="mb-1 text-slate-500 dark:text-zink-200 text-xs">
                Total Cash In
              </p>
              <h5 className="text-15">
                Rp{" "}
                <CountUp
                  end={totalIn}
                  decimals={0}
                  className="counter-value"
                />
              </h5>
            </div>
            <div className="grow">
              <p className="mb-1 text-slate-500 dark:text-zink-200 text-xs">
                Total Cash Out
              </p>
              <h5 className="text-15">
                Rp{" "}
                <CountUp
                  end={totalOut}
                  decimals={0}
                  className="counter-value"
                />
              </h5>
            </div>
            <div className="grow">
              <p className="mb-1 text-slate-500 dark:text-zink-200 text-xs">
                Net
              </p>
              <h5
                className={`text-15 ${
                  net >= 0 ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                Rp{" "}
                <CountUp end={net} decimals={0} className="counter-value" />
              </h5>
            </div>
          </div>

          <CashflowChart chartId="cashflowChart" data={data} />
        </div>
      </div>
    </React.Fragment>
  );
};

export default Cashflow;
