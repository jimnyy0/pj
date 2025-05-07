// 더미 데이터
const stocks = [
    { id: 1, ticker: 'AAPL', name: 'Apple Inc.', price: 150.25, volume: 1000000 },
    { id: 2, ticker: 'TSLA', name: 'Tesla Inc.', price: 700.50, volume: 500000 },
    { id: 3, ticker: 'MSFT', name: 'Microsoft Corp.', price: 300.75, volume: 750000 },
    { id: 4, ticker: 'GOOGL', name: 'Alphabet Inc.', price: 2800.10, volume: 300000 },
    { id: 5, ticker: 'AMZN', name: 'Amazon.com Inc.', price: 3400.20, volume: 400000 },
    { id: 6, ticker: 'FB', name: 'Meta Platforms Inc.', price: 330.15, volume: 600000 },
    { id: 7, ticker: 'NVDA', name: 'NVIDIA Corp.', price: 250.60, volume: 800000 },
    { id: 8, ticker: 'JPM', name: 'JPMorgan Chase & Co.', price: 160.30, volume: 200000 },
    { id: 9, ticker: 'V', name: 'Visa Inc.', price: 220.45, volume: 250000 },
    { id: 10, ticker: 'WMT', name: 'Walmart Inc.', price: 140.80, volume: 150000 },
];

let currentPage = 1;
const rowsPerPage = 10;
let currentSort = 'volume';
let searchQuery = '';
let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
let isSidebarOpen = false;

// 로그인 상태 확인
function isLoggedIn() {
    return !!localStorage.getItem('user_id');
}

// UI 업데이트 (로그인/로그아웃 버튼, 메뉴 아이콘)
function updateUI() {
    const signupBtn = document.getElementById('signup-btn');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const menuToggle = document.getElementById('menu-toggle');
    if (isLoggedIn()) {
        signupBtn.style.display = 'none';
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        menuToggle.style.display = 'inline-flex';
    } else {
        signupBtn.style.display = 'inline-block';
        loginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        menuToggle.style.display = 'none';
        // 비로그인 시 사이드바 접기
        isSidebarOpen = false;
        document.getElementById('sidebar').classList.remove('open');
        document.querySelector('header').classList.remove('sidebar-open');
    }
}

// 로그아웃
function logout() {
    localStorage.removeItem('user_id');
    localStorage.setItem('favorites', '[]');
    favorites = [];
    isSidebarOpen = false;
    document.getElementById('sidebar').classList.remove('open');
    document.querySelector('header').classList.remove('sidebar-open');
    updateUI();
    loadStocks();
    Swal.fire({
        icon: 'success',
        title: '로그아웃',
        text: '로그아웃되었습니다.',
    });
}

// 즐겨찾기 토글
function toggleFavorite(ticker) {
    if (!isLoggedIn()) {
        Swal.fire({
            icon: 'warning',
            title: '로그인 필요',
            text: '즐겨찾기 기능은 로그인 후 사용 가능합니다.',
        });
        return;
    }

    const isFavorited = favorites.includes(ticker);
    if (isFavorited) {
        favorites = favorites.filter(t => t !== ticker);
    } else {
        favorites.push(ticker);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    loadStocks();
    if (isSidebarOpen) {
        renderFavorites();
    }
    Swal.fire({
        icon: 'success',
        title: isFavorited ? '즐겨찾기 해제' : '즐겨찾기 등록',
        text: `종목 ${ticker}이 ${isFavorited ? '즐겨찾기에서 제거되었습니다.' : '즐겨찾기에 추가되었습니다.'}`,
    });
}

// 사이드바 즐겨찾기 렌더링
function renderFavorites() {
    const favoritesList = document.getElementById('favorites-list');
    favoritesList.innerHTML = '';
    if (favorites.length === 0) {
        const li = document.createElement('li');
        li.textContent = '즐겨찾기한 종목이 없습니다.';
        favoritesList.appendChild(li);
        return;
    }
    favorites.forEach(ticker => {
        const stock = stocks.find(s => s.ticker === ticker);
        if (stock) {
            const li = document.createElement('li');
            li.textContent = stock.name;
            favoritesList.appendChild(li);
        }
    });
}

// 사이드바 토글
function toggleSidebar() {
    isSidebarOpen = !isSidebarOpen;
    const sidebar = document.getElementById('sidebar');
    const header = document.querySelector('header');
    if (isSidebarOpen) {
        sidebar.classList.add('open');
        header.classList.add('sidebar-open');
        renderFavorites();
    } else {
        sidebar.classList.remove('open');
        header.classList.remove('sidebar-open');
    }
}

// 주식 목록 렌더링
function loadStocks() {
    const stockList = document.getElementById('stock-list');
    stockList.innerHTML = '';

    let filteredStocks = stocks.filter(stock =>
        stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.ticker.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (currentSort === 'volume') {
        filteredStocks.sort((a, b) => b.volume - a.volume);
    } else {
        filteredStocks.sort((a, b) => b.price - a.price);
    }

    const totalPages = Math.ceil(filteredStocks.length / rowsPerPage);
    currentPage = Math.min(currentPage, totalPages || 1);

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedStocks = filteredStocks.slice(start, end);

    paginatedStocks.forEach(stock => {
        const row = document.createElement('tr');
        const isFavorited = favorites.includes(stock.ticker);
        row.innerHTML = `
            <td>${stock.name}</td>
            <td>${stock.price.toFixed(2)}</td>
            <td>${stock.volume.toLocaleString()}</td>
            <td>
                <svg class="favorite-icon ${isFavorited ? 'favorite' : ''} ${!isLoggedIn() ? 'disabled' : ''}" 
                     onclick="toggleFavorite('${stock.ticker}')"
                     viewBox="0 0 24 24">
                    <path d="M17 3H7a2 2 0 0 0-2 2v16l7-5 7 5V5a2 2 0 0 0-2-2z"/>
                </svg>
            </td>
        `;
        stockList.appendChild(row);
    });

    document.getElementById('page-info').textContent = `${currentPage} / ${totalPages || 1}`;
    document.getElementById('prev-btn').disabled = currentPage === 1;
    document.getElementById('next-btn').disabled = currentPage === totalPages;
}

// 검색
function searchStocks() {
    searchQuery = document.getElementById('search-bar').value;
    currentPage = 1;
    loadStocks();
}

// 정렬
function sortStocks() {
    currentSort = document.getElementById('sort-option').value;
    currentPage = 1;
    loadStocks();
}

// 페이지 이동
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        loadStocks();
    }
}

function nextPage() {
    const totalPages = Math.ceil(
        stocks.filter(stock =>
            stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            stock.ticker.toLowerCase().includes(searchQuery.toLowerCase())
        ).length / rowsPerPage
    );
    if (currentPage < totalPages) {
        currentPage++;
        loadStocks();
    }
}

// 새로고침
let startTime = Date.now();
function refreshPage() {
    startTime = Date.now();
    loadStocks();
}

// 경과 시간
setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    document.querySelector('.elapsed-time').textContent = `마지막 새로고침: ${elapsed}초`;
}, 1000);

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    loadStocks();
    document.getElementById('menu-toggle').addEventListener('click', toggleSidebar);
});