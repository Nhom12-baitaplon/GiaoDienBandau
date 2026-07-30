        let readersDatabase = []
            { id: "DG001", name: "Trương Hải Kỳ", gender: "Nữ", phone: "0585003562", hasCard: true },
            { id: "DG002", name: "Nguyễn Hoàng Lâm", gender: "Nữ", phone: "0912345678", hasCard: true },
            { id: "DG003", name: "Hoàng Văn Linh", gender: "Nữ", phone: "0934578213", hasCard: true },
            { id: "DG004", name: "Trương Hải Hà", gender: "Nam", phone: "0855234902", hasCard: true },
            { id: "DG005", name: "Trương Hải Lâu", gender: "Nam", phone: "0345769889", hasCard: true },
            { id: "DG006", name: "Ngô Tuyết Ninh", gender: "Nữ", phone: "0323406581", hasCard: true },
            { id: "DG007", name: "Thẩm Văn Lang", gender: "Nam", phone: "0988745326", hasCard: true },
            { id: "DG008", name: "Cao Đồ", gender: "Nam", phone: "0857342180", hasCard: true },
            { id: "DG009", name: "Thịnh Thiếu Du", gender: "Nam", phone: "0352185719", hasCard: true },
            { id: "DG010", name: "Hoa Vịnh", gender: "Nam", phone: "0758294691", hasCard: true },
            { id: "DG011", name: "Đường Hà Thanh", gender: "Nữ", phone: "0347197481", hasCard: true },
            { id: "DG012", name: "Chu Hải Yến", gender: "Nam", phone: "0384902668", hasCard: true }
        ];

        let borrowsDatabase = [];

        function parseDateString(str) {
            let parts = str.split("/");
            if(parts.length !== 3) return new Date();
            return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }

        function formatDateString(date) {
            let day = String(date.getDate()).padStart(2, '0');
            let month = String(date.getMonth() + 1).padStart(2, '0');
            let year = date.getFullYear();
            return `${day}/${month}/${year}`;
        }

        function calculateDaysDiff(date1, date2) {
            let timeDiff = date2.getTime() - date1.getTime();
            let daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            return daysDiff > 0 ? daysDiff : 0;
        }

        function autoSynchronizeBorrows() {
            let todayStr = formatDateString(new Date());
            
            readersDatabase.forEach((reader, index) => {
                // Kiểm tra xem độc giả này đã từng có phiếu mượn nào lưu trữ trong hệ thống chưa
                let hasTicket = borrowsDatabase.some(b => b.readerId === reader.id);
                
                // Nếu là dữ liệu khởi tạo nguyên bản, phân bổ ngẫu nhiên một số độc giả mượn sách để tạo dữ liệu mô phỏng thực tế
                if (!hasTicket && index < 6) {
                    let bookToBorrow = booksDatabase.find(b => !b.isBorrowed && !b.isLost);
                    if (bookToBorrow) {
                        let borrowDate = new Date();
                        // Tạo sự lệch ngày để tạo ra các phiếu mượn có trường hợp quá hạn chân thực
                        borrowDate.setDate(borrowDate.getDate() - (15 + index)); 
                        let dueDate = new Date(borrowDate);
                        dueDate.setDate(dueDate.getDate() + 14);

                        bookToBorrow.isBorrowed = true;
                        borrowsDatabase.push({
                            id: "PM" + String(borrowsDatabase.length + 1).padStart(3, '0'),
                            readerId: reader.id,
                            bookId: bookToBorrow.id,
                            borrowDateStr: formatDateString(borrowDate),
                            dueDateStr: formatDateString(dueDate),
                            status: "Đang mượn",
                            fine: 0
                        });
                    }
                }
            });
            
            // Tiến hành cập nhật tính toán lại toàn bộ tiền phạt quá hạn dựa trên mốc thời gian thực tại hệ thống
            recalculateAllOverdueFines();
        }

        function recalculateAllOverdueFines() {
            let today = new Date();
            borrowsDatabase.forEach(ticket => {
                if (ticket.status === "Đang mượn") {
                    let dueDate = parseDateString(ticket.dueDateStr);
                    if (today > dueDate) {
                        let overdueDays = calculateDaysDiff(dueDate, today);
                        ticket.fine = overdueDays * 5000; // Áp dụng định mức phạt phạt 5000đ/ngày
                    } else {
                        ticket.fine = 0;
                    }
                }
            });
        }