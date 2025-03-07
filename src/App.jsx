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
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      setData(jsonData);
    };
    reader.readAsBinaryString(file);
  };

  const validator = (val) => {
    var allDigitEqual = [
      "0000000000",
      "1111111111",
      "2222222222",
      "3333333333",
      "4444444444",
      "5555555555",
      "6666666666",
      "7777777777",
      "8888888888",
      "9999999999",
    ];
    const codeMelliPattern = /^([0-9]{10})+$/;
    if (allDigitEqual.indexOf(val) !== -1 || !codeMelliPattern.test(val)) {
      return false;
    }
    var chArray = Array.from(val);
    var num0 = parseInt(chArray[0]) * 10;
    var num2 = parseInt(chArray[1]) * 9;
    var num3 = parseInt(chArray[2]) * 8;
    var num4 = parseInt(chArray[3]) * 7;
    var num5 = parseInt(chArray[4]) * 6;
    var num6 = parseInt(chArray[5]) * 5;
    var num7 = parseInt(chArray[6]) * 4;
    var num8 = parseInt(chArray[7]) * 3;
    var num9 = parseInt(chArray[8]) * 2;
    var a = parseInt(chArray[9]);
    var b = num0 + num2 + num3 + num4 + num5 + num6 + num7 + num8 + num9;
    var c = b % 11;
    return (c < 2 && a === c) || (c >= 2 && 11 - c === a);
  };

  const handleSearch = () => {
    if (searchTerm === "") {
      toast.error('کد ملی را وارد کنید');
      return;
    } else if (!validator(searchTerm)) {
      toast.error('کد ملی نامعتبر است');
      return;
    }
    const record = data.find(row => row["کد ملی"] === searchTerm);
    if (record) {
      setFoundRecord(record || null);
    } else {
      toast.error('رکوردی با این کد ملی یافت نشد');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">آپلود فایل اکسل</h1>
      <input
        type="file"
        accept=".xlsx, .xls"
        onChange={handleFileUpload}
        className="p-2 border rounded-md bg-white cursor-pointer"
      />

      {uploadProgress > 0 && (
        <div className="w-full max-w-md mt-4">
          <div className="w-full bg-gray-300 rounded-full h-4">
            <div
              className="bg-blue-500 h-4 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-center mt-1 text-sm">{uploadProgress}%</p>
        </div>
      )}

      {data.length > 0 && (
        <div className="mt-6">
          <input
            type="number"
            min={10000000000}
            max={99999999999}
            placeholder="کد ملی را وارد کنید"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 border rounded-md mr-2"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer"
          >
            جستجو
          </button>
        </div>
      )}

      {foundRecord && (
        <div className="mt-6 p-4 border rounded bg-white shadow-lg">
          <h2 className="text-lg font-bold mb-2">اطلاعات رکورد</h2>
          {Object.entries(foundRecord).map(([key, value]) => (
            <p key={key} className="border-b p-2">
              <strong>{key}:</strong> {value}
            </p>
          ))}
          <button
            onClick={() => setFoundRecord(null)}
            className="mt-4 bg-red-500 text-white px-3 py-1 rounded"
          >
            بستن
          </button>
        </div>
      )}
    </div>
  );
}