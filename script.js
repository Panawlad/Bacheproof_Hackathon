const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const ABI = [
  "function submitReport(string,string) external",
];

async function submitReport() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

  const location = document.getElementById("location").value;
  const image = document.getElementById("image").files[0];

  // Subir a IPFS (modo demo)
  const reader = new FileReader();
  reader.onloadend = async function () {
    const imageHash = btoa(reader.result); // sustituir por IPFS real
    const tx = await contract.submitReport(location, imageHash);
    await tx.wait();
    document.getElementById("status").innerText = "Reporte enviado correctamente.";
  };
  reader.readAsDataURL(image);
}
