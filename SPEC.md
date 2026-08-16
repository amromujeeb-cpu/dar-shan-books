# دار شأن للنشر والتوزيع — مواصفات المشروع التقنية

هاد الملف هو مرجعك ومرجع Claude Code لإكمال بناء الموقع ونشره فعلياً.
البنية الحالية (هاد المجلد) هي **سكيلتون شغّال** — صفحات وتصميم جاهزين بـ Next.js وTailwind، بس البيانات فيها ثابتة (mock) ومفيش ربط حقيقي بقاعدة بيانات أو دفع بعد. كل نقطة "TODO" داخل الكود بتوريكي وين بالضبط لازم تربطي المنطق الحقيقي.

---

## ١. المكدّس التقني (Tech Stack)

| الطبقة | الأداة | السبب |
|---|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript | يدعم SSR (مهم للـ SEO لمتجر كتب)، ونشر سهل على Vercel |
| التنسيق | Tailwind CSS | متطابق مع نظام الألوان المستخدم بالنموذج الأولي |
| قاعدة البيانات | Supabase (PostgreSQL) | مجاني للبداية، فيه نظام مستخدمين (Auth) وتخزين ملفات (Storage) جاهز، لوحة تحكم ويب |
| الاستضافة | Vercel | نشر مباشر من Git، مجاني للمشاريع الصغيرة، أداء ممتاز بالمنطقة العربية |
| الدفع الإلكتروني | HyperPay (الأنسب للأردن) أو PayTabs | بوابات معتمدة إقليمياً، تدعم مدى وفيزا وماستركارد |

---

## ٢. مخطط قاعدة البيانات (Database Schema)

نفذي هاد الـ SQL من لوحة Supabase → SQL Editor:

```sql
-- الكتب
create table books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  category text not null,
  price numeric(10,3) not null,
  compare_at_price numeric(10,3),
  stock integer not null default 0,
  description text,
  isbn text,
  pages integer,
  cover_url text,
  created_at timestamptz default now()
);

-- ملفات تعريف المستخدمين (تمتد من auth.users المدمج بـ Supabase)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text default 'customer' check (role in ('customer','admin')),
  created_at timestamptz default now()
);

-- الطلبات
create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  status text default 'pending' check (status in ('pending','processing','shipped','delivered','cancelled')),
  total numeric(10,3) not null,
  shipping_name text,
  shipping_phone text,
  shipping_city text,
  shipping_address text,
  payment_method text check (payment_method in ('card','cod','wallet')),
  created_at timestamptz default now()
);

-- عناصر الطلب
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  book_id uuid references books(id),
  quantity integer not null,
  price_at_purchase numeric(10,3) not null
);

-- المفضلة
create table favorites (
  user_id uuid references auth.users(id) on delete cascade,
  book_id uuid references books(id) on delete cascade,
  primary key (user_id, book_id)
);
```

### صلاحيات الوصول (Row Level Security) — مهم جداً قبل الإطلاق
فعّلي RLS على كل جدول، وأضيفي policies بحيث:
- أي حد يقدر يقرأ جدول `books` (متجر عام)
- بس صاحب الطلب أو `role = 'admin'` يقدر يشوف صفوف `orders` و`order_items`
- بس `admin` يقدر يعمل insert/update/delete على `books`

راجعي [توثيق RLS من Supabase](https://supabase.com/docs/guides/auth/row-level-security) عند التنفيذ.

---

## ٣. تسجيل الدخول (Auth)

استخدمي `@supabase/auth-helpers-nextjs` (موجود بـ package.json). أبسط مسار:
- تسجيل بالإيميل + كلمة مرور، أو OTP عبر SMS إذا بدك تجربة أقرب للسوق المحلي
- عند إنشاء حساب جديد، أنشئي صف تلقائي بجدول `profiles` عبر Supabase trigger
- صفحة `/admin` لازم يكون فيها middleware (`middleware.ts`) يتحقق من `role === 'admin'` قبل ما يسمح بالدخول

---

## ٤. الدفع الإلكتروني (HyperPay)

الخطوات على مستوى عالٍ (التفاصيل الكاملة بتوثيق HyperPay بعد فتح حساب تاجر):

1. افتحي حساب تاجر (Merchant Account) عند بنك محلي شريك مع HyperPay، أو مباشرة عبر منصتهم
2. رح تحصلي على `Entity ID` و `Access Token` — حطيهم بـ `.env.local` (شوفي `.env.example`)
3. من صفحة `/checkout`، بعد ما يعبّي الزبون بياناته، استدعي HyperPay Checkout API لإنشاء جلسة دفع (checkoutId)
4. حمّلي widget الدفع الخاص فيهم بالصفحة (JS script من طرفهم)
5. بعد الدفع، HyperPay بترجع نتيجة للـ backend عندك (webhook) — هون بتحدّثي حالة الطلب بجدول `orders` من `pending` إلى `processing`

**بديل أبسط للبداية:** فعّلي بس "الدفع عند الاستلام" (COD) أول شي وأطلقي الموقع، وضيفي الدفع الإلكتروني كمرحلة ثانية — هيك بتنطلقي أسرع وتختبري الطلب الفعلي على المتجر قبل ما تعقّدي بربط بوابة دفع.

---

## ٥. خطوات النشر (Deployment)

1. **قاعدة البيانات:** أنشئي مشروع على [supabase.com](https://supabase.com)، نفذي الـ SQL أعلاه
2. **الكود:** ارفعي هالمجلد على GitHub (repo خاص)
3. **الاستضافة:** اربطي الـ repo بـ [vercel.com](https://vercel.com)، وحطي environment variables من `.env.example` بإعدادات Vercel
4. **الدومين:** سجّلي دومين (مثلاً darshan.jo أو darshan.com) واربطيه من إعدادات Vercel → Domains
5. **الدفع:** فعّليه لما يكون الموقع شغّال ومختبر بـ COD

---

## ٦. أولويات التنفيذ المقترحة (Roadmap)

| الأولوية | المهمة |
|---|---|
| ١ | ربط `books` و`categories` بـ Supabase الحقيقي بدل البيانات الثابتة |
| ٢ | نظام تسجيل دخول + صفحة "بياناتي" |
| ٣ | سلة شراء حقيقية (state management: Zustand أو Context API) |
| ٤ | صفحة `/checkout` تنشئ طلب فعلي بقاعدة البيانات (COD أول شي) |
| ٥ | لوحة الإدارة: عرض/تعديل الطلبات الحقيقية |
| ٦ | ربط بوابة دفع HyperPay |
| ٧ | رفع صور أغلفة حقيقية عبر Supabase Storage (بدل المونوغرام الافتراضي) |
| ٨ | النشر على دومين حقيقي + اختبار كامل لدورة الشراء |

---

## ٧. ملاحظات هوية بصرية (للحفاظ على الاتساق أثناء التطوير)

- الألوان: بنفسجي `#5B1D6B` كلون أساسي وحيد، أسود `#111114`، رمادي فاتح `#F2F2F4` — لا تُدخلي ألوان إضافية بدون داعٍ
- الخط: Cairo للعناوين والعناصر البارزة، Tajawal للنصوص الطويلة
- غلاف الكتاب الافتراضي (المونوغرام + نقشة المعينات) هو عنصر هوية مقصود — حافظي عليه كـ fallback حتى بعد ربط رفع الصور الحقيقية، لأي كتاب ما إله صورة
