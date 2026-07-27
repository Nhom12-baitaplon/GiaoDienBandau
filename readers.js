function renderReaderTable() {
    let tbody = document.getElementById("mainReaderTableBody");
    tbody.innerHTML = "";

    let keyword = document.getElementById("searchReaderInput").value.toLowerCase().trim();

    let readers = readersDatabase.filter(reader =>
        reader.id.toLowerCase().includes(keyword) ||
        reader.name.toLowerCase().includes(keyword) ||
        reader.phone.includes(keyword)
    );

    if (readers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;color:gray;">
                    Không tìm thấy độc giả.
                </td>
            </tr>
        `;
        return;
    }

    readers.forEach(reader => {
        let status = reader.hasCard
            ? `<span class="badge bg-success">Hoạt động</span>`
            : `<span class="badge bg-danger">Khóa thẻ</span>`;

        let row = document.createElement("tr");

        row.innerHTML = `
            <td><strong>${reader.id}</strong></td>
            <td>${reader.name}</td>
            <td>${reader.gender}</td>
            <td>${reader.phone}</td>
            <td>${status}</td>
            <td>
                <button class="actionBtn editBtn"
                    onclick="openEditReaderModal('${reader.id}')">
                    ✏️ Sửa
                </button>

                <button class="actionBtn deleteBtn"
                    onclick="deleteReaderData('${reader.id}')">
                    🗑️ Xóa
                </button>
            </td>
        `;

        tbody.appendChild(row);
    });
}

function openAddReaderModal() {

    document.getElementById("readerModalTitle").innerText = "Thêm độc giả";

    document.getElementById("modalReaderEditId").value = "";
    document.getElementById("modalReaderName").value = "";
    document.getElementById("modalReaderGender").value = "Nam";
    document.getElementById("modalReaderPhone").value = "";

    document.getElementById("readerModal").style.display = "flex";
}

function openEditReaderModal(id) {

    let reader = readersDatabase.find(r => r.id === id);

    if (!reader) return;

    document.getElementById("readerModalTitle").innerText = "Sửa thông tin độc giả";

    document.getElementById("modalReaderEditId").value = reader.id;
    document.getElementById("modalReaderName").value = reader.name;
    document.getElementById("modalReaderGender").value = reader.gender;
    document.getElementById("modalReaderPhone").value = reader.phone;

    document.getElementById("readerModal").style.display = "flex";
}

function closeReaderModal() {
    document.getElementById("readerModal").style.display = "none";
}

function saveReaderData() {

    let editId = document.getElementById("modalReaderEditId").value;

    let name = document.getElementById("modalReaderName").value.trim();
    let gender = document.getElementById("modalReaderGender").value;
    let phone = document.getElementById("modalReaderPhone").value.trim();

    if (name === "" || phone === "") {
        alert("Vui lòng nhập đầy đủ thông tin.");
        return;
    }

    if (editId) {

        let reader = readersDatabase.find(r => r.id === editId);

        if (reader) {
            reader.name = name;
            reader.gender = gender;
            reader.phone = phone;

            alert("Cập nhật độc giả thành công.");
        }

    } else {

        let number = readersDatabase.length + 1;
        let id = "DG" + String(number).padStart(3, "0");

        while (readersDatabase.some(r => r.id === id)) {
            number++;
            id = "DG" + String(number).padStart(3, "0");
        }

        readersDatabase.push({
            id: id,
            name: name,
            gender: gender,
            phone: phone,
            hasCard: true
        });

        alert("Thêm độc giả thành công.");
    }

    closeReaderModal();
    renderReaderTable();
    updateDashboardStatistics();

    if (typeof autoSynchronizeBorrows === "function") {
        autoSynchronizeBorrows();
    }
}

function deleteReaderData(id) {

    let reader = readersDatabase.find(r => r.id === id);

    if (!reader) return;

    let borrowing = borrowsDatabase.some(b =>
        b.readerId === id &&
        b.status === "Đang mượn"
    );

    if (borrowing) {
        alert("Không thể xóa vì độc giả đang mượn sách.");
        return;
    }

    if (confirm(`Bạn có chắc muốn xóa độc giả "${reader.name}"?`)) {

        readersDatabase = readersDatabase.filter(r => r.id !== id);

        borrowsDatabase = borrowsDatabase.filter(b => b.readerId !== id);

        renderReaderTable();
        updateDashboardStatistics();

        alert("Đã xóa thành công.");
    }
}