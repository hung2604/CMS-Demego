/** Dữ liệu seed: cây menu + bài viết (HTML tương thích TipTap / DOMPurify). */

export interface SeedPostContent {
  slugVi: string
  slugEn: string
  titleVi: string
  titleEn: string
  excerptVi: string
  excerptEn: string
  status: 'draft' | 'published'
  contentVi: string
  contentEn: string
  seoVi: { title: string; description: string }
  seoEn: { title: string; description: string }
}

export interface SeedMenuBranch {
  title: string
  /** Tiêu đề tiếng Anh (mặc định trùng `title` nếu bỏ trống) */
  titleEn?: string
  slug: string
  icon: string
  order: number
  post: SeedPostContent
  children?: SeedMenuBranch[]
}

const IMG = (seed: string, w = 800, h = 420) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`

function richVariant (id: number, topicVi: string, topicEn: string): { vi: string; en: string } {
  const cycles = [
    (tVi: string, tEn: string) => ({
      vi: `<h2>${tVi}</h2>
<p>Đoạn mở đầu với <strong>chữ đậm</strong>, <em>nghiêng</em>, <u>gạch chân</u> và <s>gạch ngang</s> để minh họa định dạng cơ bản.</p>
<blockquote><p>Trích dẫn ngắn làm nổi bật thông điệp quan trọng trong bài.</p></blockquote>
<h3>Danh sách không thứ tự</h3>
<ul>
<li>Mục một với <mark>highlight</mark> nhẹ</li>
<li>Mục hai
<ul><li>Mục con bên trong</li><li>Mục con khác</li></ul></li>
<li>Mục ba</li>
</ul>
<h3>Danh sách có thứ tự</h3>
<ol>
<li>Bước chuẩn bị</li>
<li>Bước thực hiện</li>
<li>Bước kiểm tra &amp; tối ưu</li>
</ol>
<hr />
<p>Kết đoạn: công thức nước — H<sub>2</sub>O; diện tích E = mc<sup>2</sup> (minh họa chỉ số dưới/trên).</p>`,
      en: `<h2>${tEn}</h2>
<p>Opening paragraph with <strong>bold</strong>, <em>italic</em>, <u>underline</u>, and <s>strikethrough</s>.</p>
<blockquote><p>A short pull quote to emphasize the core message.</p></blockquote>
<h3>Bulleted list</h3>
<ul>
<li>First item with subtle <mark>highlight</mark></li>
<li>Second item
<ul><li>Nested point A</li><li>Nested point B</li></ul></li>
<li>Third item</li>
</ul>
<h3>Numbered list</h3>
<ol>
<li>Prepare</li>
<li>Execute</li>
<li>Verify &amp; refine</li>
</ol>
<hr />
<p>Footer: chemistry — H<sub>2</sub>O; notation E = mc<sup>2</sup>.</p>`
    }),
    (tVi: string, tEn: string) => ({
      vi: `<h2>Bảng so sánh — ${tVi}</h2>
<p style="text-align: center">Đoạn căn giữa để tạo nhịp trình bày khác biệt.</p>
<table>
<thead><tr><th>Tiêu chí</th><th>Phương án A</th><th>Phương án B</th></tr></thead>
<tbody>
<tr><td>Thời gian triển khai</td><td>2–4 tuần</td><td>4–8 tuần</td></tr>
<tr><td>Độ linh hoạt</td><td>Cao</td><td>Rất cao</td></tr>
<tr><td>Chi phí vận hành</td><td>Thấp</td><td>Trung bình</td></tr>
</tbody>
</table>
<h3>Snippet cấu hình (minh họa)</h3>
<pre><code>// ví dụ cấu hình ngắn
export default defineNuxtConfig({
  modules: ['edge cases'],
})</code></pre>
<p style="text-align: right">Ghi chú căn phải: phù hợp cho metadata hoặc nguồn trích dẫn.</p>`,
      en: `<h2>Comparison table — ${tEn}</h2>
<p style="text-align: center">Centered paragraph for visual rhythm.</p>
<table>
<thead><tr><th>Criteria</th><th>Option A</th><th>Option B</th></tr></thead>
<tbody>
<tr><td>Delivery time</td><td>2–4 weeks</td><td>4–8 weeks</td></tr>
<tr><td>Flexibility</td><td>High</td><td>Very high</td></tr>
<tr><td>Operating cost</td><td>Low</td><td>Medium</td></tr>
</tbody>
</table>
<h3>Short config sample</h3>
<pre><code>// small illustrative snippet
export default defineNuxtConfig({
  modules: ['edge cases'],
})</code></pre>
<p style="text-align: right">Right-aligned note for sources or metadata.</p>`
    }),
    (tVi: string, tEn: string) => ({
      vi: `<h2>Hình ảnh &amp; liên kết — ${tVi}</h2>
<p>Tham khảo thêm tại <a href="https://nuxt.com" target="_blank" rel="noopener noreferrer">Nuxt</a> và <a href="https://www.mongodb.com" target="_blank" rel="noopener noreferrer">MongoDB</a>.</p>
<figure>
<img src="${IMG(`${id}a`)}" alt="Ảnh minh họa 1" width="800" height="420" />
<figcaption>Hình 1 — minh họa layout với chú thích (figcaption).</figcaption>
</figure>
<hr />
<p>Ảnh thứ hai Full-width hơn (cùng tỷ lệ khác):</p>
<img src="${IMG(`${id}b`, 800, 500)}" alt="Ảnh minh họa 2" width="800" height="500" />
<p>Đoạn kết ngắn sau khối media.</p>`,
      en: `<h2>Images &amp; links — ${tEn}</h2>
<p>Learn more at <a href="https://nuxt.com" target="_blank" rel="noopener noreferrer">Nuxt</a> and <a href="https://www.mongodb.com" target="_blank" rel="noopener noreferrer">MongoDB</a>.</p>
<figure>
<img src="${IMG(`${id}a`)}" alt="Illustration 1" width="800" height="420" />
<figcaption>Figure 1 — caption under the image.</figcaption>
</figure>
<hr />
<p>Second image, different crop:</p>
<img src="${IMG(`${id}b`, 800, 500)}" alt="Illustration 2" width="800" height="500" />
<p>Short closing paragraph after media blocks.</p>`
    }),
    (tVi: string, tEn: string) => ({
      vi: `<h2>Quy trình chi tiết — ${tVi}</h2>
<ol>
<li><strong>Phân tích</strong>: thu thập yêu cầu và rủi ro</li>
<li><strong>Thiết kế</strong>: mô hình dữ liệu và luồng người dùng
<ul><li>Wireframe</li><li>API contract</li></ul></li>
<li><strong>Hiện thực</strong>: lập trình và kiểm thử</li>
<li><strong>Bàn giao</strong>: tài liệu và đào tạo</li>
</ol>
<table>
<thead><tr><th>Vai trò</th><th>Hoạt động chính</th><th>Đầu ra</th></tr></thead>
<tbody>
<tr><td>PM</td><td>Ưu tiên backlog</td><td>Roadmap</td></tr>
<tr><td>Dev</td><td>PR &amp; review</td><td>Build ổn định</td></tr>
<tr><td>QA</td><td>Kịch bản thử</td><td>Báo cáo lỗi</td></tr>
</tbody>
</table>`,
      en: `<h2>Detailed workflow — ${tEn}</h2>
<ol>
<li><strong>Analysis</strong>: gather requirements and risks</li>
<li><strong>Design</strong>: data model and UX flow
<ul><li>Wireframes</li><li>API contracts</li></ul></li>
<li><strong>Build</strong>: implementation and testing</li>
<li><strong>Handover</strong>: docs and training</li>
</ol>
<table>
<thead><tr><th>Role</th><th>Main activity</th><th>Output</th></tr></thead>
<tbody>
<tr><td>PM</td><td>Prioritize backlog</td><td>Roadmap</td></tr>
<tr><td>Dev</td><td>PR &amp; review</td><td>Stable build</td></tr>
<tr><td>QA</td><td>Test cases</td><td>Bug reports</td></tr>
</tbody>
</table>`
    }),
    (tVi: string, tEn: string) => ({
      vi: `<h2>Khối hỗn hợp — ${tVi}</h2>
<p>Đoạn giới thiệu ngắn trước khi xuống nội dung kỹ thuật.</p>
<h3>Mã minh họa</h3>
<pre><code>{
  "service": "cms",
  "locales": ["vi", "en"],
  "editor": "tiptap"
}</code></pre>
<blockquote><p>Kết hợp trích dẫn giữa bảng và mã giúp trang trông giống bài blog chuyên sâu.</p></blockquote>
<hr />
<h4>Tiểu mục nhỏ</h4>
<p>Ghi chú cuối với liên kết nội bộ giả định: <a href="/huong-dan">Hướng dẫn</a>.</p>`,
      en: `<h2>Mixed block layout — ${tEn}</h2>
<p>A short intro before technical blocks.</p>
<h3>Sample JSON</h3>
<pre><code>{
  "service": "cms",
  "locales": ["vi", "en"],
  "editor": "tiptap"
}</code></pre>
<blockquote><p>Mixing quotes with code mimics in-depth editorial pages.</p></blockquote>
<hr />
<h4>Small subsection</h4>
<p>Closing note with a pseudo-internal link: <a href="/huong-dan">User guide</a>.</p>`
    }),
    (tVi: string, tEn: string) => ({
      vi: `<h2>Định dạng đặc biệt — ${tVi}</h2>
<p style="text-align: center"><em>“Chất lượng là tổng của những chi tiết nhỏ.”</em></p>
<p>Danh sách kiểm tra nhanh:</p>
<ul>
<li><span style="color: var(--ui-primary, #0d9488)">Tiêu điểm màu</span> (inline style)</li>
<li>⚙ ký hiệu unicode minh họa (chỉ văn bản)</li>
<li>Kết hợp <mark>highlight</mark> và <strong>đậm</strong></li>
</ul>
<img src="${IMG(`${id}c`, 720, 360)}" alt="Banner ngang" width="720" height="360" />
<p style="text-align: right"><span style="font-size:0.875em">Nguồn: ảnh placeholder — thay bằng asset thật khi triển khai.</span></p>`,
      en: `<h2>Special formatting — ${tEn}</h2>
<p style="text-align: center"><em>“Quality is the sum of small details.”</em></p>
<p>Quick checklist:</p>
<ul>
<li><span style="color: var(--ui-primary, #0d9488)">Accent color</span> (inline)</li>
<li>⚙ Unicode glyph as plain text</li>
<li>Mix <mark>highlight</mark> and <strong>bold</strong></li>
</ul>
<img src="${IMG(`${id}c`, 720, 360)}" alt="Wide banner" width="720" height="360" />
<p style="text-align: right"><span style="font-size:0.875em">Source: placeholder — replace for production.</span></p>`
    })
  ]

  const builder = cycles[id % cycles.length]
  if (!builder) {
    throw new Error('seed-cms: missing rich variant builder')
  }
  return builder(topicVi, topicEn)
}

function post (
  slugVi: string,
  slugEn: string,
  titleVi: string,
  titleEn: string,
  excerptVi: string,
  excerptEn: string,
  status: 'draft' | 'published',
  id: number
): SeedPostContent {
  const { vi, en } = richVariant(id, titleVi, titleEn)
  return {
    slugVi,
    slugEn,
    titleVi,
    titleEn,
    excerptVi,
    excerptEn,
    status,
    contentVi: vi,
    contentEn: en,
    seoVi: { title: `${titleVi} | CMS Demego`, description: excerptVi },
    seoEn: { title: `${titleEn} | CMS Demego`, description: excerptEn }
  }
}

/** 22 menu (cha + con), mỗi mục một bài; 2 bản nháp để thử trạng thái. */
export function getSeedMenuTree (): SeedMenuBranch[] {
  let n = 0
  const p = (
    slugVi: string,
    slugEn: string,
    titleVi: string,
    titleEn: string,
    excerptVi: string,
    excerptEn: string,
    status: 'draft' | 'published'
  ) => post(slugVi, slugEn, titleVi, titleEn, excerptVi, excerptEn, status, n++)

  return [
    {
      title: 'Giới thiệu',
      slug: 'gioi-thieu',
      icon: 'i-lucide-building-2',
      order: 0,
      post: p(
        'gioi-thieu',
        'about',
        'Giới thiệu tổ chức',
        'About us',
        'Tổng quan về sứ mệnh, giá trị và hướng phát triển.',
        'Mission, values, and direction in a concise overview.',
        'published'
      ),
      children: [
        {
          title: 'Lịch sử hình thành',
          slug: 'lich-su',
          icon: 'i-lucide-history',
          order: 0,
          post: p(
            'lich-su',
            'history',
            'Lịch sử hình thành',
            'Our history',
            'Các mốc phát triển từ ngày đầu đến hiện tại.',
            'Key milestones from day one to today.',
            'published'
          )
        },
        {
          title: 'Tầm nhìn & sứ mệnh',
          slug: 'tam-nhin',
          icon: 'i-lucide-telescope',
          order: 1,
          post: p(
            'tam-nhin',
            'vision-mission',
            'Tầm nhìn và sứ mệnh',
            'Vision & mission',
            'Định hướng dài hạn và cam kết với khách hàng.',
            'Long-term direction and customer commitment.',
            'published'
          )
        },
        {
          title: 'Đội ngũ',
          slug: 'doi-ngu',
          icon: 'i-lucide-users',
          order: 2,
          post: p(
            'doi-ngu',
            'team',
            'Đội ngũ',
            'Team',
            'Con người đứng sau sản phẩm và dịch vụ.',
            'The people behind our products and services.',
            'published'
          )
        }
      ]
    },
    {
      title: 'Dịch vụ',
      slug: 'dich-vu',
      icon: 'i-lucide-briefcase',
      order: 1,
      post: p(
        'dich-vu',
        'services',
        'Dịch vụ của chúng tôi',
        'Our services',
        'Tư vấn, triển khai và vận hành — trọn gói hoặc từng phần.',
        'Consulting, delivery, and operations — modular or end-to-end.',
        'published'
      ),
      children: [
        {
          title: 'Tư vấn chiến lược',
          slug: 'tu-van',
          icon: 'i-lucide-lightbulb',
          order: 0,
          post: p(
            'tu-van',
            'consulting',
            'Tư vấn chiến lược',
            'Strategy consulting',
            'Làm rõ bài toán, ưu tiên và lộ trình chuyển đổi.',
            'Clarify problems, priorities, and transformation roadmap.',
            'published'
          )
        },
        {
          title: 'Phát triển phần mềm',
          slug: 'phat-trien-phan-mem',
          icon: 'i-lucide-code-2',
          order: 1,
          post: p(
            'phat-trien-phan-mem',
            'software-development',
            'Phát triển phần mềm',
            'Software development',
            'Web, API, tích hợp — theo chuẩn chất lượng và bảo mật.',
            'Web, APIs, integrations — quality and security first.',
            'published'
          )
        },
        {
          title: 'Vận hành & hỗ trợ',
          slug: 'van-hanh',
          icon: 'i-lucide-server-cog',
          order: 2,
          post: p(
            'van-hanh',
            'operations-support',
            'Vận hành và hỗ trợ',
            'Operations & support',
            'Giám sát, SLA, và cải tiến liên tục sau go-live.',
            'Monitoring, SLAs, and continuous improvement after go-live.',
            'published'
          )
        }
      ]
    },
    {
      title: 'Sản phẩm',
      slug: 'san-pham',
      icon: 'i-lucide-package',
      order: 2,
      post: p(
        'san-pham',
        'products',
        'Sản phẩm',
        'Products',
        'Các nền tảng và giải pháp có thể mở rộng.',
        'Platforms and solutions built to scale.',
        'published'
      ),
      children: [
        {
          title: 'Nền tảng Alpha',
          slug: 'nen-tang-a',
          icon: 'i-lucide-box',
          order: 0,
          post: p(
            'nen-tang-a',
            'platform-alpha',
            'Nền tảng Alpha',
            'Platform Alpha',
            'Tập trung tự động hóa quy trình nội bộ.',
            'Focused on internal process automation.',
            'published'
          )
        },
        {
          title: 'Nền tảng Beta',
          slug: 'nen-tang-b',
          icon: 'i-lucide-layers',
          order: 1,
          post: p(
            'nen-tang-b',
            'platform-beta',
            'Nền tảng Beta',
            'Platform Beta',
            'Phân tích dữ liệu thời gian thực và báo cáo.',
            'Real-time analytics and reporting.',
            'published'
          )
        }
      ]
    },
    {
      title: 'Tài nguyên',
      slug: 'tai-nguyen',
      icon: 'i-lucide-library',
      order: 3,
      post: p(
        'tai-nguyen',
        'resources',
        'Tài nguyên',
        'Resources',
        'Hướng dẫn, FAQ và tài liệu tải về.',
        'Guides, FAQs, and downloads.',
        'published'
      ),
      children: [
        {
          title: 'Hướng dẫn sử dụng',
          slug: 'huong-dan',
          icon: 'i-lucide-book-open',
          order: 0,
          post: p(
            'huong-dan',
            'user-guide',
            'Hướng dẫn sử dụng',
            'User guide',
            'Bước đầu tiên, thiết lập, và mẹo hay.',
            'First steps, setup, and practical tips.',
            'published'
          )
        },
        {
          title: 'Câu hỏi thường gặp',
          slug: 'faq',
          icon: 'i-lucide-circle-help',
          order: 1,
          post: p(
            'faq',
            'faq',
            'Câu hỏi thường gặp',
            'FAQ',
            'Giải đáp nhanh các thắc mắc phổ biến.',
            'Quick answers to common questions.',
            'published'
          )
        },
        {
          title: 'Tải xuống',
          slug: 'tai-xuong',
          icon: 'i-lucide-download',
          order: 2,
          post: p(
            'tai-xuong',
            'downloads',
            'Tải xuống tài liệu',
            'Downloads',
            'Bản nháp — tài liệu đang cập nhật (minh họa trạng thái draft).',
            'Draft placeholder — documents being updated.',
            'draft'
          )
        }
      ]
    },
    {
      title: 'Liên hệ',
      slug: 'lien-he',
      icon: 'i-lucide-mail',
      order: 4,
      post: p(
        'lien-he',
        'contact',
        'Liên hệ',
        'Contact',
        'Kênh hỗ trợ, địa chỉ và form liên lạc.',
        'Support channels, address, and how to reach us.',
        'published'
      )
    },
    {
      title: 'Tin tức',
      slug: 'tin-tuc',
      icon: 'i-lucide-newspaper',
      order: 5,
      post: p(
        'tin-tuc',
        'news',
        'Tin tức',
        'News',
        'Cập nhật mới nhất từ công ty và ngành.',
        'Latest updates from the company and industry.',
        'published'
      ),
      children: [
        {
          title: 'Thông báo',
          slug: 'thong-bao',
          icon: 'i-lucide-megaphone',
          order: 0,
          post: p(
            'thong-bao',
            'announcements',
            'Thông báo',
            'Announcements',
            'Chính sách, bảo trì, và thay đổi quan trọng.',
            'Policies, maintenance, and important changes.',
            'published'
          )
        },
        {
          title: 'Sự kiện',
          slug: 'su-kien',
          icon: 'i-lucide-calendar-days',
          order: 1,
          post: p(
            'su-kien',
            'events',
            'Sự kiện',
            'Events',
            'Hội thảo, webinar, và gặp gỡ cộng đồng.',
            'Workshops, webinars, and meetups.',
            'published'
          )
        },
        {
          title: 'Bài viết nổi bật',
          slug: 'bai-noi-bat',
          icon: 'i-lucide-star',
          order: 2,
          post: p(
            'bai-noi-bat',
            'featured-stories',
            'Bài viết nổi bật',
            'Featured stories',
            'Series dài kỳ, phân tích sâu và case study.',
            'Long reads, deep dives, and case studies.',
            'published'
          )
        },
        {
          title: 'Xu hướng công nghệ',
          slug: 'xu-huong-cong-nghe',
          icon: 'i-lucide-trending-up',
          order: 3,
          post: p(
            'xu-huong-cong-nghe',
            'tech-trends',
            'Xu hướng công nghệ',
            'Tech trends',
            'Bản nháp nội bộ về xu hướng đang theo dõi.',
            'Internal draft on trends under review.',
            'draft'
          )
        }
      ]
    }
  ]
}
