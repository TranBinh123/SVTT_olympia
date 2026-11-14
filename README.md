# Đường lên đỉnh Olympia – Event Game (The Bana Code)

Ứng dụng game show chạy hoàn toàn trên trình duyệt (React + Vite + Zustand), không cần server.
Gồm 4 vòng thi, màn hình quản trị (Admin) cho từng vòng và màn hình Xếp hạng chung cuộc.

> Nguyên tắc: mỗi vòng là một **module độc lập**. Dữ liệu dùng chung (đội, điểm) chỉ đi qua `src/core`.
> Ưu tiên **ổn định khi vận hành sự kiện** hơn hiệu ứng trang trí.

## 1. Chạy dự án

```bash
npm install
npm run dev      # tự sinh imageLibrary.ts (predev) rồi chạy Vite
npm run build    # sinh imageLibrary.ts + tsc -b + vite build
npm run preview
```

`scripts/generate-image-library.mjs` quét thư mục `public/` và sinh `src/modules/acceleration/data/imageLibrary.ts`
(danh sách ảnh cho Admin Vòng 3). File này là **auto-generated**, không sửa tay.

## 2. Tổng quan 4 vòng

| Vòng | Module | Tóm tắt luật |
|---|---|---|
| 1 – Khởi động | `warmup` | Mỗi đội 1 lượt 120 giây, bộ 10 câu; Đúng +10, Sai/Chuyển tiếp 0 |
| 2 – Vượt chướng ngại vật | `obstacle` | Ô chữ hàng ngang → hàng dọc; có phần khán giả |
| 3 – Tăng tốc | `acceleration` | Câu hỏi hình ảnh, giành quyền trả lời, có đồng hồ |
| 4 – Về đích | `finish` | 4 gói × 5 câu (10/10/20/20/30đ), Ngôi sao hy vọng, cướp điểm |

4 đội cố định: 🔧 Ban Kỹ thuật (xanh lá), 🧑‍🍳 Ban Ẩm thực (đỏ), ⚙️ Ban Vận hành (vàng), 🤝 Ban Do Giám đốc quản lý (xanh dương).

### Vòng 1 – Khởi động
1. MC chọn đội (chuột hoặc phím `1`–`4`). Đội đã thi bị khóa.
2. MC **chọn thủ công** một bộ câu hỏi còn trống (bộ đã dùng không hiện lại, bộ phải đủ 10 câu).
3. Timer 02:00 tự chạy. Phím tắt: `D` Đúng · `S` Sai · `C` Chuyển tiếp · `P` Tạm dừng/tiếp tục (không xử lý khi đang gõ trong input/textarea/select).
4. Đúng +10; Sai và Chuyển tiếp 0. Câu Đúng/Sai bị khóa. Hết 10 câu, các câu **Chuyển tiếp** được hỏi lại; hết giờ là kết thúc tuyệt đối.
5. Admin: tạo/sửa/xóa bộ câu hỏi (mỗi bộ đúng 10 câu, chỉ lưu nội dung câu hỏi, không lưu đáp án) và nút **Reset điểm test**.

### Vòng 2 – Vượt chướng ngại vật
- Admin thiết kế ô chữ bằng kéo thả: câu hỏi, đáp án, vị trí giao với hàng dọc, thời gian/câu, điểm hàng ngang, điểm hàng dọc.
- Có thể tạo **nhiều bộ ô chữ**; bấm **"DÙNG BỘ NÀY CHO VÒNG 2"** để chọn bộ đang dùng (đánh dấu ★ ĐANG DÙNG). Màn hình chơi chỉ chạy bộ đang dùng.
  Đổi bộ khi đang có ván dở sẽ hỏi xác nhận, xóa ván và đặt điểm Vòng 2 về 0.
- Admin cảnh báo khi số chữ đáp án dọc ≠ số hàng ngang.
- Phần đội thi: MC mở từng hàng ngang, tích đội trả lời đúng; mỗi đội đúng nhận điểm hàng ngang. Có thể chuyển sang **phần khán giả** (không cộng điểm đội).
- Hàng dọc: chọn đội trả lời; đúng thì nhận điểm hàng dọc (chỉ cộng một lần/ván).
- **VÁN MỚI** đặt lại bảng và điểm Vòng 2 về 0 (có xác nhận).

### Vòng 3 – Tăng tốc
- Admin thêm câu hỏi hình ảnh (chọn từ thư viện `public/` hoặc URL) + đáp án, đặt thời gian/câu và điểm/câu.
- MC bấm hiện ảnh, timer chạy; MC chọn đội giành quyền → chấm Đúng (+điểm, hiện đáp án) hoặc Sai (đội đó bị loại khỏi câu).
- Hết giờ hoặc cả 4 đội sai → chuyển sang khán giả (không cộng điểm). "Làm lại Vòng 3" đặt điểm Vòng 3 về 0 (có xác nhận).

### Vòng 4 – Về đích
- 4 gói câu hỏi, mỗi gói 5 câu (2 câu 10đ, 2 câu 20đ, 1 câu 30đ có video YouTube). Mỗi đội chọn 1 gói, mỗi gói chỉ một đội; câu hỏi trong gói được xáo trộn khi chọn.
- Mỗi câu: giới thiệu → (nếu gói chưa dùng) quyết định dùng **Ngôi sao hy vọng** → trả lời trong 30 giây.
- Không dùng sao: Đúng +điểm, Sai 0. Dùng sao (mỗi gói một lần): Đúng **×2**, Sai **−điểm câu**.
- Khi đội chủ sai hoặc hết giờ, các đội còn lại được **cướp**: đội cướp đúng +điểm câu. Đội cướp sai: nếu câu đang dùng sao thì bị −điểm câu (luật đã xác nhận). Đội chủ không bị trừ thêm khi bị cướp.
- Hết 4 đội: màn hình tổng kết. "Chơi lại Vòng 4" đặt điểm Vòng 4 về 0, **giữ nguyên nội dung câu hỏi** (có xác nhận).

### Xếp hạng chung cuộc
- Tab 🏆 XẾP HẠNG: điểm "Khám phá" và "Lên cáp" nhập tay (lưu `olympia-ranking-scores`), "Chạm đỉnh" = tổng điểm trong app (`totalScore`).
  Chỉ nhập tay những điểm **chưa được chấm trong app** để không bị tính trùng.
- Ở chế độ chơi tab này **chỉ xem**; chỉnh sửa điểm nằm ở chế độ Quản trị.

## 3. Kiến trúc

```text
src/
├── core/                    # lớp dùng chung duy nhất
│   ├── store/gameStore.ts   # đội, totalScore, phaseScores (persist)
│   ├── scoring/scoring.ts   # addScore / resetPhaseScores
│   ├── hooks/usePersistentState.ts  # useState có lưu localStorage
│   └── types/game.ts
├── modules/{warmup,obstacle,acceleration,finish}/   # mỗi vòng: pages, store, types, data
├── admin/{warmup,obstacle,acceleration,finish,ranking}/
├── components/Scoreboard.tsx
├── App.tsx  main.tsx  styles.css
```

Quy tắc cho người/AI phát triển tiếp:
1. Đọc README trước khi sửa. Không đổi luật đã chốt khi chưa có yêu cầu.
2. Không cộng điểm trực tiếp vào `totalScore`; luôn dùng `addScore` / `resetPhaseScores` của CORE.
3. Module mới tạo thư mục riêng; không sửa logic vòng cũ để phục vụ vòng mới.
4. Không lưu đáp án/gợi ý vào model câu hỏi Vòng 1.
5. Style của các vòng nằm trong `src/styles.css` (các file `.css` riêng trong module chỉ là dự phòng, không được import).
6. Sau mỗi thay đổi lớn chạy `npm run build`.

## 4. Lưu trữ dữ liệu (localStorage)

| Key | Nội dung |
|---|---|
| `olympia-core-game` | đội, điểm tổng và điểm theo vòng |
| `olympia-warmup-config` | các bộ câu hỏi Vòng 1 |
| `olympia-obstacle-config` | các bộ ô chữ Vòng 2 + bộ đang dùng |
| `olympia-acceleration-config` | câu hỏi Vòng 3 |
| `olympia-finish-game` | gói câu hỏi + toàn bộ trạng thái Vòng 4 |
| `olympia-ranking-scores` | điểm nhập tay ở Xếp hạng |
| `olympia-session:*` | **tiến trình ván đang chơi** của Vòng 1–3 (đội đã thi, ô đã giải, câu hiện tại, timer…) |

- F5 giữa ván **không mất trạng thái**. Vòng 1 sau F5 tự tạm dừng để MC bấm tiếp tục; Vòng 2/3 timer tiếp tục chạy.
- Dữ liệu chỉ nằm trên **trình duyệt/máy đang dùng**; muốn đổi máy cần nhập lại cấu hình. Không xóa dữ liệu trình duyệt trong sự kiện.
- **Reset điểm test** (Admin Khởi động): đặt toàn bộ điểm về 0, làm lại Vòng 4 và xóa mọi tiến trình `olympia-session:*`; cấu hình câu hỏi được giữ.

## 5. Mật khẩu Quản trị
- Mọi màn hình **Quản trị** (kể cả chỉnh điểm Xếp hạng) yêu cầu mật khẩu; mở khóa được nhớ trong phiên của tab (`sessionStorage`).
- Đặt mật khẩu bằng biến môi trường `VITE_ADMIN_PASSWORD` (local: file `.env`, xem `.env.example`; Vercel: Settings → Environment Variables, rồi **redeploy**).
- Nếu không đặt, mật khẩu mặc định là `banacode` — **phải đổi trước khi deploy**.
- Đây là khóa phía trình duyệt, chỉ chặn người dùng thông thường. Mật khẩu và dữ liệu câu hỏi/đáp án vẫn nằm trong mã gửi tới trình duyệt, nên người rành kỹ thuật vẫn có thể đọc được. Giữ kín đường link nếu đáp án quan trọng.

## 6. Checklist trước sự kiện
- [ ] Đã đặt `VITE_ADMIN_PASSWORD` trên Vercel và thử đăng nhập Quản trị.
- [ ] `npm run build` không lỗi; thử bản build bằng `npm run preview`.
- [ ] Nhập đủ nội dung: ≥4 bộ Vòng 1 (mỗi bộ 10 câu), ô chữ + chọn bộ đang dùng ở Vòng 2, câu hỏi Vòng 3, 4 gói × 5 câu ở Vòng 4.
- [ ] Chạy thử trọn một lượt từng vòng, F5 giữa chừng để kiểm tra khôi phục.
- [ ] Bấm **Reset điểm test** trước giờ chính thức, rồi kiểm tra bảng điểm = 0.
- [ ] Dùng một máy/trình duyệt duy nhất cho MC; tắt chế độ ẩn danh.

## 7. Hạn chế đã biết
- Không có server: không đồng bộ giữa nhiều máy/màn hình.
- Timer chạy phía client (`setInterval`); tab bị nền lâu có thể trễ vài giây.
- Ảnh trong `public/` khá nặng (~25 MB); nên nén trước khi triển khai.
