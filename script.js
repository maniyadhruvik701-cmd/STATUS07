// Firebase Configuration
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

// Initialize Firebase using compat API
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

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
    statuses: ['Visit Done', 'Visit', 'Pending', 'Call Done'],
    leadTypes: ['Hot', 'Warm', 'Cold']
};

let dropdownConfig = JSON.parse(localStorage.getItem(SAVE_KEY_CONFIG)) || defaultConfig;

function saveConfig() {
    localStorage.setItem(SAVE_KEY_CONFIG, JSON.stringify(dropdownConfig));
}

// Initialize Data
let tableData = []; // Will be loaded from Firebase

// Fix dates with wrong year (0026 -> 2026)
function fixDates(data) {
    const dateFields = ['date', 'orderDate', 'orderDate2', 'orderDate3', 'orderDate4', 'orderDate5', 'followUp'];
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
let dataRef = db.ref('status_data');
let mainData = [];
let repeatData = [];
let currentView = localStorage.getItem(SAVE_KEY_VIEW) || 'data-entry';

db.ref('status_data').on('value', (snapshot) => {
    const data = snapshot.val();
    mainData = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
    if (fixDates(mainData)) {
        db.ref('status_data').set(mainData);
    }
    if (currentView !== 'repeat-entry') {
        tableData = mainData;
        dataRef = db.ref('status_data');
        renderTable();
    }
});

db.ref('repeat_status_data').on('value', (snapshot) => {
    const data = snapshot.val();
    repeatData = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
    if (fixDates(repeatData)) {
        db.ref('repeat_status_data').set(repeatData);
    }
    if (currentView === 'repeat-entry') {
        tableData = repeatData;
        dataRef = db.ref('repeat_status_data');
        renderTable();
    }
});

function saveData() {
    // Save to Firebase Cloud
    // We use set() to overwrite the list with the new state
    dataRef.set(tableData).catch((error) => {
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
const navRepeatEntry = document.getElementById('nav-repeat-entry');
const navRepeatOrders = document.getElementById('nav-repeat-orders');
const navAnalytics = document.getElementById('nav-analytics');

// Analytics Elements
const analyticsView = document.getElementById('analytics-view');
const analyticsStartDate = document.getElementById('analytics-start-date');
const analyticsEndDate = document.getElementById('analytics-end-date');
const analyticsLeadType = document.getElementById('analytics-lead-type');
const generateAnalyticsBtn = document.getElementById('generate-analytics-btn');
const analyticsResults = document.getElementById('analytics-results');
const analyticsTableHead = document.getElementById('analytics-table-head');
const analyticsTableBody = document.getElementById('analytics-table-body');
const analyticsTableFooter = document.getElementById('analytics-table-footer');

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
const orderTableHead = document.getElementById('order-table-head');

// Repeat Order Report Elements
const repeatOrderReportView = document.getElementById('repeat-order-report-view');
const repeatOrderStartDate = document.getElementById('repeat-order-start-date');
const repeatOrderEndDate = document.getElementById('repeat-order-end-date');
const generateRepeatOrderBtn = document.getElementById('generate-repeat-order-btn');
const repeatOrderResults = document.getElementById('repeat-order-results');
const repeatOrderTableBody = document.getElementById('repeat-order-table-body');
const repeatOrderTableFooter = document.getElementById('repeat-order-table-footer');
const repeatOrderTableHead = document.getElementById('repeat-order-table-head');

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
    currentView = view;
    localStorage.setItem(SAVE_KEY_VIEW, view);
    [dataEntryView, reportsView, performanceView, orderReportView, repeatOrderReportView, analyticsView].forEach(v => v?.classList.add('hidden'));
    [navDataEntry, navReports, navPerformance, navOrders, navRepeatEntry, navRepeatOrders, navAnalytics].forEach(n => n?.classList.remove('active'));

    const repeatCols = document.querySelectorAll('.repeat-col');
    if (view === 'repeat-entry') {
        repeatCols.forEach(col => col.classList.remove('hidden'));
    } else {
        repeatCols.forEach(col => col.classList.add('hidden'));
    }

    if (view === 'data-entry') {
        tableData = mainData;
        dataRef = db.ref('status_data');
        dataEntryView.classList.remove('hidden');
        navDataEntry.classList.add('active');
        viewTitle.textContent = 'Data Entry';
        viewSubtitle.textContent = 'Manage and input your records';
        renderTable();
    } else if (view === 'repeat-entry') {
        tableData = repeatData;
        dataRef = db.ref('repeat_status_data');
        dataEntryView.classList.remove('hidden');
        if (navRepeatEntry) navRepeatEntry.classList.add('active');
        viewTitle.textContent = 'Repeat Entry';
        viewSubtitle.textContent = 'Manage your repeat entries';
        renderTable();
    } else if (view === 'reports') {
        tableData = mainData;
        dataRef = db.ref('status_data');
        reportsView.classList.remove('hidden');
        navReports.classList.add('active');
        viewTitle.textContent = 'To Do List';
        viewSubtitle.textContent = 'Check your tasks by follow-up date';
    } else if (view === 'performance') {
        tableData = mainData;
        dataRef = db.ref('status_data');
        performanceView.classList.remove('hidden');
        navPerformance.classList.add('active');
        viewTitle.textContent = 'Work Report';
        viewSubtitle.textContent = 'Summary of activities within a date range';
    } else if (view === 'orders') {
        tableData = mainData;
        dataRef = db.ref('status_data');
        orderReportView.classList.remove('hidden');
        navOrders.classList.add('active');
        viewTitle.textContent = 'Total Order Report';
        viewSubtitle.textContent = 'Summary of orders by date';
    } else if (view === 'repeat-orders') {
        tableData = repeatData;
        dataRef = db.ref('repeat_status_data');
        repeatOrderReportView.classList.remove('hidden');
        if (navRepeatOrders) navRepeatOrders.classList.add('active');
        viewTitle.textContent = 'Repeat Order Report';
        viewSubtitle.textContent = 'Summary of repeat orders by date';
    } else if (view === 'analytics') {
        tableData = mainData;
        dataRef = db.ref('status_data');
        analyticsView.classList.remove('hidden');
        if (navAnalytics) navAnalytics.classList.add('active');
        viewTitle.textContent = 'Analytics';
        viewSubtitle.textContent = 'Platform-wise Work Report';

        if (analyticsLeadType) {
            const currVal = analyticsLeadType.value;
            analyticsLeadType.innerHTML = '<option value="ALL">All</option>';
            (dropdownConfig.leadTypes || []).forEach(lt => {
                const opt = document.createElement('option');
                opt.value = lt;
                opt.textContent = lt;
                analyticsLeadType.appendChild(opt);
            });
            analyticsLeadType.value = currVal || 'ALL';
        }
    }
}

navDataEntry.onclick = () => switchView('data-entry');
navReports.onclick = () => switchView('reports');
navPerformance.onclick = () => switchView('performance');
navOrders.onclick = () => switchView('orders');
if (navRepeatEntry) navRepeatEntry.onclick = () => switchView('repeat-entry');
if (navRepeatOrders) navRepeatOrders.onclick = () => switchView('repeat-orders');
if (navAnalytics) navAnalytics.onclick = () => switchView('analytics');

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
        { key: 'orderDate2', type: 'date', repeatOnly: true },
        { key: 'orderDate3', type: 'date', repeatOnly: true },
        { key: 'orderDate4', type: 'date', repeatOnly: true },
        { key: 'orderDate5', type: 'date', repeatOnly: true },
        { key: 'totalQty', type: 'number' },
        { key: 'followUp', type: 'date' },
        { key: 'comments', type: 'text' },
        { key: 'leadType', type: 'select', configKey: 'leadTypes', label: 'Lead Type' }
    ];
    fields.forEach(f => {
        if (f.repeatOnly && currentView !== 'repeat-entry') return;
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
        } else if (f.type === 'text') {
            const textarea = document.createElement('textarea');
            textarea.className = 'cell-input';
            textarea.value = data[f.key] || '';
            textarea.rows = 1;
            textarea.style.resize = 'none';
            textarea.style.overflow = 'hidden';
            textarea.style.minHeight = '28px';
            textarea.style.lineHeight = '1.5';
            
            const autoExpand = function() {
                this.style.height = 'auto';
                this.style.height = this.scrollHeight + 'px';
            };
            
            textarea.addEventListener('input', autoExpand);
            textarea.onchange = (e) => { tableData[actualIndex][f.key] = e.target.value; saveData(); };
            
            td.appendChild(textarea);
            
            // Trigger expand on load
            setTimeout(() => autoExpand.call(textarea), 0);
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
    let displayData = [...tableData].reverse();
    let originalIndices = tableData.map((_, i) => i).reverse();

    if (query) {
        displayData = [];
        originalIndices = [];
        const isReport = query.startsWith('report:');
        let repType = '', rStart = '', rEnd = '', rPlatform = '', rStatus = '', rLeadType = '';
        if (isReport) {
            const parts = query.split(':');
            repType = parts[1];
            rStart = parts[2];
            rEnd = parts[3] || parts[2];
            rPlatform = parts[4] || '';
            rStatus = parts[5] || '';
            rLeadType = parts[6] || '';
        }

        for (let i = tableData.length - 1; i >= 0; i--) {
            const row = tableData[i];
            let matches = false;
            if (isReport) {
                if (repType === 'todo') {
                    matches = (row.followUp === rStart);
                } else if (repType === 'perf') {
                    matches = (row.date >= rStart && row.date <= rEnd);
                } else if (repType === 'order') {
                    matches = ((row.orderDate || '') >= rStart && 
                               (row.orderDate || '') <= rEnd && 
                               (row.orderDate || '').trim() !== '' && 
                               (row.totalQty || '').toString().trim() !== '' && 
                               (row.platform || '').toString().trim() !== '');
                } else if (repType === 'analytics') {
                    matches = (row.date >= rStart && row.date <= rEnd);
                    if (rPlatform && rPlatform !== 'all') {
                        matches = matches && ((row.platform || '').toLowerCase() === rPlatform);
                    }
                    if (rStatus && rStatus !== 'all') {
                        matches = matches && ((row.status || '').toLowerCase() === rStatus);
                    }
                    if (rLeadType && rLeadType !== 'all') {
                        matches = matches && ((row.leadType || '').toLowerCase() === rLeadType);
                    }
                }
            } else {
                const searchableText = `${row.name || ''} ${row.mobile || ''} ${row.company || ''} ${row.city || ''} ${row.state || ''} ${row.date || ''} ${row.status || ''} ${row.platform || ''} ${row.type || ''} ${row.leadType || ''}`.toLowerCase();
                matches = searchableText.includes(query);
            }

            if (matches) {
                displayData.push(row);
                originalIndices.push(i);
            }
        }
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
    // Since the table is rendered in reverse order, these will appear at the TOP on Page 1.
    const today = new Date().toISOString().split('T')[0]; // e.g. 2026-02-25
    for (let i = 0; i < 50; i++) {
        tableData.push({
            date: today, name: '', mobile: '', company: '', city: '', state: '', platform: '',
            type: '', status: '',
            orderDate: '', totalQty: '', followUp: '', comments: '', leadType: ''
        });
    }
    // Go to the first page to show the new blank rows at the top
    currentPage = 1;

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
        const headers = ["Date", "Name", "Mobile No", "Company", "City", "State", "Platform", "Type", "Status", "Order Date", "Total Qty", "Follow-up", "Comments", "Lead Type"];
        const rows = tableData.map(r => [
            r.date, r.name, r.mobile, r.company, r.city || '', r.state || '', r.platform, r.type, r.status, r.orderDate, r.totalQty, r.followUp, r.comments, r.leadType || ''
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
                tr.style.cursor = 'pointer';
                tr.onclick = () => {
                    if (searchInput) searchInput.value = n !== '-' ? n : '';
                    switchView('data-entry');
                    renderTable();
                };
                summaryTableBody.appendChild(tr);
            }
        });
    });

    // Grand Total Row
    const trTotal = document.createElement('tr');
    trTotal.style.background = 'rgba(255, 255, 255, 0.05)';
    trTotal.innerHTML = `<td colspan="2" style="font-weight:700; color: var(--primary); text-align: right; padding-right: 20px;">GRAND TOTAL</td><td style="text-align:center; color:var(--primary); font-weight:800;">${grandTotal}</td>`;
    trTotal.style.cursor = 'pointer';
    trTotal.onclick = () => {
        const d = reportStartDate.value;
        if (searchInput) searchInput.value = 'report:todo:' + d;
        switchView('data-entry');
        renderTable();
    };
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
                tr.style.cursor = 'pointer';
                tr.onclick = () => {
                    if (searchInput) searchInput.value = row.name || row.mobile || row.date || '';
                    switchView('data-entry');
                    renderTable();
                };
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
            tr.style.cursor = 'pointer';
            tr.onclick = () => {
                if (searchInput) searchInput.value = s;
                switchView('data-entry');
                renderTable();
            };
            perfTableBody.appendChild(tr);
        }
    });

    // Grand Total Row
    const trTotal = document.createElement('tr');
    trTotal.innerHTML = `<td style="font-weight:700; color: var(--primary);">GRAND TOTAL</td><td style="text-align:center; color:var(--primary); font-weight:800;">${grandTotal}</td>`;
    trTotal.style.cursor = 'pointer';
    trTotal.onclick = () => {
        if (searchInput) searchInput.value = 'report:perf:' + start + ':' + end;
        switchView('data-entry');
        renderTable();
    };
    perfTableBody.appendChild(trTotal);
};

generateOrderBtn.onclick = () => {
    const start = orderStartDate.value;
    const end = orderEndDate.value;
    if (!start || !end) return alert('Select Range');

    // Filter by Order Date AND only include those that have orderDate, totalQty and Platform selected
    const filtered = tableData.filter(r => 
        (r.orderDate || '') >= start && 
        (r.orderDate || '') <= end && 
        (r.orderDate || '').trim() !== '' && 
        (r.totalQty || '').toString().trim() !== '' && 
        (r.platform || '').toString().trim() !== ''
    );

    let grandTotalPlatform = filtered.length;

    orderResults.classList.remove('hidden');
    orderTableHead.innerHTML = '';
    orderTableBody.innerHTML = '';
    orderTableFooter.innerHTML = '';

    // Build Header
    const platforms = dropdownConfig.platforms || [];
    let headerHtml = `
        <tr>
            <th style="color: var(--success);">Order Date</th>
            <th style="color: var(--success);">Name</th>
    `;
    platforms.forEach(p => {
        headerHtml += `<th style="color: var(--success); text-align: center;">${p}</th>`;
    });
    headerHtml += `</tr>`;
    orderTableHead.innerHTML = headerHtml;

    if (filtered.length === 0) {
        orderTableBody.innerHTML = `<tr><td colspan="${2 + platforms.length}" style="text-align:center; padding: 20px;">No platform entries found in this range.</td></tr>`;
    } else {
        const platformTotals = {};
        platforms.forEach(p => platformTotals[p] = 0);
        let grandTotalAll = 0;

        // Sort by Order Date
        const sorted = [...filtered].sort((a, b) => (a.orderDate || '').localeCompare(b.orderDate || ''));
        sorted.forEach(row => {
            let pltStr = (row.platform || '').toString().trim();

            let colsHtml = '';
            platforms.forEach(p => {
                if (pltStr === p) {
                    colsHtml += `<td style="text-align:center; font-weight:800;">1</td>`;
                    platformTotals[p]++;
                    grandTotalAll++;
                } else {
                    colsHtml += `<td style="text-align:center; color:var(--text-muted);">-</td>`; // 0 or -
                }
            });

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.orderDate}</td>
                <td style="font-weight:600;">${row.name || '-'}</td>
                ${colsHtml}
            `;
            tr.style.cursor = 'pointer';
            tr.onclick = () => {
                if (searchInput) searchInput.value = row.name || row.mobile || row.orderDate || '';
                switchView('data-entry');
                renderTable();
            };
            orderTableBody.appendChild(tr);
        });

        // Grand Total Row in Footer
        let footerColsHtml = '';
        platforms.forEach(p => {
            footerColsHtml += `<td style="text-align:center; color: var(--success); font-weight:800; font-size: 1.2rem;">${platformTotals[p]}</td>`;
        });

        const trTotal = document.createElement('tr');
        trTotal.innerHTML = `
            <td colspan="2" style="font-weight:700; color: var(--success); font-size: 1.1rem; text-align: right; padding-right: 20px;">TOTAL ORDERS (${grandTotalAll})</td>
            ${footerColsHtml}
        `;
        trTotal.style.cursor = 'pointer';
        trTotal.onclick = () => {
            if (searchInput) searchInput.value = 'report:order:' + start + ':' + end;
            switchView('data-entry');
            renderTable();
        };
        orderTableFooter.appendChild(trTotal);
    }
};

if (generateRepeatOrderBtn) {
    generateRepeatOrderBtn.onclick = () => {
        const start = repeatOrderStartDate.value;
        const end = repeatOrderEndDate.value;
        if (!start || !end) return alert('Select Range');

        // Filter by Order Date AND only include those that have orderDate, totalQty and Platform selected
        const filtered = repeatData.filter(r => 
            (r.orderDate || '') >= start && 
            (r.orderDate || '') <= end && 
            (r.orderDate || '').trim() !== '' && 
            (r.totalQty || '').toString().trim() !== '' && 
            (r.platform || '').toString().trim() !== ''
        );

        let grandTotalPlatform = filtered.length;

        repeatOrderResults.classList.remove('hidden');
        repeatOrderTableHead.innerHTML = '';
        repeatOrderTableBody.innerHTML = '';
        repeatOrderTableFooter.innerHTML = '';

        // Build Header
        const platforms = dropdownConfig.platforms || [];
        let headerHtml = `
            <tr>
                <th style="color: var(--success);">Order Date</th>
                <th style="color: var(--success);">Name</th>
        `;
        platforms.forEach(p => {
            headerHtml += `<th style="color: var(--success); text-align: center;">${p}</th>`;
        });
        headerHtml += `</tr>`;
        repeatOrderTableHead.innerHTML = headerHtml;

        if (filtered.length === 0) {
            repeatOrderTableBody.innerHTML = `<tr><td colspan="${2 + platforms.length}" style="text-align:center; padding: 20px;">No repeat platform entries found in this range.</td></tr>`;
        } else {
            const platformTotals = {};
            platforms.forEach(p => platformTotals[p] = 0);
            let grandTotalAll = 0;

            // Sort by Order Date
            const sorted = [...filtered].sort((a, b) => (a.orderDate || '').localeCompare(b.orderDate || ''));
            sorted.forEach(row => {
                let pltStr = (row.platform || '').toString().trim();

                let colsHtml = '';
                platforms.forEach(p => {
                    if (pltStr === p) {
                        colsHtml += `<td style="text-align:center; font-weight:800;">1</td>`;
                        platformTotals[p]++;
                        grandTotalAll++;
                    } else {
                        colsHtml += `<td style="text-align:center; color:var(--text-muted);">-</td>`; // 0 or -
                    }
                });

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${row.orderDate}</td>
                    <td style="font-weight:600;">${row.name || '-'}</td>
                    ${colsHtml}
                `;
                tr.style.cursor = 'pointer';
                tr.onclick = () => {
                    if (searchInput) searchInput.value = 'report:order:' + (row.orderDate || '');
                    switchView('repeat-entry');
                    renderTable();
                };
                repeatOrderTableBody.appendChild(tr);
            });

            // Grand Total Row in Footer
            let footerColsHtml = '';
            platforms.forEach(p => {
                footerColsHtml += `<td style="text-align:center; color: var(--success); font-weight:800; font-size: 1.2rem;">${platformTotals[p]}</td>`;
            });

            const trTotal = document.createElement('tr');
            trTotal.innerHTML = `
                <td colspan="2" style="font-weight:700; color: var(--success); font-size: 1.1rem; text-align: right; padding-right: 20px;">TOTAL ORDERS (${grandTotalAll})</td>
                ${footerColsHtml}
            `;
            trTotal.style.cursor = 'pointer';
            trTotal.onclick = () => {
                if (searchInput) searchInput.value = 'report:order:' + start + ':' + end;
                switchView('repeat-entry');
                renderTable();
            };
            repeatOrderTableFooter.appendChild(trTotal);
        }
    };
}

if (generateAnalyticsBtn) {
    generateAnalyticsBtn.onclick = () => {
        const start = analyticsStartDate.value;
        const end = analyticsEndDate.value;
        const leadVal = analyticsLeadType ? analyticsLeadType.value : 'ALL';
        if (!start || !end) return alert('Select Range');
        
        const filtered = tableData.filter(r => r.date >= start && r.date <= end && (leadVal === 'ALL' || r.leadType === leadVal));
        analyticsResults.classList.remove('hidden');
        analyticsTableHead.innerHTML = '';
        analyticsTableBody.innerHTML = '';
        analyticsTableFooter.innerHTML = '';

        const platforms = dropdownConfig.platforms || [];
        const statuses = dropdownConfig.statuses || [];

        let headerHtml = `<tr><th style="color: var(--primary);">Platform</th>`;
        statuses.forEach(s => {
            headerHtml += `<th style="color: var(--secondary); text-align: center;">${s}</th>`;
        });
        headerHtml += `<th style="color: var(--primary); text-align: center;">Total</th></tr>`;
        analyticsTableHead.innerHTML = headerHtml;

        let statusTotals = {};
        statuses.forEach(s => statusTotals[s] = 0);
        let grandTotal = 0;

        platforms.forEach(p => {
            let platformTotal = 0;
            const platformData = filtered.filter(r => r.platform === p);
            
            const tr = document.createElement('tr');
            
            const tdPlat = document.createElement('td');
            tdPlat.style.fontWeight = '600';
            tdPlat.textContent = p;
            tdPlat.style.cursor = 'pointer';
            tdPlat.onclick = () => {
                if (searchInput) searchInput.value = `report:analytics:${start}:${end}:${p}:ALL:${leadVal}`;
                switchView('data-entry');
                renderTable();
            };
            tr.appendChild(tdPlat);

            statuses.forEach(s => {
                const count = platformData.filter(r => r.status === s).length;
                platformTotal += count;
                statusTotals[s] += count;
                
                const tdCount = document.createElement('td');
                tdCount.style.textAlign = 'center';
                if (count > 0) {
                    tdCount.style.fontWeight = '800';
                    tdCount.style.color = 'var(--text-main)';
                    tdCount.textContent = count;
                    tdCount.style.cursor = 'pointer';
                    tdCount.onclick = () => {
                        if (searchInput) searchInput.value = `report:analytics:${start}:${end}:${p}:${s}:${leadVal}`;
                        switchView('data-entry');
                        renderTable();
                    };
                } else {
                    tdCount.style.color = 'var(--text-muted)';
                    tdCount.textContent = '-';
                }
                tr.appendChild(tdCount);
            });
            grandTotal += platformTotal;

            const tdPlatTotal = document.createElement('td');
            tdPlatTotal.style.textAlign = 'center';
            tdPlatTotal.style.color = 'var(--primary)';
            tdPlatTotal.style.fontWeight = '800';
            tdPlatTotal.textContent = platformTotal;
            tdPlatTotal.style.cursor = 'pointer';
            tdPlatTotal.onclick = () => {
                if (searchInput) searchInput.value = `report:analytics:${start}:${end}:${p}:ALL:${leadVal}`;
                switchView('data-entry');
                renderTable();
            };
            tr.appendChild(tdPlatTotal);

            analyticsTableBody.appendChild(tr);
        });

        const trTotal = document.createElement('tr');
        
        const tdGrand = document.createElement('td');
        tdGrand.style.fontWeight = '700';
        tdGrand.style.color = 'var(--primary)';
        tdGrand.style.textAlign = 'right';
        tdGrand.textContent = 'GRAND TOTAL';
        tdGrand.style.cursor = 'pointer';
        tdGrand.onclick = () => {
            if (searchInput) searchInput.value = `report:analytics:${start}:${end}:ALL:ALL:${leadVal}`;
            switchView('data-entry');
            renderTable();
        };
        trTotal.appendChild(tdGrand);

        statuses.forEach(s => {
            const tdStatusTotal = document.createElement('td');
            tdStatusTotal.style.textAlign = 'center';
            tdStatusTotal.style.color = 'var(--secondary)';
            tdStatusTotal.style.fontWeight = '800';
            tdStatusTotal.textContent = statusTotals[s];
            tdStatusTotal.style.cursor = 'pointer';
            tdStatusTotal.onclick = () => {
                if (searchInput) searchInput.value = `report:analytics:${start}:${end}:ALL:${s}:${leadVal}`;
                switchView('data-entry');
                renderTable();
            };
            trTotal.appendChild(tdStatusTotal);
        });

        const tdGrandTotal = document.createElement('td');
        tdGrandTotal.style.textAlign = 'center';
        tdGrandTotal.style.color = 'var(--primary)';
        tdGrandTotal.style.fontWeight = '800';
        tdGrandTotal.textContent = grandTotal;
        tdGrandTotal.style.cursor = 'pointer';
        tdGrandTotal.onclick = () => {
            if (searchInput) searchInput.value = `report:analytics:${start}:${end}:ALL:ALL:${leadVal}`;
            switchView('data-entry');
            renderTable();
        };
        trTotal.appendChild(tdGrandTotal);

        analyticsTableFooter.appendChild(trTotal);
    };
}

function checkRestore() {
    const isLoggedIn = localStorage.getItem(SAVE_KEY_AUTH) === 'true';
    if (isLoggedIn) {
        authSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');
        const savedView = localStorage.getItem(SAVE_KEY_VIEW) || 'data-entry';
        switchView(savedView);
    } else {
        authSection.classList.remove('hidden');
        dashboardSection.classList.add('hidden');
    }
}

checkRestore();
console.log('Premium Dashboard Ready');
