import React, { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

function UploadPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      console.error("Nenhum arquivo selecionado");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true); // Inicia o carregamento

    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "termos_estagio.zip");
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      } else {
        console.error("Erro ao gerar PDFs");
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h1>Gerador de Termo de Compromisso de Estágio</h1>
      <p className="container mt-5">
        A planilha tem que ter as colunas com os seguintes
        títulos: Nome;  CPF;  Matricula;  Endereco;  Cidade/UF;  Telefone
      </p>
      <div className="mb-3">
        <input type="file" className="form-control" onChange={handleFileChange} />
      </div>

      <button className="btn btn-primary" onClick={handleUpload} disabled={!file || loading}>
        {loading ? "Carregando..." : "Gerar e Baixar Termos"}
      </button>

      {loading && (
        <div className="mt-3">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <span className="ms-2">Carregando...</span>
        </div>
      )}
    </div>
  );
}

export default UploadPage;
