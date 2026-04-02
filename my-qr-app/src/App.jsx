import React, { useState, useEffect, useMemo, useCallback } from 'react';
import QRCode from 'qrcode';

// --- Icon Components (using inline SVGs for portability) ---
// We use inline SVGs to ensure the app works without external icon libraries.

const Icon = ({ path, className = "w-6 h-6" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {path}
  </svg>
);

const ICONS = {
  qr: <>

    <rect width="4" height="4" x="7" y="7" rx="1" />
    <rect width="4" height="4" x="13" y="7" rx="1" />
    <rect width="4" height="4" x="7" y="13" rx="1" />
    <rect width="4" height="4" x="13" y="13" rx="1" />
  </>,
  plus: <>
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </>,
  file: <>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
  </>,
  link: <>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </>,
  clock: <>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </>,
  edit: <>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </>,
  trash: <>
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </>,
  download: <>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </>,
  x: <>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </>,
  upload: <>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </>,
};

// Note: Removed the runtime script loader and switched to the local `qrcode` package.

// --- Toast Notification Component ---
function Toast({ message, show, onHide }) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onHide, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  return (
    <div
      className={`fixed top-5 right-5 z-50 transition-all duration-300 ${
        show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="bg-green-600 text-white font-medium py-3 px-6 rounded-lg shadow-lg">
        {message}
      </div>
    </div>
  );
}

// --- QR Code Card Component ---
function QrCard({ qr, onEdit, onDelete, onDownload }) {
  const formattedDate = useMemo(() => {
    return new Date(qr.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [qr.createdAt]);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl">
      <div className="p-5">
        <img
          src={qr.qrDataUrl}
          alt={`QR code for ${qr.name}`}
          className="w-full h-auto object-cover rounded-lg border border-gray-100"
        />
      </div>
      <div className="p-6 pt-0">
        <h3 className="text-2xl font-bold text-gray-900 mb-3 truncate" title={qr.name}>
          {qr.name}
        </h3>
        <div className="space-y-3 text-gray-700">
          <div className="flex items-center space-x-3">
            <Icon path={ICONS.file} className="w-5 h-5 flex-shrink-0" />
            <span className="truncate" title={qr.fileName}>{qr.fileName}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Icon path={ICONS.link} className="w-5 h-5 flex-shrink-0" />
            <span className="truncate text-indigo-600" title={qr.link}>{qr.link}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Icon path={ICONS.clock} className="w-5 h-5 flex-shrink-0" />
            <span className="truncate">Created: {formattedDate}</span>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3">
          <button
            onClick={() => onEdit(qr)}
            className="col-span-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Icon path={ICONS.edit} className="w-4 h-4 mr-2" />
            Edit
          </button>
          <button
            onClick={() => onDelete(qr.id)}
            className="col-span-1 inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <Icon path={ICONS.trash} className="w-4 h-4 mr-2" />
            Delete
          </button>
          <button
            onClick={() => onDownload(qr)}
            className="col-span-1 inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Icon path={ICONS.download} className="w-4 h-4 mr-2" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Create/Edit Modal Component ---
function QrCodeModal({ modal, onClose, onSave, qrCodeReady }) {
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);

  const isEditing = useMemo(() => modal.mode === 'edit', [modal.mode]);

  useEffect(() => {
    if (modal.show) {
      if (isEditing && modal.qr) {
        setName(modal.qr.name);
        // We don't re-populate the file input for security reasons
        // The user must select a new file if they want to update it.
        setFile(null); 
      } else {
        setName('');
        setFile(null);
      }
      setError(null);
    }
  }, [modal, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // In create mode, a file is required.
    // In edit mode, a file is optional (only if updating the doc).
    if (!name.trim()) {
      setError('A name is required.');
      return;
    }
    if (modal.mode === 'create' && !file) {
      setError('A document file is required.');
      return;
    }
    if (!qrCodeReady) {
      setError('QR Code library is not ready. Please wait.');
      return;
    }

    try {
      await onSave(name, file);
      onClose();
    } catch (err) {
      console.error('Failed to save QR code:', err);
      setError('Failed to generate QR code. See console for details.');
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const selectedFile = e.dataTransfer.files ? e.dataTransfer.files[0] : null;
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      // Manually update the hidden file input's files list
      const fileInput = document.getElementById('file-upload');
      if (fileInput) {
        fileInput.files = e.dataTransfer.files;
      }
    }
  };
  
  const handleDragEvents = (e, over) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(over);
  };


  if (!modal.show) return null;

  const currentFileName = isEditing ? modal.qr.fileName : (file ? file.name : null);

  return (
    <div
      className="fixed inset-0 z-40 bg-black bg-opacity-70 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-8 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <Icon path={ICONS.x} className="w-7 h-7" />
        </button>

        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          {isEditing ? 'Edit QR Code' : 'Create New QR Code'}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., 'Conference Handout'"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document
            </label>
            <label
              htmlFor="file-upload"
              onDrop={handleDrop}
              onDragOver={(e) => handleDragEvents(e, true)}
              onDragEnter={(e) => handleDragEvents(e, true)}
              onDragLeave={(e) => handleDragEvents(e, false)}
              className={`flex justify-center w-full px-6 pt-5 pb-6 border-2 ${
                dragOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 border-dashed'
              } rounded-lg cursor-pointer transition-colors`}
            >
              <div className="space-y-1 text-center">
                <Icon path={ICONS.upload} className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <span className="relative font-medium text-indigo-600 hover:text-indigo-500">
                    Upload a file
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </span>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PDF, DOCX, PNG, JPG, etc.
                </p>
              </div>
            </label>
            {currentFileName && (
              <div className="mt-3 text-sm font-medium text-gray-700 bg-gray-100 px-3 py-2 rounded-md">
                <span className="font-bold">{isEditing && !file ? "Current: " : "Selected: "}</span>
                {currentFileName}
              </div>
            )}
             {isEditing && (
              <p className="text-xs text-gray-500 mt-2">
                Uploading a new file will replace the existing document while keeping the same QR code.
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!qrCodeReady}
              className={`px-6 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                !qrCodeReady
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
            >
              {isEditing ? 'Save Changes' : 'Create QR Code'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Main App Component ---
export default function App() {
  const [qrCodes, setQrCodes] = useState([]);
  const [modal, setModal] = useState({ show: false, mode: 'create', qr: null });
  const [toast, setToast] = useState({ show: false, message: '' });

  // Using the locally imported `qrcode` package; mark ready immediately
  const qrCodeReady = true;

  // Load from localStorage on initial render
  useEffect(() => {
    try {
      const storedQrCodes = localStorage.getItem('qrDocHubCodes');
      if (storedQrCodes) {
        setQrCodes(JSON.parse(storedQrCodes));
      }
    } catch (error) {
      console.error("Failed to parse QR codes from localStorage:", error);
      localStorage.removeItem('qrDocHubCodes'); // Clear corrupted data
    }
  }, []);

  // Save to localStorage whenever qrCodes state changes
  useEffect(() => {
    localStorage.setItem('qrDocHubCodes', JSON.stringify(qrCodes));
  }, [qrCodes]);

  const showToast = (message) => {
    setToast({ show: true, message });
  };

  const handleModalOpen = (mode, qr = null) => {
    setModal({ show: true, mode, qr });
  };

  const handleModalClose = () => {
    setModal({ show: false, mode: 'create', qr: null });
  };

  const handleSave = async (name, file) => {
    if (modal.mode === 'create') {
      // --- CREATE ---
      // This is where you would get a real URL from your backend (Azure, etc.)
      // For this demo, we create a placeholder link.
      const id = crypto.randomUUID();
      const link = `https://your-domain.com/redirect/${id}`; // This is the stable URL
      
  // Generate the QR code pointing to the stable URL using the local package
  const qrDataUrl = await QRCode.toDataURL(link, { width: 300, margin: 2 });
      
      const newQr = {
        id,
        name,
        fileName: file.name,
        fileType: file.type,
        createdAt: new Date().toISOString(),
        qrDataUrl, // The image data for the QR code
        link,      // The permanent link embedded in the QR
      };
      
      setQrCodes([newQr, ...qrCodes]);
      showToast('QR Code created successfully!');

    } else if (modal.mode === 'edit' && modal.qr) {
      // --- UPDATE ---
      // This is the key logic: we update the item's details,
      // but the 'id', 'link', and 'qrDataUrl' all stay the same.
      
      // On a real backend, this is where you'd upload the new 'file'
      // and tell your server to associate it with the 'modal.qr.id'.
      
      setQrCodes(
        qrCodes.map((qr) =>
          qr.id === modal.qr.id
            ? {
                ...qr,
                name: name,
                // Only update file info if a new file was provided
                fileName: file ? file.name : qr.fileName,
                fileType: file ? file.type : qr.fileType,
              }
            : qr
        )
      );
      showToast('QR Code updated successfully!');
    }
  };

  const handleDelete = (id) => {
    // --- DELETE ---
    if (window.confirm('Are you sure you want to delete this QR code? This cannot be undone.')) {
      setQrCodes(qrCodes.filter((qr) => qr.id !== id));
      showToast('QR Code deleted.');
    }
  };
  
  const handleDownload = (qr) => {
    // --- DOWNLOAD ---
    const link = document.createElement('a');
    link.href = qr.qrDataUrl;
    link.download = `${qr.name.replace(/\s+/g, '_').toLowerCase()}_qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Toast
        message={toast.message}
        show={toast.show}
        onHide={() => setToast({ ...toast, show: false })}
      />
      <QrCodeModal
        modal={modal}
        onClose={handleModalClose}
        onSave={handleSave}
        qrCodeReady={qrCodeReady}
      />

      {/* --- Header --- */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Icon path={ICONS.qr} className="w-8 h-8 text-indigo-600" />
              <h1 className="ml-3 text-2xl font-bold text-gray-900">
                QR Document Hub
              </h1>
            </div>
            <button
              onClick={() => handleModalOpen('create')}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Icon path={ICONS.plus} className="w-5 h-5 mr-2 -ml-1" />
              Create New
            </button>
          </div>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {qrCodes.length === 0 ? (
          <div className="text-center bg-white p-12 rounded-lg shadow-sm border border-gray-200">
            <Icon path={ICONS.qr} className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-2 text-2xl font-medium text-gray-900">
              No QR codes yet
            </h3>
            <p className="mt-1 text-lg text-gray-500">
              Get started by creating a new QR code.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => handleModalOpen('create')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Icon path={ICONS.plus} className="w-5 h-5 mr-2 -ml-1" />
                Create New QR Code
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {qrCodes.map((qr) => (
              <QrCard
                key={qr.id}
                qr={qr}
                onEdit={handleModalOpen.bind(null, 'edit')}
                onDelete={handleDelete}
                onDownload={handleDownload}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}