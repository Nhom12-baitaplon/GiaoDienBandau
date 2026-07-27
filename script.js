// =======================
// =======================
function handleLogin() {
    const user = document.getElementById("loginUser").value.trim();
    const pass = document.getElementById("loginPass").value.trim();
    const role = document.getElementById("loginRole").value;

    if (user !== appConfig.username || pass !== appConfig.password) {
        alert("❌ Tài khoản hoặc mật khẩu không chính xác!");
        return;
    }

    appConfig.currentStaff =
        role === "Admin" ? "Ký Linh" : "Nhân viên Thư ký";
    appConfig.currentRole = role;

    document.getElementById("sessionUser").innerText = appConfig.currentStaff;
    document.getElementById("sessionRole").innerText = appConfig.currentRole;
    document.getElementById("staffDetailName").innerText = appConfig.currentStaff;
    document.getElementById("staffDetailUser").innerText = user;
    document.getElementById("staffDetailRole").innerText =
        role === "Admin"
            ? "Hệ thống cấp cao (Admin)"
            : "Nhân viên Thư viện (Thủ thư)";

    document.getElementById("loginWrapper").style.opacity = "0";

    setTimeout(() => {
        document.getElementById("loginWrapper").style.display = "none";
        document.getElementById("mainApp").style.display = "block";
        initSystem();
    }, 300);
}

// =======================

// =======================
function handleLogout() {
    if (!confirm("Bạn có chắc chắn muốn đăng xuất?")) return;

    document.getElementById("loginPass").value = "";
    document.getElementById("mainApp").style.display = "none";
    document.getElementById("loginWrapper").style.display = "flex";
    document.getElementById("loginWrapper").style.opacity = "1";
}

// =======================

// =======================
function showPage(pageId) {
    document.querySelectorAll(".page").forEach(page =>
        page.classList.remove("active")
    );

    document.querySelectorAll("nav button").forEach(button =>
        button.classList.remove("nav-active")
    );

    document.getElementById(pageId).classList.add("active");
    document.getElementById(`nav-${pageId}`).classList.add("nav-active");

    switch (pageId) {
        case "home":
            updateDashboardStatistics();
            break;
        case "book":
            renderBookTable();
            break;
        case "reader":
            renderReaderTable();
            break;
        case "borrow":
            renderBorrowTable();
            break;
    }
}

// =======================

// =======================
function updateDashboardStatistics() {
    recalculateAllOverdueFines();

    document.getElementById("statTotalBooks").innerText = booksDatabase.length;
    document.getElementById("statTotalReaders").innerText = readersDatabase.length;

    const activeBorrows = borrowsDatabase.filter(item => item.status === "Đang mượn").length;
    const returnedBooks = borrowsDatabase.filter(item => item.status === "Đã trả").length;
    const lostBooks = booksDatabase.filter(book => book.isLost).length;

    document.getElementById("statTotalBorrows").innerText = activeBorrows;
    document.getElementById("statTotalReturns").innerText = returnedBooks;
    document.getElementById("statTotalLost").innerText = lostBooks;

    const neverBorrowed = readersDatabase.filter(reader =>
        !borrowsDatabase.some(borrow => borrow.readerId === reader.id)
    ).length;

    document.getElementById("statNeverBorrowed").innerText = neverBorrowed;

    const overdueTickets = borrowsDatabase.filter(
        item => item.status === "Đang mượn" && item.fine > 0
    ).length;

    document.getElementById("statOverdueTickets").innerText = overdueTickets;

    const totalFine = borrowsDatabase.reduce(
        (sum, item) => sum + item.fine,
        0
    );

    document.getElementById("statTotalFines").innerText =
        totalFine.toLocaleString("vi-VN") + " VNĐ";
}