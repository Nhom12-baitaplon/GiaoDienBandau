  window.onerror = function(message, source, lineno, colno, error) {
        console.error("Hệ thống phát hiện lỗi vận hành: " + message + " tại dòng: " + lineno);
        return true;
    };

    document.getElementById("loginPass").addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            handleLogin();
        }
    });

    function resetToFactorySettings() {
        if(confirm("CẢNH BÁO PHỤC HỒI: Bạn có chắc chắn muốn xóa toàn bộ dữ liệu hiện tại để khôi phục cấu hình gốc ban đầu?")) {
            location.reload();
        }
    }

    function validatePhoneNumber(phone) {
        let regex = /^(0)[3|5|7|8|9]+([0-9]{8})$/;
        return regex.test(phone);
    }

    setInterval(() => {
        if(document.getElementById("mainApp").style.display === "block") {
            recalculateAllOverdueFines();
            updateDashboardStatistics();
            console.log("🔄 Cơ chế nền: Đã tự động cập nhật và đồng bộ hóa lại các mốc thời gian phiếu phạt.");
        }
    }, 30000);

    console.log("🚀 Góc nhỏ tri thức Engine — Toàn bộ 100 phân đoạn kiến trúc Core của phần mềm Thư viện đã nạp và sẵn sàng thực thi!");z