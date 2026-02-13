import React from 'react';
import { Shield, Eye, Cookie, Trash2 } from 'lucide-react';

interface PrivacyPolicyProps {
  onClose: () => void;
}

/**
 * 隐私政策页面
 * Space Diary 风格
 */
export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-space-950/95 p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-space-850 border-2 border-amber-400/50 rounded-lg p-8 hologram-card my-8">
        {/* 标题 */}
        <div className="flex items-center gap-3 mb-6">
          <Shield size={32} className="text-amber-400" />
          <h1 className="text-3xl font-bold text-amber-400 font-display glow-text">隐私政策</h1>
        </div>

        {/* 更新日期 */}
        <p className="text-sm text-space-700 mb-6">最后更新：2026年2月13日</p>

        {/* 内容 */}
        <div className="space-y-6 text-space-300 leading-relaxed">
          {/* 引言 */}
          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">引言</h2>
            <p className="mb-3">
              欢迎使用星际日记（"我们"、"本应用"）。我们非常重视您的隐私保护和个人信息安全。
              本隐私政策旨在向您说明我们如何收集、使用、存储和保护您的个人信息。
            </p>
            <p>
              使用本应用即表示您同意本隐私政策的条款。如果您不同意这些条款，请停止使用本应用。
            </p>
          </section>

          {/* 我们收集的信息 */}
          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3 flex items-center gap-2">
              <Eye size={20} />
              我们收集的信息
            </h2>

            <h3 className="text-lg font-bold text-cyan-400 mb-2">1. 账户信息</h3>
            <ul className="list-disc list-inside mb-4 space-y-1 text-space-400">
              <li>邮箱地址（用于注册和登录）</li>
              <li>用户名（可选，用于显示）</li>
            </ul>

            <h3 className="text-lg font-bold text-cyan-400 mb-2">2. 用户生成内容</h3>
            <ul className="list-disc list-inside mb-4 space-y-1 text-space-400">
              <li>您回答的问题内容</li>
              <li>打卡记录和进度</li>
              <li>已查看的记忆碎片记录</li>
            </ul>

            <h3 className="text-lg font-bold text-cyan-400 mb-2">3. 技术信息</h3>
            <ul className="list-disc list-inside space-y-1 text-space-400">
              <li>设备信息和浏览器类型</li>
              <li>IP地址（用于安全审计）</li>
              <li>使用日志和错误报告</li>
            </ul>
          </section>

          {/* 信息的使用 */}
          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">信息的使用</h2>
            <p className="mb-3">我们使用收集的信息用于：</p>
            <ul className="list-disc list-inside space-y-1 text-space-400">
              <li>提供、维护和改进本应用</li>
              <li>保存您的思考和回答，方便您跨设备访问</li>
              <li>追踪打卡进度和成就</li>
              <li>发送重要通知（如服务变更）</li>
              <li>分析和改进应用性能</li>
              <li>防止欺诈和滥用</li>
            </ul>
          </section>

          {/* Cookies和类似技术 */}
          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3 flex items-center gap-2">
              <Cookie size={20} />
              Cookies 和本地存储
            </h2>
            <p className="mb-3">
              本应用使用浏览器的 LocalStorage 功能来存储您的数据。这些数据仅保存在您的设备上，
              不会自动上传到我们的服务器，除非您登录账户。
            </p>
            <p className="text-space-400">
              您可以通过清除浏览器数据来删除 LocalStorage 中的内容。
            </p>
          </section>

          {/* 数据共享和披露 */}
          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">数据共享和披露</h2>
            <p className="mb-3">我们不会出售、出租或交易您的个人信息。仅在以下情况下披露：</p>
            <ul className="list-disc list-inside space-y-1 text-space-400">
              <li><strong>经您同意：</strong>明确同意的情况下</li>
              <li><strong>服务提供商：</strong>帮助我们托管服务的第三方（如 Supabase）</li>
              <li><strong>法律要求：</strong>法律、法规或政府机构要求</li>
              <li><strong>保护权利：</strong>保护我们的权利、财产或安全</li>
            </ul>
          </section>

          {/* 数据安全 */}
          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">数据安全</h2>
            <p className="mb-3">
              我们采取合理的技术和组织措施来保护您的个人信息：
            </p>
            <ul className="list-disc list-inside space-y-1 text-space-400">
              <li>使用 HTTPS 加密传输</li>
              <li>数据库加密存储</li>
              <li>访问控制和身份验证</li>
              <li>定期安全审计</li>
            </ul>
            <p className="mt-3 text-space-400">
              但请注意，没有任何系统是完全安全的。我们无法保证绝对安全。
            </p>
          </section>

          {/* 您的权利 */}
          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">您的权利</h2>
            <p className="mb-3">您对自己的个人信息拥有以下权利：</p>
            <ul className="list-disc list-inside space-y-1 text-space-400">
              <li><strong>访问权：</strong>查看我们持有的您的信息</li>
              <li><strong>更正权：</strong>更新或更正不准确的信息</li>
              <li><strong>删除权：</strong>要求删除您的账户和数据</li>
              <li><strong>导出权：</strong>以可读格式导出您的数据</li>
              <li><strong>反对权：</strong>反对某些数据处理活动</li>
            </ul>
            <p className="mt-3 text-space-400">
              如需行使这些权利，请通过下方联系方式与我们联系。
            </p>
          </section>

          {/* 数据保留 */}
          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">数据保留</h2>
            <p>
              我们会在您的账户活跃期间保留您的个人信息。如果您删除账户或要求我们删除数据，
              我们将在合理时间内删除您的信息，除非法律要求我们保留更长时间。
            </p>
          </section>

          {/* 第三方链接 */}
          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">第三方服务</h2>
            <p className="mb-3">本应用使用以下第三方服务：</p>
            <ul className="list-disc list-inside space-y-1 text-space-400">
              <li><strong>Supabase：</strong>用于用户认证和数据存储</li>
              <li><strong>Google Gemini：</strong>用于生成哲学问题</li>
            </ul>
            <p className="mt-3 text-space-400">
              这些服务有自己的隐私政策。我们建议您查阅其政策。
            </p>
          </section>

          {/* 儿童隐私 */}
          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">儿童隐私</h2>
            <p>
              本应用不面向13岁以下的儿童。我们不会故意收集13岁以下儿童的个人信息。
              如果我们发现已收集此类信息，我们将采取措施删除它。
            </p>
          </section>

          {/* 政策变更 */}
          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">政策变更</h2>
            <p>
              我们可能会不时更新本隐私政策。更新后，我们将在应用内或通过邮件通知您。
              继续使用本应用即表示您接受更新后的政策。
            </p>
          </section>

          {/* 联系方式 */}
          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">联系我们</h2>
            <p className="mb-2">
              如对本隐私政策有任何疑问、意见或投诉，请通过以下方式联系我们：
            </p>
            <div className="bg-space-900/50 rounded-lg p-4 border border-space-700">
              <p className="text-space-400">邮箱：your-email@example.com</p>
              <p className="text-space-400 text-sm mt-1">
                （请替换为您的实际联系方式）
              </p>
            </div>
          </section>
        </div>

        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="mt-8 w-full bg-amber-400 hover:bg-amber-500 text-space-950 font-bold py-3 px-6 rounded-lg btn-3d"
        >
          关闭
        </button>
      </div>

      {/* 背景装饰 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="scanlines"></div>
      </div>
    </div>
  );
};
