const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo').default || require('connect-mongo');
const { engine } = require('express-handlebars');
require('dotenv').config();

const { BookRead, BookWrite } = require('./models/Book');

const app = express();
const PORT = process.env.PORT || 3000;

// Cấu hình Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Cấu hình Handlebars View Engine
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

// --- CẤU HÌNH STATELESS SESSION LƯU VÀO MONGODB ATLAS ---
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret_key_23IT189',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI_WRITE, // Sử dụng URI có quyền ghi để lưu Session
    collectionName: 'sessions'
  }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // Session tồn tại 1 ngày
}));

// --- THUẬT TOÁN CÁ NHÂN HÓA DỰA TRÊN MSSV ---
// MSSV: 23IT189
const MSSV = "23IT189";
const mssvPrefix = "189"; // 3 số cuối MSSV
const lastDigit = 9;      // Chữ số cuối MSSV
const vatRate = lastDigit + 5; // VAT = (9 + 5)% = 14%

// 1. Route Hiển thị danh sách (Dùng kết nối READ)
app.get('/', async (req, res) => {
  try {
    // Điều hướng truy vấn ĐỌC qua BookRead
    const books = await BookRead.find().lean();
    
    // Đếm lượt truy cập phiên làm việc (Session demo)
    req.session.views = (req.session.views || 0) + 1;

    res.render('index', {
      books,
      vatRate,
      error: req.query.error
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi máy chủ khi lấy dữ liệu!');
  }
});

// 2. Route Thêm sách mới (Dùng kết nối WRITE)
app.post('/add-book', async (req, res) => {
  try {
    const { productCode, name, price } = req.body;

    // Bộ lọc: Mã sản phẩm BẮT BUỘC có tiền tố 3 số cuối MSSV ("189")
    if (!productCode.startsWith(mssvPrefix)) {
      return res.redirect(`/?error=Mã sản phẩm phải bắt đầu bằng 3 số cuối MSSV (${mssvPrefix})!`);
    }

    const priceBefore = parseFloat(price);
    // Tính giá sau thuế: VAT = 14%
    const priceAfter = priceBefore + (priceBefore * (vatRate / 100));

    // Điều hướng truy vấn GHI qua BookWrite
    const newBook = new BookWrite({
      productCode,
      name,
      priceBeforeTax: priceBefore,
      priceAfterTax: priceAfter,
      vatRate: vatRate
    });

    await newBook.save();
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi máy chủ khi thêm sản phẩm!');
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}`);
});