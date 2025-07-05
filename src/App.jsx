import { useState } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

export default function ExcelUploader() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [foundRecord, setFoundRecord] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onprogress = (e) => {
      if (e.lengthComputable) {
        const progress = Math.round((e.loaded / e.total) * 100);
        setUploadProgress(progress);
      }
    };

    reader.onloadstart = () => setUploadProgress(0);
    reader.onloadend = () => setUploadProgress(100);

    reader.onload = (e) => {
      const workbook = XLSX.read(e.target.result, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { raw: false }); 
      setData(jsonData);
    };

    reader.readAsBinaryString(file);
  };

  const validator = (val) => {
    const allDigitEqual = Array.from({ length: 10 }, (_, i) =>
      String(i).repeat(10)
    );
    const codeMelliPattern = /^([0-9]{10})+$/;
    if (allDigitEqual.includes(val) || !codeMelliPattern.test(val)) return false;

    const chArray = Array.from(val);
    const sum = chArray
      .slice(0, 9)
      .reduce((acc, num, i) => acc + parseInt(num) * (10 - i), 0);
    const remainder = sum % 11;
    const check = parseInt(chArray[9]);
    return (remainder < 2 && check === remainder) || (remainder >= 2 && 11 - remainder === check);
  };

  const handleSearch = () => {
    const trimmed = searchTerm.trim();

    if (trimmed === "") {
      toast.error("کد ملی را وارد کنید");
      return;
    }

    if (!validator(trimmed)) {
      toast.error("کد ملی نامعتبر است");
      return;
    }

    const record = data.find((row) => {
      const code = String(row["کد ملی"] ?? "").trim();
      return code === trimmed;
    });

    if (record) {
      setFoundRecord(record);
    } else {
      toast.error("رکوردی با این کد ملی یافت نشد");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-slate-900 text-slate-100 py-10 px-4">
      <h1 className="text-3xl font-bold mb-6 text-slate-200">
        آپلود و جستجوی فایل اکسل
      </h1>

      <div className="mb-4 w-full max-w-md">
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          className="w-full p-2 border border-slate-600 rounded-md bg-slate-800 text-slate-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-100 hover:file:bg-slate-600 transition"
        />
      </div>

      {uploadProgress > 0 && (
        <div className="w-full max-w-md mb-6">
          <div className="w-full bg-slate-700 rounded-full h-3">
            <div
              className="bg-green-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-center text-xs mt-1 text-slate-300">{uploadProgress}%</p>
        </div>
      )}

      {data.length > 0 && (
        <>
          <div className="flex items-center gap-2 mb-6">
            <input
              type="text"
              placeholder="کد ملی را وارد کنید"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 border border-slate-600 bg-slate-800 text-slate-100 rounded-md w-64 placeholder-slate-400"
            />
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              جستجو
            </button>
          </div>

          {foundRecord && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-5 mb-8 w-full max-w-2xl">
              <h2 className="text-lg font-bold mb-3 text-slate-100">
                نتیجه جستجو
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(foundRecord).map(([key, value]) => (
                  <div
                    key={key}
                    className="p-2 bg-slate-700 rounded-md text-sm text-slate-200 border border-slate-600"
                  >
                    <strong className="text-slate-300">{key}:</strong> {value}
                  </div>
                ))}
              </div>
              <button
                onClick={() => setFoundRecord(null)}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
              >
                بستن
              </button>
            </div>
          )}

          <div className="w-full overflow-x-auto rounded-lg border border-slate-700 shadow-xl">
            <table className="min-w-[600px] w-full text-sm bg-slate-800 text-slate-200 text-right">
              <thead className="bg-slate-700 text-slate-300 border-b border-slate-600">
                <tr>
                  {Object.keys(data[0]).map((key) => (
                    <th key={key} className="py-2 px-4 font-medium whitespace-nowrap">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-700 transition">
                    {Object.values(row).map((value, i) => (
                      <td key={i} className="py-2 px-4 border-t border-slate-700">
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
