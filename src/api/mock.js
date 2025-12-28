import { getUser } from '../auth/storage.js'

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms))

const roles = [
  { id: '1', roleCode: 'ADMIN', roleName: '系统管理员', status: 1 },
  { id: '2', roleCode: 'LIBRARIAN', roleName: '图书管理员', status: 1 },
  { id: '3', roleCode: 'READER', roleName: '读者', status: 1 },
]

let userSeq = 3
let categorySeq = 6
let bookSeq = 12
let copySeq = 11
let loanSeq = 2

const users = [
  {
    id: '1',
    username: 'admin',
    password: 'admin',
    nickname: '管理员',
    phone: '13800000001',
    email: 'admin@example.com',
    status: 1,
    roles: ['ADMIN'],
  },
  {
    id: '2',
    username: 'librarian',
    password: 'librarian',
    nickname: '图书管理员',
    phone: '13800000002',
    email: 'librarian@example.com',
    status: 1,
    roles: ['LIBRARIAN'],
  },
  {
    id: '3',
    username: 'reader',
    password: 'reader',
    nickname: '读者',
    phone: '13800000003',
    email: 'reader@example.com',
    status: 1,
    roles: ['READER'],
  },
]

const categories = [
  { id: '1', parentId: '0', name: '文学', code: 'LIT' },
  { id: '5', parentId: '0', name: '计算机', code: 'CS' },
  { id: '6', parentId: '5', name: '人工智能', code: 'AI' },
]

const books = [
  {
    id: '6',
    isbn: '9787362863730',
    title: '算法与数据结构：工程化',
    author: '韩磊',
    publisher: '北京大学出版社',
    publishDate: '2025-02-20',
    categoryId: '6',
    tags: 'AI,MySQL',
    description: '示例数据：算法与数据结构：工程化，用于CRUD/RBAC联调与分页检索。',
  },
  {
    id: '12',
    isbn: '9787273461957',
    title: '深入理解 工程化',
    author: '高峰',
    publisher: '北京大学出版社',
    publishDate: '2021-10-07',
    categoryId: '5',
    tags: 'DDD,Network,Java,OS',
    description: '示例数据：深入理解 工程化，用于CRUD/RBAC联调与分页检索。',
  },
]

const copies = [
  { id: '10', bookId: '6', copyCode: 'BC2025000010', location: 'A-9-12', status: 2 },
  { id: '11', bookId: '6', copyCode: 'BC2025000011', location: 'A-9-18', status: 1 },
]

const loans = [
  {
    id: '2',
    loanNo: 'LN20251228000002',
    userId: '3',
    copyId: '10',
    borrowedAt: '2025-08-08 10:00:00',
    dueAt: '2025-08-29 10:00:00',
    returnedAt: null,
    status: 3,
  },
]

const toSafeUser = (user) => {
  const { password, ...rest } = user
  return rest
}

const toNumber = (value, fallback) => {
  if (value === undefined || value === null || value === '') {
    return fallback
  }
  const num = Number(value)
  return Number.isNaN(num) ? fallback : num
}

const matchKeyword = (value, keyword) => {
  if (!keyword) {
    return true
  }
  return String(value || '').toLowerCase().includes(keyword.toLowerCase())
}

const paginate = (items, page = 1, size = 10) => {
  const total = items.length
  const start = (page - 1) * size
  return {
    items: items.slice(start, start + size),
    page,
    size,
    total,
  }
}

const pad2 = (value) => String(value).padStart(2, '0')
const formatDateTime = (date) => {
  const d = new Date(date)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(
    d.getHours(),
  )}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`
}

const nextId = (type) => {
  if (type === 'user') {
    userSeq += 1
    return String(userSeq)
  }
  if (type === 'category') {
    categorySeq += 1
    return String(categorySeq)
  }
  if (type === 'book') {
    bookSeq += 1
    return String(bookSeq)
  }
  if (type === 'copy') {
    copySeq += 1
    return String(copySeq)
  }
  if (type === 'loan') {
    loanSeq += 1
    return String(loanSeq)
  }
  return String(Date.now())
}

const nextLoanNo = () => {
  const now = new Date()
  const y = now.getFullYear()
  const m = pad2(now.getMonth() + 1)
  const d = pad2(now.getDate())
  const seq = String(loans.length + 1).padStart(5, '0')
  return `LN${y}${m}${d}${seq}`
}

const throwError = (message, status = 400) => {
  const error = new Error(message)
  error.status = status
  throw error
}

export async function mockRequest(path, options = {}) {
  await delay()
  const method = options.method || 'GET'
  const params = options.params || {}
  const body = options.body || {}

  if (path === '/api/v1/auth/login' && method === 'POST') {
    const user = users.find((item) => item.username === body.username)
    if (!user || user.password !== body.password) {
      throwError('用户名或密码错误', 400)
    }
    return {
      accessToken: `mock-token-${user.id}`,
      user: toSafeUser(user),
    }
  }

  if (path === '/api/v1/auth/register' && method === 'POST') {
    if (!body.username || !body.password || !body.nickname) {
      throwError('注册信息不完整', 400)
    }
    const exists = users.some((item) => item.username === body.username)
    if (exists) {
      throwError('用户名已存在', 400)
    }
    const newUser = {
      id: nextId('user'),
      username: body.username,
      password: body.password,
      nickname: body.nickname,
      phone: body.phone || '',
      email: body.email || '',
      status: 1,
      roles: ['READER'],
    }
    users.push(newUser)
    return {
      accessToken: `mock-token-${newUser.id}`,
      user: toSafeUser(newUser),
    }
  }

  if (path === '/api/v1/auth/password/reset' && method === 'POST') {
    const user = users.find((item) => item.username === body.username)
    if (!user) {
      throwError('用户不存在', 404)
    }
    user.password = body.newPassword
    return {}
  }

  if (path === '/api/v1/auth/logout' && method === 'POST') {
    return {}
  }

  if (path === '/api/v1/roles' && method === 'GET') {
    return roles
  }

  if (path === '/api/v1/users' && method === 'GET') {
    const keyword = params.keyword || ''
    const status = params.status === undefined ? undefined : Number(params.status)
    const page = toNumber(params.page, 1)
    const size = toNumber(params.size, 10)
    const filtered = users.filter((item) => {
      const hit =
        matchKeyword(item.username, keyword) ||
        matchKeyword(item.nickname, keyword) ||
        matchKeyword(item.phone, keyword) ||
        matchKeyword(item.email, keyword)
      const statusOk = status === undefined || Number(item.status) === status
      return hit && statusOk
    })
    return paginate(filtered.map(toSafeUser), page, size)
  }

  if (path === '/api/v1/users' && method === 'POST') {
    if (!body.username || !body.password || !body.nickname) {
      throwError('用户信息不完整', 400)
    }
    const exists = users.some((item) => item.username === body.username)
    if (exists) {
      throwError('用户名已存在', 400)
    }
    const newUser = {
      id: nextId('user'),
      username: body.username,
      password: body.password,
      nickname: body.nickname,
      phone: body.phone || '',
      email: body.email || '',
      status: toNumber(body.status, 1),
      roles: Array.isArray(body.roles) ? body.roles : [],
    }
    users.push(newUser)
    return {}
  }

  const userMatch = path.match(/^\/api\/v1\/users\/([^/]+)$/)
  if (userMatch && method === 'PUT') {
    const id = userMatch[1]
    const target = users.find((item) => item.id === id)
    if (!target) {
      throwError('用户不存在', 404)
    }
    if (params.roles !== undefined) {
      const rolesValue = Array.isArray(params.roles)
        ? params.roles
        : String(params.roles)
            .split(',')
            .map((role) => role.trim())
            .filter(Boolean)
      target.roles = rolesValue
    } else {
      target.nickname = body.nickname ?? target.nickname
      target.phone = body.phone ?? target.phone
      target.email = body.email ?? target.email
      target.status = toNumber(body.status, target.status)
    }
    return {}
  }

  if (userMatch && method === 'DELETE') {
    const id = userMatch[1]
    const index = users.findIndex((item) => item.id === id)
    if (index === -1) {
      throwError('用户不存在', 404)
    }
    users.splice(index, 1)
    return {}
  }

  if (path === '/api/v1/categories' && method === 'GET') {
    return categories
  }

  if (path === '/api/v1/categories' && method === 'POST') {
    const newCategory = {
      id: nextId('category'),
      parentId: body.parentId || '0',
      name: body.name,
      code: body.code,
    }
    categories.push(newCategory)
    return {}
  }

  const categoryMatch = path.match(/^\/api\/v1\/categories\/([^/]+)$/)
  if (categoryMatch && method === 'PUT') {
    const id = categoryMatch[1]
    const target = categories.find((item) => item.id === id)
    if (!target) {
      throwError('分类不存在', 404)
    }
    target.parentId = body.parentId ?? target.parentId
    target.name = body.name ?? target.name
    target.code = body.code ?? target.code
    return {}
  }

  if (categoryMatch && method === 'DELETE') {
    const id = categoryMatch[1]
    const index = categories.findIndex((item) => item.id === id)
    if (index === -1) {
      throwError('分类不存在', 404)
    }
    categories.splice(index, 1)
    return {}
  }

  if (path === '/api/v1/books' && method === 'GET') {
    const page = toNumber(params.page, 1)
    const size = toNumber(params.size, 10)
    const keyword = params.keyword || ''
    const categoryId = params.categoryId || ''
    const filtered = books.filter((item) => {
      const hit =
        matchKeyword(item.title, keyword) ||
        matchKeyword(item.author, keyword) ||
        matchKeyword(item.isbn, keyword)
      const categoryOk = !categoryId || item.categoryId === categoryId
      return hit && categoryOk
    })
    return paginate(filtered, page, size)
  }

  if (path === '/api/v1/books' && method === 'POST') {
    const newBook = {
      id: nextId('book'),
      isbn: body.isbn,
      title: body.title,
      author: body.author,
      publisher: body.publisher,
      publishDate: body.publishDate,
      categoryId: body.categoryId,
      tags: body.tags || '',
      description: body.description || '',
    }
    books.push(newBook)
    return {}
  }

  const bookMatch = path.match(/^\/api\/v1\/books\/([^/]+)$/)
  if (bookMatch && method === 'PUT') {
    const id = bookMatch[1]
    const target = books.find((item) => item.id === id)
    if (!target) {
      throwError('书目不存在', 404)
    }
    Object.assign(target, {
      isbn: body.isbn ?? target.isbn,
      title: body.title ?? target.title,
      author: body.author ?? target.author,
      publisher: body.publisher ?? target.publisher,
      publishDate: body.publishDate ?? target.publishDate,
      categoryId: body.categoryId ?? target.categoryId,
      tags: body.tags ?? target.tags,
      description: body.description ?? target.description,
    })
    return {}
  }

  if (bookMatch && method === 'DELETE') {
    const id = bookMatch[1]
    const index = books.findIndex((item) => item.id === id)
    if (index === -1) {
      throwError('书目不存在', 404)
    }
    books.splice(index, 1)
    return {}
  }

  if (path === '/api/v1/copies' && method === 'GET') {
    const page = toNumber(params.page, 1)
    const size = toNumber(params.size, 10)
    const bookId = params.bookId || ''
    const status = params.status === undefined ? undefined : Number(params.status)
    const filtered = copies.filter((item) => {
      const bookOk = !bookId || item.bookId === bookId
      const statusOk = status === undefined || Number(item.status) === status
      return bookOk && statusOk
    })
    return paginate(filtered, page, size)
  }

  if (path === '/api/v1/copies' && method === 'POST') {
    const newCopy = {
      id: nextId('copy'),
      bookId: body.bookId,
      copyCode: body.copyCode,
      location: body.location,
      status: toNumber(body.status, 1),
    }
    copies.push(newCopy)
    return {}
  }

  const copyMatch = path.match(/^\/api\/v1\/copies\/([^/]+)$/)
  if (copyMatch && method === 'PUT') {
    const id = copyMatch[1]
    const target = copies.find((item) => item.id === id)
    if (!target) {
      throwError('副本不存在', 404)
    }
    target.location = body.location ?? target.location
    target.status = toNumber(body.status, target.status)
    return {}
  }

  if (copyMatch && method === 'DELETE') {
    const id = copyMatch[1]
    const index = copies.findIndex((item) => item.id === id)
    if (index === -1) {
      throwError('副本不存在', 404)
    }
    copies.splice(index, 1)
    return {}
  }

  if (path === '/api/v1/loans' && method === 'GET') {
    const page = toNumber(params.page, 1)
    const size = toNumber(params.size, 10)
    const userId = params.userId || ''
    const status = params.status === undefined ? undefined : Number(params.status)
    const filtered = loans.filter((item) => {
      const userOk = !userId || item.userId === userId
      const statusOk = status === undefined || Number(item.status) === status
      return userOk && statusOk
    })
    return paginate(filtered, page, size)
  }

  if ((path === '/loans/borrow' || path === '/api/v1/loans/borrow') && method === 'POST') {
    const currentUser = getUser()
    if (!currentUser?.id) {
      throwError('请先登录', 401)
    }
    const copyId = params.copyId || body.copyId
    const days = toNumber(params.days ?? body.days, 14)
    const targetCopy = copies.find((item) => item.id === String(copyId))
    if (!targetCopy) {
      throwError('副本不存在', 404)
    }
    if (Number(targetCopy.status) !== 1) {
      throwError('该副本不可借', 400)
    }
    const borrowedAt = formatDateTime(new Date())
    const dueAt = formatDateTime(new Date(Date.now() + days * 24 * 60 * 60 * 1000))
    const newLoan = {
      id: nextId('loan'),
      loanNo: nextLoanNo(),
      userId: currentUser.id,
      copyId: String(copyId),
      borrowedAt,
      dueAt,
      returnedAt: null,
      status: 1,
    }
    loans.unshift(newLoan)
    targetCopy.status = 2
    return {}
  }

  if (path === '/api/v1/loans/return' && method === 'POST') {
    const copyId = params.copyId || body.copyId
    const targetCopy = copies.find((item) => item.id === String(copyId))
    if (!targetCopy) {
      throwError('副本不存在', 404)
    }
    const loan = loans.find(
      (item) => item.copyId === String(copyId) && (item.status === 1 || item.status === 3),
    )
    if (!loan) {
      throwError('未找到可归还的借阅记录', 400)
    }
    loan.status = 2
    loan.returnedAt = formatDateTime(new Date())
    targetCopy.status = 1
    return {}
  }

  throwError(`未实现的接口: ${method} ${path}`, 404)
}

