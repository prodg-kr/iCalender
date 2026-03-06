document.addEventListener('DOMContentLoaded', () => {
    const calendarGrid = document.getElementById('calendarGrid');
    const currentMonthYear = document.getElementById('currentMonthYear');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const todayBtn = document.getElementById('todayBtn');
    const tripModal = document.getElementById('tripModal');
    const addTripBtn = document.getElementById('addTripBtn');
    const closeModal = document.getElementById('closeModal');
    const saveTripBtn = document.getElementById('saveTrip');
    const dDayGrid = document.getElementById('dDayGrid');

    // ─── 근무 규칙 ───────────────────────────────────────────────────────
    // 조퇴: 비행일 전날 → 야간편 탑승 (월 8h 이내 만근 인정)
    // 지각: 귀국 당일 07:00 이전 도착 → 지각 출근 (월 8h 이내)

    const HOLIDAYS_2026 = {
        '2026-01-01': '신정', '2026-02-16': '설날 연휴', '2026-02-17': '설날', '2026-02-18': '설날 연휴',
        '2026-03-01': '삼일절', '2026-03-02': '대체공휴일(삼일절)', '2026-05-01': '근로자의 날',
        '2026-05-05': '어린이날', '2026-05-24': '부처님 오신 날', '2026-05-25': '대체공휴일(부처님 오신 날)',
        '2026-06-03': '제9회 전국동시지방선거', '2026-06-06': '현충일', '2026-08-15': '광복절',
        '2026-08-17': '대체공휴일(광복절)', '2026-09-24': '추석 연휴', '2026-09-25': '추석',
        '2026-09-26': '추석 연휴', '2026-09-28': '대체공휴일(추석)', '2026-10-03': '개천절',
        '2026-10-05': '대체공휴일(개천절)', '2026-10-09': '한글날', '2026-12-25': '성탄절'
    };

    const GOLDEN_WINDOWS = [
        {
            rank: 1, start: '2026-09-22', end: '2026-09-29', totalDays: 8, leaveDays: 1, efficiency: 8.0,
            badge: '🏆 최고효율', badgeClass: 'badge-gold', label: '추석 황금연휴',
            desc: '추석 연휴 + 정기휴무 결합. 연차 단 1개로 8일 여행!',
            holidays: ['추석 연휴', '추석', '대체공휴일'],
            tip: '출발 전날(9/21 월요일) 조퇴 활용 시 오후 항공편으로 1일 더 확보 가능!'
        },
        {
            rank: 2, start: '2026-06-02', end: '2026-06-07', totalDays: 6, leaveDays: 1, efficiency: 6.0,
            badge: '🥈 추천', badgeClass: 'badge-silver', label: '선거+현충일 연휴',
            desc: '지방선거 + 현충일 연계. 연차 1개로 6일 여행.',
            holidays: ['지방선거', '현충일'],
            tip: '6/1(월) 조퇴 시 오후편으로 출발 → 총 7일 효과'
        },
        {
            rank: 3, start: '2026-08-13', end: '2026-08-18', totalDays: 6, leaveDays: 1, efficiency: 6.0,
            badge: '🥈 추천', badgeClass: 'badge-silver', label: '광복절 연휴',
            desc: '광복절 + 대체공휴일 + 정기휴무 연계. 연차 1개로 6일.',
            holidays: ['광복절', '대체공휴일'],
            tip: '8/12(수) 조퇴 활용 → 오후 출발편 이용 가능'
        },
        {
            rank: 4, start: '2026-10-01', end: '2026-10-06', totalDays: 6, leaveDays: 1, efficiency: 6.0,
            badge: '🥈 추천', badgeClass: 'badge-silver', label: '개천절 연휴',
            desc: '개천절 + 대체공휴일 + 정기휴무 연계. 연차 1개로 6일.',
            holidays: ['개천절', '대체공휴일'],
            tip: '9/30(수) 조퇴로 오후 출발 → 총 7일 확보'
        },
        {
            rank: 5, start: '2026-05-22', end: '2026-05-26', totalDays: 5, leaveDays: 1, efficiency: 5.0,
            badge: '🥉 양호', badgeClass: 'badge-bronze', label: '부처님 오신 날',
            desc: '부처님 오신 날 + 대체공휴일. 연차 1개로 5일 여행.',
            holidays: ['부처님 오신 날', '대체공휴일'],
            tip: '5/21(목) 조퇴 → 오후 출발편 탑승 가능'
        },
        {
            rank: 6, start: '2026-03-01', end: '2026-03-06', totalDays: 6, leaveDays: 2, efficiency: 3.0,
            badge: '📅 일반', badgeClass: 'badge-normal', label: '삼일절 연휴',
            desc: '삼일절 + 대체공휴일 + 정기휴무. 연차 2개로 6일.',
            holidays: ['삼일절', '대체공휴일'],
            tip: '2/28(토) 밤 출발편 활용 시 연차 0개로도 가능!'
        },
        {
            rank: 7, start: '2026-09-22', end: '2026-10-09', totalDays: 18, leaveDays: 5, efficiency: 3.6,
            badge: '🌏 장기여행', badgeClass: 'badge-long', label: '추석+개천절 슈퍼연휴',
            desc: '추석부터 개천절까지! 연차 5개로 무려 18일 대장정.',
            holidays: ['추석', '개천절', '대체공휴일'],
            tip: '9/21 조퇴 + 10/10 지각 활용 시 최대 20일 확보! (경유편 이용 시 중국 2개 도시 경유 추천)'
        }
    ];

    let currentDate = new Date();
    let trips = JSON.parse(localStorage.getItem('ica_trips') || '[]');
    let leaveData = JSON.parse(localStorage.getItem('ica_leave') || JSON.stringify({ total: 15, remaining: 9, resetDate: '2026-08-25' }));
    let currentTab = 'calendar';

    // ─── 사외교육 데이터 ─────────────────────────────────────────────────
    // 상반기 2일, 하반기 2일 — 날짜 미정, 사용자가 직접 지정
    let trainingDays = JSON.parse(localStorage.getItem('ica_training') || JSON.stringify({
        h1: ['', ''],   // 상반기 2일
        h2: ['', '']    // 하반기 2일
    }));

    // ─── 근무시간 유틸 ────────────────────────────────────────────────────
    function getPrevWorkDay(dateStr) {
        // 출발일 기준 전날 근무일 찾기
        const [y, m, d] = dateStr.split('-').map(Number);
        let prev = new Date(y, m - 1, d);
        prev.setDate(prev.getDate() - 1);
        // 전날이 휴무면 계속 앞으로
        while (!isWorkDay(prev)) prev.setDate(prev.getDate() - 1);
        return formatDateLocal(prev);
    }

    function getNextWorkDay(dateStr) {
        const [y, m, d] = dateStr.split('-').map(Number);
        let next = new Date(y, m - 1, d);
        next.setDate(next.getDate() + 1);
        while (!isWorkDay(next)) next.setDate(next.getDate() + 1);
        return formatDateLocal(next);
    }

    // 조퇴/지각 전략 계산
    function calcShortfallStrategy(depDate, retDate) {
        const prevWork = getPrevWorkDay(depDate);
        const nextWork = getNextWorkDay(retDate);
        return {
            // 출발 전날 조퇴: 퇴근 후 공항 이동, 야간편 탑승
            depEarlyLeave: { date: prevWork, type: '조퇴', desc: '오후 근무 후 공항 이동 → 야간 출발편 탑승 (19:00 이후 비행편 유리)', hoursShort: 2 },
            // 귀국 당일 지각: 이른 아침 도착 → 공항에서 바로 출근
            retLateArrive: { date: nextWork, type: '지각', desc: '오전 귀국편 → 공항에서 바로 출근 (07:00 이전 도착편 이용)', hoursShort: 2 },
            // 월 8시간 한도 안에서 둘 다 사용 가능
            canUseBoth: true,
            totalShortfall: 4, // 2+2 = 4h < 8h 한도
            note: '월 8시간 이내 만근 인정 규정 활용 — 조퇴 2h + 지각 2h = 총 4h 공제, 만근 유지'
        };
    }

    function init() {
        renderCalendar();
        renderSidebar();
        setupEventListeners();
        setupTabs();
    }

    function getAllTrainingDates() {
        return [...trainingDays.h1, ...trainingDays.h2].filter(d => d && d.length === 10);
    }

    function isTrainingDay(dateStr) {
        return getAllTrainingDates().includes(dateStr);
    }

    function isWorkDay(date) {
        const day = date.getDay();
        const dateStr = formatDateLocal(date);
        if (day === 2 || day === 5) return false;
        if (HOLIDAYS_2026[dateStr]) return false;
        if (day === 0) return false;
        return true;
    }

    // 연차 계산 시 사외교육일은 차감하지 않음
    function calculateLeaveUsage(startStr, endStr) {
        let count = 0;
        let curr = new Date(startStr);
        const end = new Date(endStr);
        while (curr <= end) {
            const ds = formatDateLocal(curr);
            if (isWorkDay(curr) && !isTrainingDay(ds)) count++;
            curr.setDate(curr.getDate() + 1);
        }
        return count;
    }

    function saveTraining() {
        localStorage.setItem('ica_training', JSON.stringify(trainingDays));
    }

    function formatDateLocal(date) {
        const y = date.getFullYear(), m = String(date.getMonth() + 1).padStart(2, '0'), d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    function formatDateKR(str) {
        const [y, m, d] = str.split('-');
        return `${m}월 ${d}일`;
    }

    function getDayName(str) {
        const days = ['일', '월', '화', '수', '목', '금', '토'];
        const [y, m, d] = str.split('-').map(Number);
        return days[new Date(y, m - 1, d).getDay()];
    }

    // ─── 탭 ─────────────────────────────────────────────────────────────
    function setupTabs() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const tab = btn.getAttribute('data-tab');
                if (tab) { currentTab = tab; renderMainContent(); }
            });
        });
    }

    function renderMainContent() {
        const cw = document.querySelector('.calendar-wrapper');
        const gp = document.getElementById('goldenPanel');
        const ap = document.getElementById('aiPanel');
        cw.style.display = currentTab === 'calendar' ? 'flex' : 'none';
        gp.style.display = currentTab === 'golden' ? 'block' : 'none';
        ap.style.display = currentTab === 'ai' ? 'flex' : 'none';
        if (currentTab === 'golden') renderGoldenPanel();
        if (currentTab === 'ai') renderAiPanel();
    }

    // ─── 황금연휴 패널 ────────────────────────────────────────────────────
    function renderGoldenPanel() {
        const panel = document.getElementById('goldenPanel');
        panel.innerHTML = `
            <div class="panel-header">
                <h2>🗓️ 황금연휴 추천</h2>
                <p class="panel-sub">2026년 잔여 연차 <strong>${leaveData.remaining}개</strong> 기준 · 화·금 정기휴무 + 공휴일 + <span class="highlight-text">조퇴/지각 전략</span> 최적화</p>
            </div>
            <div class="strategy-banner">
                <div class="strategy-icon">⏰</div>
                <div class="strategy-text">
                    <strong>조퇴·지각 만근 인정 전략 (07:00 귀국 권장)</strong>
                    <span>월 8시간 이내 조퇴+지각 → 만근 인정! 출발 전날 조퇴(주간편 선호) + 귀국 당일 지각(07:00 이전 도착)으로 여행 기간 연장</span>
                </div>
            </div>
            <div class="golden-grid">
                ${GOLDEN_WINDOWS.filter(w => w.leaveDays <= leaveData.remaining).map((w, i) => {
            const strat = calcShortfallStrategy(w.start, w.end);
            return `
                    <div class="golden-card ${w.badgeClass}" data-window="${i}">
                        <div class="golden-card-top">
                            <span class="golden-badge ${w.badgeClass}">${w.badge}</span>
                            <span class="golden-efficiency">×${w.efficiency.toFixed(1)} 효율</span>
                        </div>
                        <h3 class="golden-label">${w.label}</h3>
                        <div class="golden-dates">
                            <span class="golden-date-range">${formatDateKR(w.start)}(${getDayName(w.start)}) ~ ${formatDateKR(w.end)}(${getDayName(w.end)})</span>
                        </div>
                        <p class="golden-desc">${w.desc}</p>
                        <div class="golden-stats">
                            <div class="stat"><span class="stat-num">${w.totalDays}</span><span class="stat-label">총 일수</span></div>
                            <div class="stat"><span class="stat-num leave-num">${w.leaveDays}</span><span class="stat-label">연차 사용</span></div>
                            <div class="stat"><span class="stat-num text-green">${w.totalDays + 2}</span><span class="stat-label">조퇴+지각 시</span></div>
                        </div>
                        <div class="shortfall-tip">
                            <div class="stip-row">🛫 <strong>${strat.depEarlyLeave.date}(${getDayName(strat.depEarlyLeave.date)}) 조퇴</strong> → ${strat.depEarlyLeave.desc}</div>
                            <div class="stip-row">🛬 <strong>${strat.retLateArrive.date}(${getDayName(strat.retLateArrive.date)}) 지각</strong> → ${strat.retLateArrive.desc}</div>
                            <div class="stip-note">💡 ${strat.note}</div>
                        </div>
                        <div class="golden-tags">${w.holidays.map(h => `<span class="holiday-tag">${h}</span>`).join('')}</div>
                    </div>`
        }).join('')}
            </div>
        `;
    }

    // ─── 사외교육 + 여행 팁 통합 패널 ───────────────────────────────────
    function renderAiPanel() {
        const panel = document.getElementById('aiPanel');
        const td = trainingDays;
        const allTd = getAllTrainingDates();

        panel.innerHTML = `
            <div class="ai-sidebar">
                <div class="ai-profile">
                    <div class="ai-avatar">📚</div>
                    <h3>사외교육 & 여행 팁</h3>
                    <p>사외교육 날짜 지정 + 항공권 절약 전략 가이드</p>
                </div>

                <div class="training-summary">
                    <p class="qb-label">사외교육 현황</p>
                    <div class="td-status">
                        <div class="td-half">
                            <span class="td-half-label">상반기</span>
                            <span class="td-count ${td.h1.filter(d => d).length === 2 ? 'done' : 'pending'}">${td.h1.filter(d => d).length}/2일 ${td.h1.filter(d => d).length === 2 ? '✅' : '미정'}</span>
                        </div>
                        <div class="td-half">
                            <span class="td-half-label">하반기</span>
                            <span class="td-count ${td.h2.filter(d => d).length === 2 ? 'done' : 'pending'}">${td.h2.filter(d => d).length}/2일 ${td.h2.filter(d => d).length === 2 ? '✅' : '미정'}</span>
                        </div>
                    </div>
                    ${allTd.length > 0 ? `<div class="td-dates">${allTd.map(d => `<span class="td-chip">${formatDateKR(d)}(${getDayName(d)})</span>`).join('')}</div>` : ''}
                    <button class="qbtn" onclick="showTrainingSection()">📅 날짜 설정하기</button>
                </div>

                <div class="ai-quick-btns">
                    <p class="qb-label">여행 팁 가이드</p>
                    <button class="qbtn" onclick="showTip('cheapFlight')">💰 항공권 최저가 전략</button>
                    <button class="qbtn" onclick="showTip('nightFlight')">🌙 야간편 활용법</button>
                    <button class="qbtn" onclick="showTip('stopover')">🔄 경유·스톱오버 전략</button>
                    <button class="qbtn" onclick="showTip('sites')">🔍 검색 사이트 비교</button>
                    <button class="qbtn" onclick="showTip('annual2026')">📅 2026 맞춤 플랜</button>
                    <button class="qbtn" onclick="showTip('earlyBook')">⏰ 예약 타이밍 전략</button>
                </div>
            </div>

            <div class="ai-chat-container">
                <div class="ai-chat-header">
                    <span id="aiPanelTitle">💬 여행 팁 가이드</span>
                    <button class="btn-clear-chat" onclick="showWelcome()">← 처음으로</button>
                </div>
                <div class="ai-messages" id="aiMessages">
                    ${buildWelcomeMsg()}
                </div>

                <!-- 사외교육 설정 섹션 (처음엔 숨김) -->
                <div id="trainingSection" style="display:none; padding:1.25rem; border-top:1px solid var(--border); background:#fafafa;">
                    <h4 style="margin-bottom:1rem; font-size:0.95rem;">📚 사외교육 날짜 지정</h4>
                    <div class="training-form-grid">
                        <div class="td-form-group">
                            <label>상반기 1일차</label>
                            <input type="date" class="flight-input" id="tdH1D1" value="${td.h1[0]}"
                                min="2026-01-01" max="2026-06-30"
                                onchange="updateTraining('h1',0,this.value)">
                        </div>
                        <div class="td-form-group">
                            <label>상반기 2일차</label>
                            <input type="date" class="flight-input" id="tdH1D2" value="${td.h1[1]}"
                                min="2026-01-01" max="2026-06-30"
                                onchange="updateTraining('h1',1,this.value)">
                        </div>
                        <div class="td-form-group">
                            <label>하반기 1일차</label>
                            <input type="date" class="flight-input" id="tdH2D1" value="${td.h2[0]}"
                                min="2026-07-01" max="2026-12-31"
                                onchange="updateTraining('h2',0,this.value)">
                        </div>
                        <div class="td-form-group">
                            <label>하반기 2일차</label>
                            <input type="date" class="flight-input" id="tdH2D2" value="${td.h2[1]}"
                                min="2026-07-01" max="2026-12-31"
                                onchange="updateTraining('h2',1,this.value)">
                        </div>
                    </div>
                    <p class="td-hint">💡 사외교육일은 연차 차감 없이 여행 기간에 포함할 수 있습니다. 날짜를 지정하면 캘린더에 표시됩니다.</p>
                </div>
            </div>
        `;
    }

    function buildWelcomeMsg() {
        const allTd = getAllTrainingDates();
        const tdInfo = allTd.length > 0
            ? `<br>📚 <strong>사외교육 지정일:</strong> ${allTd.map(d => formatDateKR(d) + '(' + getDayName(d) + ')').join(', ')}`
            : `<br>📚 사외교육 날짜가 미지정 상태입니다. 왼쪽 <strong>[날짜 설정하기]</strong>에서 지정하면 캘린더에 반영됩니다.`;
        return `
            <div class="ai-msg ai">
                <div class="msg-avatar">📚</div>
                <div class="msg-bubble">
                    <strong>사외교육 & 여행 팁 센터</strong>입니다 ✈️<br><br>
                    <strong>📌 사외교육 안내</strong><br>
                    • 상반기 2일 + 하반기 2일 = 총 4일<br>
                    • 날짜 미정 → 왼쪽에서 직접 지정 가능<br>
                    • 사외교육일은 <strong>연차 차감 없음</strong><br>
                    • 황금연휴와 연계 시 여행 기간 연장에 활용 가능
                    ${tdInfo}<br><br>
                    왼쪽 버튼으로 <strong>항공권 절약 팁</strong>을 확인하거나,<br>
                    <strong>[날짜 설정하기]</strong>로 사외교육 일정을 등록하세요!
                </div>
            </div>`;
    }

    window.showWelcome = function () {
        const title = document.getElementById('aiPanelTitle');
        const msgs  = document.getElementById('aiMessages');
        const ts    = document.getElementById('trainingSection');
        if (!title || !msgs || !ts) return; // aiPanel 미렌더 상태
        title.textContent = '💬 여행 팁 가이드';
        msgs.innerHTML = buildWelcomeMsg();
        ts.style.display = 'none';
    };

    window.showTrainingSection = function () {
        const title = document.getElementById('aiPanelTitle');
        const ts    = document.getElementById('trainingSection');
        const msgs  = document.getElementById('aiMessages');
        if (!title || !ts || !msgs) return;
        title.textContent = '📚 사외교육 날짜 설정';
        ts.style.display = 'block';
        msgs.scrollTop = msgs.scrollHeight;
    };

    window.updateTraining = function (half, idx, val) {
        trainingDays[half][idx] = val;
        saveTraining();
        renderCalendar();
        renderSidebar();
        // aiPanel이 현재 열려 있을 때만 인라인 DOM 업데이트 (닫혀있으면 null 에러 방지)
        const tdHalves = document.querySelectorAll('.td-half');
        if (tdHalves.length === 0) return;
        const td = trainingDays;
        tdHalves.forEach((el, i) => {
            const h = i === 0 ? td.h1 : td.h2;
            const cnt = h.filter(d => d).length;
            el.querySelector('.td-count').textContent = `${cnt}/2일 ${cnt === 2 ? '✅' : '미정'}`;
            el.querySelector('.td-count').className = `td-count ${cnt === 2 ? 'done' : 'pending'}`;
        });
        const allTd = getAllTrainingDates();
        const tdDatesEl = document.querySelector('.td-dates');
        if (allTd.length > 0) {
            const html = allTd.map(d => `<span class="td-chip">${formatDateKR(d)}(${getDayName(d)})</span>`).join('');
            if (tdDatesEl) {
                tdDatesEl.innerHTML = html;
            } else {
                const tsSummary = document.querySelector('.training-summary');
                if (tsSummary) {
                    const div = document.createElement('div');
                    div.className = 'td-dates';
                    div.innerHTML = html;
                    tsSummary.insertBefore(div, tsSummary.querySelector('.qbtn'));
                }
            }
        } else if (tdDatesEl) {
            tdDatesEl.remove();
        }
    };

    // ─── 내장 여행 팁 답변 DB ────────────────────────────────────────────
    const TIPS = {
        cheapFlight: {
            title: '💰 항공권 최저가 전략',
            content: `
                <strong>📅 예약 타이밍</strong><br>
                • 국내선·단거리 아시아: 출발 <strong>1~3개월 전</strong>이 최적<br>
                • 유럽·미주 장거리: 출발 <strong>3~6개월 전</strong>에 예약<br>
                • 얼리버드 특가: 출발 6개월+ 전, 항공사 직항 구독 메일 확인<br><br>
                <strong>📆 저렴한 출발 요일</strong><br>
                • 화·수·목 출발편이 금·토·일 대비 <strong>15~30% 저렴</strong><br>
                • 귀국편: 화·수요일 귀국이 일요일 대비 저렴<br><br>
                <strong>🔔 가격 알림 설정</strong><br>
                • 스카이스캐너 → "가격 알림" 설정 → 목표가 도달 시 알림<br>
                • 구글 항공편 → "이 여정 추적" → 가격 변동 이메일 수신<br>
                • 카약 → "가격 예측" 기능으로 지금 살지 기다릴지 판단<br><br>
                <strong>💳 추가 절약 팁</strong><br>
                • 항공사 마일리지 카드 활용 (신한 에어플러스, 현대 플래티넘)<br>
                • 연 1~2회 항공사 직접 세일 행사 노리기 (대한항공·아시아나 연초)<br>
                • LCC 비교: 제주항공·진에어·에어부산·티웨이·이스타·에어서울`
        },
        nightFlight: {
            title: '☀️ 주간편 vs 🌙 야간편 전략',
            content: `
                <strong>주간편 선호 (추천)</strong><br>
                • 컨디션 조절 용이: 아침/오전 출발 → 현지 저녁 도착 후 바로 휴식<br>
                • 숙소 체크인 시간 맞추기 유리<br>
                • 항공사별 오전 황금 시간대 노선 활용<br><br>
                <strong>⏰ 조퇴 활용 시나리오 (주간편)</strong><br>
                • 출발 전날 또는 당일 오전 근무 후 일찍 퇴근 → 낮 비행편 탑승<br>
                • 월 8시간 이내이므로 <strong>만근 유지</strong><br><br>
                <strong>🛬 귀국 당일 지각 전략 (필수 확인)</strong><br>
                • <strong>07:00 이전 도착</strong> 귀국편 선택 (귀국 당일 출근 시)<br>
                • 공항 출국 후 빠르게 이동 → 지각 시간 최소화<br>
                • 월 8시간 한도 내 운용 → <strong>만근 인정</strong>`
        },
        stopover: {
            title: '🔄 경유·중국 2개도시 경유 전략',
            content: `
                <strong>경유편의 매력 (중국 2개도시 & 2개국 경유)</strong><br>
                • 직항 대비 <strong>30~60% 저렴</strong> (특히 중국 항공사 활용 시)<br>
                • 중국 내 <strong>2개 도시 경유(PEK-PVG 등)</strong> 시 파격적인 가격대 형성<br>
                • 경유지에서 추가 여행 가능 (스톱오버/무비자 입국 활용)<br><br>
                <strong>🌏 추천 경유 허브 & 항공사</strong><br>
                • <strong>중국 (PEK/PVG/CAN)</strong> - 에어차이나·동방항공: 유럽·미주·대양주 최저가<br>
                • <strong>싱가포르/홍콩</strong> - 싱가포르항공·캐세이퍼시픽: 프리미엄 경유 서비스<br>
                • <strong>도쿄/나리타</strong> - 일본 항공사: 미국 노선 2개국 경유 여행<br><br>
                <strong>✈️ 중국 노선 특전</strong><br>
                • 72/144시간 무비자 체류 가능 도시 활용 → 본 여행 전후의 '보너스 여행'<br>
                • 중국 대형 항공사: 경유 시 무료 호텔 또는 라운지 제공 여부 확인 필수<br><br>
                <strong>💡 전략 조합 예시</strong><br>
                • 추석 연휴: 인천 → 북경(경유) → 상하이(경유) → 목적지<br>
                • 주간편 탑승 선호 시: 오전/오후 출발 경유편으로 일정 여유 확보`
        },
        sites: {
            title: '🔍 항공권 검색 사이트 비교',
            content: `
                <strong>🟢 네이버 항공</strong><br>
                • 장점: 국내 카드 할인 연동, 한국어 UI, 국내 LCC 모두 포함<br>
                • 단점: 일부 외국 항공사 누락<br>
                • 추천 상황: <strong>국내 카드 결제 최적화, LCC 비교</strong><br><br>
                <strong>🔵 스카이스캐너</strong><br>
                • 장점: 전 세계 최다 항공사, 가격 알림, "어디든지" 검색<br>
                • 단점: 가격 클릭 후 항공사 사이트로 이동<br>
                • 추천 상황: <strong>목적지 미정, 최저가 탐색, 가격 추이 확인</strong><br><br>
                <strong>🟡 카약 (KAYAK)</strong><br>
                • 장점: 가격 예측 (지금/기다림), Hacker Fares(편도 조합)<br>
                • 단점: UI가 다소 복잡<br>
                • 추천 상황: <strong>가격 예측 기능, 복잡한 일정 조합</strong><br><br>
                <strong>🔴 구글 항공편</strong><br>
                • 장점: 빠른 검색, 지도 탐색, 가격 캘린더, 여정 추적<br>
                • 단점: 일부 LCC 미포함<br>
                • 추천 상황: <strong>날짜 유연할 때, 최저가 날짜 캘린더 확인</strong><br><br>
                <strong>🟠 인터파크 투어</strong><br>
                • 장점: 국내 특가 프로모션, 할인 쿠폰, 패키지 연계<br>
                • 추천 상황: <strong>프로모션·패키지 특가 노릴 때</strong><br><br>
                <strong>✅ 추천 전략: 3단계 검색</strong><br>
                1. 구글 항공편으로 <strong>최저가 날짜</strong> 파악<br>
                2. 스카이스캐너로 <strong>전체 항공사 가격 비교</strong><br>
                3. 네이버항공으로 <strong>국내 카드 할인 최종 결제</strong>`
        },
        annual2026: {
            title: '📅 2026 나만의 맞춤 여행 플랜',
            content: `
                <strong>화·금 정기휴무 + 공휴일 + 조퇴/지각 + 사외교육 최적 활용</strong><br><br>
                <strong>🏆 1순위: 추석 황금연휴 (9/22~9/29)</strong><br>
                • 연차 1개 → 8일 여행<br>
                • 9/21(월) 조퇴 + 9/30(수) 지각 → <strong>최대 10일</strong><br>
                • 추천: 유럽·미주 장거리 or 일본 장기 여행<br><br>
                <strong>🥈 2순위: 선거+현충일 (6/2~6/7)</strong><br>
                • 연차 1개 → 6일 여행<br>
                • 6/1(월) 조퇴 → 6/8(월) 지각 → <strong>최대 8일</strong><br>
                • 추천: 동남아 단거리<br><br>
                <strong>🥈 3순위: 광복절 (8/13~8/18)</strong><br>
                • 연차 1개 → 6일<br>
                • 8/12(수) 조퇴 + 8/19(수) 지각 → <strong>최대 8일</strong><br>
                • 추천: 일본·동남아<br><br>
                <strong>📚 사외교육 연계 전략</strong><br>
                • 상반기 교육을 6/2~3 또는 5/22~23에 배치하면<br>
                  황금연휴와 연결해 연차 0개로 6~7일 여행 가능<br>
                • 하반기 교육을 9/22~23 주변에 배치하면<br>
                  추석 슈퍼연휴가 <strong>연차 0개</strong>로도 가능!<br><br>
                <strong>💡 연차 9개 추천 배분</strong><br>
                • 추석: 1개 | 광복절: 1개 | 개천절: 1개<br>
                • 현충일/선거: 1개 | 부처님오신날: 1개<br>
                • 추석+개천절 슈퍼연휴: 5개 (18일 여행!)<br>
                → 연차 9개로 총 <strong>40일 이상</strong> 여행 가능`
        },
        earlyBook: {
            title: '⏰ 예약 타이밍 완벽 가이드',
            content: `
                <strong>🗓️ 언제 예약해야 가장 저렴할까?</strong><br><br>
                <strong>단거리 아시아 (일본·동남아)</strong><br>
                • 최적 예약 시점: 출발 <strong>6~10주 전</strong><br>
                • 너무 일찍(6개월+): 초기 가격이 높음<br>
                • 너무 늦게(2주 전): 좌석 부족으로 급등<br>
                • 황금연휴 기간: 평소보다 <strong>3~4개월 전</strong> 예약 필수<br><br>
                <strong>장거리 유럽·미주</strong><br>
                • 최적 예약 시점: 출발 <strong>3~5개월 전</strong><br>
                • 추석·황금연휴: 반드시 <strong>5~6개월 전</strong> 예약<br><br>
                <strong>⚡ 특가 항공권 잡는 법</strong><br>
                • 항공사 뉴스레터 구독 (대한항공·아시아나·LCC 직접)<br>
                • 스카이스캐너 가격 알림 → 목표가 설정<br>
                • 화·수요일 오전 검색 (항공사 가격 조정 타이밍)<br>
                • 항공사 앱 전용 할인: 대한항공 앱, 진에어 앱 등<br><br>
                <strong>📊 추석 연휴 항공권 예약 시점별 가격 (일본 기준)</strong><br>
                • 6개월 전: 약 25만원<br>
                • 3개월 전: 약 35만원<br>
                • 1개월 전: 약 50만원~<br>
                • 2주 전: 약 80만원 이상<br><br>
                <strong>✅ 결론: 2026 추석 연휴 항공권</strong><br>
                지금 당장 (2026년 3월) 검색 시작 → <strong>4~5월 예약 완료</strong>가 최적!`
        }
    };

    window.showTip = function (key) {
        const tip = TIPS[key];
        if (!tip) return;
        const title = document.getElementById('aiPanelTitle');
        const ts    = document.getElementById('trainingSection');
        const msgs  = document.getElementById('aiMessages');
        if (!title || !ts || !msgs) return; // aiPanel 미렌더 상태
        title.textContent = tip.title;
        ts.style.display = 'none';
        msgs.innerHTML = `
            <div class="ai-msg ai">
                <div class="msg-avatar">💡</div>
                <div class="msg-bubble">${tip.content}</div>
            </div>`;
        msgs.scrollTop = 0;
    };

    window.clearChat = function () {
        showWelcome();
    };

    // ─── 캘린더 ───────────────────────────────────────────────────────────
    function renderCalendar() {
        calendarGrid.innerHTML = '';
        const year = currentDate.getFullYear(), month = currentDate.getMonth();
        currentMonthYear.textContent = `${year}년 ${month + 1}월`;
        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();
        const prevLastDate = new Date(year, month, 0).getDate();
        for (let i = firstDay; i > 0; i--) createDayCell(new Date(year, month - 1, prevLastDate - i + 1), true);
        const today = new Date(); today.setHours(0, 0, 0, 0);
        for (let i = 1; i <= lastDate; i++) { const d = new Date(year, month, i); createDayCell(d, false, d.getTime() === today.getTime()); }
        const rem = 42 - (firstDay + lastDate);
        for (let i = 1; i <= rem; i++) createDayCell(new Date(year, month + 1, i), true);
        applyTripStyles();
        applyGoldenWindowStyles();
    }

    function createDayCell(date, isOtherMonth, isToday = false) {
        const cell = document.createElement('div'); cell.classList.add('day-cell');
        const dateStr = formatDateLocal(date), holidayName = HOLIDAYS_2026[dateStr], day = date.getDay();
        if (isOtherMonth) cell.classList.add('other-month');
        if (isToday) cell.classList.add('today');
        if (!isWorkDay(date)) {
            cell.classList.add('day-off');
            if (day === 2 || day === 5) cell.classList.add('regular-off');
            if (holidayName || day === 0 || day === 6) cell.classList.add('holiday');
        }
        cell.setAttribute('data-date', dateStr);
        let content = `<span class="day-num">${date.getDate()}</span>`;
        if (holidayName) content += `<span class="holiday-name">${holidayName}</span>`;
        else if (day === 2 || day === 5) content += `<span class="off-tag">정기휴무</span>`;
        else if (isTrainingDay(dateStr)) content += `<span class="training-tag">사외교육</span>`;
        cell.innerHTML = content;
        if (isTrainingDay(dateStr)) cell.classList.add('training-day');
        calendarGrid.appendChild(cell);
    }

    function applyGoldenWindowStyles() {
        // rank7(슈퍼연휴)은 rank1+rank4의 합산 구간이므로 캘린더 중복 제외
        const windows = GOLDEN_WINDOWS.filter(w => w.rank !== 7);

        // 날짜별로 rank 가장 낮은(=우선순위 높은) 윈도우 1개만 매핑 → 중복 방지
        const dateMap = {};
        windows.forEach(w => {
            let cur = new Date(w.start); cur.setHours(0,0,0,0);
            const endD = new Date(w.end); endD.setHours(0,0,0,0);
            while (cur <= endD) {
                const ds = formatDateLocal(cur);
                if (!dateMap[ds] || w.rank < dateMap[ds].rank) dateMap[ds] = w;
                cur.setDate(cur.getDate() + 1);
            }
        });

        calendarGrid.querySelectorAll('.day-cell').forEach(cell => {
            if (cell.classList.contains('other-month')) return;
            const ds = cell.getAttribute('data-date');
            const w = dateMap[ds];
            if (!w) return;

            cell.classList.add('golden-window');

            // 구간 시작 셀에만 라벨 뱃지 (dot 대신 텍스트로 교체)
            if (ds === w.start) {
                const badge = document.createElement('span');
                badge.className = 'golden-cal-badge';
                badge.textContent = w.label;
                badge.title = `연차 ${w.leaveDays}개 → ${w.totalDays}일`;
                cell.appendChild(badge);
            }
        });
    }

    function applyTripStyles() {
        // 기존 trip 요소 전체 제거
        calendarGrid.querySelectorAll('.trip-bar, .trip-label').forEach(el => el.remove());
        calendarGrid.querySelectorAll('.day-cell').forEach(c =>
            c.classList.remove('is-trip', 'trip-start', 'trip-end'));

        const PALETTE = ['#4f46e5','#0ea5e9','#10b981','#f59e0b','#ec4899'];

        trips.forEach((trip, idx) => {
            const color = PALETTE[idx % PALETTE.length];
            const start = new Date(trip.start); start.setHours(0,0,0,0);
            const end   = new Date(trip.end);   end.setHours(0,0,0,0);

            calendarGrid.querySelectorAll('.day-cell').forEach(cell => {
                const ds = cell.getAttribute('data-date');
                const cd = new Date(ds); cd.setHours(0,0,0,0);
                if (cd < start || cd > end) return;

                const isStart = cd.getTime() === start.getTime();
                const isEnd   = cd.getTime() === end.getTime();

                cell.classList.add('is-trip');
                if (isStart) cell.classList.add('trip-start');
                if (isEnd)   cell.classList.add('trip-end');

                // 셀 하단 컬러 바
                const bar = document.createElement('div');
                bar.className = 'trip-bar';
                bar.style.background = color;
                if (isStart) bar.style.borderRadius = '3px 0 0 3px';
                if (isEnd)   bar.style.borderRadius = isStart ? '3px' : '0 3px 3px 0';
                cell.appendChild(bar);

                // 시작일에만 여행지 라벨
                if (isStart) {
                    const lbl = document.createElement('div');
                    lbl.className = 'trip-label';
                    lbl.style.background = color;
                    lbl.textContent = `✈ ${trip.location}`;
                    cell.appendChild(lbl);
                }
            });
        });
    }

    // ─── 사이드바 ─────────────────────────────────────────────────────────
    function renderSidebar() { renderDDays(); renderLeaveBalance(); renderGoldenMiniList(); renderTrainingSidebar(); }

    function renderTrainingSidebar() {
        const c = document.getElementById('trainingSidebarInfo'); if (!c) return;
        const allTd = getAllTrainingDates();
        const td = trainingDays;
        const h1done = td.h1.filter(d => d).length;
        const h2done = td.h2.filter(d => d).length;
        c.innerHTML = `
            <div class="td-sidebar-row">
                <span>상반기 교육</span>
                <span class="${h1done === 2 ? 'done' : 'pending'}">${h1done}/2일 ${h1done === 2 ? '✅' : '미정'}</span>
            </div>
            <div class="td-sidebar-row">
                <span>하반기 교육</span>
                <span class="${h2done === 2 ? 'done' : 'pending'}">${h2done}/2일 ${h2done === 2 ? '✅' : '미정'}</span>
            </div>
            ${allTd.length > 0 ? allTd.map(d => `<div class="td-chip-sm">📚 ${formatDateKR(d)}(${getDayName(d)})</div>`).join('') : '<div style="font-size:0.72rem;color:var(--text-muted)">날짜 미지정 — 팁 탭에서 설정</div>'}
        `;
    }

    function renderLeaveBalance() {
        const c = document.getElementById('leaveBalanceContainer'); if (!c) return;
        c.innerHTML = `<div class="leave-card"><div class="leave-header"><span>잔여 연차</span><span class="count">${leaveData.remaining} / ${leaveData.total}</span></div><div class="progress-bar"><div class="progress" style="width:${(leaveData.remaining / leaveData.total) * 100}%"></div></div><p class="reset-info">갱신일: ${leaveData.resetDate}</p></div>`;
    }

    function renderGoldenMiniList() {
        const container = document.getElementById('goldenMiniList'); if (!container) return;
        const top3 = GOLDEN_WINDOWS.filter(w => w.leaveDays <= leaveData.remaining).slice(0, 3);
        container.innerHTML = top3.map(w => `
            <div class="golden-mini-item" onclick="switchToGolden()">
                <span class="gmi-dot"></span>
                <div><strong>${w.label}</strong><span>${formatDateKR(w.start)} · 연차 ${w.leaveDays}개</span></div>
                <span class="gmi-eff">×${w.efficiency.toFixed(1)}</span>
            </div>`).join('');
    }

    window.switchToGolden = function () {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        document.querySelector('[data-tab="golden"]').classList.add('active');
        currentTab = 'golden'; renderMainContent();
    };

    function renderDDays() {
        if (trips.length === 0) { dDayGrid.innerHTML = '<div class="d-day-item empty"><span>계획된 여행이 없습니다</span></div>'; return; }
        dDayGrid.innerHTML = '';
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const upcoming = trips.map(t => { const [sY, sM, sD] = t.start.split('-').map(Number); const d = new Date(sY, sM - 1, sD); d.setHours(0, 0, 0, 0); return { ...t, startDate: d }; }).filter(t => t.startDate >= today).sort((a, b) => a.startDate - b.startDate);
        if (upcoming.length === 0) { dDayGrid.innerHTML = '<div class="d-day-item empty"><span>다가오는 여행이 없습니다</span></div>'; return; }
        upcoming.forEach(trip => {
            const diff = Math.ceil((trip.startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            const leaveUsed = calculateLeaveUsage(trip.start, trip.end);
            const item = document.createElement('div'); item.classList.add('sidebar-trip-card');
            item.innerHTML = `<div class="card-info"><span class="loc">${trip.location}</span><span class="dday">D-${diff === 0 ? 'Day' : diff}</span></div><div class="card-meta"><span>연차 ${leaveUsed}개 소모</span></div>`;
            dDayGrid.appendChild(item);
        });
    }

    // ─── 모달 연차 상태 렌더 ──────────────────────────────────────────────
    function renderModalLeaveStatus(usedOverride = null) {
        const box = document.getElementById('modalLeaveStatus');
        if (!box) return;
        const pct = (leaveData.remaining / leaveData.total) * 100;
        const afterUsed = usedOverride !== null ? leaveData.remaining - usedOverride : null;
        const isShort   = usedOverride !== null && afterUsed < 0;

        box.innerHTML = `
            <div class="mls-row">
                <span class="mls-label">현재 잔여 연차</span>
                <span class="mls-count ${leaveData.remaining <= 3 ? 'low' : ''}">${leaveData.remaining} / ${leaveData.total}일</span>
            </div>
            <div class="mls-bar-wrap">
                <div class="mls-bar-bg">
                    <div class="mls-bar-fill" style="width:${pct}%"></div>
                    ${usedOverride !== null && !isShort ? `<div class="mls-bar-used" style="width:${(usedOverride / leaveData.total) * 100}%; left:${Math.max(0, pct - (usedOverride / leaveData.total) * 100)}%"></div>` : ''}
                </div>
            </div>
            ${usedOverride !== null ? `
            <div class="mls-preview ${isShort ? 'over' : ''}">
                ${isShort
                    ? `⚠️ 연차 <strong>${Math.abs(afterUsed)}개 부족</strong> — 날짜를 조정해주세요`
                    : `사용 <strong>${usedOverride}일</strong> → 입력 후 잔여 <strong class="mls-after">${afterUsed}일</strong>`}
            </div>` : ''}
        `;
    }
    function setupEventListeners() {
        prevMonthBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); });
        nextMonthBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); });
        todayBtn.addEventListener('click', () => { currentDate = new Date(); renderCalendar(); });

        // 모달 열기 — 폼 초기화 + 현재 잔여 연차 표시
        function openModal() {
            document.getElementById('tripLocation').value = '';
            document.getElementById('startDate').value = '';
            document.getElementById('endDate').value = '';
            document.getElementById('leavePreview').style.display = 'none';
            renderModalLeaveStatus();
            tripModal.classList.add('active');
        }
        addTripBtn.addEventListener('click', openModal);
        closeModal.addEventListener('click', () => tripModal.classList.remove('active'));
        const mobileAddBtn = document.getElementById('mobileAddBtn');
        if (mobileAddBtn) mobileAddBtn.addEventListener('click', openModal);

        // 날짜 변경 시 실시간 연차 차감 미리보기
        function updateLeavePreview() {
            const s = document.getElementById('startDate').value;
            const e = document.getElementById('endDate').value;
            const box = document.getElementById('leavePreview');
            if (s && e && new Date(s) <= new Date(e)) {
                const used = calculateLeaveUsage(s, e);
                box.style.display = 'block';
                renderModalLeaveStatus(used);
            } else {
                box.style.display = 'none';
                renderModalLeaveStatus();
            }
        }
        document.getElementById('startDate').addEventListener('change', updateLeavePreview);
        document.getElementById('endDate').addEventListener('change', updateLeavePreview);

        saveTripBtn.addEventListener('click', () => {
            const location = document.getElementById('tripLocation').value;
            const start = document.getElementById('startDate').value;
            const end = document.getElementById('endDate').value;
            if (location && start && end) {
                const sy = new Date(start).getFullYear();
                if (sy > 2100 || sy < 1900) { alert('날짜가 올바르지 않습니다.'); return; }
                const leaveUsed = calculateLeaveUsage(start, end);
                if (leaveUsed > leaveData.remaining) { alert('연차가 부족합니다!'); return; }
                trips.push({ location, start, end, leaveUsed });
                leaveData.remaining -= leaveUsed;
                localStorage.setItem('ica_trips', JSON.stringify(trips));
                localStorage.setItem('ica_leave', JSON.stringify(leaveData));
                tripModal.classList.remove('active');
                renderCalendar(); renderSidebar();
            } else alert('모든 정보를 입력해주세요!');
        });
    }

    init();
});
