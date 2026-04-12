// ─── HelpModal.jsx ────────────────────────────────────────────────────────────
// Modal de ajuda com guia completo do Stellar Map
// Uso: <HelpModal lang={lang} onClose={() => setHelpOpen(false)} />
// ──────────────────────────────────────────────────────────────────────────────

// ── Conteúdo do guia por idioma ──────────────────────────────────────────────
const GUIDE = {

  // ── PT-BR ──────────────────────────────────────────────────────────────────
  "Português": {
    title: "📖 Guia · Stellar Map",
    sections: [
      {
        heading: "1. Como Usar",
        body: `Stellar Map foi criado para auxiliar os jogadores do Star Rail a calcular seus tiros, usando informações de versão, recompensas e modos de jogo presentes.`,
        items: [
          { label: "Criar Novo Mapa", text: "Permite criar um mapa de tiros customizado." },
          { label: "Carregar Mapas", text: "Carrega seus mapas salvos (é necessário ter uma conta para salvar). Você pode editá-los, exportá-los (JSON), renomeá-los, mudar posições e deletá-los." },
        ],
      },
      {
        heading: "2. Menu de Criação",
        items: [
          { label: "Modo Calendário", text: "Para cálculos mais precisos, permite escolher o período exato." },
          { label: "Duração da Versão", text: "Sem uso do calendário. Padrão: 42 dias." },
          { label: "Jades Diárias", text: "Quantidade recebida por completar missões diárias. Padrão: 60." },
          { label: "Jades/Passes Atuais na Conta", text: "Adicione o que já possui. Os passes são automaticamente convertidos e somados." },
          { label: "Passe de Suprimento", text: "Marque se já possui o passe. Se já usou e recebeu as recompensas, deixe desmarcado." },
        ],
      },
      {
        heading: "3. Edição de Mapa",
        items: [
          { label: "Passes & Fragmentos", text: "Marque as opções que já possui ou vai usar: Passe de Suprimentos, Conversão de Fragmentos Oníricos, Passe de Batalha (Glória dos Inominados) e Medalha dos Inominados." },
          { label: "Endgames", text: "MoC, Pura Ficção e Sombra Apocalíptica — com opção de recompensas por estrelas." },
          { label: "Universo Divergente", text: "Conta as semanas com reset nas segundas-feiras durante o período selecionado." },
          { label: "Reset Mensal & Teste de Personagens", text: "Passes comprados na loja e testes de personagens da versão." },
          { label: "Atualização de Conteúdo", text: "Jades de manutenção, aumento de nível, tiros adicionais (E6 = 1 Passe) e jades extras (Missão Principal, Modos Especiais, Exploração e Conquistas)." },
          { label: "Eventos & Aniversário", text: "Presente da Odisseia (10 tiros), recompensas de aniversário (em jades) e eventos customizados com suas jades." },
        ],
      },
      {
        heading: "4. Meta de Tiros",
        items: [
          { label: "Meta", text: "Coloque a quantidade de tiros que almeja. Exibe porcentagem, jades necessárias, tiros e jades excedentes." },
          { label: "Fim do Objetivo", text: "Define um prazo via calendário. Aparece na edição e em Carregar Mapas, mostrando quantos dias faltam." },
        ],
      },
      {
        heading: "5. Login / Cadastro",
        body: "Informe um usuário e senha para criar uma conta e salvar seus mapas na nuvem.",
      },
    ],
  },

  // ── English ────────────────────────────────────────────────────────────────
  "English": {
    title: "📖 Guide · Stellar Map",
    sections: [
      {
        heading: "1. How to Use",
        body: "Stellar Map helps Star Rail players calculate their pulls using version info, rewards, and current game modes.",
        items: [
          { label: "Create New Map", text: "Lets you build a custom pull map." },
          { label: "Load Maps", text: "Opens your saved maps (account required to save). You can edit, export (JSON), rename, reorder, and delete them." },
        ],
      },
      {
        heading: "2. Creation Menu",
        items: [
          { label: "Calendar Mode", text: "For more precise calculations, lets you pick an exact date range." },
          { label: "Version Duration", text: "Without calendar mode. Default: 42 days." },
          { label: "Daily Jade", text: "Amount earned by completing daily missions. Default: 60." },
          { label: "Current Jade / Passes", text: "Enter what you already have. Passes are automatically converted and added." },
          { label: "Supply Pass", text: "Check if you own the pass. If you already used it and claimed rewards, leave it unchecked." },
        ],
      },
      {
        heading: "3. Map Editing",
        items: [
          { label: "Passes & Shards", text: "Mark what you own or plan to use: Supply Pass, Oneiric Shard conversion, Nameless Glory Battle Pass, and Nameless Medal." },
          { label: "Endgames", text: "MoC, Pure Fiction, and Apocalyptic Shadow — with star-based reward options." },
          { label: "Divergent Universe", text: "Counts weeks with Monday resets during the selected period." },
          { label: "Monthly Reset & Trials", text: "Shop-purchased passes and character trials for the current version." },
          { label: "Content Update", text: "Maintenance Jade, level-up rewards, bonus pulls (E6 = 1 Pass), and extra Jade (Main Quest, Special Modes, Exploration, Achievements)." },
          { label: "Events & Anniversary", text: "Gift of Odyssey (10 pulls), anniversary rewards (in Jade), and custom events with their Jade amounts." },
        ],
      },
      {
        heading: "4. Pull Goal",
        items: [
          { label: "Goal", text: "Enter the number of pulls you're aiming for. Shows percentage, Jade needed, and surplus pulls/Jade." },
          { label: "Goal Deadline", text: "Set a calendar deadline. Shown in both the edit screen and Load Maps, displaying days remaining." },
        ],
      },
      {
        heading: "5. Login / Register",
        body: "Enter a username and password to create an account and save your maps to the cloud.",
      },
    ],
  },

  // ── 简体中文 ────────────────────────────────────────────────────────────────
  "简体中文": {
    title: "📖 指南 · Stellar Map",
    sections: [
      {
        heading: "1. 使用方法",
        body: "Stellar Map 旨在帮助《崩坏：星穹铁道》玩家利用版本信息、奖励内容和当前游戏模式计算抽数。",
        items: [
          { label: "创建新地图", text: "创建自定义抽数地图。" },
          { label: "加载地图", text: "加载已保存的地图（需要账号才能保存）。可编辑、导出（JSON）、重命名、调整顺序和删除。" },
        ],
      },
      {
        heading: "2. 创建菜单",
        items: [
          { label: "日历模式", text: "可设定精确日期范围，获得更准确的计算结果。" },
          { label: "版本时长", text: "不使用日历时的默认值：42天。" },
          { label: "每日星琼", text: "完成每日任务可获得的数量。默认：60。" },
          { label: "当前星琼 / 专票", text: "输入已拥有的数量。专票将自动换算并累计。" },
          { label: "列车补给凭证", text: "若已拥有请勾选。若已使用并领取奖励，请取消勾选。" },
        ],
      },
      {
        heading: "3. 地图编辑",
        items: [
          { label: "专票 & 古老梦华", text: "勾选您拥有或计划使用的内容：补给凭证、古老梦华兑换星琼、无名客的荣光·战令、无名客的奖章。" },
          { label: "常驻挑战", text: "混沌回忆、虚构叙事、末日幻影——支持按星级选择奖励。" },
          { label: "差分宇宙", text: "统计所选时段内每周一重置的次数。" },
          { label: "月度重置 & 角色试用", text: "商店购买的专票及本版本的角色试用次数。" },
          { label: "内容更新", text: "维护补偿星琼、升级奖励、额外抽数（E6=1张专票）及额外星琼（主线任务、特殊模式、地图探索、成就）。" },
          { label: "活动 & 周年纪念", text: "巡星之礼（10抽）、周年奖励（星琼）以及自定义活动星琼数量。" },
        ],
      },
      {
        heading: "4. 抽数目标",
        items: [
          { label: "目标", text: "输入目标抽数，显示完成百分比、所需星琼以及超额抽数/星琼。" },
          { label: "目标截止日期", text: "通过日历设置截止日期，在编辑页面和地图加载页均可显示剩余天数。" },
        ],
      },
      {
        heading: "5. 登录 / 注册",
        body: "输入用户名和密码创建账号，将您的地图保存至云端。",
      },
    ],
  },

  // ── 日本語 ──────────────────────────────────────────────────────────────────
  "日本語": {
    title: "📖 ガイド · Stellar Map",
    sections: [
      {
        heading: "1. 使い方",
        body: "Stellar Mapは『崩壊：スターレイル』プレイヤーが、バージョン情報・報酬・現行ゲームモードを活用して引き数を計算できるツールです。",
        items: [
          { label: "新しいマップを作成", text: "カスタム引きマップを作成します。" },
          { label: "マップを読み込む", text: "保存済みマップを読み込みます（保存にはアカウントが必要）。編集・エクスポート（JSON）・名前変更・並び替え・削除が可能です。" },
        ],
      },
      {
        heading: "2. 作成メニュー",
        items: [
          { label: "カレンダーモード", text: "正確な日付範囲を指定して、より精密な計算を行います。" },
          { label: "バージョン期間", text: "カレンダーを使用しない場合のデフォルト：42日。" },
          { label: "1日あたりの星玉", text: "デイリーミッション達成で得られる量。デフォルト：60。" },
          { label: "現在の星玉 / チケット", text: "現在持っている数量を入力してください。チケットは自動換算・合算されます。" },
          { label: "列車補給標章", text: "所持している場合はチェックを入れてください。すでに使用済みの場合はチェックを外してください。" },
        ],
      },
      {
        heading: "3. マップ編集",
        items: [
          { label: "チケット & 往日の夢華", text: "所持または使用予定のものにチェック：補給標章・往日の夢華換算・ナナシの栄光（バトルパス）・ナナシの勲章。" },
          { label: "エンドゲーム", text: "混沌の記憶・虚構叙事・末日の幻影 — 星レベルごとの報酬設定に対応。" },
          { label: "階差宇宙", text: "選択期間内の月曜日リセット回数を自動集計します。" },
          { label: "月次リセット & キャラクター試用", text: "ショップで購入したチケット数および本バージョンのキャラクター試用回数。" },
          { label: "コンテンツ更新", text: "メンテナンス補填星玉・レベルアップ報酬・追加引き数（E6=1チケット）・追加星玉（メインクエスト・特殊モード・探索・実績）。" },
          { label: "イベント & 記念日", text: "巡星の礼（10回）・周年記念報酬（星玉）・カスタムイベントの星玉設定。" },
        ],
      },
      {
        heading: "4. 引き目標",
        items: [
          { label: "目標", text: "目標引き数を入力。達成率・必要星玉・余剰引き数/星玉を表示します。" },
          { label: "目標期限", text: "カレンダーで締め切りを設定。編集画面とマップ読み込み画面に残り日数が表示されます。" },
        ],
      },
      {
        heading: "5. ログイン / アカウント作成",
        body: "ユーザー名とパスワードを入力してアカウントを作成し、マップをクラウドに保存してください。",
      },
    ],
  },

  // ── ภาษาไทย ────────────────────────────────────────────────────────────────
  "ภาษาไทย": {
    title: "📖 คู่มือ · Stellar Map",
    sections: [
      {
        heading: "1. วิธีใช้งาน",
        body: "Stellar Map สร้างขึ้นเพื่อช่วยผู้เล่น Star Rail คำนวณจำนวนโรลโดยใช้ข้อมูลเวอร์ชัน รางวัล และโหมดเกมปัจจุบัน",
        items: [
          { label: "สร้างแผนที่ใหม่", text: "สร้างแผนที่โรลที่กำหนดเองได้" },
          { label: "โหลดแผนที่", text: "โหลดแผนที่ที่บันทึกไว้ (ต้องมีบัญชีเพื่อบันทึก) สามารถแก้ไข ส่งออก (JSON) เปลี่ยนชื่อ เรียงลำดับ และลบได้" },
        ],
      },
      {
        heading: "2. เมนูสร้างแผนที่",
        items: [
          { label: "โหมดปฏิทิน", text: "กำหนดช่วงวันที่แน่นอนเพื่อการคำนวณที่แม่นยำยิ่งขึ้น" },
          { label: "ระยะเวลาเวอร์ชัน", text: "ค่าเริ่มต้นเมื่อไม่ใช้ปฏิทิน: 42 วัน" },
          { label: "Jade รายวัน", text: "จำนวนที่ได้รับจากการทำภารกิจรายวัน ค่าเริ่มต้น: 60" },
          { label: "Jade / พาสปัจจุบัน", text: "ป้อนจำนวนที่มีอยู่แล้ว พาสจะถูกแปลงและรวมอัตโนมัติ" },
          { label: "บัตรเสบียงรถไฟ", text: "ทำเครื่องหมายหากมีบัตร หากใช้และรับรางวัลแล้ว ให้ยกเลิกเครื่องหมาย" },
        ],
      },
      {
        heading: "3. การแก้ไขแผนที่",
        items: [
          { label: "พาส & Oneiric Shard", text: "ทำเครื่องหมายสิ่งที่มีหรือจะใช้: บัตรเสบียง, แปลง Shard เป็น Jade, Nameless Glory Battle Pass และ Nameless Medal" },
          { label: "โหมดท้าทาย (Endgame)", text: "Memory of Chaos, Pure Fiction และ Apocalyptic Shadow — พร้อมตัวเลือกรางวัลตามดาว" },
          { label: "จักรวาลต่างมิติ", text: "นับจำนวนสัปดาห์ที่มีการรีเซ็ตวันจันทร์ในช่วงเวลาที่เลือก" },
          { label: "รีเซ็ตรายเดือน & ทดลองตัวละคร", text: "พาสที่ซื้อในร้านค้าและการทดลองตัวละครในเวอร์ชันนี้" },
          { label: "อัปเดตเนื้อหา", text: "Jade บำรุงรักษา, รางวัลเลเวลอัป, โรลเพิ่มเติม (E6 = 1 พาส) และ Jade พิเศษ (เนื้อเรื่องหลัก, โหมดพิเศษ, สำรวจโลก, ความสำเร็จ)" },
          { label: "กิจกรรม & วันครบรอบ", text: "ของขวัญจากดวงดาว (10 โรล), รางวัลครบรอบ (เป็น Jade) และกิจกรรมที่กำหนดเองพร้อม Jade" },
        ],
      },
      {
        heading: "4. เป้าหมายการโรล",
        items: [
          { label: "เป้าหมาย", text: "ป้อนจำนวนโรลที่ต้องการ แสดงเปอร์เซ็นต์ Jade ที่ต้องการ และโรล/Jade ที่เกินมา" },
          { label: "กำหนดเส้นตาย", text: "ตั้งเส้นตายผ่านปฏิทิน แสดงในหน้าแก้ไขและ โหลดแผนที่ พร้อมจำนวนวันที่เหลือ" },
        ],
      },
      {
        heading: "5. เข้าสู่ระบบ / สมัครสมาชิก",
        body: "ป้อนชื่อผู้ใช้และรหัสผ่านเพื่อสร้างบัญชีและบันทึกแผนที่ของคุณไว้บนคลาวด์",
      },
    ],
  },

  // ── Español ────────────────────────────────────────────────────────────────
  "Español": {
    title: "📖 Guía · Stellar Map",
    sections: [
      {
        heading: "1. Cómo Usar",
        body: "Stellar Map fue creado para ayudar a los jugadores de Star Rail a calcular sus tiradas usando información de versión, recompensas y modos de juego actuales.",
        items: [
          { label: "Crear Nuevo Mapa", text: "Te permite crear un mapa de tiradas personalizado." },
          { label: "Cargar Mapas", text: "Carga tus mapas guardados (se necesita cuenta para guardar). Puedes editarlos, exportarlos (JSON), renombrarlos, cambiar el orden y eliminarlos." },
        ],
      },
      {
        heading: "2. Menú de Creación",
        items: [
          { label: "Modo Calendario", text: "Para cálculos más precisos, permite elegir el período exacto." },
          { label: "Duración de la Versión", text: "Sin el calendario, el valor predeterminado es 42 días." },
          { label: "Jade Diario", text: "Cantidad recibida al completar misiones diarias. Predeterminado: 60." },
          { label: "Jade / Pases Actuales", text: "Añade lo que ya tienes. Los pases se convierten y suman automáticamente." },
          { label: "Pase de Suministros", text: "Marca si ya tienes el pase. Si ya lo usaste y recibiste las recompensas, déjalo desmarcado." },
        ],
      },
      {
        heading: "3. Edición del Mapa",
        items: [
          { label: "Pases & Esquirlas", text: "Marca lo que tienes o usarás: Pase de Suministros, conversión de Esquirlas Oníricas, Nameless Glory Battle Pass y Nameless Medal." },
          { label: "Modos Permanentes", text: "Memoria del Caos, Pura Ficción y Sombra Apocalíptica — con opciones de recompensas por estrellas." },
          { label: "Universo Diferenciado", text: "Cuenta las semanas con reinicio los lunes durante el período seleccionado." },
          { label: "Reinicio Mensual & Pruebas", text: "Pases comprados en la tienda y pruebas de personajes de la versión." },
          { label: "Actualización de Contenido", text: "Jade de mantenimiento, recompensas de subida de nivel, tiradas adicionales (E6 = 1 Pase) y Jade extra (Misión Principal, Modos Especiales, Exploración y Logros)." },
          { label: "Eventos & Aniversario", text: "Presente del Cometa (10 tiradas), recompensas de aniversario (en Jade) y eventos personalizados con sus Jade." },
        ],
      },
      {
        heading: "4. Meta de Tiradas",
        items: [
          { label: "Meta", text: "Ingresa la cantidad de tiradas que buscas. Muestra porcentaje, Jade necesario y excedente de tiradas/Jade." },
          { label: "Fecha Límite", text: "Define un plazo mediante el calendario. Aparece en la pantalla de edición y en Cargar Mapas con los días restantes." },
        ],
      },
      {
        heading: "5. Iniciar Sesión / Registrarse",
        body: "Introduce un usuario y contraseña para crear una cuenta y guardar tus mapas en la nube.",
      },
    ],
  },
};

// ── Componente principal ─────────────────────────────────────────────────────
export const HelpModal = ({ lang, onClose }) => {
  const guide = GUIDE[lang] || GUIDE["Português"];

  // Fecha ao clicar no overlay
  const handleOverlay = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="help-overlay" onClick={handleOverlay}>
      <div className="help-modal" role="dialog" aria-modal="true" aria-label={guide.title}>

        {/* Cabeçalho */}
        <div className="help-modal-header">
          <span className="help-modal-title">{guide.title}</span>
          <button className="help-modal-close" onClick={onClose} aria-label="Fechar">✕</button>
        </div>

        {/* Conteúdo rolável */}
        <div className="help-modal-body">
          {guide.sections.map((sec, i) => (
            <div className="help-section" key={i}>
              <div className="help-section-heading">{sec.heading}</div>
              {sec.body && <p className="help-section-body">{sec.body}</p>}
              {sec.items && (
                <ul className="help-item-list">
                  {sec.items.map((item, j) => (
                    <li key={j} className="help-item">
                      <span className="help-item-label">{item.label}:</span>
                      <span className="help-item-text"> {item.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default HelpModal;