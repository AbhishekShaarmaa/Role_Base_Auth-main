/* eslint-disable no-unused-vars */
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Search, Eye, DownloadCloud, FileDown } from "lucide-react";
import axios from "axios";
import convertISOToDate from "../../utils/formatDate";
import PayVoucher from "../analytics/PayVoucher";
import html2pdf from "html2pdf.js";
import * as XLSX from 'xlsx'; // Import XLSX for Excel creation

const TransactionsTable = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8); // Set the number of items per page
  const [filterDate, setFilterDate] = useState({
    startDate: "",
    endDate: "",
    subHead: ""
  });
  const [selectedSubHead, setSelectedSubHead] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const payVoucherRef = useRef();
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const handlePrint = () => {
    if (payVoucherRef.current) {
      const options = {
        margin: 10,
        filename: 'pay_voucher.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      html2pdf().from(payVoucherRef.current).set(options).save();
    }
  };

  const handleFilter = async () => {
    try {
      const filters = { ...filterDate };

      if (selectedSubHead) {
        filters.subHead = String(selectedSubHead);
      }
      if (selectedStatus) {
        filters.status = selectedStatus;
      }

      console.log("filters",filters)

      const response = await axios.post(
        `http://localhost:4000/api/expense/filterDate`,
        filters,
        {
          withCredentials: true,
        }
      );

      if (response.data) {
        setFilteredTransactions(response.data);
      }
    } catch (error) {
      console.error("Error filtering transactions", error);
    }
  };

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4000/api/expense/getExpense`,
          {
            withCredentials: true,
          }
        );

        if (response.data) {
          setFilteredTransactions(response.data?.Expenses);
        }
      } catch (error) {
        console.error("Error fetching expenses", error);
      }
    };

    fetchExpenses();
  }, []);

  const indexOfLastTransaction = currentPage * itemsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );

  // Calculate total pages
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleDownloadVoucher = (transaction) => {
    setSelectedTransaction(transaction);
    setTimeout(() => handlePrint(), 0);
  };

  // Handle checkbox change for selecting transactions
  const handleCheckboxChange = (transaction) => {
    if (selectedTransactions.includes(transaction)) {
      setSelectedTransactions(selectedTransactions.filter(item => item !== transaction));
    } else {
      setSelectedTransactions([...selectedTransactions, transaction]);
    }
  };

  // Export selected transactions to Excel
  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(selectedTransactions);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    XLSX.writeFile(workbook, "selected_transactions.xlsx");
  };

  return (
    <motion.div
      className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex flex-col justify-between items-start mb-6 gap-2">
        <h2 className="text-xl font-semibold text-gray-100">
          Transaction History
        </h2>
        <div className="w-full flex gap-4 justify-between items-center">
          <div className="flex gap-4">
            {/* Date Filter */}
            <label htmlFor="filterDate" className="flex flex-col gap-2 items-start">
              <p>From</p>
              <input
                type="date"
                name="filterDate"
                id="filterDate"
                className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setFilterDate({ ...filterDate, startDate: e.target.value })}
              />
            </label>

            <label htmlFor="filterDate" className="flex flex-col gap-2 items-start">
              <p>To</p>
              <input
                type="date"
                name="filterDate"
                id="filterDate"
                className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setFilterDate({ ...filterDate, endDate: e.target.value })}
              />
            </label>

            {/* SubHead Dropdown */}
            <label htmlFor="subHead" className="flex flex-col gap-2 items-start">
              <p>SubHead</p>
              <select
                name="subHead"
                id="subHead"
                className="bg-gray-700 text-white rounded-lg px-4 py-2"
                value={selectedSubHead}
                onChange={(e) => setSelectedSubHead(e.target.value)}
              >
                <option value="">All</option>
                <option value="BCA">BCA</option>
                <option value="BBA">BBA</option>
                <option value="OMSP">OMSP</option>
                <option value="Exam">Exam</option>
                <option value="SW">SW</option>
                <option value="GEN">GEN</option>
                <option value="NSS">NSS</option>
                <option value="NCC">NCC</option>
              </select>
            </label>

            {/* Status Dropdown */}
            <label htmlFor="status" className="flex flex-col gap-2 items-start">
              <p>Status</p>
              <select
                name="status"
                id="status"
                className="bg-gray-700 text-white rounded-lg px-4 py-2"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">All</option>
                <option value="pending">pending</option>
                <option value="verified">Verified</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </label>
          </div>

          <button onClick={handleFilter} className="px-4 py-2 text-white bg-blue-600 rounded">
            Filter
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Select
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Txn ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                SubHead
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Status
              </th>

              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Download Voucher
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                Download Notesheet
              </th>
            </tr>
          </thead>

          <tbody className="divide divide-gray-700">
            {currentTransactions.map((transaction) => (
              <motion.tr
                key={transaction?._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                  <input
                    type="checkbox"
                    checked={selectedTransactions.includes(transaction)}
                    onChange={() => handleCheckboxChange(transaction)}
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                  {transaction?._id.slice(0, 10)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {convertISOToDate(transaction?.updatedAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                  {transaction?.subHead}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                  ₹ {parseInt(transaction?.total).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${transaction.status === "verified"
                      ? "bg-green-100 text-green-800"
                      : transaction.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : transaction.status === "approved"
                          ? "bg-blue-100 text-blue-800"
                          : transaction.status === "completed"
                            ? "bg-purple-100 text-purple-800"
                            : transaction.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800" // Default case if status does not match
                    }`}
                  >
                    {transaction?.status}
                  </span>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-300">
                  <button onClick={() => handleDownloadVoucher(transaction)} className="text-indigo-400 hover:text-indigo-300 mr-2">
                    <DownloadCloud size={18} />
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-300">
                  <button className="text-indigo-400 hover:text-indigo-300 mr-2">
                    <FileDown size={18} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <button
          className={`px-4 py-2 text-white bg-blue-600 rounded ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <div className="text-gray-400">
          Page {currentPage} of {totalPages}
        </div>
        <button
          className={`px-4 py-2 text-white bg-blue-600 rounded ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
            }`}
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      {/* Download Excel Button */}
      <div className="flex justify-end mt-4">
        <button
          onClick={handleDownloadExcel}
          className="px-4 py-2 text-white bg-green-600 rounded"
          disabled={selectedTransactions.length === 0} // Disable if no transactions are selected
        >
          Download Excel
        </button>
      </div>

      <div className="hidden">
        {selectedTransaction && <PayVoucher ref={payVoucherRef} transaction={selectedTransaction} />}
      </div>
    </motion.div>
  );
};

export default TransactionsTable;
