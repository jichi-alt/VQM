import React from 'react';
import { FileText, AlertTriangle, Ban, Gavel } from 'lucide-react';

interface TermsOfServiceProps {
  onClose: () => void;
}

/**
 * 服务条款页面
 * Space Diary 风格
 */
export const TermsOfService: React.FC<TermsOfServiceProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-space-950/95 p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-space-850 border-2 border-amber-400/50 rounded-lg p-8 hologram-card my-8">
        {/* 标题 */}
        <div className="flex items-center gap-3 mb-6">
          <FileText size={32} className="text-amber-400" />
          <h1 className="text-3xl font-bold text-amber-400 font-display glow-text">服务条款</h1>
        </div>

        {/* 更新日期 */}
        <p className="text-sm text-space-700 mb-6">最后更新：2026年2月13日</p>

        {/* 内容 */}
        <div className="space-y-6 text-space-300 leading-relaxed">
          {/* 引言 */}
          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">引言</h2>
            <p className="mb-3">
              欢迎使用星际日记（"本应用"、"我们"）。感谢您使用本应用！
              这些服务条款（"条款"） govern 您与星际日记之间的关系。
            </p>
            <p>
              使用本应用即表示您同意遵守这些条款。如果您不同意这些条款，请勿使用本应用。
            </p>
          </section>

          {/* 服务描述 */}
          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">服务描述</h2>
            <p className="mb-3">
              星际日记是一个思考记录和习惯养成应用，提供以下服务：
            </p>
            <ul className="list-disc list-inside space-y-1 text-space-400">
              <li>每日哲学问题生成</li>
              <li>思考和答案记录</li>
              <li>21天打卡挑战</li>
              <li>记忆碎片故事体验</li>
              <li>跨设备数据同步（需登录）</li>
            </ul>
          </section>

          {/* 用户责任 */}
          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3 flex items-center gap-2">
              <AlertTriangle size={20} />
              用户责任
            </h2>
            <p className="mb-3">使用本应用时，您同意：</p>
            <ul className="list-disc list-inside space-y-1 text-space-400">
              <li>年满13岁或获得父母同意</li>
              <li>提供准确、真实的注册信息</li>
              <li>保护您的账户安全</li>
              <li>对您账户下的所有活动负责</li>
              <li>不与他人共享账户</li>
              <li>遵守所有适用的法律法规</li>
            </ul>
          </section>

          {/* 禁止行为 */}
          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3 flex items-center gap-2">
              <Ban size={20} />
              禁止行为
            </h2>
            <p className="mb-3">您不得：</p>
            <ul className="list-disc list-inside space-y-1 text-space-400">
              <li>使用本应用从事任何非法活动</li>
              <li>发布有害、威胁、诽谤、骚扰、淫秽或其他不当内容</li>
              <li>冒充他人或实体</li>
              <li>干扰或破坏本应用的服务器或网络</li>
              <li>尝试未经授权访问本应用的任何部分</li>
              <li>使用自动化工具（爬虫、机器人等）访问本应用</li>
              <li>逆向工程或试图提取源代码</li>
              <li>传播病毒或恶意代码</li>
              <li> spam 或发送未经请求的商业通信</li>
            </ul>
          </section>

          {/* 知识产权 */}
          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">知识产权</h2>
            <p className="mb-3">
              本应用及其原始内容、功能和设计均为星际日记及其许可方的专有财产，
              受版权、商标和其他知识产权法律保护。
            </p>
            <p className="mb-3">
              您提交的内容（回答的问题、思考等）归您所有。您授予我们存储、处理和显示这些内容的权利，
              以便提供本应用服务。
            </p>
            <p className="text-space-400">
              您不得未经授权使用本应用的名称、标志或品牌材料。
            </p>
          </section>

          {/* 用户内容 */}
          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">用户内容</h2>
            <p className="mb-3">您对您在本应用中发布的内容负责。</p>
            <p className="mb-3">
              通过提交内容，您声明并保证：
            </p>
            <ul className="list-disc list-inside space-y-1 text-space-400">
              <li>您拥有该内容的所有权利</li>
              <li>该内容不侵犯任何第三方的权利</li>
              <li>该内容不违反任何法律或法规</li>
            </ul>
            <p className="mt-3 text-space-400">
              我们保留在不通知的情况下删除或限制访问任何内容（包括您的内容）的权利。
            </p>
          </section>

          {/* 免责声明 */}
          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">免责声明</h2>
            <p className="mb-3">本应用按"现状"和"可用"基础提供，不提供任何明示或暗示的保证。</p>
            <p className="mb-3">特别是，我们不保证：</p>
            <ul className="list-disc list-inside space-y-1 text-space-400">
              <li>服务将不间断、及时、安全或无错误</li>
              <li>从服务获得的信息将是准确的或可靠的</li>
              <li>服务的任何缺陷或错误将被更正</li>
            </ul>
            <p className="mt-3 text-space-400">
              您使用服务的风险由您自行承担。本应用生成的哲学问题仅供参考，
              不构成专业建议（医疗、心理、法律等）。
            </p>
          </section>

          {/* 责任限制 */}
          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">责任限制</h2>
            <p className="mb-3">
              在法律允许的最大范围内，星际日记及其董事、员工、合作伙伴、代理人、供应商或关联方
              不对以下任何情况承担责任：
            </p>
            <ul className="list-disc list-inside space-y-1 text-space-400">
              <li>间接、偶然、特殊、后果性或惩罚性损害</li>
              <li>使用或无法使用服务导致的损失</li>
              <li>未经授权访问或更改您的传输或数据</li>
              <li>第三方在服务上的任何行为或不作为</li>
            </ul>
          </section>

          {/* 服务终止 */}
          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">服务终止</h2>
            <p className="mb-3">
              我们可能随时因任何原因（包括但不限于违反这些条款）终止或暂停您的账户和服务访问权，
              而无需通知或承担责任。
            </p>
            <p className="text-space-400">
              您也可以随时停止使用服务并删除您的账户。
            </p>
          </section>

          {/* 条款变更 */}
          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">条款变更</h2>
            <p>
              我们保留随时修改这些条款的权利。修改后的条款将在本页面上发布，
              并在发布后立即生效。继续使用本应用即表示您接受修改后的条款。
            </p>
          </section>

          {/* 争议解决 */}
          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3 flex items-center gap-2">
              <Gavel size={20} />
              争议解决
            </h2>
            <p className="mb-3">
              如果您与星际日记之间发生任何争议，我们首先尝试通过友好协商解决。
            </p>
            <p className="text-space-400">
              如果协商不成，争议应提交至有管辖权的法院解决。
            </p>
          </section>

          {/* 其他条款 */}
          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">其他条款</h2>
            <p className="mb-3">
              这些条款构成您与星际日记之间关于使用本应用的完整协议。
            </p>
            <p className="mb-3">
              如果我们未能执行这些条款的任何权利或规定，这不构成对该权利的放弃。
            </p>
            <p>
              如果任何条款被认定为不可执行，该条款将被修改为可执行，
              而其余条款仍将完全有效。
            </p>
          </section>

          {/* 联系方式 */}
          <section>
            <h2 className="text-xl font-bold text-amber-400 mb-3">联系我们</h2>
            <p className="mb-2">
              如对这些服务条款有任何疑问，请通过以下方式联系我们：
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
