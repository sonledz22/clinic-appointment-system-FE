---
name: clinic-appointment-system-FE
colors:
  primary: '#0EA5E9'
  primary-hover: '#0284C7'
  primary-light: '#E0F2FE'
  secondary: '#0369A1'
  background: '#F8FAFC'
  surface: '#FFFFFF'
  border: '#E2E8F0'
  text-primary: '#0F172A'
  text-secondary: '#64748B'
  success: '#22C55E'
  warning: '#F59E0B'
  danger: '#EF4444'
  info: '#0EA5E9'
typography:
  fontFamily: 'Be Vietnam Pro, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  body:
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: '0'
  label:
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: '0'
  button:
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: '0'
  heading:
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: '0'
rounded:
  small: 8px
  medium: 12px
  large: 16px
spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
ui:
  framework: Vite + React + TypeScript
  componentLibrary: PrimeReact
  iconSet: PrimeIcons
  primeTheme: lara-light-blue
  optionalUtilities: PrimeFlex, custom CSS tokens
---

# Design System: clinic-appointment-system-FE

Tài liệu này là nguồn tham chiếu chính thức cho UI của project `clinic-appointment-system-FE`. Project là hệ thống đặt lịch khám/phòng khám dùng Vite, React và TypeScript. Các thay đổi UI trong tương lai phải bám theo tài liệu này trước khi thêm style hoặc component mới.

## 1. Tổng quan phong cách UI

Giao diện cần chuyên nghiệp, sạch, hiện đại và phù hợp bối cảnh y tế. Người dùng chính gồm bệnh nhân, bác sĩ và quản trị viên, vì vậy UI phải ưu tiên khả năng đọc, thao tác nhanh, luồng rõ ràng và hạn chế màu gây nhiễu.

Phong cách thị giác nên dựa trên nền sáng, bề mặt trắng, viền mảnh, khoảng cách thoáng vừa đủ và màu xanh da trời làm điểm nhấn chính. Mỗi màn hình cần thể hiện rõ hành động quan trọng nhất: đặt lịch, quản lý lịch khám, xem danh sách bệnh nhân, duyệt dữ liệu hoặc xử lý trạng thái hệ thống.

Thiết kế phải thân thiện cho desktop và responsive. Desktop ưu tiên layout dashboard/table rõ ràng. Mobile ưu tiên form, danh sách dạng card, nút dễ bấm và thông tin không bị nén quá nhỏ.

## 2. Tech stack UI

- **Framework:** Vite + React + TypeScript.
- **Component library chính:** PrimeReact.
- **Icon set chính:** PrimeIcons.
- **Theme PrimeReact đề xuất:** `lara-light-blue`.
- **Layout utility:** Có thể dùng PrimeFlex vì project đã cài `primeflex`.
- **Custom CSS:** Chỉ dùng cho design token, layout wrapper, responsive rule, hoặc tinh chỉnh nhỏ chưa có trong PrimeReact.
- **Không ưu tiên thêm UI library khác:** Không trộn thêm Material UI, Ant Design, Chakra, shadcn/ui hoặc icon library khác nếu PrimeReact/PrimeIcons đáp ứng được.

PrimeReact là lớp component mặc định cho button, input, dropdown, calendar, dialog, toast, data table, card, tag, toolbar, menu và sidebar. Custom HTML/CSS chỉ nên dùng khi component PrimeReact không phù hợp hoặc để tạo layout riêng của app.

## 3. Màu sắc

### 3.1 Design tokens chính

- **Primary Sky Blue (`#0EA5E9`)**: Màu thương hiệu chính. Dùng cho button chính, link quan trọng, icon chính, active menu, form focus, trạng thái info và điểm nhấn của dashboard.
- **Primary Hover / Dark (`#0284C7`)**: Dùng cho hover/active của primary button, selected navigation, header/sidebar đậm hơn hoặc trạng thái đang chọn.
- **Primary Light / Background (`#E0F2FE`)**: Dùng cho nền badge info, row selected nhẹ, card highlight, empty state nhẹ và focus ring mềm.
- **Secondary Deep Blue (`#0369A1`)**: Dùng cho header/sidebar cần độ đậm hơn primary, tiêu đề khu vực quan trọng hoặc điểm nhấn phụ.
- **Background (`#F8FAFC`)**: Nền toàn trang. Giúp giao diện sạch, nhẹ, ít mỏi mắt khi xem dashboard/table lâu.
- **Surface/Card (`#FFFFFF`)**: Nền card, form, table, dialog, panel và header nổi.
- **Border (`#E2E8F0`)**: Viền card, input, table row, divider và toolbar.
- **Text chính (`#0F172A`)**: Heading, label quan trọng, nội dung chính, dữ liệu bảng.
- **Text phụ (`#64748B`)**: Mô tả, placeholder, helper text, metadata, timestamp, secondary navigation.
- **Success (`#22C55E`)**: Lịch hẹn thành công, trạng thái hoàn tất, hệ thống hoạt động.
- **Warning (`#F59E0B`)**: Chờ xử lý, cảnh báo lịch, pending queue, trạng thái cần chú ý.
- **Danger/Error (`#EF4444`)**: Lỗi form, thao tác xóa, hủy lịch, logout, trạng thái thất bại hoặc nguy hiểm.

### 3.2 Cách dùng màu theo UI

- **Button chính:** nền `#0EA5E9`, hover `#0284C7`, text trắng. Không dùng gradient cho button mặc định.
- **Button phụ:** nền trắng, viền `#E2E8F0`, text `#0F172A`, hover nền `#F8FAFC`.
- **Button nguy hiểm:** dùng `#EF4444` cho delete/cancel destructive. Nếu chỉ là logout, có thể dùng outlined danger để giảm độ căng thị giác.
- **Header/Sidebar:** nền trắng hoặc `#0369A1` tùy vai trò màn hình. Nếu nền đậm, text phải trắng và active item dùng nền `#0EA5E9` hoặc `#E0F2FE` có contrast rõ.
- **Card:** nền `#FFFFFF`, viền `#E2E8F0`, shadow rất nhẹ. Không dùng nhiều màu nền trong card nếu không phải status.
- **Table:** header nền `#F8FAFC`, border `#E2E8F0`, row hover dùng `#E0F2FE` ở opacity nhẹ hoặc token tương đương.
- **Status badge:** dùng PrimeReact `Tag`; success dùng `#22C55E`, warning dùng `#F59E0B`, danger dùng `#EF4444`, info dùng `#0EA5E9`.
- **Form focus:** input focus border/ring dùng `#0EA5E9`. Không dùng đỏ/trạng thái lỗi nếu field chưa validate lỗi.
- **Error message:** text `#EF4444`, icon `pi pi-exclamation-circle` nếu cần, đặt ngay dưới field liên quan.

### 3.3 Nguyên tắc phối màu

Mỗi màn hình chỉ nên có một màu chủ đạo là xanh da trời, cộng thêm màu trạng thái khi thật sự cần. Không dùng nhiều gradient, không dùng palette quá sặc sỡ, không dùng màu đỏ cho thông tin thường vì đỏ phải giữ ý nghĩa cảnh báo/nguy hiểm.

## 4. Typography

### 4.1 Font chính

Font chính đề xuất là **Be Vietnam Pro**.

Fallback:

```css
Be Vietnam Pro, Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

Lý do: Be Vietnam Pro hỗ trợ tiếng Việt tốt, chữ rõ ở kích thước nhỏ, phù hợp form, table, dashboard và các màn hình có nhiều dữ liệu y tế. Inter và system font được dùng làm fallback để đảm bảo render ổn định nếu font chính chưa tải.

### 4.2 Font weight

- **400:** text thường, mô tả, paragraph, nội dung bảng.
- **500:** label, navigation, metadata quan trọng.
- **600:** button, subtitle, table header, status label.
- **700:** heading, page title, section title, card title quan trọng.

### 4.3 Kích thước chữ khuyến nghị

- **Page title:** 24-28px, weight 700.
- **Section title:** 18-20px, weight 700.
- **Card title:** 16-18px, weight 600-700.
- **Body text:** 14-16px, weight 400.
- **Table text:** 14px, weight 400-500.
- **Helper text:** 13px, weight 400.
- **Badge/Tag text:** 12-13px, weight 600.

Không dùng text quá nhỏ dưới 12px cho nội dung chính. Với tiếng Việt, giữ `letter-spacing: 0` để dễ đọc.

## 5. PrimeReact component guideline

### 5.1 Button

**Khi dùng:** Submit form, tạo mới, lưu, tìm kiếm, lọc, hủy, xóa, mở dialog, thao tác trong table.

**Style thống nhất:**

- Dùng `Button` của PrimeReact.
- Primary action dùng `severity` mặc định hoặc custom token primary `#0EA5E9`.
- Secondary action dùng `outlined` hoặc `text`.
- Delete/cancel destructive dùng `severity="danger"`.
- Success action dùng `severity="success"`.
- Border radius: 8px cho button nhỏ, 12px cho button chính.
- Padding: tối thiểu 8px 12px; CTA chính nên 10px 16px hoặc lớn hơn.
- Icon đặt trước label, ví dụ `icon="pi pi-plus"` với label "Thêm".

**Icon nên dùng:** `pi pi-plus`, `pi pi-save`, `pi pi-search`, `pi pi-pencil`, `pi pi-trash`, `pi pi-times`, `pi pi-sign-out`.

### 5.2 InputText

**Khi dùng:** Text field thường như họ tên, email, số điện thoại, địa chỉ, chuyên khoa, tìm kiếm.

**Style thống nhất:**

- Dùng `InputText` của PrimeReact.
- Luôn có label rõ ràng.
- Border radius: 8px.
- Border mặc định `#E2E8F0`.
- Focus border/ring dùng primary `#0EA5E9`.
- Placeholder dùng text phụ `#64748B`.
- Search input nên dùng icon `pi pi-search` trong `IconField`/`InputIcon` hoặc layout tương đương.

### 5.3 Password

**Khi dùng:** Login, register, đổi mật khẩu.

**Style thống nhất:**

- Dùng `Password` của PrimeReact.
- Bật toggle mask khi phù hợp.
- Với form login/register, không dùng quá nhiều màu; chỉ dùng primary cho CTA và danger cho lỗi.
- Border radius: 8px.
- Error message đặt ngay dưới field.

**Icon nên dùng:** `pi pi-lock`.

### 5.4 Dropdown

**Khi dùng:** Chọn role, chuyên khoa, bác sĩ, trạng thái, phòng khám, khung giờ hoặc filter table.

**Style thống nhất:**

- Dùng `Dropdown` của PrimeReact.
- Có placeholder rõ ràng, ví dụ "Chọn bác sĩ".
- Border radius: 8px.
- Panel dropdown không quá cao; dùng search/filter nếu danh sách dài.
- Option label phải ngắn gọn, tránh nhồi quá nhiều metadata.

### 5.5 Calendar

**Khi dùng:** Chọn ngày khám, ngày sinh, range lọc lịch hẹn, lịch làm việc.

**Style thống nhất:**

- Dùng `Calendar` của PrimeReact.
- Format ngày nên nhất quán theo ngữ cảnh Việt Nam.
- Icon calendar bật khi cần giúp nhận diện nhanh.
- Border radius: 8px.
- Focus dùng primary.

**Icon nên dùng:** `pi pi-calendar`, `pi pi-calendar-clock`.

### 5.6 Dialog

**Khi dùng:** Tạo/sửa lịch hẹn, xác nhận xóa, xem chi tiết bệnh nhân, cập nhật thông tin bác sĩ, thông báo thao tác quan trọng.

**Style thống nhất:**

- Dùng `Dialog` của PrimeReact.
- Header rõ mục đích: "Tạo lịch hẹn", "Xác nhận xóa".
- Footer có action rõ: nút phụ bên trái hoặc trước, nút chính bên phải hoặc sau.
- Dialog form nên có max-width hợp lý: 480-720px tùy nội dung.
- Border radius: 16px.
- Không đưa quá nhiều nội dung vào một dialog; tách step nếu form dài.

### 5.7 Toast

**Khi dùng:** Phản hồi thao tác sau submit, lưu, xóa, đặt lịch, login/logout, lỗi API.

**Style thống nhất:**

- Dùng `Toast` của PrimeReact.
- Success: thao tác hoàn tất.
- Info: thông tin trung tính.
- Warn: cảnh báo cần chú ý.
- Error: lỗi API, lỗi validation tổng quát.
- Nội dung toast ngắn, cụ thể, không thay thế error message ngay dưới field.

### 5.8 DataTable

**Khi dùng:** Danh sách lịch hẹn, bác sĩ, bệnh nhân, người dùng, phòng khám, audit log, cấu hình hệ thống.

**Style thống nhất:**

- Dùng `DataTable` và `Column` của PrimeReact.
- Header rõ ràng, text 14px, weight 600.
- Có paginator khi danh sách dài.
- Có loading state.
- Có empty state.
- Có filter/search khi dữ liệu cần tra cứu.
- Row action dùng icon button PrimeIcons.
- Status dùng `Tag`, không tự tạo badge rời nếu không cần.
- Border radius container: 12-16px.

### 5.9 Card

**Khi dùng:** Dashboard stat, thông tin bác sĩ, thông tin bệnh nhân, block form, nội dung chi tiết, profile summary.

**Style thống nhất:**

- Dùng `Card` của PrimeReact hoặc wrapper card custom thống nhất.
- Nền trắng, border `#E2E8F0`, shadow nhẹ.
- Border radius: 12px hoặc 16px.
- Padding: 16px cho card nhỏ, 24px cho card nội dung chính.
- Card không nên lồng nhiều card con nếu chỉ để tạo hiệu ứng trang trí.

### 5.10 Tag

**Khi dùng:** Trạng thái lịch hẹn, trạng thái bác sĩ, role người dùng, queue/status hệ thống.

**Style thống nhất:**

- Dùng `Tag` của PrimeReact.
- `success`: đã hoàn tất, hoạt động, xác nhận.
- `warning`: đang chờ, cần xử lý.
- `danger`: hủy, lỗi, khóa, thất bại.
- `info`: đang khám, đã đặt, thông tin chung.
- Border radius dạng pill hoặc 8px tùy theme, text 12-13px, weight 600.

### 5.11 Toolbar, Menu, Sidebar

**Khi dùng:**

- `Toolbar`: vùng action trên cùng của table/list, gồm search, filter, button thêm mới.
- `Menu`: danh sách điều hướng nhỏ, user menu, menu thao tác.
- `Sidebar`: navigation chính hoặc panel lọc/chi tiết trên màn hình nhỏ.

**Style thống nhất:**

- Sidebar nền trắng hoặc `#0369A1` nếu cần identity mạnh.
- Active item dùng primary hoặc primary light.
- Icon trước label, khoảng cách 8px.
- Navigation label weight 500.
- Header/sidebar phải rõ vị trí hiện tại của user.

## 6. Icon system

PrimeIcons là icon set chính. Không trộn icon từ nhiều thư viện khác nếu không cần. Nếu đang thay UI, ưu tiên thay icon cũ bằng PrimeIcons.

### 6.1 Danh sách icon chuẩn

- Home: `pi pi-home`
- Dashboard: `pi pi-chart-line`
- User: `pi pi-user`
- Users: `pi pi-users`
- Doctor: `pi pi-briefcase`
- Appointment: `pi pi-calendar`
- Calendar: `pi pi-calendar-clock`
- Search: `pi pi-search`
- Add: `pi pi-plus`
- Edit: `pi pi-pencil`
- Delete: `pi pi-trash`
- Save: `pi pi-save`
- Cancel/Close: `pi pi-times`
- Login: `pi pi-sign-in`
- Logout: `pi pi-sign-out`
- Email: `pi pi-envelope`
- Password: `pi pi-lock`
- Phone: `pi pi-phone`
- Location: `pi pi-map-marker`
- Notification: `pi pi-bell`
- Setting: `pi pi-cog`
- Loading: `pi pi-spin pi-spinner`

### 6.2 Quy định dùng icon

- Icon đi kèm button đặt trước label.
- Icon chính dùng màu primary `#0EA5E9`.
- Icon nguy hiểm/delete dùng danger `#EF4444`.
- Icon trong navigation dùng cùng màu text; active item đổi sang primary hoặc trắng tùy nền.
- Icon chỉ nên dùng để hỗ trợ nhận diện, không thay thế label ở các thao tác quan trọng nếu không có tooltip.
- Icon-only button trong table phải có tooltip hoặc `aria-label`.

## 7. Layout rules

### 7.1 Page container

- Nền toàn trang dùng `#F8FAFC`.
- Container desktop nên có max-width rõ ràng, ví dụ 1200-1280px cho màn thường.
- Gutter desktop: 24-32px.
- Gutter mobile: 16px.
- Khoảng cách giữa các section: 24-32px.

### 7.2 Header

- Header cao khoảng 64-72px.
- Nền trắng, border bottom `#E2E8F0`, hoặc nền secondary `#0369A1` nếu là layout có sidebar/header đậm.
- Bên trái là logo/tên hệ thống, bên phải là user menu, notification, logout.
- Header phải giữ thông tin vai trò hoặc khu vực hiện tại khi cần.

### 7.3 Sidebar nếu có

- Sidebar dùng cho dashboard/admin/doctor nếu navigation nhiều.
- Width desktop: 240-280px.
- Mobile: chuyển thành overlay Sidebar của PrimeReact.
- Active item rõ bằng primary background/text.
- Không dùng quá nhiều cấp menu; nếu có nhóm, đặt heading ngắn.

### 7.4 Form layout

- Form đơn giản dùng 1 cột.
- Form dài trên desktop có thể dùng 2 cột, nhưng các field liên quan phải gần nhau.
- Label luôn nằm trên input.
- Khoảng cách giữa label và input: 4-8px.
- Khoảng cách giữa field: 16px.
- Footer form có CTA chính rõ ràng.

### 7.5 Card layout

- Dashboard stat card dùng grid responsive.
- Card nội dung chính dùng padding 24px.
- Card nhỏ dùng padding 16px.
- Border radius medium 12px hoặc large 16px.
- Shadow nhẹ, không dùng shadow quá đậm.

### 7.6 Table/list layout

- Table nằm trong surface/card riêng.
- Toolbar phía trên table chứa title, search/filter và action chính.
- Mobile có thể chuyển row thành card list nếu DataTable quá chật.
- Action buttons trong row đặt cuối dòng/cột, dùng icon PrimeIcons.

### 7.7 Spacing scale

Chỉ dùng spacing scale sau nếu có thể:

- 4px: khoảng cách rất nhỏ, icon/text compact.
- 8px: gap giữa icon và label, label với input.
- 12px: padding button nhỏ, chip, compact cell.
- 16px: khoảng cách field, padding card nhỏ.
- 24px: padding card chính, gap section vừa.
- 32px: gap section lớn, page block.

### 7.8 Border radius

- **Small 8px:** input, small button, tag, compact controls.
- **Medium 12px:** primary button, dropdown, card nhỏ, table wrapper.
- **Large 16px:** dialog, card lớn, dashboard panel, appointment detail panel.

## 8. Form design

- Mọi input phải có label rõ ràng, không chỉ dùng placeholder.
- Input chính dùng PrimeReact: `InputText`, `Password`, `Dropdown`, `Calendar`, `InputTextarea` nếu cần.
- Focus state dùng primary `#0EA5E9`.
- Error message dùng danger `#EF4444`, đặt ngay dưới field và viết cụ thể.
- Required field nên có dấu `*` hoặc mô tả rõ trong label.
- Button chính phải thể hiện CTA rõ: "Đăng nhập", "Lưu", "Đặt lịch", "Tạo lịch hẹn".
- Login/register form cần dễ nhìn, ít màu, không dùng nhiều badge/trang trí.
- Form submit phải có loading/disabled state khi đang xử lý.
- Nếu có lỗi API tổng quát, dùng Toast error và giữ lỗi field nếu xác định được field liên quan.

## 9. Table/Data display

- Dùng PrimeReact `DataTable` cho dữ liệu dạng danh sách.
- Header cột rõ, không viết tắt khó hiểu.
- Có empty state: mô tả ngắn và action nếu cần, ví dụ "Chưa có lịch hẹn".
- Có loading state: dùng spinner PrimeReact hoặc `pi pi-spin pi-spinner`.
- Có paginator khi dữ liệu nhiều.
- Có search/filter với icon `pi pi-search` khi danh sách cần tra cứu.
- Action buttons dùng PrimeIcons: edit `pi pi-pencil`, delete `pi pi-trash`, save `pi pi-save`, close `pi pi-times`.
- Status dùng `Tag` với màu:
  - Success: hoàn tất, đang hoạt động, xác nhận.
  - Warning: chờ xử lý, chờ khám, pending.
  - Danger: hủy, lỗi, khóa, xóa.
  - Info: đã đặt, đang khám, thông tin.
- Dữ liệu quan trọng như ngày giờ, tên bệnh nhân, tên bác sĩ phải dễ scan; tránh text quá nhỏ hoặc màu quá nhạt.

## 10. Accessibility/responsive

- Contrast giữa text và nền phải dễ đọc, nhất là trong table/form.
- Button và control click được phải đủ lớn, tối thiểu khoảng 40px chiều cao cho control chính.
- Form phải có label rõ ràng và error message gắn với field.
- Icon-only action phải có tooltip hoặc `aria-label`.
- Không dùng text quá nhỏ dưới 12px cho dữ liệu quan trọng.
- Responsive phải đảm bảo không vỡ layout ở mobile.
- Dialog trên mobile nên gần full width, có scroll nội dung nếu form dài.
- Table trên màn nhỏ cần horizontal scroll hoặc chuyển thành list/card để vẫn đọc được.
- Màu không được là tín hiệu duy nhất cho trạng thái; nên có text label trong `Tag`.

## 11. Rules for future UI changes

- Không đổi business logic.
- Không đổi API endpoint.
- Không đổi route.
- Không xóa chức năng hiện có.
- Khi sửa UI phải ưu tiên PrimeReact component.
- Icon phải dùng PrimeIcons.
- Màu phải lấy theo design token trong `DESIGN.md`.
- Không thêm nhiều UI library khác nếu PrimeReact đáp ứng được.
- Nếu cần custom CSS, đặt theo token rõ ràng và tránh hard-code màu rải rác.
- Sau khi sửa UI phải chạy `npm run build` nếu project có script build.
