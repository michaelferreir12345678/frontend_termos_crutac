import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import 'primereact/resources/themes/lara-light-indigo/theme.css';  // Tema PrimeReact
import 'primereact/resources/primereact.min.css';  // Estilos do PrimeReact

function UploadPage() {
  const [file, setFile] = useState(null);
  const [policyNumber, setPolicyNumber] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [studentsData, setStudentsData] = useState([]);
  const [units, setUnits] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({}); // Estado para os erros de validação
  const [backendError, setBackendError] = useState(""); // Estado para mensagens de erro do backend

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setBackendError(""); // Limpa erros anteriores ao selecionar um novo arquivo
  };

  const handlePolicyChange = (e) => {
    setPolicyNumber(e.target.value);
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  const handleUnitChange = (studentName, unit) => {
    setUnits((prev) => ({ ...prev, [studentName]: unit }));

    // Remover erro quando a unidade é selecionada
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors[studentName]; // Remover o erro para o aluno específico
      return newErrors;
    });
  };

  const handleShowStudents = async () => {
    if (!file) {
      console.error("Nenhum arquivo selecionado");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/nomes_alunos", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const studentsData = data.students.map((name, index) => ({
          name,
          cpf: data.cpf[index],
          matricula: data.matricula[index],
          endereco: data.endereco[index],
          cidade: data.cidade[index],
          telefone: data.telefone[index],
        }));
        setStudentsData(studentsData);
        setBackendError(""); // Limpar mensagem de erro ao carregar dados com sucesso
      } else {
        const errorData = await response.json();
        setBackendError(errorData.error || "Erro desconhecido ao processar a solicitação.");
      }
    } catch (error) {
      setBackendError("Erro ao se conectar ao servidor. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTerms = async () => {
    // Verificar se todas as unidades concedentes estão selecionadas corretamente
    const newErrors = {};
    studentsData.forEach((student) => {
      if (!units[student.name] || units[student.name] === "Selecione...") {
        newErrors[student.name] = "Campo obrigatório"; // Adiciona erro para o aluno específico
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors); // Atualiza os erros
      return; // Não prosseguir se houver erros
    }

    // Se não houver erros, enviar para o backend
    const payload = {
      policyNumber,
      startDate,
      endDate,
      students: studentsData.map((student) => ({
        name: student.name,
        cpf: student.cpf,
        matricula: student.matricula,
        endereco: student.endereco,
        cidade: student.cidade,
        telefone: student.telefone,
        unit: units[student.name] || "Não Selecionado",
      })),
    };

    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
        setBackendError(""); // Limpa mensagem de erro ao gerar os termos com sucesso
      } else {
        const errorData = await response.json();
        setBackendError(errorData.error || "Erro desconhecido ao processar a solicitação.");
      }
    } catch (error) {
      setBackendError("Erro ao se conectar ao servidor. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h1>Gerador de Termo de Compromisso de Estágio</h1>
      <p>
        A planilha deve conter as colunas: Nome; CPF; Matricula; Endereço;
        Cidade/UF; Telefone.
      </p>

      {backendError && (
        <div className="alert alert-danger" role="alert">
          {backendError}
        </div>
      )}

      <div className="row mb-3">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Número da Apólice"
            value={policyNumber}
            onChange={handlePolicyChange}
          />
        </div>
        <div className="col-md-4">
          <input
            type="date"
            className="form-control"
            placeholder="Data Início da Vigência"
            value={startDate}
            onChange={handleStartDateChange}
          />
        </div>
        <div className="col-md-4">
          <input
            type="date"
            className="form-control"
            placeholder="Data Final de Vigência"
            value={endDate}
            onChange={handleEndDateChange}
          />
        </div>
      </div>

      <div className="mb-3">
        <input
          type="file"
          className="form-control"
          onChange={handleFileChange}
        />
      </div>

      <button
        className="btn btn-primary"
        onClick={handleShowStudents}
        disabled={!file || loading}
      >
        {loading ? "Carregando..." : "Mostrar"}
      </button>

      {studentsData.length > 0 && (
        <div className="mt-5">
          <h2>Lista de Alunos</h2>
          <DataTable value={studentsData} responsive striped>
            <Column field="name" header="Nome" />
            <Column field="cpf" header="CPF" />
            <Column field="matricula" header="Matricula" />
            <Column field="endereco" header="Endereço" />
            <Column field="cidade" header="Cidade" />
            <Column field="telefone" header="Telefone" />
            <Column
              body={(rowData) => (
                <div>
                  <select
                    className={`form-select ${errors[rowData.name] ? "is-invalid" : ""}`}
                    value={units[rowData.name] || ""}
                    onChange={(e) => handleUnitChange(rowData.name, e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    <option value="Beberibe">Beberibe</option>
                    <option value="Itaitinga">Itaitinga</option>
                    <option value="Aquiraz">Aquiraz</option>
                    <option value="Aracati">Aracati</option>
                    <option value="Horizonte">Horizonte</option>
                  </select>
                  {errors[rowData.name] && (
                    <div className="invalid-feedback">{errors[rowData.name]}</div>
                  )}
                </div>
              )}
              header="Unidade Concedente"
            />
          </DataTable>

          <button
            className="btn btn-success mt-3 mb-5"
            onClick={handleGenerateTerms}
            disabled={loading}
          >
            {loading ? "Gerando..." : "Gerar e Baixar Termos"}
          </button>
        </div>
      )}
    </div>
  );
}

export default UploadPage;
