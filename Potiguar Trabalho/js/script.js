const hoje = new Date();
const mesSelecionado = parseInt(localStorage.getItem("mesSelecionado") || hoje.getMonth());
const anoAtual = 2025;
const diasNoMes = new Date(anoAtual, mesSelecionado + 1, 0).getDate();

document.getElementById("tituloMes").textContent = `Agendamentos - ${new Date(anoAtual, mesSelecionado).toLocaleString("pt-BR", { month: "long", year: "numeric" })}`;

const monthGrid = document.getElementById("monthGrid");
const timeList = document.getElementById("timeList");
const confirmCard = document.getElementById("confirmCard");
const confirmHorario = document.getElementById("confirmHorario");
const observacao = document.getElementById("observacao");

const horariosBase = [];
let selectedDay = null;
let selectedTime = null;

// Gera horários 08:00 - 18:00 com 1h30 de intervalo
for (let h = 8; h < 18; h += 1.5) {
  const hora = String(Math.floor(h)).padStart(2, "0");
  const min = h % 1 === 0 ? "00" : "30";
  horariosBase.push(`${hora}:${min}`);
}

// Renderiza o calendário do mês
for (let dia = 1; dia <= diasNoMes; dia++) {
  const cell = document.createElement("div");
  cell.classList.add("day-cell");
  cell.textContent = dia;

  const data = new Date(anoAtual, mesSelecionado, dia);
  if (data < hoje) cell.classList.add("day-past");

  cell.addEventListener("click", () => {
    if (cell.classList.contains("day-past")) return;
    selectedDay = dia;
    renderHorarios(dia);
  });

  monthGrid.appendChild(cell);
}

// Renderiza horários
function renderHorarios(dia) {
  timeList.innerHTML = "";
  confirmCard.style.display = "none";
  const chaveDia = `agendamentos-${anoAtual}-${mesSelecionado}-${dia}`;
  const agendados = JSON.parse(localStorage.getItem(chaveDia)) || [];

  horariosBase.forEach(horario => {
    const slot = document.createElement("div");
    slot.classList.add("time-slot");
    slot.textContent = horario;

    if (agendados.find(a => a.horario === horario)) {
      slot.classList.add("occupied");
      slot.addEventListener("click", () => cancelarHorario(dia, horario));
    } else {
      slot.addEventListener("click", () => abrirConfirmacao(dia, horario));
    }

    timeList.appendChild(slot);
  });
}

// Card de confirmação
function abrirConfirmacao(dia, horario) {
  selectedTime = horario;
  confirmCard.style.display = "block";
  confirmHorario.textContent = `Dia ${dia} às ${horario}`;
  observacao.value = "";
}

// Confirma agendamento
document.getElementById("confirmarBtn").addEventListener("click", () => {
  const chaveDia = `agendamentos-${anoAtual}-${mesSelecionado}-${selectedDay}`;
  const agendados = JSON.parse(localStorage.getItem(chaveDia)) || [];

  agendados.push({ horario: selectedTime, obs: observacao.value || "" });
  localStorage.setItem(chaveDia, JSON.stringify(agendados));

  confirmCard.style.display = "none";
  renderHorarios(selectedDay);
  atualizarCores();
  alert("✅ Agendamento confirmado!");
});

// Cancela agendamento
function cancelarHorario(dia, horario) {
  if (!confirm("Deseja cancelar este agendamento?")) return;
  const chaveDia = `agendamentos-${anoAtual}-${mesSelecionado}-${dia}`;
  let agendados = JSON.parse(localStorage.getItem(chaveDia)) || [];
  agendados = agendados.filter(a => a.horario !== horario);
  localStorage.setItem(chaveDia, JSON.stringify(agendados));
  renderHorarios(dia);
  atualizarCores();
}

document.getElementById("cancelarBtn").addEventListener("click", () => {
  confirmCard.style.display = "none";
});

// Atualiza cores dos dias
function atualizarCores() {
  const cells = document.querySelectorAll(".day-cell");
  cells.forEach((cell, index) => {
    const dia = index + 1;
    const chaveDia = `agendamentos-${anoAtual}-${mesSelecionado}-${dia}`;
    const agendados = JSON.parse(localStorage.getItem(chaveDia)) || [];
    cell.classList.remove("day-green", "day-yellow", "day-red");

    const data = new Date(anoAtual, mesSelecionado, dia);
    if (data < hoje) return;

    const qtd = agendados.length;
    if (qtd > 0 && qtd <= 2) cell.classList.add("day-green");
    else if (qtd > 2 && qtd <= 5) cell.classList.add("day-yellow");
    else if (qtd > 5) cell.classList.add("day-red");
  });
}

function voltar() {
  window.location.href = "calendario-anual.html";
}

atualizarCores();
