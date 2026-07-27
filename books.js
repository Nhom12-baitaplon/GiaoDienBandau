function renderBookTable() {
    const tbody = document.getElementById("mainBookTableBody");
    tbody.innerHTML = "";

    const filterCat = document.getElementById("filterBookCategory").value;
    const search = document.getElementById("searchBookInput").value.toLowerCase().trim();

    const categories = [
        "Sách Văn Học",
        "Truyện Tranh",
        "Sách Lịch Sử",
        "Tiểu Thuyết Ngôn Tình",
        "Kỹ Năng Giao Tiếp / Triết Học",
        "Tùy Bút Việt Nam",
        "Sách Kiếm Hiệp cổ điển",
        "Sách Trinh Thám",
        "Tiểu Thuyết Đam mỹ",
        "Truyện manga",
        "Tiểu Thuyết Kháng Chiến / Cách Mạng",
        "Truyện Thơ Cổ Phong Việt Nam",
        "Văn Học Cổ Điển + Triết Lý / Chiến Tranh"
    ];

    const classMap = {
        "Sách Văn Học":"vanhoc",
        "Truyện Tranh":"truyentranh",
        "Sách Lịch Sử":"lichsu",
        "Tiểu Thuyết Ngôn Tình":"tieuthuyet",
        "Kỹ Năng Giao Tiếp / Triết Học":"kynang",
        "Tùy Bút Việt Nam":"tuybut",
        "Sách Kiếm Hiệp cổ điển":"coaphong",
        "Sách Trinh Thám":"trinhtham",
        "Tiểu Thuyết Đam mỹ":"dammy",
        "Truyện manga":"manga",
        "Tiểu Thuyết Kháng Chiến / Cách Mạng":"cachmang",
        "Truyện Thơ Cổ Phong Việt Nam":"coaphong",
        "Văn Học Cổ Điển + Triết Lý / Chiến Tranh":"vanhoc"
    };

    function getStatus(book){
        if(book.isLost)
            return `<span class="badge bg-danger">Bị mất / Hư hỏng</span>`;

        if(book.isBorrowed)
            return `<span class="badge bg-warning">Đang cho mượn</span>`;

        return `<span class="badge bg-success">Sẵn sàng mượn</span>`;
    }

    function addBookRow(book){
        tbody.innerHTML += `
        <tr>
            <td><strong>${book.id}</strong></td>
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.category}</td>
            <td>${getStatus(book)}</td>
            <td>
                <button class="actionBtn editBtn"
                    onclick="openEditBookModal('${book.id}')">✏️ Sửa</button>

                <button class="actionBtn deleteBtn"
                    onclick="deleteBookData('${book.id}')">🗑️ Xóa</button>
            </td>
        </tr>`;
    }

    categories.forEach(category=>{

        if(filterCat!="All" && filterCat!=category) return;

        const list=booksDatabase.filter(book=>{

            return book.category==category &&
            (
                book.title.toLowerCase().includes(search) ||
                book.author.toLowerCase().includes(search) ||
                book.id.toLowerCase().includes(search)
            );

        });

        if(list.length==0) return;

        tbody.innerHTML+=`
        <tr class="categoryRow ${classMap[category]||'vanhoc'}">
            <td colspan="6">
                📚 THỂ LOẠI: ${category.toUpperCase()} (${list.length} cuốn)
            </td>
        </tr>`;

        list.forEach(addBookRow);
    });

}
function openAddBookModal(){

    document.getElementById("bookModalTitle").innerText="Thêm sách";

    document.getElementById("modalBookEditId").value="";
    document.getElementById("modalBookName").value="";
    document.getElementById("modalBookAuthor").value="";
    document.getElementById("modalBookCategory").selectedIndex=0;

    document.getElementById("bookModal").style.display="flex";

}
function openEditBookModal(id){

    const book=booksDatabase.find(item=>item.id===id);

    if(!book) return;

    document.getElementById("bookModalTitle").innerText="Chỉnh sửa sách";

    document.getElementById("modalBookEditId").value=book.id;
    document.getElementById("modalBookName").value=book.title;
    document.getElementById("modalBookAuthor").value=book.author;
    document.getElementById("modalBookCategory").value=book.category;

    document.getElementById("bookModal").style.display="flex";

}
function closeBookModal(){

    document.getElementById("bookModal").style.display="none";

}
function saveBookData(){

    const id=document.getElementById("modalBookEditId").value;
    const title=document.getElementById("modalBookName").value.trim();
    const author=document.getElementById("modalBookAuthor").value.trim();
    const category=document.getElementById("modalBookCategory").value;

    if(title=="" || author==""){
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    if(id){

        const book=booksDatabase.find(item=>item.id===id);

        if(book){
            book.title=title;
            book.author=author;
            book.category=category;
            alert("Cập nhật thành công!");
        }

    }else{

        let number=1;

        while(booksDatabase.some(book=>book.id==="S"+String(number).padStart(3,"0"))){
            number++;
        }

        booksDatabase.push({

            id:"S"+String(number).padStart(3,"0"),
            title,
            author,
            category,
            isBorrowed:false,
            isLost:false

        });

        alert("Đã thêm sách mới!");

    }

    closeBookModal();
    renderBookTable();
    updateDashboardStatistics();

}
function deleteBookData(id){

    const book=booksDatabase.find(item=>item.id===id);

    if(!book) return;

    if(book.isBorrowed){
        alert("Không thể xóa vì sách đang được mượn.");
        return;
    }

    if(confirm(`Bạn có muốn xóa "${book.title}" không?`)){

        booksDatabase=booksDatabase.filter(item=>item.id!==id);

        borrowsDatabase=borrowsDatabase.filter(item=>item.bookId!==id);

        renderBookTable();
        updateDashboardStatistics();

        alert("Đã xóa thành công.");

    }

}