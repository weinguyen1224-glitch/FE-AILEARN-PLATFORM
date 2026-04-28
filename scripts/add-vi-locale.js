const fs = require('fs');
const path = require('path');

// Xác định đường dẫn gốc của project
const projectRoot = path.resolve(__dirname, '..');

const proComponentsLocalesPath = path.join(
  projectRoot,
  'node_modules/@ant-design/pro-components/es/layout/locales'
);

console.log('Project root:', projectRoot);
console.log('Locales path:', proComponentsLocalesPath);

const viSettingDrawerContent = `const locale = {
  "app.setting.pagestyle": "Cài đặt kiểu trang",
  "app.setting.pagestyle.dark": "Phong cách tối",
  "app.setting.pagestyle.light": "Phong cách sáng",
  "app.setting.pagestyle.realdark": "Phong cách tối thực sự",
  "app.setting.content-width": "Chiều rộng nội dung",
  "app.setting.content-width.fixed": "Cố định",
  "app.setting.content-width.fluid": "Chiều rộng linh hoạt",
  "app.setting.themecolor": "Màu chủ đề",
  "app.setting.themecolor.dust": "Đỏ bụi",
  "app.setting.themecolor.volcano": "Núi lửa",
  "app.setting.themecolor.sunset": "Cam hoàng hôn",
  "app.setting.themecolor.cyan": "Xanh ngọc",
  "app.setting.themecolor.green": "Xanh lục cực",
  "app.setting.themecolor.daybreak": "Xanh bình minh (mặc định)",
  "app.setting.themecolor.geekblue": "Xanh dán keo",
  "app.setting.themecolor.purple": "Tím hoàng gia",
  "app.setting.navigationmode": "Chế độ điều hướng",
  "app.setting.sidemenu": "Bố cục menu bên",
  "app.setting.topmenu": "Bố cục menu trên",
  "app.setting.mixmenu": "Bố cục menu hỗn hợp",
  "app.setting.sidermenutype": "Loại menu bên",
  "app.setting.sidermenutype-sub": "Menu con",
  "app.setting.sidermenutype-group": "Nhóm menu",
  "app.setting.fixedheader": "Cố định tiêu đề",
  "app.setting.fixedsidebar": "Cố định thanh bên",
  "app.setting.fixedsidebar.hint": "Hoạt động trên bố cục menu bên",
  "app.setting.hideheader": "Ẩn tiêu đề khi cuộn",
  "app.setting.hideheader.hint": "Hoạt động khi tiêu đề ẩn được bật",
  "app.setting.regionalsettings": "Cài đặt khu vực",
  "app.setting.weakmode": "Chế độ thân thiện với người mù màu",
  "app.setting.copy": "Sao chép cài đặt",
  "app.setting.copyinfo": "Sao chép thành công, vui lòng thay thế defaultSettings trong src/models/setting.js",
  "app.setting.production.hint": "Bảng cài đặt chỉ hiển thị trong môi trường phát triển, vui lòng sửa đổi thủ công",
  "app.setting.layout": "Kiểu bố cục",
  "app.setting.siderMenuType": "Kiểu menu bên"
};
export default locale;`;

const indexContent = `import { isBrowser } from "../../utils";
import enUSLocal from "./en-US";
import itITLocal from "./it-IT";
import koKRLocal from "./ko-KR";
import zhLocal from "./zh-CN";
import zhTWLocal from "./zh-TW";
import viVNLocal from "./vi-VN";

const locales = {
  'zh-CN': zhLocal,
  'zh-TW': zhTWLocal,
  'en-US': enUSLocal,
  'it-IT': itITLocal,
  'ko-KR': koKRLocal,
  'vi-VN': viVNLocal,
};

export const getLanguage = () => {
  if (!isBrowser()) return 'zh-CN';
  const lang = window.localStorage.getItem('umi_locale');
  return lang || window.g_locale || navigator.language;
};

export const gLocaleObject = () => {
  const gLocale = getLanguage();
  return locales[gLocale] || locales['zh-CN'];
};`;

try {
  // Tạo folder vi-VN trong locales
  const viDir = path.join(proComponentsLocalesPath, 'vi-VN');
  console.log('Creating dir:', viDir);
  
  if (!fs.existsSync(viDir)) {
    fs.mkdirSync(viDir, { recursive: true });
    console.log('Created directory');
  } else {
    console.log('Directory exists');
  }

  // Tạo file vi-VN/settingDrawer.ts
  const settingDrawerPath = path.join(viDir, 'settingDrawer.ts');
  fs.writeFileSync(settingDrawerPath, viSettingDrawerContent);
  console.log('Created settingDrawer.ts');

  // Tạo file vi-VN/index.ts
  const indexPath = path.join(viDir, 'index.ts');
  fs.writeFileSync(indexPath, "export { default } from './settingDrawer';");
  console.log('Created index.ts');

  // Update index.js
  const mainIndexPath = path.join(proComponentsLocalesPath, 'index.js');
  fs.writeFileSync(mainIndexPath, indexContent);
  console.log('Updated index.js');

  console.log('✅ Done!');
} catch (err) {
  console.error('❌ Error:', err.message);
  console.error(err.stack);
}
