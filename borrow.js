// ======================

// ======================
function renderBorrowTable() {
    let tbody = document.getElementById("mainBorrowTableBody");
    tbody.innerHTML = "";

    recalculateAllOverdueFines();

    let filterStatus = document.getElementById("filterBorrowStatus").value;

    if (borrowsDatabase.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align:center;color:gray;">
                    Chưa có phiếu mượn nào.
                </td>
            </tr>
        `;
        return;
    }

    borrowsDatabase.forEach(ticket => {

        let reader = readersDatabase.find(r => r.id === ticket.readerId);
        let book = booksDatabase.find(b => b.id === ticket.bookId);

        let readerName = reader ? reader.name : "Độc giả không tồn tại";
        let bookName = book ? book.title : "Sách không tồn tại";

        let displayStatus = ticket.status;

        if (ticket.status === "Đang mượn" && ticket.fine > 0) {
            displayStatus = "Quá hạn";
        }

        if (filterStatus !== "All" && filterStatus !== displayStatus) {
            return;
        }

        let statusBadge = "";

        switch (displayStatus) {

            case "Đang mượn":
                statusBadge = `<span class="badge bg-warning">Đang mượn</span>`;
                break;

            case "Đã trả":
                statusBadge = `<span class="badge bg-success">Đã trả</span>`;
                break;

            case "Quá hạn":
                statusBadge = `<span class="badge bg-danger">Quá hạn</span>`;
                break;

            case "Mất sách":
                statusBadge = `<span class="badge bg-dark">Mất sách</span>`;
                break;
        }

        let action = "";

        if (ticket.status === "Đang mượn") {

            action = `
                <button class="actionBtn returnBtn"
                    onclick="processReturnBook('${ticket.id}')">
                    ↩️ Trả
                </button>

                <button class="actionBtn deleteBtn"
                    style="background:#e67e22"
                    onclick="processLostBook('${ticket.id}')">
                    ❗ Báo mất
                </button>
            `;

        } else {

            action = `
                <button class="actionBtn deleteBtn"
                    onclick="deleteBorrowTicket('${ticket.id}')">
                    🗑️ Xóa
                </button>
            `;
        }

        let row = document.createElement("tr");

        row.innerHTML = `
            <td><strong>${ticket.id}</strong></td>
            <td>${readerName}</td>
            <td>${bookName}</td>
            <td>${ticket.borrowDateStr}</td>
            <td>${ticket.dueDateStr}</td>
            <td>${statusBadge}</td>
            <td>${ticket.fine.toLocaleString("vi-VN")} đ</td>
            <td>${action}</td>
        `;

        tbody.appendChild(row);
    });
}

// ======================

// ======================
function openAddBorrowModal() {

    let readerSelect = document.getElementById("modalBorrowReaderId");
    let bookSelect = document.getElementById("modalBorrowBookId");

    readerSelect.innerHTML = "";
    bookSelect.innerHTML = "";

    readersDatabase.forEach(reader => {

        let option = document.createElement("option");

        option.value = reader.id;
        option.text = `${reader.name} (${reader.id})`;

        readerSelect.appendChild(option);
    });

    let books = booksDatabase.filter(book =>
        !book.isBorrowed &&
        !book.isLost
    );

    books.forEach(book => {

        let option = document.createElement("option");

        option.value = book.id;
        option.text = `${book.title} (${book.id})`;

        bookSelect.appendChild(option);
    });

    if (books.length === 0) {

        let option = document.createElement("option");

        option.text = "Không còn sách để mượn";

        bookSelect.appendChild(option);
    }

    document.getElementById("modalBorrowDate").value =
        formatDateString(new Date());

    document.getElementById("borrowModal").style.display = "flex";
}

// ======================

// ======================
function closeBorrowModal() {
    document.getElementById("borrowModal").style.display = "none";
}
// ======================

// ======================
function saveBorrowData() {

    let readerId = document.getElementById("modalBorrowReaderId").value;
    let bookId = document.getElementById("modalBorrowBookId").value;
    let borrowDateStr = document.getElementById("modalBorrowDate").value;

    if (!bookId || bookId === "Không còn sách để mượn") {
        alert("❌ Không có sách để mượn.");
        return;
    }

    let book = booksDatabase.find(b => b.id === bookId);

    if (!book) return;

    let borrowDate = parseDateString(borrowDateStr);
    let dueDate = new Date(borrowDate);
    dueDate.setDate(dueDate.getDate() + 14);

    let number = borrowsDatabase.length + 1;
    let borrowId = "PM" + String(number).padStart(3, "0");

    while (borrowsDatabase.some(b => b.id === borrowId)) {
        number++;
        borrowId = "PM" + String(number).padStart(3, "0");
    }

    book.isBorrowed = true;

    borrowsDatabase.push({
        id: borrowId,
        readerId: readerId,
        bookId: bookId,
        borrowDateStr: borrowDateStr,
        dueDateStr: formatDateString(dueDate),
        status: "Đang mượn",
        fine: 0
    });

    alert("✅ Lập phiếu mượn thành công!");

    closeBorrowModal();
    renderBorrowTable();
    updateDashboardStatistics();
}

// ======================

// ======================
function processReturnBook(ticketId) {

    let ticket = borrowsDatabase.find(t => t.id === ticketId);

    if (!ticket) return;

    let book = booksDatabase.find(b => b.id === ticket.bookId);

    recalculateAllOverdueFines();

    let message = "Bạn có chắc muốn xác nhận trả sách?";

    if (ticket.fine > 0) {
        message =
            `Phiếu này đang quá hạn.\n` +
            `Tiền phạt: ${ticket.fine.toLocaleString("vi-VN")} VNĐ.\n` +
            `Xác nhận đã thu tiền và trả sách?`;
    }

    if (confirm(message)) {

        if (book) {
            book.isBorrowed = false;
        }

        ticket.status = "Đã trả";

        alert("✅ Trả sách thành công.");

        renderBorrowTable();
        updateDashboardStatistics();
    }
}

// ======================

// ======================
function processLostBook(ticketId) {

    let ticket = borrowsDatabase.find(t => t.id === ticketId);

    if (!ticket) return;

    let book = booksDatabase.find(b => b.id === ticket.bookId);

    let fine = 200000;

    if (confirm(`Xác nhận báo mất sách?\nTiền bồi thường: ${fine.toLocaleString("vi-VN")} VNĐ`)) {

        if (book) {
            book.isBorrowed = false;
            book.isLost = true;
        }

        ticket.status = "Mất sách";
        ticket.fine = fine;

        alert("✅ Đã cập nhật tình trạng mất sách.");

        renderBorrowTable();
        updateDashboardStatistics();
    }
}

// ======================

// ======================
function deleteBorrowTicket(ticketId) {

    if (!confirm("Bạn có chắc muốn xóa phiếu mượn này?")) {
        return;
    }

    borrowsDatabase = borrowsDatabase.filter(
        ticket => ticket.id !== ticketId
    );

    alert("✅ Đã xóa phiếu mượn.");

    renderBorrowTable();
    updateDashboardStatistics();
}
// ======================

// ======================
function handleChangePassword() {

    let oldPassword = document.getElementById("oldPasswordInput").value.trim();
    let newPassword = document.getElementById("newPasswordInput").value.trim();

    if (oldPassword === "" || newPassword === "") {
        alert("❌ Vui lòng nhập đầy đủ mật khẩu cũ và mật khẩu mới.");
        return;
    }

    if (oldPassword !== appConfig.password) {
        alert("❌ Mật khẩu cũ không đúng.");
        return;
    }

    if (newPassword.length < 4) {
        alert("❌ Mật khẩu mới phải có ít nhất 4 ký tự.");
        return;
    }

    appConfig.password = newPassword;

    document.getElementById("oldPasswordInput").value = "";
    document.getElementById("newPasswordInput").value = "";

    alert("✅ Đổi mật khẩu thành công!");
}

// ======================

// ======================
function initSystem() {

    document.getElementById("libNameHeading").innerText =
        "📚 THƯ VIỆN: " + appConfig.libName.toUpperCase();

    document.getElementById("libFooterName").innerText =
        appConfig.libName;

    // Đồng bộ dữ liệu mượn trả
    autoSynchronizeBorrows();

    // Cập nhật giao diện
    updateDashboardStatistics();
    renderBookTable();
    renderReaderTable();
    renderBorrowTable();
}