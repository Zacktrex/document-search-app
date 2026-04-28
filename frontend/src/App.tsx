import { useState, useEffect, useCallback, useRef } from 'react'

import './App.css'

interface Document {
  _id: string
  fileName: string
  lastModified: string
  content?: string
}

const API_BASE_URL = 'http://localhost:5000'

function App() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [searchResults, setSearchResults] = useState<Document[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchAllDocuments = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/files`)
      const data = await response.json()
      setDocuments(data)
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAllDocuments()
  }, [fetchAllDocuments])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      setSearchResults([])
      setHasSearched(false)
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      setSearchResults(data)
      setHasSearched(true)
      setSelectedDoc(null)
    } catch (error) {
      console.error('Error searching:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!uploadFiles || uploadFiles.length === 0) {
      alert('Please select one or more files to upload')
      return
    }

    try {
      setLoading(true)
      const formData = new FormData()
      for (let i = 0; i < uploadFiles.length; i++) {
        formData.append('files', uploadFiles[i])
      }

      const response = await fetch(`${API_BASE_URL}/files`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        alert(`${data.uploadedCount} file(s) uploaded successfully!`)
        setUploadFiles(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        fetchAllDocuments()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error uploading:', error)
      alert('Error uploading files')
    } finally {
      setLoading(false)
    }
  }

  const viewDocumentContent = (doc: Document) => {
    setSelectedDoc(doc)
  }

  const displayDocs = hasSearched ? searchResults : documents

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Document Search Application</h1>
      </header>

      <main className="app-main">
        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="form-group">
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="btn btn-primary">
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          <form onSubmit={handleUpload} className="upload-form">
            <div className="form-group">
              <label htmlFor="file-input" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Select Files (PDF, DOCX, TXT)
              </label>
              <input
                ref={fileInputRef}
                id="file-input"
                type="file"
                multiple
                accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                onChange={(e) => setUploadFiles(e.target.files)}
                className="upload-input"
              />
            </div>
            {uploadFiles && uploadFiles.length > 0 && (
              <div className="file-list">
                <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                  {uploadFiles.length} file(s) selected:
                </p>
                <ul style={{ fontSize: '12px', color: '#666', marginLeft: '20px' }}>
                  {Array.from(uploadFiles).map((file, idx) => (
                    <li key={idx}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
            <button type="submit" className="btn btn-secondary" disabled={loading}>
              {loading ? 'Uploading...' : 'Upload Files'}
            </button>
          </form>
        </div>

        <div className="results-container">
          {selectedDoc ? (
            <div className="document-detail">
              <button onClick={() => setSelectedDoc(null)} className="btn btn-back">
                Back to Results
              </button>
              <h2>{selectedDoc.fileName}</h2>
              <p className="last-modified">
                Last Modified: {new Date(selectedDoc.lastModified).toLocaleString()}
              </p>
              <div className="content-box">
                {selectedDoc.content || 'Content not available'}
              </div>
            </div>
          ) : (
            <div className="results-section">
              <h2>
                {hasSearched
                  ? `Search Results (${displayDocs.length})`
                  : `All Documents (${displayDocs.length})`}
              </h2>

              {displayDocs.length === 0 ? (
                <div className="no-results">
                  {hasSearched
                    ? 'No documents found matching your search'
                    : 'No documents available'}
                </div>
              ) : (
                <div className="documents-list">
                  {displayDocs.map((doc) => (
                    <div key={doc._id} className="document-card">
                      <h3>{doc.fileName}</h3>
                      <p className="last-modified">
                        Last Modified: {new Date(doc.lastModified).toLocaleString()}
                      </p>
                      <button
                        onClick={() => viewDocumentContent(doc)}
                        className="btn btn-view"
                      >
                        View Content
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
