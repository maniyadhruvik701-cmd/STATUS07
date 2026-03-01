// Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAz4e7tEJdisgTSAY5pGzx7P60fmR2kI4U",
    authDomain: "statusdashboard-d30db.firebaseapp.com",
    databaseURL: "https://statusdashboard-d30db-default-rtdb.firebaseio.com",
    projectId: "statusdashboard-d30db",
    storageBucket: "statusdashboard-d30db.firebasestorage.app",
    messagingSenderId: "345766167688",
    appId: "1:345766167688:web:e665f41a75f25e72bf8b3d",
    measurementId: "G-23TBXXLHTX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Storage Management (Still use LocalStorage for auth/view state, but Data is now Firebase)
const SAVE_KEY_PAGE = 'status_current_page';
const SAVE_KEY_AUTH = 'status_is_logged_in';
const SAVE_KEY_CONFIG = 'status_dropdown_config'; // We could potentially move config to Firebase too
const SAVE_KEY_VIEW = 'status_current_view';

// Pagination State
let currentPage = parseInt(localStorage.getItem(SAVE_KEY_PAGE)) || 1;
const rowsPerPage = 20;

// Config Dropdowns with Persistence
const defaultConfig = {
    platforms: ['Indiamart', 'Google', 'Personal', 'Paid'],
    types: ['Reseller', 'Wholeseller', 'Online Brand'],
    statuses: ['Visit Done', 'Visit', 'Pending', 'Call Done']
};

let dropdownConfig = JSON.parse(localStorage.getItem(SAVE_KEY_CONFIG)) || defaultConfig;

function saveConfig() {
    localStorage.setItem(SAVE_KEY_CONFIG, JSON.stringify(dropdownConfig));
}

// Initialize Data
let tableData = []; // Will be loaded from Firebase

// Fix dates with wrong year (0026 -> 2026)
function fixDates(data) {
    const dateFields = ['date', 'orderDate', 'followUp'];
    let changed = false;
    data.forEach(row => {
        dateFields.forEach(field => {
            if (row[field] && row[field].includes('0026')) {
                row[field] = row[field].replace('0026', '2026');
                changed = true;
            }
        });
    });
    return changed;
}

// Listen for Data Changes - This makes it real-time across devices!
const dataRef = ref(db, 'status_data');
onValue(dataRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
        // Firebase returns objects for lists sometimes, ensure it's an array
        tableData = Array.isArray(data) ? data : Object.values(data);
        // Auto-fix wrong year dates
        if (fixDates(tableData)) {
            saveData(); // Save corrected dates back to Firebase
        }
    } else {
        tableData = [];
    }
    renderTable(); // Re-render whenever cloud data updates
});

function saveData() {
    // Save to Firebase Cloud
    // We use set() to overwrite the list with the new state
    set(dataRef, tableData).catch((error) => {
        console.error("Error saving data: ", error);
        alert('Data could not be saved to the cloud. Please check your connection.');
    });
}

function savePage() {
    localStorage.setItem(SAVE_KEY_PAGE, currentPage.toString());
}

function saveAuthState(status) {
    localStorage.setItem(SAVE_KEY_AUTH, status);
}

// DOM Elements
const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');
const dataEntryView = document.getElementById('data-entry-view');
const reportsView = document.getElementById('reports-view');
const performanceView = document.getElementById('performance-view');
const viewTitle = document.getElementById('view-title');
const viewSubtitle = document.getElementById('view-subtitle');

const signinForm = document.getElementById('signin-form');
const signupForm = document.getElementById('signup-form');
const logoutBtn = document.getElementById('logout-btn');

const tableBody = document.getElementById('table-body');
const addRowBtn = document.getElementById('addRowBtn');
const paginationContainer = document.getElementById('pagination-controls');
const searchInput = document.getElementById('searchInput');

const navDataEntry = document.getElementById('nav-data-entry');
const navReports = document.getElementById('nav-reports');
const navPerformance = document.getElementById('nav-performance');
const navOrders = document.getElementById('nav-orders');

// To Do Report Elements
const reportStartDate = document.getElementById('report-start-date');
const generateReportBtn = document.getElementById('generate-report-btn');
const reportResults = document.getElementById('report-results');
const summaryTableBody = document.getElementById('summary-table-body');

// Performance Report Elements
const perfStartDate = document.getElementById('perf-start-date');
const perfEndDate = document.getElementById('perf-end-date');
const generatePerfBtn = document.getElementById('generate-perf-btn');
const perfResults = document.getElementById('perf-results');
const perfTableBody = document.getElementById('perf-table-body');

// Order Report Elements
const orderReportView = document.getElementById('order-report-view');
const orderStartDate = document.getElementById('order-start-date');
const orderEndDate = document.getElementById('order-end-date');
const generateOrderBtn = document.getElementById('generate-order-btn');
const orderResults = document.getElementById('order-results');
const orderTableBody = document.getElementById('order-table-body');
const orderTableFooter = document.getElementById('order-table-footer');

// Modal Elements
const optionsModal = document.getElementById('options-modal');
const modalTitle = document.getElementById('modal-title');
const modalOptionsList = document.getElementById('modal-options-list');
const newOptionInput = document.getElementById('new-option-input');
const addOptionBtn = document.getElementById('add-option-btn');
const closeModalBtn = document.getElementById('close-modal');

let activeConfigKey = '';

// Navigation
function switchView(view) {
    localStorage.setItem(SAVE_KEY_VIEW, view);
    [dataEntryView, reportsView, performanceView, orderReportView].forEach(v => v?.classList.add('hidden'));
    [navDataEntry, navReports, navPerformance, navOrders].forEach(n => n?.classList.remove('active'));

    if (view === 'data-entry') {
        dataEntryView.classList.remove('hidden');
        navDataEntry.classList.add('active');
        viewTitle.textContent = 'Data Entry';
        viewSubtitle.textContent = 'Manage and input your records';
        renderTable();
    } else if (view === 'reports') {
        reportsView.classList.remove('hidden');
        navReports.classList.add('active');
        viewTitle.textContent = 'To Do List';
        viewSubtitle.textContent = 'Check your tasks by follow-up date';
    } else if (view === 'performance') {
        performanceView.classList.remove('hidden');
        navPerformance.classList.add('active');
        viewTitle.textContent = 'Work Report';
        viewSubtitle.textContent = 'Summary of activities within a date range';
    } else if (view === 'orders') {
        orderReportView.classList.remove('hidden');
        navOrders.classList.add('active');
        viewTitle.textContent = 'Total Order Report';
        viewSubtitle.textContent = 'Summary of orders by date';
    }
}

navDataEntry.onclick = () => switchView('data-entry');
navReports.onclick = () => switchView('reports');
navPerformance.onclick = () => switchView('performance');
navOrders.onclick = () => switchView('orders');

signinForm.onsubmit = (e) => { e.preventDefault(); doLogin(e); };
signupForm.onsubmit = (e) => { e.preventDefault(); doLogin(e); };

function doLogin(e) {
    const form = e.target;
    const email = form.querySelector('input[type="email"]').value;
    const password = form.querySelector('input[type="password"]').value;

    if (email === 'maniyadhruvik07@gmail.com' && password === 'maniya@#07') {
        authSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');
        saveAuthState('true');
        renderTable();
        const savedView = localStorage.getItem(SAVE_KEY_VIEW) || 'data-entry';
        switchView(savedView);
    } else {
        alert('Invalid Email or Password!');
    }
}

logoutBtn.onclick = () => {
    dashboardSection.classList.add('hidden');
    authSection.classList.remove('hidden');
    saveAuthState('false');
    localStorage.removeItem(SAVE_KEY_PAGE);
    localStorage.removeItem(SAVE_KEY_VIEW);
};

// Modal logic
function openOptionsModal(configKey) {
    activeConfigKey = configKey;
    modalTitle.textContent = `Manage ${configKey.charAt(0).toUpperCase() + configKey.slice(1)}`;
    renderModalOptions();
    optionsModal.classList.remove('hidden');
}

function renderModalOptions() {
    modalOptionsList.innerHTML = '';
    const options = dropdownConfig[activeConfigKey];
    options.forEach((opt, index) => {
        const div = document.createElement('div');
        div.className = 'option-entry';
        const input = document.createElement('input');
        input.type = 'text';
        input.value = opt;
        input.onchange = (e) => {
            dropdownConfig[activeConfigKey][index] = e.target.value;
            saveConfig();
            renderTable();
        };
        const actions = document.createElement('div');
        actions.className = 'option-actions';
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-icon btn-danger-icon';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.onclick = () => {
            dropdownConfig[activeConfigKey].splice(index, 1);
            saveConfig();
            renderModalOptions();
            renderTable();
        };
        actions.appendChild(deleteBtn);
        div.appendChild(input);
        div.appendChild(actions);
        modalOptionsList.appendChild(div);
    });
}

addOptionBtn.onclick = () => {
    const newVal = newOptionInput.value.trim();
    if (newVal) {
        dropdownConfig[activeConfigKey].push(newVal);
        newOptionInput.value = '';
        saveConfig();
        renderModalOptions();
        renderTable();
    }
};

closeModalBtn.onclick = () => optionsModal.classList.add('hidden');

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('edit-config')) {
        openOptionsModal(e.target.dataset.config);
    }
});

// Table Rendering
function createRow(data, actualIndex) {
    const tr = document.createElement('tr');

    // Sr. No Cell
    const tdSr = document.createElement('td');
    tdSr.textContent = actualIndex + 1;
    tdSr.style.fontWeight = 'bold';
    tdSr.style.color = 'var(--text-muted)';
    tr.appendChild(tdSr);

    const fields = [
        { key: 'date', type: 'date' },
        { key: 'name', type: 'text' },
        { key: 'mobile', type: 'tel' },
        { key: 'company', type: 'text' },
        { key: 'city', type: 'text' },
        { key: 'state', type: 'text' },
        { key: 'platform', type: 'select', configKey: 'platforms', label: 'Platform' },
        { key: 'type', type: 'select', configKey: 'types', label: 'Type' },
        { key: 'status', type: 'select', configKey: 'statuses', label: 'Status' },
        { key: 'orderDate', type: 'date' },
        { key: 'totalQty', type: 'number' },
        { key: 'followUp', type: 'date' },
        { key: 'comments', type: 'text' }
    ];
    fields.forEach(f => {
        const td = document.createElement('td');
        if (f.type === 'select') {
            const select = document.createElement('select');
            select.className = 'cell-input';

            // Add Placeholder Option
            const placeholder = document.createElement('option');
            placeholder.value = '';
            placeholder.textContent = `-- Select ${f.label} --`;
            placeholder.selected = !data[f.key];
            select.appendChild(placeholder);
            select.value = data[f.key] || '';

            dropdownConfig[f.configKey].forEach(opt => {
                const o = document.createElement('option');
                o.value = opt;
                o.textContent = opt;
                if (opt === data[f.key]) o.selected = true;
                select.appendChild(o);
            });
            select.onchange = (e) => { tableData[actualIndex][f.key] = e.target.value; saveData(); };
            td.appendChild(select);
        } else {
            const input = document.createElement('input');
            input.type = f.type;
            input.className = 'cell-input';
            input.value = data[f.key] || '';
            input.onchange = (e) => { tableData[actualIndex][f.key] = e.target.value; saveData(); };
            td.appendChild(input);
        }
        tr.appendChild(td);
    });
    return tr;
}

function renderTable() {
    tableBody.innerHTML = '';
    const query = (searchInput ? searchInput.value.toLowerCase() : '');

    // Filter logic
    let displayData = tableData;
    let originalIndices = tableData.map((_, i) => i);

    if (query) {
        displayData = [];
        originalIndices = [];
        tableData.forEach((row, index) => {
            const searchableText = `${row.name || ''} ${row.mobile || ''} ${row.company || ''} ${row.city || ''} ${row.state || ''} ${row.date || ''}`.toLowerCase();
            if (searchableText.includes(query)) {
                displayData.push(row);
                originalIndices.push(index);
            }
        });
    }

    const totalPages = Math.ceil(displayData.length / rowsPerPage);
    if (currentPage > totalPages) currentPage = totalPages || 1;
    const startIndex = (currentPage - 1) * rowsPerPage;
    const pageData = displayData.slice(startIndex, startIndex + rowsPerPage);

    pageData.forEach((row, idx) => {
        // Pass the absolute index so that updates write to the correct row in tableData
        const actualIndex = originalIndices[startIndex + idx];
        tableBody.appendChild(createRow(row, actualIndex));
    });

    renderPagination(displayData.length);
}

if (searchInput) {
    searchInput.addEventListener('input', () => {
        currentPage = 1;
        savePage();
        renderTable();
    });
}

function renderPagination(totalItemsCount) {
    paginationContainer.innerHTML = '';
    const totalPages = Math.ceil(totalItemsCount / rowsPerPage);
    if (totalPages <= 1) return;
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        btn.textContent = i;
        btn.onclick = () => { currentPage = i; savePage(); renderTable(); };
        paginationContainer.appendChild(btn);
    }
}

addRowBtn.onclick = () => {
    // Add new entries to the BOTTOM (push)
    // This ensures existing entries at the top (index 0, 1, etc.) STAY at the top.
    const today = new Date().toISOString().split('T')[0]; // e.g. 2026-02-25
    for (let i = 0; i < 50; i++) {
        tableData.push({
            date: today, name: '', mobile: '', company: '', city: '', state: '', platform: '',
            type: '', status: '',
            orderDate: '', totalQty: '', followUp: '', comments: ''
        });
    }
    // We stay on the current page so the user doesn't lose context, 
    // or we can go to the last page. 
    // Let's go to the last page to show the new blank rows as requested previously.
    currentPage = Math.ceil(tableData.length / rowsPerPage);
    if (currentPage < 1) currentPage = 1;

    saveData(); savePage(); renderTable();
};

const clearAllBtn = document.getElementById('clearAllBtn');
if (clearAllBtn) {
    clearAllBtn.onclick = () => {
        if (confirm('Are you sure you want to CLEAR ALL entries? This action cannot be undone.')) {
            tableData = [];
            currentPage = 1;
            saveData();
            savePage();
            renderTable();
        }
    };
}

const exportBtn = document.getElementById('exportBtn');
if (exportBtn) {
    exportBtn.onclick = () => {
        if (tableData.length === 0) return alert('No data to export');
        const headers = ["Date", "Name", "Mobile No", "Company", "City", "State", "Platform", "Type", "Status", "Order Date", "Total Qty", "Follow-up", "Comments"];
        const rows = tableData.map(r => [
            r.date, r.name, r.mobile, r.company, r.city || '', r.state || '', r.platform, r.type, r.status, r.orderDate, r.totalQty, r.followUp, r.comments
        ]);
        let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `status_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
}

// Report Logics
generateReportBtn.onclick = () => {
    const d = reportStartDate.value;
    if (!d) return alert('Select a Date');
    const filtered = tableData.filter(r => r.followUp === d);
    reportResults.classList.remove('hidden');
    summaryTableBody.innerHTML = '';

    // name વાઇઝ અને status વાઇઝ કાઉન્ટિંગ (માત્ર To Do table માટે)
    let grandTotal = 0;

    // પહેલા ડેટા ને Name થી ગ્રુપ કરો.
    const nameGroups = {};
    filtered.forEach(r => {
        const n = r.name || '-';
        if (!nameGroups[n]) nameGroups[n] = [];
        nameGroups[n].push(r);
    });

    Object.keys(nameGroups).sort().forEach(n => {
        const groupData = nameGroups[n];

        dropdownConfig.statuses.forEach(s => {
            const count = groupData.filter(r => r.status === s).length;
            if (count > 0) {
                grandTotal += count;
                const tr = document.createElement('tr');
                const color = s === 'Pending' ? 'var(--warning)' : 'var(--success)';
                tr.innerHTML = `
                    <td style="font-weight:600;">${n}</td>
                    <td style="font-weight:600;">${s}</td>
                    <td style="text-align:center; color:${color}; font-weight:800;">${count} To Do</td>
                `;
                summaryTableBody.appendChild(tr);
            }
        });
    });

    // Grand Total Row
    const trTotal = document.createElement('tr');
    trTotal.style.background = 'rgba(255, 255, 255, 0.05)';
    trTotal.innerHTML = `<td colspan="2" style="font-weight:700; color: var(--primary); text-align: right; padding-right: 20px;">GRAND TOTAL</td><td style="text-align:center; color:var(--primary); font-weight:800;">${grandTotal}</td>`;
    summaryTableBody.appendChild(trTotal);

    // Show Pending Entries Detail
    const todoPendingBody = document.getElementById('todo-pending-body');
    const todoPendingSection = document.getElementById('todo-pending-section');
    if (todoPendingBody) {
        todoPendingBody.innerHTML = '';
        const pendingEntries = filtered.filter(r => r.status === 'Pending');
        if (pendingEntries.length === 0) {
            todoPendingSection.style.display = 'none';
        } else {
            todoPendingSection.style.display = '';
            pendingEntries.forEach(row => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row.date || '-'}</td>
                    <td>${row.name || '-'}</td>
                    <td>${row.mobile || '-'}</td>
                    <td>${row.company || '-'}</td>
                    <td>${row.city || '-'}</td>
                    <td>${row.state || '-'}</td>
                    <td>${row.followUp || '-'}</td>
                    <td style="color: var(--warning); font-weight: 600;">${row.status}</td>
                    <td style="font-size: 0.85rem; color: var(--text-muted);">${row.comments || '-'}</td>
                `;
                todoPendingBody.appendChild(tr);
            });
        }
    }
};

generatePerfBtn.onclick = () => {
    const start = perfStartDate.value;
    const end = perfEndDate.value;
    if (!start || !end) return alert('Select Range');
    const filtered = tableData.filter(r => r.date >= start && r.date <= end);
    perfResults.classList.remove('hidden');
    perfTableBody.innerHTML = '';

    let grandTotal = 0;
    dropdownConfig.statuses.forEach(s => {
        const count = filtered.filter(r => r.status === s).length;
        if (count > 0) {
            grandTotal += count;
            const tr = document.createElement('tr');
            tr.innerHTML = `<td style="font-weight:600;">${s}</td><td style="text-align:center; color:var(--secondary); font-weight:800;">${count}</td>`;
            perfTableBody.appendChild(tr);
        }
    });

    // Grand Total Row
    const trTotal = document.createElement('tr');
    trTotal.innerHTML = `<td style="font-weight:700; color: var(--primary);">GRAND TOTAL</td><td style="text-align:center; color:var(--primary); font-weight:800;">${grandTotal}</td>`;
    perfTableBody.appendChild(trTotal);
};

generateOrderBtn.onclick = () => {
    const start = orderStartDate.value;
    const end = orderEndDate.value;
    if (!start || !end) return alert('Select Range');

    // Filter by Date (Entry Date)
    const filtered = tableData.filter(r => r.date >= start && r.date <= end && (r.totalQty || '').toString().trim() !== '');

    let grandTotalQty = 0;
    filtered.forEach(r => {
        grandTotalQty += parseInt(r.totalQty) || 0;
    });

    orderResults.classList.remove('hidden');
    orderTableBody.innerHTML = '';
    orderTableFooter.innerHTML = '';

    if (filtered.length === 0) {
        orderTableBody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 20px;">No orders found in this range.</td></tr>';
    } else {

        // Sort by Entry Date
        const sorted = [...filtered].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
        sorted.forEach(row => {
            let qtyStr = (row.totalQty || '').toString().trim();
            if (!qtyStr) qtyStr = '0'; // Default to 0 if blank

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="font-weight:600;">${row.date}</td>
                <td>${row.name || '-'}</td>
                <td style="text-align:center; font-weight:800;">${qtyStr === '0' ? '<span style="color:var(--text-muted)">-</span>' : qtyStr}</td>
            `;
            orderTableBody.appendChild(tr);
        });
    }

    // Grand Total Row in Footer
    const trTotal = document.createElement('tr');
    trTotal.innerHTML = `
        <td colspan="2" style="font-weight:700; color: var(--success); font-size: 1.1rem; text-align: right; padding-right: 20px;">GRAND TOTAL</td>
        <td style="text-align:center; color: var(--success); font-weight:800; font-size: 1.2rem;">${grandTotalQty}</td>
    `;
    orderTableFooter.appendChild(trTotal);
};
checkRestore();
console.log('Premium Dashboard Ready');
