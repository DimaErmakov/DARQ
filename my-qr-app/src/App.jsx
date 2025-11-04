import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
// CRUD

// Website where you can create, read, update, and delete QR codes.
// Button to upload document(s) and generate QR code(s) for the document(s).
// Can change the underlying document(s) by uploading new document(s) and keeping the same QR code(s).
// Store the documents in a database or file storage system, maybe MongoDB
// The server should handle the file uploads and QR code generation, maybe Azure
import React, { useState, useEffect, useCallback } from 'react';
// import QRCode from 'qrcode'; // Removed: This was causing the error, will use CDN
import { Plus, FileText, Edit, Trash2, X, Upload, QrCode } from 'lucide-react';

// --- Mock Data ---
// This is the base URL your QR codes will point to.
// The backend would handle redirection based on the 'id' query parameter.
const BASE_REDIRECT_URL = "https://your-service.com/redirect";

// Function to generate a mock QR code item
const createMockItem = async (id, name, docName) => {
  const url = `${BASE_REDIRECT_URL}?id=${id}`;
  try {
    // Check if the QR code library from the CDN is available
    if (!window.QRCode) {
      console.error("QR Code library (from CDN) is not loaded yet.");
      return null;
    }
    const qrDataURL = await window.QRCode.toDataURL(url, {
      color: { dark: "#000000", light: "#FFFFFF" },
      margin: 2,
      width: 128
    });
    return {
      id,
      name,
      documentName: docName,
      qrCodeUrl: qrDataURL, // This is the image data
      redirectUrl: url     // This is the URL encoded in the QR
    };
  } catch (err) {
    console.error("Failed to generate QR code", err);
    return null;
  }
};

// --- Main Application Component ---
export default function App() {
  const [qrCodes, setQrCodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isQrLibLoaded, setIsQrLibLoaded] = useState(false); // Track CDN script load
  
  // 'editing' will hold the QR code object being updated,
  // 'null' means the modal is in "Create New" mode.
  const [editingItem, setEditingItem] = useState(null);

  // --- Load QR Code Library from CDN ---
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode/1.5.3/qrcode.min.js';
    script.async = true;
    script.onload = () => setIsQrLibLoaded(true);
    script.onerror = () => console.error("Failed to load QR code library from CDN.");
    document.body.appendChild(script);
    
    // Cleanup script on component unmount
    return () => {
      try {
        document.body.removeChild(script);
      } catch (e) {
         // ignore if script already removed
      }
    };
  }, []); // Empty dependency array ensures this runs only once

  // --- Initial Data Load (Mock) ---
  useEffect(() => {
    // Wait until the QR code library is loaded before trying to generate QR codes
    if (!isQrLibLoaded) {
      // Show loading state until library is ready
      setIsLoading(true); 
      return;
    }

    const init = async () => {
      setIsLoading(true);
      const item1 = await createMockItem("1a2b3c", "Client Contract v1", "main_contract_v1.pdf");
      const item2 = await createMockItem("4d5e6f", "Employee Handbook", "handbook_2024.pdf");
      if (item1 && item2) {
        setQrCodes([item1, item2]);
      }
      setIsLoading(false);
    };
    init();
  }, [isQrLibLoaded]); // This effect now depends on the QR library being loaded

  // --- CRUD Handlers ---

  const handleCreate = async (name, file) => {
    if (!name || !file) {
      // In a real app, use a custom modal, not alert
      console.warn("Create failed: Name or file missing."); 
      return;
    }
    
    const newId = `qr_${new Date().getTime()}`;
    const newItem = await createMockItem(newId, name, file.name);
    
    if (newItem) {
      setQrCodes(prevCodes => [newItem, ...prevCodes]);
    }
    setModalOpen(false);
  };

  const handleUpdate = (id, newFile) => {
    if (!newFile) {
      // In a real app, use a custom modal, not alert
      console.warn("Update failed: New file missing.");
      return;
    }
    
    setQrCodes(prevCodes =>
      prevCodes.map(item =>
        item.id === id
          ? { ...item, documentName: newFile.name } // Only document name changes
          : item
      )
    );
    
    console.log(`Simulating update for ${id}: New file is ${newFile.name}`);
    // This console.log relies on editingItem, let's make sure it's set
    if (editingItem) {
      console.log(`The QR code image and URL (${editingItem.redirectUrl}) remain unchanged.`);
    }
    
    setModalOpen(false);
  };

  const handleDelete = (id) => {
    // In a real app, you'd use a custom confirmation modal
    // Using console.warn as a placeholder for window.confirm
    console.warn("Delete action triggered. Add a custom confirmation modal.");
    // if (window.confirm("Are you sure you want to delete this QR code? This action cannot be undone.")) {
    setQrCodes(prevCodes => prevCodes.filter(item => item.id !== id));
    // }
  };

  // --- Modal Triggers ---

  const openCreateModal = () => {
    setEditingItem(null); // Ensure we are in "create" mode
    setModalOpen(true);
  };

  const openUpdateModal = (item) => {
    setEditingItem(item); // Set the item to be edited
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      <div className="container mx-auto p-4 md:p-8">
        
        {/* --- Header --- */}
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b border-gray-300">
          <h1 className="text-3xl font-bold text-gray-900">
            QR Code Document Manager
          </h1>
          <button
            onClick={openCreateModal}
            className="mt-4 sm:mt-0 flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200"
          >
            <Plus size={20} className="mr-2" />
            Create New QR Code
          </button>
        </header>

        {/* --- QR Code List --- */}
        <main>
          {isLoading && <p className="text-center text-gray-600">Loading QR codes...</p>}
          
          {!isLoading && qrCodes.length === 0 && (
            <p className="text-center text-gray-600">
              No QR codes found. Click "Create New" to get started!
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {qrCodes.map(item => (
              <QrCodeItem
                key={item.id}
                item={item}
                onUpdate={() => openUpdateModal(item)}
                onDelete={() => handleDelete(item.id)}
              />
            ))}
          </div>
        </main>
      </div>

      {/* --- Create/Update Modal --- */}
      {modalOpen && (
        <QrCodeModal
          item={editingItem}
          onClose={() => setModalOpen(false)}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}

// --- QR Code Item Component ---
function QrCodeItem({ item, onUpdate, onDelete }) {
  
  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = item.qrCodeUrl;
    link.download = `${item.name.replace(/\s+/g, '_')}_qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div className="p-5">
        <h2 className="text-xl font-semibold mb-3 truncate" title={item.name}>
          {item.name}
        </h2>
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
          <img
            src={item.qrCodeUrl}
            alt={`QR code for ${item.name}`}
            className="w-32 h-32 border-4 border-gray-200 rounded-md flex-shrink-0"
          />
          <div className="flex-grow flex flex-col justify-between min-w-0"> {/* Added min-w-0 for truncation */}
            <div className="mb-3">
              <div className="flex items-center text-gray-700 mb-2" title={item.documentName}>
                <FileText size={18} className="mr-2 flex-shrink-0" />
                <span className="truncate text-sm">{item.documentName}</span>
              </div>
              <div className="flex items-center text-gray-500" title={item.redirectUrl}>
                <QrCode size={18} className="mr-2 flex-shrink-0" />
                <span className="truncate text-xs">{item.redirectUrl}</span>
              </div>
            </div>
            <button
              onClick={handleDownloadQR}
              className="w-full text-sm text-blue-600 font-medium py-1.5 rounded-md hover:bg-blue-50"
            >
              Download QR
            </button>
          </div>
        </div>
      </div>
      <div className="flex bg-gray-50 border-t border-gray-200">
        <button
          onClick={onUpdate}
          className="flex-1 flex items-center justify-center p-3 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors duration-200 border-r border-gray-200"
        >
          <Edit size={16} className="mr-2" />
          Update File
        </button>
        <button
          onClick={onDelete}
          className="flex-1 flex items-center justify-center p-3 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors duration-200"
        >
          <Trash2 size={16} className="mr-2" />
          Delete
        </button>
      </div>
    </div>
  );
}

// --- Create/Update Modal Component ---
function QrCodeModal({ item, onClose, onCreate, onUpdate }) {
  const isUpdateMode = item !== null;
  const [name, setName] = useState(isUpdateMode ? item.name : "");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState(isUpdateMode ? item.documentName : "");

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isUpdateMode) {
      if (!file) {
        // In a real app, use a custom modal
        console.warn("Update failed: No new file selected."); 
        return;
      }
      onUpdate(item.id, file);
    } else {
      if (!file) {
        // In a real app, use a custom modal
        console.warn("Create failed: No file selected.");
        return;
      }
      onCreate(name, file);
    }
  };
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div 
        className="relative bg-white rounded-lg shadow-2xl w-full max-w-lg z-50 overflow-hidden"
        onClick={e => e.stopPropagation()} // Prevent modal close on content click
      >
        <form onSubmit={handleSubmit}>
          {/* --- Modal Header --- */}
          <div className="flex justify-between items-center p-5 border-b border-gray-200">
            <h3 className="text-2xl font-semibold">
              {isUpdateMode ? "Update Document" : "Create New QR Code"}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          {/* --- Modal Body --- */}
          <div className="p-6 space-y-6">
            {isUpdateMode && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">
                <p className="font-semibold">Keeping the same QR Code</p>
                <p className="text-sm">
                  Uploading a new document will replace the file linked to this
                  QR code. The QR code itself will not change.
                </p>
              </div>
            )}
            
            <div>
              <label htmlFor="qrName" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                id="qrName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., 'Client Contract v2'"
                disabled={isUpdateMode} // Name is not editable in update mode for this example
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
              {isUpdateMode && (
                <p className="text-xs text-gray-500 mt-1">
                  The name cannot be changed after creation.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isUpdateMode ? "Upload New Document" : "Upload Document"}
              </label>
              <label 
                htmlFor="fileUpload" 
                className="relative flex flex-col items-center justify-center w-full h-32 px-4 py-6 bg-white border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-blue-500 hover:bg-gray-50"
              >
                <div className="text-center">
                  <Upload size={32} className="mx-auto text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PDF, DOCX, PNG, JPG, etc.</p>
                </div>
                {fileName && (
                  <div className="absolute bottom-2 px-3 py-1 bg-white text-sm font-medium text-gray-700 rounded-md shadow-sm border border-gray-200 max-w-[90%] truncate">
                    {fileName}
                  </div>
                )}
              </label>
              <input
                type="file"
                id="fileUpload"
                onChange={handleFileChange}
                className="hidden"
                // 'required' is tricky on update, so we'll do it in JS
                // required 
              />
            </div>
          </div>

          {/* --- Modal Footer --- */}
          <div className="flex justify-end items-center p-5 bg-gray-50 border-t border-gray-200 space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isUpdateMode ? "Save & Update File" : "Generate QR Code"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

