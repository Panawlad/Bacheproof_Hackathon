const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const ABI = [
  "function reports(uint) view returns (uint id, string memory location, string memory imageHash, address reporter, bool approved, uint cost, uint repairDate, bool paid, bool isFixed)",
  "function nextReportId() view returns (uint)",
  "function approveReport(uint, uint, uint) public",
  "function markAsFixed(uint) public"
];

async function connectWalletAndLoad() {
  if (!window.ethereum) {
    alert("Instala Metamask para continuar.");
    return;
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    console.log("Wallet conectada:", accounts[0]);
    await loadReports();
  } catch (err) {
    console.error("Error al conectar Metamask:", err);
    alert("Error al conectar Metamask. Consulta la consola.");
  }
}

async function loadReports() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

  const total = await contract.nextReportId();
  const container = document.getElementById("reports");
  container.innerHTML = "";

  if (total.toNumber() === 0) {
    container.innerHTML = "<p>No hay reportes registrados aún.</p>";
    return;
  }

  for (let i = 0; i < total; i++) {
    const rep = await contract.reports(i);

    const div = document.createElement("div");
    div.className = "report";

    div.innerHTML = `
      <h3>Reporte #${rep.id}</h3>
      <p><strong>Ubicación:</strong> ${rep.location}</p>
      <p><strong>Reportado por:</strong> ${rep.reporter}</p>
      <p><strong>Aprobado:</strong> ${rep.approved}</p>
      <p><strong>Costo:</strong> ${rep.cost}</p>
      <p><strong>Fecha reparación:</strong> ${rep.repairDate}</p>
      <p><strong>Pagado:</strong> ${rep.paid}</p>
      <p><strong>Reparado:</strong> ${rep.isFixed}</p>
      <img src="${atob(rep.imageHash)}" width="200" />
    `;

    if (!rep.approved) {
      const costInput = document.createElement("input");
      costInput.placeholder = "Costo en wei";
      const dateInput = document.createElement("input");
      dateInput.placeholder = "Fecha (timestamp)";
      const btnApprove = document.createElement("button");
      btnApprove.innerText = "Aprobar";
      btnApprove.onclick = async () => {
        await contract.approveReport(rep.id, costInput.value, dateInput.value);
        loadReports();
      };
      div.append(costInput, dateInput, btnApprove);
    } else if (rep.paid && !rep.isFixed) {
      const btnFix = document.createElement("button");
      btnFix.innerText = "Marcar como Reparado";
      btnFix.onclick = async () => {
        await contract.markAsFixed(rep.id);
        loadReports();
      };
      div.appendChild(btnFix);
    }

    container.appendChild(div);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("connectBtn");
  if (btn) {
    btn.addEventListener("click", connectWalletAndLoad);
  } else {
    console.error("No se encontró el botón con ID 'connectBtn'");
  }
});
