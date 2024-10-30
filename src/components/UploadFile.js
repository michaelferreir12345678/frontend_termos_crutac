import React, { useState } from 'react';

function UploadPage() {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      console.error('Nenhum arquivo selecionado');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://127.0.0.1:5000/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        // Cria um link temporário para baixar o ZIP
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'termos_estagio.zip');
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        
      } else {
        console.error('Erro ao gerar PDFs');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={!file}>Gerar e Baixar Termos</button>
    </div>
  );
}

export default UploadPage;
