// 初始化變數
let currentUser = "admin1";
let isAdmin = true;
let soundEnabled = true;
let tasks = {
    duties: [
        {id: 1, title: "會議室整理", location: "三樓會議室", uniform: "便服", quota: 5, signedUp: 3, checkedIn: 2, deadline: "2024-01-20", status: "active"},
        {id: 2, title: "檔案歸檔", location: "檔案室", uniform: "工作服", quota: 3, signedUp: 3, checkedIn: 1, deadline: "2024-01-18", status: "active"},
        {id: 3, title: "器材保養", location: "器材室", uniform: "工作服", quota: 4, signedUp: 2, checkedIn: 0, deadline: "2024-01-25", status: "active"}
    ],
    fire: [
        {id: 1, category: "住宅", location: "中山區中山路100號", time: "2024-01-15 10:30", taskHints: "注意瓦斯管線", checkedIn: 8, status: "completed"},
        {id: 2, category: "雜草", location: "西區河堤旁", time: "2024-01-14 14:20", taskHints: "注意風向", checkedIn: 5, status: "completed"},
        {id: 3, category: "工廠", location: "工業區五路15號", time: "2024-01-16 09:15", taskHints: "化學物質洩漏", checkedIn: 12, status: "active"}
    ],
    trainings: [
        {id: 1, title: "年度消防訓練", date: "2024-01-20", location: "訓練中心", instructor: "王教官", maxParticipants: 30, signedUp: 25, checkedIn: 20, status: "upcoming"},
        {id: 2, title: "急救技能複訓", date: "2024-01-18", location: "醫務室", instructor: "李醫師", maxParticipants: 20, signedUp: 18, checkedIn: 16, status: "completed"},
        {id: 3, title: "裝備操作訓練", date: "2024-01-25", location: "器材室", instructor: "陳教官", maxParticipants: 15, signedUp: 10, checkedIn: 0, status: "upcoming"}
    ]
};

let checkinHistory = [
    {id: 1, type: "duty", taskId: 1, taskName: "會議室整理", time: "2024-01-15 09:30", status: "checked-in"},
    {id: 2, type: "fire", taskId: 1, taskName: "中山區住宅火警", time: "2024-01-15 11:15", status: "checked-in"},
    {id: 3, type: "training", taskId: 2, taskName: "急救技能複訓", time: "2024-01-14 14:00", status: "checked-in"},
    {id: 4, type: "duty", taskId: 2, taskName: "檔案歸檔", time: "2024-01-13 10:45", status: "checked-in"}
];

// 圖表變數
let checkinTrendChart, taskTypeChart;

// 初始化頁面
document.addEventListener('DOMContentLoaded', function() {
    // 設定側邊欄點擊事件
    document.querySelectorAll('.sidebar a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 移除所有active類別
            document.querySelectorAll('.sidebar a').forEach(item => {
                item.classList.remove('active');
            });
            
            // 添加active類別到當前點擊的項目
            this.classList.add('active');
            
            // 顯示對應的頁面
            const pageId = this.getAttribute('data-page');
            showPage(pageId);
        });
    });
    
    // 載入初始數據
    loadTasks();
    loadCheckinData();
    initCharts();
    
    // 顯示儀表板
    showPage('dashboard');
    
    // 設定聲音切換事件
    document.getElementById('soundToggle').addEventListener('click', toggleSound);
});

// 切換頁面
function showPage(pageId) {
    // 隱藏所有頁面
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.add('d-none');
    });
    
    // 顯示目標頁面
    document.getElementById(pageId).classList.remove('d-none');
    
    // 如果是統計頁面，更新圖表
    if (pageId === 'statistics') {
        updateCharts();
    }
}

// 切換用戶
function switchUser(username) {
    currentUser = username;
    isAdmin = (username === 'admin1');
    document.getElementById('currentUser').textContent = username;
    
    // 顯示通知
    showNotification(`已切換用戶為: ${username}`, 'success');
    
    // 根據用戶權限更新介面
    updateUIForUserRole();
}

// 登出
function logout() {
    // 這裡可以實現登出邏輯
    showNotification('已成功登出系統', 'info');
    setTimeout(() => {
        alert('請重新登入系統');
    }, 500);
}

// 更新UI根據用戶角色
function updateUIForUserRole() {
    // 根據用戶角色顯示/隱藏管理功能
    // 在這個示範中，我們只更新文字提示
    loadTasks(); // 重新載入任務以顯示正確的按鈕
}

// 載入任務數據
function loadTasks() {
    // 載入公差任務
    const dutyContainer = document.getElementById('dutyTasks');
    dutyContainer.innerHTML = '';
    
    tasks.duties.forEach(task => {
        const progressPercent = task.signedUp > 0 ? Math.min(100, (task.checkedIn / task.signedUp) * 100) : 0;
        
        dutyContainer.innerHTML += `
            <div class="task-item">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h5>${task.title}</h5>
                        <p class="mb-1"><i class="fas fa-map-marker-alt"></i> ${task.location} | <i class="fas fa-tshirt"></i> ${task.uniform}</p>
                        <p class="mb-1">名額: ${task.signedUp}/${task.quota} | 已簽到: ${task.checkedIn}</p>
                        <p class="mb-0">截止日期: ${task.deadline}</p>
                    </div>
                    <div class="text-end">
                        <div class="mb-2">
                            <span class="badge ${task.status === 'active' ? 'bg-success' : 'bg-secondary'}">${task.status === 'active' ? '進行中' : '已結束'}</span>
                        </div>
                        <div class="mb-2">
                            <small>簽到進度</small>
                            <div class="progress" style="width: 150px;">
                                <div class="progress-bar progress-bar-custom" style="width: ${progressPercent}%">${Math.round(progressPercent)}%</div>
                            </div>
                        </div>
                        <div>
                            ${isAdmin ? `
                                <button class="btn btn-sm btn-outline-primary me-1" onclick="editTask('duty', ${task.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="deleteTask('duty', ${task.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            ` : `
                                ${task.signedUp < task.quota ? `
                                    <button class="btn btn-sm btn-success me-1" onclick="signUpForTask('duty', ${task.id})">
                                        <i class="fas fa-user-plus"></i> 報名
                                    </button>
                                ` : `
                                    <button class="btn btn-sm btn-secondary me-1" disabled>
                                        名額已滿
                                    </button>
                                `}
                                <button class="btn btn-sm btn-primary" onclick="checkinForTask('duty', ${task.id})">
                                    <i class="fas fa-qrcode"></i> 簽到
                                </button>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    // 載入火警記錄
    const fireContainer = document.getElementById('fireAlarms');
    fireContainer.innerHTML = '';
    
    tasks.fire.forEach(task => {
        fireContainer.innerHTML += `
            <div class="task-item fire">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h5>${task.category}火警</h5>
                        <p class="mb-1"><i class="fas fa-map-marker-alt"></i> ${task.location}</p>
                        <p class="mb-1"><i class="fas fa-clock"></i> ${task.time}</p>
                        <p class="mb-0"><i class="fas fa-exclamation-circle"></i> ${task.taskHints}</p>
                    </div>
                    <div class="text-end">
                        <div class="mb-2">
                            <span class="badge ${task.status === 'active' ? 'bg-danger' : 'bg-secondary'}">${task.status === 'active' ? '進行中' : '已結束'}</span>
                        </div>
                        <div class="mb-2">
                            <span class="badge bg-info">已簽到: ${task.checkedIn}人</span>
                        </div>
                        <div>
                            ${isAdmin ? `
                                <button class="btn btn-sm btn-outline-primary me-1" onclick="editTask('fire', ${task.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="deleteTask('fire', ${task.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            ` : `
                                <button class="btn btn-sm btn-primary" onclick="checkinForTask('fire', ${task.id})">
                                    <i class="fas fa-qrcode"></i> 簽到
                                </button>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    // 載入組訓記錄
    const trainingContainer = document.getElementById('trainingRecords');
    trainingContainer.innerHTML = '';
    
    tasks.trainings.forEach(task => {
        const progressPercent = task.signedUp > 0 ? Math.min(100, (task.checkedIn / task.signedUp) * 100) : 0;
        
        trainingContainer.innerHTML += `
            <div class="task-item training">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h5>${task.title}</h5>
                        <p class="mb-1"><i class="fas fa-map-marker-alt"></i> ${task.location}</p>
                        <p class="mb-1"><i class="fas fa-calendar"></i> ${task.date} | <i class="fas fa-chalkboard-teacher"></i> ${task.instructor}</p>
                        <p class="mb-0">名額: ${task.signedUp}/${task.maxParticipants} | 已簽到: ${task.checkedIn}</p>
                    </div>
                    <div class="text-end">
                        <div class="mb-2">
                            <span class="badge ${task.status === 'upcoming' ? 'bg-warning' : task.status === 'active' ? 'bg-success' : 'bg-secondary'}">
                                ${task.status === 'upcoming' ? '即將開始' : task.status === 'active' ? '進行中' : '已結束'}
                            </span>
                        </div>
                        <div class="mb-2">
                            <small>簽到進度</small>
                            <div class="progress" style="width: 150px;">
                                <div class="progress-bar bg-warning" style="width: ${progressPercent}%">${Math.round(progressPercent)}%</div>
                            </div>
                        </div>
                        <div>
                            ${isAdmin ? `
                                <button class="btn btn-sm btn-outline-primary me-1" onclick="editTask('training', ${task.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="deleteTask('training', ${task.id})">
                                    <i class="fas fa-trash"></i>
                                </button>
                            ` : `
                                ${task.signedUp < task.maxParticipants ? `
                                    <button class="btn btn-sm btn-warning me-1" onclick="signUpForTask('training', ${task.id})">
                                        <i class="fas fa-user-plus"></i> 報名
                                    </button>
                                ` : `
                                    <button class="btn btn-sm btn-secondary me-1" disabled>
                                        名額已滿
                                    </button>
                                `}
                                <button class="btn btn-sm btn-primary" onclick="checkinForTask('training', ${task.id})">
                                    <i class="fas fa-qrcode"></i> 簽到
                                </button>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
}

// 載入簽到數據
function loadCheckinData() {
    // 載入待簽到任務
    const pendingContainer = document.getElementById('pendingCheckins');
    pendingContainer.innerHTML = '';
    
    // 找出用戶已報名但未簽到的任務
    // 這裡使用模擬數據
    const pendingTasks = [
        {type: 'duty', id: 3, title: '器材保養', time: '2024-01-25前'},
        {type: 'training', id: 3, title: '裝備操作訓練', time: '2024-01-25'}
    ];
    
    pendingTasks.forEach(task => {
        pendingContainer.innerHTML += `
            <div class="task-item ${task.type === 'duty' ? '' : task.type === 'fire' ? 'fire' : 'training'} mb-3">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6>${task.title}</h6>
                        <p class="mb-0"><i class="fas fa-clock"></i> ${task.time}</p>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-primary checkin-btn" onclick="checkinForTask('${task.type}', ${task.id})">
                            <i class="fas fa-qrcode"></i> 簽到
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    // 載入簽到歷史
    const historyContainer = document.getElementById('checkinHistory');
    historyContainer.innerHTML = '';
    
    checkinHistory.forEach(record => {
        const typeBadge = record.type === 'duty' ? 'primary' : record.type === 'fire' ? 'danger' : 'warning';
        const typeText = record.type === 'duty' ? '公差' : record.type === 'fire' ? '火警' : '組訓';
        
        historyContainer.innerHTML += `
            <tr>
                <td>${record.time}</td>
                <td><span class="badge bg-${typeBadge}">${typeText}</span></td>
                <td>${record.taskName}</td>
                <td><span class="badge bg-success">已簽到</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-secondary" onclick="viewCheckinDetail(${record.id})">
                        <i class="fas fa-info-circle"></i>
                    </button>
                </td>
            </tr>
        `;
    });
}

// 創建新任務
function createNewTask(type) {
    const taskName = prompt(`請輸入新的${type === 'duty' ? '公差任務' : type === 'fire' ? '火警記錄' : '組訓記錄'}名稱:`);
    if (taskName) {
        showNotification(`${type === 'duty' ? '公差任務' : type === 'fire' ? '火警記錄' : '組訓記錄'}「${taskName}」已創建`, 'success');
        
        // 播放通知音效
        if (soundEnabled) {
            playNotificationSound();
        }
        
        // 重新載入任務列表
        loadTasks();
    }
}

// 編輯任務
function editTask(type, id) {
    alert(`編輯${type === 'duty' ? '公差任務' : type === 'fire' ? '火警記錄' : '組訓記錄'} ID: ${id}`);
}

// 刪除任務
function deleteTask(type, id) {
    if (confirm(`確定要刪除這個${type === 'duty' ? '公差任務' : type === 'fire' ? '火警記錄' : '組訓記錄'}嗎？`)) {
        showNotification(`${type === 'duty' ? '公差任務' : type === 'fire' ? '火警記錄' : '組訓記錄'}已刪除`, 'warning');
        
        // 從數據中刪除
        if (type === 'duty') {
            tasks.duties = tasks.duties.filter(task => task.id !== id);
        } else if (type === 'fire') {
            tasks.fire = tasks.fire.filter(task => task.id !== id);
        } else {
            tasks.trainings = tasks.trainings.filter(task => task.id !== id);
        }
        
        // 重新載入任務列表
        loadTasks();
    }
}

// 報名任務
function signUpForTask(type, id) {
    showNotification(`已成功報名${type === 'duty' ? '公差任務' : '組訓活動'}`, 'success');
}

// 簽到任務
function checkinForTask(type, id) {
    // 播放簽到音效
    playCheckinSound();
    
    // 顯示簽到成功訊息
    showNotification('簽到成功！', 'success');
    
    // 更新簽到數據
    const now = new Date();
    const timeString = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // 添加到簽到歷史
    let taskName = '';
    if (type === 'duty') {
        const task = tasks.duties.find(t => t.id === id);
        taskName = task ? task.title : `公差任務${id}`;
    } else if (type === 'fire') {
        const task = tasks.fire.find(t => t.id === id);
        taskName = task ? `${task.category}火警` : `火警記錄${id}`;
    } else {
        const task = tasks.trainings.find(t => t.id === id);
        taskName = task ? task.title : `組訓活動${id}`;
    }
    
    checkinHistory.unshift({
        id: checkinHistory.length + 1,
        type: type,
        taskId: id,
        taskName: taskName,
        time: timeString,
        status: 'checked-in'
    });
    
    // 更新統計數據
    updateStats();
    
    // 重新載入簽到數據
    loadCheckinData();
}

// 快速簽到
function quickCheckin() {
    const code = document.getElementById('quickCode').value;
    if (code) {
        // 模擬根據代碼查找任務
        showNotification(`正在處理代碼: ${code}`, 'info');
        
        // 模擬簽到成功
        setTimeout(() => {
            checkinForTask('duty', 1);
            document.getElementById('quickCode').value = '';
        }, 1000);
    } else {
        showNotification('請輸入簽到代碼', 'warning');
    }
}

// 執行簽到
function performCheckin() {
    const type = document.getElementById('checkinType').value;
    const taskId = document.getElementById('checkinTask').value;
    
    checkinForTask(type, parseInt(taskId));
}

// 顯示QR掃描器
function showQRScanner() {
    alert('QR掃描器功能 - 這在實際應用中會開啟相機進行掃描');
}

// 查看簽到詳情
function viewCheckinDetail(id) {
    const record = checkinHistory.find(r => r.id === id);
    if (record) {
        alert(`簽到詳情:\n\n類型: ${record.type === 'duty' ? '公差' : record.type === 'fire' ? '火警' : '組訓'}\n任務: ${record.taskName}\n時間: ${record.time}\n狀態: ${record.status}`);
    }
}

// 篩選火警記錄
function filterFireAlarms(category) {
    if (category === 'all') {
        showNotification('顯示所有火警記錄', 'info');
    } else {
        showNotification(`篩選顯示: ${category}類火警記錄`, 'info');
    }
}

// 匯出資料
function exportData(type) {
    let exportType = '';
    if (type === 'duties') exportType = '公差任務';
    else if (type === 'fire') exportType = '火警記錄';
    else exportType = '組訓記錄';
    
    showNotification(`${exportType}資料匯出中...`, 'info');
    
    // 模擬匯出過程
    setTimeout(() => {
        showNotification(`${exportType}資料已成功匯出為Excel檔案`, 'success');
    }, 1500);
}

// 自訂匯出
function customExport() {
    const exportType = document.getElementById('exportType').value;
    showNotification(`執行自訂匯出: ${exportType}`, 'info');
}

// 初始化圖表
function initCharts() {
    // 簽到趨勢圖
    const trendCtx = document.getElementById('checkinTrendChart').getContext('2d');
    checkinTrendChart = new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: ['1月10日', '1月11日', '1月12日', '1月13日', '1月14日', '1月15日'],
            datasets: [{
                label: '簽到次數',
                data: [12, 15, 10, 18, 22, 25],
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 5
                    }
                }
            }
        }
    });
    
    // 任務類型分布圖
    const typeCtx = document.getElementById('taskTypeChart').getContext('2d');
    taskTypeChart = new Chart(typeCtx, {
        type: 'doughnut',
        data: {
            labels: ['公差任務', '火警記錄', '組訓活動'],
            datasets: [{
                data: [35, 28, 37],
                backgroundColor: ['#3498db', '#e74c3c', '#f39c12'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// 更新圖表
function updateCharts() {
    // 這裡可以更新圖表數據
    // 在這個示範中，我們使用靜態數據
}

// 更新統計數據
function updateStats() {
    // 更新總簽到次數
    const totalCheckins = checkinHistory.length;
    document.getElementById('totalCheckins').textContent = totalCheckins;
    
    // 更新今日簽到次數（模擬）
    const todayCheckins = Math.floor(Math.random() * 5) + 1;
    document.getElementById('todayCheckins').textContent = todayCheckins;
    
    // 更新本月簽到次數（模擬）
    const monthCheckins = Math.floor(Math.random() * 20) + 10;
    document.getElementById('monthCheckins').textContent = monthCheckins;
}

// 播放通知音效
function playNotificationSound() {
    const sound = document.getElementById('notificationSound');
    sound.currentTime = 0;
    sound.play().catch(e => console.log('音效播放失敗:', e));
}

// 播放簽到音效
function playCheckinSound() {
    // 簡單的簽到音效
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.log('音效播放失敗，使用備用方法');
        playNotificationSound();
    }
}

// 顯示通知
function showNotification(message, type) {
    // 創建通知元素
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 1050; max-width: 350px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // 添加到頁面
    document.body.appendChild(notification);
    
    // 自動移除通知
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// 保存通知設定
function saveNotificationSettings() {
    soundEnabled = document.getElementById('soundNotification').checked;
    showNotification('通知設定已儲存', 'success');
}

// 保存匯出設定
function saveExportSettings() {
    showNotification('匯出設定已儲存', 'success');
}

// 切換聲音通知
function toggleSound() {
    soundEnabled = !soundEnabled;
    const icon = document.querySelector('#soundToggle i');
    if (soundEnabled) {
        icon.className = 'fas fa-volume-up';
        showNotification('聲音通知已開啟', 'success');
    } else {
        icon.className = 'fas fa-volume-mute';
        showNotification('聲音通知已關閉', 'warning');
    }
}

// 初始化統計數據
updateStats();
