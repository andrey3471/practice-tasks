// ---------------------------
// Spreadsheet: Таблица с редактированием и localStorage
// ---------------------------

const STORAGE_KEY = 'spreadsheetData-v1';
const DEFAULT_ROWS = 5;
const DEFAULT_COLS = 6;

let table = [];
let rows = DEFAULT_ROWS;
let cols = DEFAULT_COLS;

function saveTable() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ table, rows, cols }));
}

function loadTable() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    try {
      const obj = JSON.parse(data);
      if (Array.isArray(obj.table) && obj.rows > 0 && obj.cols > 0) {
        table = obj.table;
        rows = obj.rows;
        cols = obj.cols;
        return;
      }
    } catch {}
  }
  table = Array.from({ length: rows }, () => Array(cols).fill(""));
}

function renderTable() {
  const area = document.getElementById('spreadsheetArea');
  let html = `<div class="s-table-wrap"><table class="s-table"><tbody>`;

  for (let r = 0; r < rows; r++) {
    html += '<tr>';
    for (let c = 0; c < cols; c++) {
      const val = table[r]?.[c] || "";
      html += `<td data-row="${r}" data-col="${c}">
        <div class="s-cell-content" ondblclick="editCell(event,${r},${c})" ontouchstart="cellTouchStart(event,${r},${c})" tabindex="0">
          ${val ? escapeHtml(val) : ''}
        </div>
      </td>`;
    }
    html += '</tr>';
  }
  html += `</tbody></table>
    <div class="s-table-controls">
      <button class="s-btn" onclick="addCol()" title="Добавить столбец">+</button>
      <button class="s-btn" onclick="removeCol()" title="Удалить столбец" ${cols === 1 ? 'disabled' : ''}>-</button>
    </div>
    </div>
    <div class="s-table-row-controls">
      <button class="s-btn" onclick="addRow()" title="Добавить строку">+</button>
      <button class="s-btn" onclick="removeRow()" title="Удалить строку" ${rows === 1 ? 'disabled' : ''}>-</button>
    </div>
    `;
  area.innerHTML = html;

  document.querySelectorAll('.s-cell-content').forEach(div => {
    div.addEventListener('keydown', function(e) {
      if (e.key === "Enter") {
        const r = +this.parentNode.dataset.row, c = +this.parentNode.dataset.col;
        editCell(e, r, c);
      }
    });
  });
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, m => ({
    '&': "&amp;", '<': "&lt;", '>': "&gt;", '"': "&quot;", "'": "&#39;"
  })[m]);
}

function editCell(event, r, c) {
  event.preventDefault();
  const td = document.querySelector(`td[data-row="${r}"][data-col="${c}"]`);
  if (!td) return;
  const val = table[r]?.[c] || "";
  td.innerHTML = `<input type="text" value="${escapeHtml(val)}" autofocus />`;
  const input = td.firstElementChild;
  input.focus();
  input.select();
  input.onblur = () => saveCell(r, c, input.value);
  input.onkeydown = e => {
    if (e.key === "Enter" || e.key === "Tab") {
      input.blur();
      e.preventDefault();
    } else if (e.key === "Escape") {
      td.innerHTML = `<div class="s-cell-content" ondblclick="editCell(event,${r},${c})" ontouchstart="cellTouchStart(event,${r},${c})" tabindex="0">${escapeHtml(val)}</div>`;
    }
  };
}

function saveCell(r, c, val) {
  table[r][c] = val;
  saveTable();
  renderTable();
}

let lastTap = 0;
window.cellTouchStart = function(event, r, c) {
  const now = Date.now();
  if (now - lastTap < 350) {
    editCell(event, r, c);
  }
  lastTap = now;
};

window.editCell = editCell;

window.addCol = function() {
  cols++;
  for (let r = 0; r < rows; r++) {
    table[r].push("");
  }
  saveTable();
  renderTable();
};

window.removeCol = function() {
  if (cols === 1) return;
  let hasData = false;
  for (let r = 0; r < rows; r++) {
    if (table[r][cols - 1]) hasData = true;
  }
  if (hasData && !confirm('В столбце есть данные. Удалить столбец?')) return;
  cols--;
  for (let r = 0; r < rows; r++) {
    table[r].pop();
  }
  saveTable();
  renderTable();
};

window.addRow = function() {
  rows++;
  table.push(Array(cols).fill(""));
  saveTable();
  renderTable();
};

window.removeRow = function() {
  if (rows === 1) return;
  let hasData = false;
  for (let c = 0; c < cols; c++) {
    if (table[rows - 1][c]) hasData = true;
  }
  if (hasData && !confirm('В строке есть данные. Удалить строку?')) return;
  rows--;
  table.pop();
  saveTable();
  renderTable();
};

loadTable();
renderTable();
