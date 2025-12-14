import { Language } from '../types';

export const t = (key: string, lang: Language): string => {
  const dict: Record<string, Record<Language, string>> = {
    // Navigation
    'nav.dashboard': { en: 'Dashboard', zh: '仪表盘' },
    'nav.scan': { en: 'Scan & Upload', zh: '扫描上传' },
    'nav.bank': { en: 'Question Bank', zh: '题库管理' },
    'nav.exam': { en: 'Exam Composer', zh: '试卷排版' },
    'nav.tutor': { en: 'AI Tutor', zh: 'AI 辅导' },
    'nav.settings': { en: 'Settings', zh: '系统设置' },
    'nav.signout': { en: 'Sign Out', zh: '退出登录' },
    'nav.status': { en: 'Status', zh: '状态' },
    'nav.online': { en: 'System Online', zh: '系统在线' },

    // Dashboard
    'dashboard.title': { en: 'Dashboard', zh: '仪表盘' },
    'dashboard.download': { en: 'Download Report', zh: '下载报告' },
    'dashboard.recentUploads': { en: 'Recent Uploads', zh: '最近上传' },
    'dashboard.invite': { en: 'Manage your recent file uploads.', zh: '管理您最近上传的文件。' },
    'dashboard.view': { en: 'View', zh: '查看' },
    'dashboard.totalQuestions': { en: 'Total Questions', zh: '题目总数' },
    'dashboard.examsCreated': { en: 'Exams Created', zh: '已创建试卷' },
    'dashboard.lastMonth': { en: 'from last month', zh: '较上月' },
    'dashboard.quickAsk': { en: 'Quick AI Ask', zh: 'AI 快速提问' },
    'dashboard.askPlaceholder': { en: 'Ask about your questions...', zh: '询问关于你的题目...' },
    'dashboard.subjectDist': { en: 'Subject Distribution', zh: '科目分布' },
    'dashboard.subjectDesc': { en: 'Breakdown of questions by subject.', zh: '按科目分类的题目统计。' },
    'dashboard.recentQuestions': { en: 'Recent Questions Added', zh: '最近添加的题目' },
    'dashboard.col.question': { en: 'Question', zh: '题目' },
    'dashboard.col.subject': { en: 'Subject', zh: '科目' },
    'dashboard.col.difficulty': { en: 'Difficulty', zh: '难度' },
    'dashboard.col.type': { en: 'Type', zh: '类型' },

    // Upload Zone
    'upload.title': { en: 'Scan & Upload', zh: '扫描与上传' },
    'upload.subtitle': { en: 'Upload images to auto-scan or manually crop specific questions.', zh: '上传图片进行自动扫描，或手动裁剪特定题目。' },
    'upload.drop': { en: 'Drop files here or click to upload', zh: '拖拽文件到此处或点击上传' },
    'upload.scanAll': { en: 'Scan All Pending', zh: '扫描所有待处理' },
    'upload.scanning': { en: 'Scanning Background...', zh: '后台扫描中...' },
    'upload.manual': { en: 'Manual Crop', zh: '手动裁剪' },
    'upload.auto': { en: 'Auto Scan', zh: '自动扫描' },
    'upload.qr': { en: 'Scan QR Code', zh: '扫描二维码' },
    'upload.qrTitle': { en: 'Scan Question QR', zh: '扫描题目二维码' },
    'upload.qrDesc': { en: 'Point your camera at a QR code containing a URL to a question set (JSON).', zh: '将摄像头对准包含题目集（JSON）URL的二维码。' },
    'upload.stop': { en: 'Stop Scanning', zh: '停止扫描' },
    'upload.cameraError': { en: 'Camera access denied or unavailable.', zh: '无法访问摄像头。' },

    // Question Bank
    'bank.title': { en: 'Question Bank', zh: '题库管理' },
    'bank.managing': { en: 'Managing', zh: '管理中' },
    'bank.questions': { en: 'questions', zh: '道题目' },
    'bank.selected': { en: 'Selected', zh: '已选择' },
    'bank.addToExam': { en: 'Add to Exam', zh: '加入试卷' },
    'bank.batchEdit': { en: 'Batch Edit', zh: '批量编辑' },
    'bank.aiTutor': { en: 'AI Tutor', zh: 'AI 辅导' },
    'bank.selectAll': { en: 'Select All', zh: '全选' },
    'bank.deselect': { en: 'Deselect', zh: '取消全选' },
    'bank.search': { en: 'Search questions by keyword...', zh: '搜索题目关键字...' },
    'bank.filters': { en: 'Filters', zh: '筛选' },
    'bank.filter.subject': { en: 'All Subjects', zh: '所有科目' },
    'bank.filter.type': { en: 'All Types', zh: '所有题型' },
    'bank.filter.diff': { en: 'All Difficulties', zh: '所有难度' },
    'bank.empty': { en: 'Your bank is empty', zh: '题库为空' },
    'bank.emptySub': { en: 'Go to "Scan & Upload" to build your database.', zh: '前往“扫描上传”建立你的数据库。' },

    // Settings
    'settings.title': { en: 'Settings', zh: '设置' },
    'settings.subtitle': { en: 'Manage your preferences, profile, and application settings.', zh: '管理您的偏好、个人资料和应用设置。' },
    'settings.profile': { en: 'User Profile', zh: '用户资料' },
    'settings.appearance': { en: 'Appearance & Language', zh: '外观与语言' },
    'settings.theme': { en: 'Theme Color', zh: '主题颜色' },
    'settings.language': { en: 'Language', zh: '语言' },
    'settings.save': { en: 'Save Changes', zh: '保存更改' },
    'settings.system': { en: 'System Information', zh: '系统信息' },

    // Auth
    'auth.welcome': { en: 'Welcome to SmartStudy', zh: '欢迎使用 SmartStudy' },
    'auth.signin': { en: 'Sign In', zh: '登录' },
    'auth.signup': { en: 'Sign Up', zh: '注册' },
    'auth.create': { en: 'Create Account', zh: '创建账户' },
    'auth.email': { en: 'Email Address', zh: '邮箱地址' },
    'auth.password': { en: 'Password', zh: '密码' },
    'auth.name': { en: 'Full Name', zh: '全名' },
    
    // General
    'common.processing': { en: 'Processing...', zh: '处理中...' }
  };

  return dict[key]?.[lang] || key;
};