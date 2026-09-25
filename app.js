const initialData={members:[{id:1,name:'Nguyễn Văn An',role:'Kỹ sư hiện trường',hours:8,done:1,tasks:3,initials:'NA',active:false},{id:2,name:'Trần Minh Khoa',role:'Đội trưởng thi công',hours:8,done:2,tasks:3,initials:'TK',active:true,startedAt:Date.now()-2.1*3600000},{id:3,name:'Lê Thị Mai',role:'Giám sát chất lượng',hours:8,done:3,tasks:3,initials:'LM',active:false},{id:4,name:'Phạm Quốc Huy',role:'Thợ hoàn thiện',hours:7.5,done:1,tasks:2,initials:'PH',active:true,startedAt:Date.now()-1.4*3600000}],tasks:[{id:1,project:'Nhà phố Thảo Điền',phase:'01',phaseName:'Chuẩn bị mặt bằng',name:'Dọn dẹp và định vị công trình',assignee:'Nguyễn Văn An',expected:3,actual:2.5,status:'done'},{id:2,project:'Nhà phố Thảo Điền',phase:'02',phaseName:'Móng và nền',name:'Đào đất móng công trình',assignee:'Trần Minh Khoa',expected:8,actual:6.2,status:'doing'},{id:3,project:'Nhà phố Thảo Điền',phase:'02',phaseName:'Móng và nền',name:'Đổ bê tông lót móng',assignee:'Phạm Quốc Huy',expected:5,actual:5.8,status:'late'},{id:4,project:'Nhà phố Thảo Điền',phase:'03',phaseName:'Kết cấu tầng 1',name:'Lắp dựng cốt thép dầm sàn',assignee:'Trần Minh Khoa',expected:12,actual:0,status:'todo'},{id:5,project:'Văn phòng Riverside',phase:'01',phaseName:'Thiết kế và chuẩn bị',name:'Duyệt bản vẽ thi công',assignee:'Lê Thị Mai',expected:4,actual:3.5,status:'done'},{id:6,project:'Văn phòng Riverside',phase:'02',phaseName:'Thi công hoàn thiện',name:'Sơn nước khu vực sảnh',assignee:'Phạm Quốc Huy',expected:8,actual:7.2,status:'done'}]};
let data=JSON.parse(localStorage.getItem('buildflow-data'))||initialData;
const save=()=>localStorage.setItem('buildflow-data',JSON.stringify(data));
const fmtHours=n=>`${Number(n).toFixed(1).replace('.0','')}h`;
const statusLabel={done:'Hoàn thành',doing:'Đang thực hiện',late:'Trễ tiến độ',todo:'Chưa bắt đầu'};
function renderTeam(){const done=data.members.reduce((s,m)=>s+m.done,0), total=data.members.reduce((s,m)=>s+m.tasks,0), active=data.members.filter(m=>m.active).length;document.querySelector('#team-metrics').innerHTML=`<div class="metric"><div class="metric-label">NHÂN SỰ CÓ MẶT</div><div class="metric-value">${data.members.length} người</div><div class="metric-note positive">● Đủ nhân sự hôm nay</div></div><div class="metric"><div class="metric-label">GIỜ LÀM ĐÃ GHI NHẬN</div><div class="metric-value">${fmtHours(data.members.reduce((s,m)=>s+(m.active?m.hours*.55:m.hours),0))}</div><div class="metric-note">Mục tiêu ${data.members.reduce((s,m)=>s+m.hours,0)}h</div></div><div class="metric"><div class="metric-label">TASK ĐÃ HOÀN THÀNH</div><div class="metric-value">${done} / ${total}</div><div class="metric-note ${done/total>.7?'positive':'warning'}">${Math.round(done/total*100)}% tổng khối lượng</div></div><div class="metric"><div class="metric-label">ĐANG LÀM VIỆC</div><div class="metric-value">${active} người</div><div class="metric-note">Cập nhật theo thời gian thực</div></div>`;document.querySelector('#team-list').innerHTML=data.members.map(m=>{const percent=Math.round(m.done/m.tasks*100);return `<div class="person-row"><div class="person"><div class="avatar">${m.initials}</div><div><strong>${m.name}</strong><small>${m.role}</small></div></div><div class="hours"><strong>${fmtHours(m.hours)}</strong><small>mục tiêu hôm nay</small></div><div class="progress-wrap"><div class="progress-bar"><b style="width:${percent}%"></b></div><div class="progress-text">${m.done}/${m.tasks} task</div></div><button class="action-btn ${m.active?'end':''}" data-member="${m.id}">${m.active?'■ Kết thúc':'▶ Bắt đầu'}</button></div>`}).join('');document.querySelectorAll('[data-member]').forEach(btn=>btn.onclick=()=>toggleMember(Number(btn.dataset.member)));}
/* =====================================================================
   TRANG "TIẾN ĐỘ CÔNG VIỆC"
   Sắp xếp theo GIAI ĐOẠN trước (Giai đoạn 01, 02, 03...), trong mỗi giai đoạn
   mới liệt kê từng dự án và người đang làm — thay vì gộp theo dự án như cũ.
   Giai đoạn mới (05, 06...) tự động xuất hiện, không cần sửa code.
   ===================================================================== */
function renderTasks(){
  // (1) Danh sách dự án để đổ vào ô lọc "Tất cả dự án"
  const projects=[...new Set(data.tasks.map(t=>t.project))];
  const filter=document.querySelector('#project-filter');
  filter.innerHTML='<option value="all">Tất cả dự án</option>'+projects.map(p=>`<option ${filter.value===p?'selected':''}>${p}</option>`).join('');

  // (2) Lọc theo dự án đang chọn (hoặc lấy tất cả)
  const shown=filter.value==='all'?data.tasks:data.tasks.filter(t=>t.project===filter.value);
  const done=shown.filter(t=>t.status==='done').length, late=shown.filter(t=>t.status==='late').length;

  // (3) Bốn ô số liệu tổng quan đầu trang — giữ nguyên như bản cũ
  document.querySelector('#task-metrics').innerHTML=`<div class="metric"><div class="metric-label">TỔNG CÔNG VIỆC</div><div class="metric-value">${shown.length} task</div><div class="metric-note">Trong ${filter.value==='all'?projects.length:1} dự án</div></div><div class="metric"><div class="metric-label">HOÀN THÀNH</div><div class="metric-value">${done} task</div><div class="metric-note positive">${Math.round(done/shown.length*100)||0}% khối lượng</div></div><div class="metric"><div class="metric-label">GIỜ DỰ KIẾN</div><div class="metric-value">${fmtHours(shown.reduce((s,t)=>s+t.expected,0))}</div><div class="metric-note">Tổng kế hoạch</div></div><div class="metric"><div class="metric-label">CÓ NGUY CƠ TRỄ</div><div class="metric-value">${late} task</div><div class="metric-note ${late?'warning':'positive'}">${late?'Cần theo dõi':'Đang kiểm soát tốt'}</div></div>`;

  // (4) Gom việc theo SỐ GIAI ĐOẠN trước (01, 02, 03…), sắp xếp tăng dần.
  //     Số giai đoạn mới trong dữ liệu (05, 06…) sẽ tự có mặt ở đây, không cần sửa code.
  const phaseNums=[...new Set(shown.map(t=>t.phase))].sort((a,b)=>a.localeCompare(b,'vi',{numeric:true}));

  document.querySelector('#task-table').innerHTML=phaseNums.map(phase=>{
    // Trong một số giai đoạn, có thể nhiều dự án cùng ở giai đoạn đó nhưng tên giai đoạn khác nhau
    // (ví dụ GĐ 01 của công trình A là "Chuẩn bị mặt bằng", của công trình B là "Thiết kế và chuẩn bị").
    // Nên bên trong mỗi giai đoạn, ta chia tiếp theo từng (dự án + tên giai đoạn).
    const rowsInPhase=shown.filter(t=>t.phase===phase);
    const groups=[...new Set(rowsInPhase.map(t=>t.project+'|'+t.phaseName))];

    const groupsHtml=groups.map(key=>{
      const [project,phaseName]=key.split('|');
      const rows=rowsInPhase.filter(t=>t.project===project&&t.phaseName===phaseName);
      return `<div class="phase-project">
          <div class="phase-project-head"><strong>${project}</strong><small>${phaseName}</small></div>
          ${rows.map(t=>`<div class="task-row"><div class="task-name"><strong>${t.name}</strong><small>${t.assignee}</small></div><div class="task-assignee">${t.assignee}</div><div class="task-time"><strong>${t.actual?fmtHours(t.actual):'—'} / ${fmtHours(t.expected)}</strong><small>thực tế / dự kiến</small></div><span class="status ${t.status==='done'?'green':t.status==='late'?'red':t.status==='doing'?'amber':''}">${statusLabel[t.status]}</span></div>`).join('')}
        </div>`;
    }).join('');

    return `<div class="phase">
        <div class="phase-head"><div class="phase-name"><span>GIAI ĐOẠN ${phase}</span></div><div class="phase-meta">${rowsInPhase.length} công việc · ${groups.length} dự án</div></div>
        ${groupsHtml}
      </div>`;
  }).join('')||'<div class="employee-empty">Bạn chưa được giao công việc nào.</div>';

  filter.onchange=renderTasks;
}

function renderReports(){const projects=[...new Set(data.tasks.map(t=>t.project))];const completed=data.tasks.filter(t=>t.status==='done');const totalExpected=data.tasks.reduce((s,t)=>s+t.expected,0), totalActual=completed.reduce((s,t)=>s+t.actual,0);document.querySelector('#report-metrics').innerHTML=`<div class="metric"><div class="metric-label">DỰ ÁN ĐANG THEO DÕI</div><div class="metric-value">${projects.length}</div><div class="metric-note">Tất cả đang triển khai</div></div><div class="metric"><div class="metric-label">TIẾN ĐỘ TOÀN BỘ</div><div class="metric-value">${Math.round(completed.length/data.tasks.length*100)}%</div><div class="metric-note positive">${completed.length}/${data.tasks.length} task hoàn thành</div></div><div class="metric"><div class="metric-label">GIỜ ĐÃ HOÀN THÀNH</div><div class="metric-value">${fmtHours(totalActual)}</div><div class="metric-note">Dự kiến ${fmtHours(totalExpected)}</div></div><div class="metric"><div class="metric-label">CHÊNH LỆCH</div><div class="metric-value">${fmtHours(Math.abs(totalActual-totalExpected))}</div><div class="metric-note ${totalActual<=totalExpected?'positive':'warning'}">${totalActual<=totalExpected?'Ít hơn':'Nhiều hơn'} so với kế hoạch</div></div>`;document.querySelector('#project-report').innerHTML=projects.map(p=>{const ts=data.tasks.filter(t=>t.project===p), c=ts.filter(t=>t.status==='done'), expected=ts.reduce((s,t)=>s+t.expected,0), actual=c.reduce((s,t)=>s+t.actual,0), pct=Math.round(c.length/ts.length*100);return `<div class="report-line"><div class="report-line-top"><strong>${p}</strong><small>${c.length}/${ts.length} task</small></div><div class="report-bar"><b style="width:${pct}%"></b></div><div class="report-detail"><span>${pct}% hoàn thành</span><span class="${actual<=expected?'good':'late'}">${actual<=expected?'Sớm':'Trễ'} ${fmtHours(Math.abs(actual-expected))}</span></div></div>`}).join('');const memberStats=data.members.map(m=>{const ts=data.tasks.filter(t=>t.assignee===m.name),c=ts.filter(t=>t.status==='done');return {...m,count:c.length,expected:ts.reduce((s,t)=>s+t.expected,0),actual:c.reduce((s,t)=>s+t.actual,0)}});document.querySelector('#member-report').innerHTML=memberStats.map(m=>`<div class="report-line"><div class="report-line-top"><strong>${m.name}</strong><small>${m.count} task hoàn thành</small></div><div class="report-bar"><b style="width:${Math.min(100,m.count/3*100)}%"></b></div><div class="report-detail"><span>${m.actual?fmtHours(m.actual):'0h'} thực tế</span><span class="${m.actual<=m.expected?'good':'late'}">Kế hoạch ${fmtHours(m.expected)}</span></div></div>`).join('');}
function toggleMember(id){const m=data.members.find(x=>x.id===id);m.active=!m.active;if(m.active)m.startedAt=Date.now();save();renderTeam();showToast(m.active?`Đã bắt đầu ca làm của ${m.name}`:`Đã kết thúc ca làm của ${m.name}`);}
function showToast(text){const toast=document.querySelector('#toast');toast.textContent=text;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2400)}
function render(view='team'){document.querySelectorAll('.view').forEach(x=>x.classList.remove('active-view'));document.querySelector(`#view-${view}`).classList.add('active-view');document.querySelectorAll('.nav-item').forEach(x=>x.classList.toggle('active',x.dataset.view===view));document.querySelector('#page-title').textContent={team:'Nhân sự',employees:'Quản lý nhân viên',tasks:'Tiến độ công việc',reports:'Tổng quan dự án'}[view];if(view==='team')renderTeam();if(view==='tasks')renderTasks();if(view==='reports')renderReports();}
document.querySelectorAll('.nav-item').forEach(btn=>btn.onclick=()=>render(btn.dataset.view));document.querySelector('#reset-data').onclick=()=>{data=JSON.parse(JSON.stringify(initialData));save();render('team');showToast('Đã khôi phục dữ liệu mẫu');};render();

/* ===== Phân công thông minh, quỹ giờ, thưởng & cảnh báo (chạy sau khi index.html nạp xong) ===== */
document.addEventListener('DOMContentLoaded',()=>{
(()=>{
const LK='buildflow-ledger',T=()=>selectedDate,$=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const SKILLS=['Chuẩn bị','Thi công thô','Cốt thép','Hoàn thiện','Giám sát'];
const W={time:.4,skill:.4,team:.2};              // trọng số chấm điểm gợi ý
const TIERS=[[30,50],[20,35],[10,20]];            // [% giờ tiết kiệm tối thiểu, % giờ tiết kiệm quy đổi thành giờ thưởng] — mặc định tạm, chỉnh trực tiếp ở màn hình Thưởng & cảnh báo
const WARN=.9, OT_MAX=2;
const seed=()=>({
  budgets:{'Nhà phố Thảo Điền':16,'Văn phòng Riverside':12},
  skills:{'Nguyễn Văn An':['Chuẩn bị','Thi công thô'],'Trần Minh Khoa':['Thi công thô','Cốt thép'],'Lê Thị Mai':['Giám sát'],'Phạm Quốc Huy':['Hoàn thiện','Thi công thô']},
  teams:{'Nguyễn Văn An':['Nhà phố Thảo Điền'],'Trần Minh Khoa':['Nhà phố Thảo Điền'],'Lê Thị Mai':['Văn phòng Riverside'],'Phạm Quốc Huy':['Nhà phố Thảo Điền','Văn phòng Riverside']},
  logs:[{d:'2026-09-23',p:'Nhà phố Thảo Điền',m:'Nguyễn Văn An',h:2.5,k:'Chuẩn bị',e:3},{d:'2026-09-23',p:'Nhà phố Thảo Điền',m:'Trần Minh Khoa',h:6.2,k:'Thi công thô'},{d:'2026-09-23',p:'Nhà phố Thảo Điền',m:'Phạm Quốc Huy',h:5.8,k:'Thi công thô'},{d:'2026-09-13',p:'Văn phòng Riverside',m:'Lê Thị Mai',h:3.5,k:'Giám sát',e:4},{d:'2026-09-20',p:'Văn phòng Riverside',m:'Phạm Quốc Huy',h:7.2,k:'Hoàn thiện',e:8}],
  ot:{},offers:[],reported:{},auto:false,tiers:TIERS.map(x=>[...x]),managers:{'Nhà phố Thảo Điền':'Trần Minh Khoa','Văn phòng Riverside':'Lê Thị Mai'}});
let L={...seed(),...JSON.parse(localStorage.getItem(LK)||'{}')}; // bổ sung khóa mới cho dữ liệu đã lưu
const put=()=>localStorage.setItem(LK,JSON.stringify(L));
const toast=t=>showToast(t);

/* ---------- Quỹ giờ trong ngày ---------- */
const mine=m=>data.tasks.filter(t=>t.assignee===m.name);
const load=m=>mine(m).reduce((s,t)=>s+(t.status==='done'?t.actual:t.expected),0); // xong sớm => chỉ tính giờ thực tế
const otOf=m=>L.ot[T()+'|'+m.name]||0;
const free=m=>m.hours+otOf(m)-load(m);
const allDone=m=>mine(m).every(t=>t.status==='done');

/* ---------- Chấm điểm gợi ý ---------- */
const score=(m,p)=>{
  const f=free(m),t=Math.max(0,Math.min(1,f/p.expected)),has=(L.skills[m.name]||[]).includes(p.skill),
    n=L.logs.filter(x=>x.m===m.name&&x.k===p.skill).length,s=has?.5+.5*Math.min(1,n/2):0,
    team=(L.teams[m.name]||[]).includes(p.project);
  return {m,f,n,has,team,pct:Math.round((W.time*t+W.skill*s+W.team*(team?1:0))*(has?1:.5)*100)}; // thiếu kỹ năng => điểm giảm một nửa
};
let pend=null,pendTop=[];

/* ---------- Thống kê công trình ---------- */
const pstat=p=>{
  const used=L.logs.filter(x=>x.p===p).reduce((s,x)=>s+x.h,0),budget=L.budgets[p]||0,ts=data.tasks.filter(t=>t.project===p),
    done=ts.length>0&&ts.every(t=>t.status==='done'),saved=Math.max(0,budget-used),sp=budget?saved/budget*100:0,tier=[...L.tiers].sort((a,b)=>b[0]-a[0]).find(([min])=>sp>=min);
  return {p,used,budget,pct:budget?used/budget:0,done,saved,sp,tier,bonus:done&&tier?saved*tier[1]/100:0};
};
const projs=()=>[...new Set([...Object.keys(L.budgets),...data.tasks.map(t=>t.project)])];
/* Đội dự án: giờ công từng người, hiệu suất (dự kiến/thực tế, kẹp 80–120%) và tỷ trọng chia thưởng = giờ × hiệu suất */
const pteam=(p,pre)=>{const by={};Object.keys(L.teams).filter(n=>L.teams[n].includes(p)).forEach(n=>by[n]={m:n,h:0,hp:0,e:0,he:0});
  L.logs.filter(x=>x.p===p).forEach(x=>{const o=by[x.m]||(by[x.m]={m:x.m,h:0,hp:0,e:0,he:0});o.h+=x.h;if(x.d.startsWith(pre))o.hp+=x.h;if(x.e){o.e+=x.e;o.he+=x.h}});
  const rows=Object.values(by).map(o=>({...o,eff:o.he?Math.min(1.2,Math.max(.8,o.e/o.he)):1})),tot=rows.reduce((s,o)=>s+o.h*o.eff,0);
  rows.forEach(o=>o.share=tot?o.h*o.eff/tot:0);return rows.sort((a,b)=>b.share-a.share)};
const alerts=()=>Object.keys(L.budgets).map(pstat).filter(s=>s.budget&&(s.pct>1||(!s.done&&s.pct>=WARN)));

/* ---------- Giao diện ---------- */
$('#view-assign').innerHTML=`<div class="hero-row"><p class="intro">Nhập công việc mới, hệ thống chấm điểm nhân sự theo giờ dư, kỹ năng và team dự án.</p></div>
<form id="sg-form" class="task-form"><div class="form-heading"><div><h2>Tạo công việc mới</h2><p>Điểm = 40% giờ dư + 40% kỹ năng/lịch sử + 20% cùng team dự án.</p></div><button class="action-btn" type="submit">✦ Gợi ý nhân sự</button></div>
<div class="form-grid"><label>Dự án<select id="sg-project"></select></label><label>Tên công việc<input id="sg-name" required placeholder="Ví dụ: Tô tường tầng 2"></label><label>Nhóm kỹ năng<select id="sg-skill">${SKILLS.map(s=>`<option>${s}</option>`).join('')}</select></label><label>Số giờ dự kiến<input id="sg-hours" type="number" min="0.5" step="0.5" value="3" required></label><label class="sg-check"><input id="sg-auto" type="checkbox"> Tự động phân phối (gán cho người điểm cao nhất)</label></div></form>
<div id="sg-box" class="sg-box"></div>
<div class="section-heading sub"><div><h2>Quỹ giờ hôm nay</h2><p>Xong hết việc còn dư giờ có thể đăng ký thêm tối đa ${OT_MAX}h.</p></div></div><div id="cap-list"></div>
<div class="section-heading sub"><div><h2>Việc đang mở</h2><p>Xác nhận hoàn thành và nhập giờ thực tế.</p></div></div><div id="open-list"></div>
<div class="section-heading sub"><div><h2>Đề xuất chờ nhân viên phản hồi</h2><p>Mô phỏng thông báo “Bạn có muốn nhận task này không?”.</p></div></div><div id="offer-list"></div>`;
$('#view-bonus').innerHTML=`<div class="hero-row"><p class="intro">Theo dõi giờ công theo ngày/tháng/năm để tính thưởng; cảnh báo khi công trình sắp hoặc đã vượt giờ.</p><select class="select-control" id="bn-period"><option value="day">Theo ngày</option><option value="month">Theo tháng</option><option value="year">Theo năm</option></select></div>
<div id="bn-metrics" class="metric-grid"></div><div class="report-grid"><div class="panel"><div class="panel-title"><div><h2>Giờ công theo công trình</h2><p>Ngân sách giờ so với thực tế và thưởng hoàn thành sớm.</p></div></div><div id="bn-projects"></div></div><div class="panel"><div class="panel-title"><div><h2>Giờ công nhân sự</h2><p>Trong kỳ đang chọn — cơ sở tính thưởng Tết/năm.</p></div></div><div id="bn-members"></div></div></div><div id="bn-detail" class="sub"></div><div id="bn-rules" class="panel sub"></div>`;

function rAlerts(){
  let bar=$('#alert-bar');if(!bar){bar=document.createElement('div');bar.id='alert-bar';$('.topbar').after(bar)}
  bar.innerHTML=alerts().map(s=>`<div class="alert ${s.pct>1?'over':'warn'}"><span><b>${esc(s.p)}</b>${L.managers[s.p]?` (QL ${esc(L.managers[s.p])})`:''}: ${s.pct>1?'ĐÃ VƯỢT':'sắp hết'} ngân sách giờ (${fmtHours(s.used)}/${fmtHours(s.budget)} — ${Math.round(s.pct*100)}%)${s.done?'':', chưa hoàn thành'}.</span>${L.reported[s.p]?`<small>Đã báo công ty ${L.reported[s.p]}</small>`:`<button class="action-btn" data-report="${esc(s.p)}">Báo công ty</button>`}</div>`).join('');
}
function rAssign(){
  const ps=[...new Set([...Object.keys(L.budgets),...data.tasks.map(t=>t.project)])],sel=$('#sg-project'),v=sel.value;
  sel.innerHTML=ps.map(p=>`<option>${esc(p)}</option>`).join('');if(ps.includes(v))sel.value=v;
  $('#sg-auto').checked=L.auto;
  $('#cap-list').innerHTML=data.members.map(m=>{const f=free(m),ot=otOf(m);return `<div class="cap-row"><div><strong>${esc(m.name)}</strong><small>${esc((L.skills[m.name]||[]).join(', ')||'Chưa khai báo kỹ năng')}</small></div><div><strong class="${f<0?'neg':''}">${f<0?'Quá tải '+fmtHours(-f):'Còn dư '+fmtHours(f)}</strong><small>Quỹ ${fmtHours(m.hours+ot)}${ot?` (gồm +${fmtHours(ot)} đăng ký thêm)`:''}</small></div>${allDone(m)&&ot<OT_MAX?`<button class="action-btn" data-ot="${esc(m.name)}">＋ Đăng ký thêm ${fmtHours(OT_MAX-ot)}</button>`:'<span></span>'}</div>`}).join('');
  const open=data.tasks.filter(t=>t.status!=='done');
  $('#open-list').innerHTML=open.length?open.map(t=>`<div class="cap-row"><div><strong>${esc(t.name)}</strong><small>${esc(t.project)} · ${esc(t.assignee)}</small></div><div><strong>${fmtHours(t.expected)}</strong><small>dự kiến</small></div><button class="action-btn" data-done="${t.id}">✓ Hoàn thành</button></div>`).join(''):'<div class="employee-empty">Không còn việc đang mở.</div>';
  $('#offer-list').innerHTML=L.offers.length?L.offers.map((o,i)=>`<div class="cap-row"><div><strong>${esc(o.task.name)}</strong><small>Gửi tới ${esc(o.member)} · ${fmtHours(o.task.expected)} · ${esc(o.task.project)}</small></div><span></span><span><button class="action-btn" data-accept="${i}">Nhận</button> <button class="outline-btn" data-reject="${i}">Từ chối</button></span></div>`).join(''):'<div class="employee-empty">Chưa có đề xuất nào.</div>';
}
function rDetail(){
  const per=$('#bn-period').value,pre=per==='day'?T():per==='month'?T().slice(0,7):T().slice(0,4),names=['',...data.members.map(m=>m.name)];
  $('#bn-detail').innerHTML=`<div class="section-heading"><div><h2>Chi tiết công theo dự án</h2><p>Quản lý dự án, số người và công (giờ) đã chi. Thưởng chia cho cả đội theo giờ đóng góp × hiệu suất.</p></div></div>`+projs().map(p=>{const s=pstat(p),rows=pteam(p,pre),hp=rows.reduce((a,o)=>a+o.hp,0);
    return `<div class="panel" style="margin-bottom:12px"><div class="panel-title"><div><h2>${esc(p)}</h2><p>${rows.length} người · ${fmtHours(s.used)} công tổng${s.budget?' / '+fmtHours(s.budget)+' ngân sách':''} · ${fmtHours(hp)} công trong kỳ</p></div><label style="font-size:11px;color:var(--muted)">Quản lý dự án <select class="select-control" data-mgr="${esc(p)}">${names.map(n=>`<option value="${esc(n)}" ${L.managers[p]===n?'selected':''}>${esc(n||'— Chưa chọn —')}</option>`).join('')}</select></label></div>${rows.length?rows.map(o=>`<div class="cap-row"><div><strong>${esc(o.m)}${o.m===L.managers[p]?' ★ QL':''}</strong><small>${fmtHours(o.h)} công · ${fmtHours(o.hp)} trong kỳ</small></div><div><strong>Hiệu suất ${Math.round(o.eff*100)}%</strong><small>Tỷ trọng thưởng ${Math.round(o.share*100)}%</small></div><strong>${s.bonus?'+'+fmtHours(o.share*s.bonus)+' thưởng':'—'}</strong></div>`).join(''):'<div class="employee-empty">Chưa có ai ghi công cho dự án này.</div>'}${s.done?'':'<small style="color:var(--muted)">Thưởng chia khi công trình hoàn thành và đạt bậc tiết kiệm.</small>'}</div>`}).join('');
  $('#bn-rules').innerHTML=`<div class="panel-title"><div><h2>Quy định thưởng &amp; ngân sách giờ</h2><p>Chưa có quy định chính thức? Giữ mặc định, chỉnh khi có số liệu thật.</p></div></div>`+L.tiers.map((t,i)=>`<div class="cap-row"><div><strong>Bậc ${i+1}</strong><small>Tiết kiệm đạt ngưỡng thì cả đội nhận % giờ tiết kiệm</small></div><label>Tiết kiệm ≥ <input type="number" min="0" style="width:64px" data-tier="${i}:0" value="${t[0]}"> %</label><label>Thưởng <input type="number" min="0" style="width:64px" data-tier="${i}:1" value="${t[1]}"> %</label></div>`).join('')+projs().map(p=>`<div class="cap-row"><div><strong>${esc(p)}</strong><small>Ngân sách giờ</small></div><label><input type="number" min="0" step="0.5" style="width:80px" data-bud="${esc(p)}" value="${L.budgets[p]||''}"> giờ</label><span></span></div>`).join('');
}
function rBonus(){rBonus0();rDetail()}
function rBonus0(){
  const per=$('#bn-period').value,pre=per==='day'?T():per==='month'?T().slice(0,7):T().slice(0,4),ls=L.logs.filter(x=>x.d.startsWith(pre)),by={};
  ls.forEach(x=>by[x.m]=(by[x.m]||0)+x.h);
  const ss=Object.keys(L.budgets).map(pstat),bonus=ss.reduce((s,x)=>s+x.bonus,0);
  $('#bn-metrics').innerHTML=`<div class="metric"><div class="metric-label">GIỜ CÔNG TRONG KỲ</div><div class="metric-value">${fmtHours(ls.reduce((s,x)=>s+x.h,0))}</div><div class="metric-note">${{day:'Ngày',month:'Tháng',year:'Năm'}[per]} ${esc(pre)}</div></div><div class="metric"><div class="metric-label">CÔNG TRÌNH CẢNH BÁO</div><div class="metric-value">${alerts().length}</div><div class="metric-note ${alerts().length?'warning':'positive'}">${alerts().length?'Cần báo công ty':'Trong tầm kiểm soát'}</div></div><div class="metric"><div class="metric-label">CÔNG TRÌNH XONG SỚM</div><div class="metric-value">${ss.filter(x=>x.done&&x.saved>0).length}</div><div class="metric-note">Tiết kiệm ${fmtHours(ss.filter(x=>x.done).reduce((s,x)=>s+x.saved,0))}</div></div><div class="metric"><div class="metric-label">GIỜ THƯỞNG QUY ĐỔI</div><div class="metric-value">${fmtHours(bonus)}</div><div class="metric-note">Theo bậc thang (tạm)</div></div>`;
  $('#bn-projects').innerHTML=ss.map(s=>{const c=s.pct>1?'var(--red)':s.pct>=WARN&&!s.done?'var(--amber)':'var(--green)';return `<div class="report-line"><div class="report-line-top"><strong>${esc(s.p)}</strong><small>${fmtHours(s.used)} / ${fmtHours(s.budget)}</small></div><div class="report-bar"><b style="width:${Math.min(100,s.pct*100)}%;background:${c}"></b></div><div class="report-detail"><span>${Math.round(s.pct*100)}% ngân sách giờ${s.done?' · Đã hoàn thành':''}</span><span class="${s.pct>1?'late':'good'}">${s.pct>1?'Vượt '+fmtHours(s.used-s.budget):s.done?(s.tier?`Tiết kiệm ${Math.round(s.sp)}% → thưởng ${fmtHours(s.bonus)}`:`Tiết kiệm ${Math.round(s.sp)}% (chưa đủ bậc)`):'Còn '+fmtHours(s.saved)}</span></div></div>`}).join('');
  $('#bn-members').innerHTML=Object.keys(by).length?Object.entries(by).sort((a,b)=>b[1]-a[1]).map(([n,h])=>`<div class="report-line"><div class="report-line-top"><strong>${esc(n)}</strong><small>${fmtHours(h)}</small></div><div class="report-detail"><span>${ls.filter(x=>x.m===n).length} lượt ghi nhận</span></div></div>`).join(''):'<div class="employee-empty">Chưa có giờ công trong kỳ này.</div>';
}
const refresh=()=>{rAlerts();rOffers();if($('#view-team').classList.contains('active-view'))renderTeam();if($('#view-assign').classList.contains('active-view'))rAssign();if($('#view-bonus').classList.contains('active-view'))rBonus();if($('#view-me').classList.contains('active-view'))rMe()};

/* ---------- Hành động ---------- */
const give=(p,name)=>{data.tasks.push({id:Date.now()+Math.random(),project:p.project,phase:'99',phaseName:'Phát sinh',name:p.name,assignee:name,expected:p.expected,actual:0,status:'todo',skill:p.skill});saveCurrentDate();put();toast(`Đã giao “${p.name}” cho ${name}`)};
$('#sg-form').addEventListener('submit',e=>{
  e.preventDefault();L.auto=$('#sg-auto').checked;
  pend={project:$('#sg-project').value,name:$('#sg-name').value.trim(),skill:$('#sg-skill').value,expected:Number($('#sg-hours').value)};
  pendTop=data.members.map(m=>score(m,pend)).sort((a,b)=>b.pct-a.pct).slice(0,3);put();
  if(L.auto&&pendTop[0]&&pendTop[0].pct>0){give(pend,pendTop[0].m.name);$('#sg-box').innerHTML='';pend=null;e.target.reset();refresh();return}
  $('#sg-box').innerHTML=`<div class="panel"><div class="panel-title"><div><h2>Top ${pendTop.length} gợi ý cho “${esc(pend.name)}”</h2><p>${esc(pend.project)} · ${esc(pend.skill)} · ${fmtHours(pend.expected)}</p></div></div>${pendTop.map((r,i)=>`<div class="cap-row"><div><strong>${esc(r.m.name)}</strong><small>${r.f>0?'Còn dư '+fmtHours(r.f)+' hôm nay':'Hết quỹ giờ'} | ${r.has?`Đã làm ${r.n} task tương tự`:'Chưa có kỹ năng phù hợp'} | ${r.team?'Cùng team dự án':'Khác team'}</small></div><div><strong>Phù hợp ${r.pct}%</strong></div><span><button class="action-btn" data-pick="${i}">Giao việc</button> <button class="outline-btn" data-offer="${i}">Gửi đề xuất</button></span></div>`).join('')}</div>`;
});
document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;const d=b.dataset;
  if(d.pick!==undefined){give(pend,pendTop[d.pick].m.name);$('#sg-box').innerHTML='';pend=null;$('#sg-form').reset()}
  else if(d.offer!==undefined){L.offers.push({task:{...pend},member:pendTop[d.offer].m.name});put();logA('edit','Gửi đề xuất giao việc',`“${pend.name}” → ${pendTop[d.offer].m.name}`);$('#sg-box').innerHTML='';toast(`Đã gửi đề xuất tới ${pendTop[d.offer].m.name}`)}
  else if(d.accept!==undefined){const o=L.offers.splice(d.accept,1)[0];give(o.task,o.member)}
  else if(d.reject!==undefined){{const o=L.offers[d.reject];if(o)logA('edit','Từ chối đề xuất',`${o.member}: “${o.task.name}”`)}L.offers.splice(d.reject,1);put();toast('Nhân viên đã từ chối, hãy chọn người khác')}
  else if(d.ot){const k=T()+'|'+d.ot;L.ot[k]=Math.min(OT_MAX,(L.ot[k]||0)+OT_MAX);put();logA('edit','Đăng ký thêm giờ',`${d.ot} +${OT_MAX}h`);toast(`${d.ot} đăng ký thêm ${OT_MAX}h`)}
  else if(d.done){const t=data.tasks.find(x=>x.id==d.done),cm0=data.members.find(x=>x.name===t.assignee);if(cm0&&cm0.active&&cm0.currentTask===t.id)commit(cm0);const v=prompt(`Giờ thực tế đã làm cho “${t.name}” (dự kiến ${t.expected}h):`,t.actual?Number(t.actual.toFixed(1)):t.expected);if(v===null||isNaN(v)||v==='')return;
    t.actual=Number(v);t.status='done';{const cm=data.members.find(x=>x.name===t.assignee);if(cm&&cm.currentTask===t.id)cm.currentTask=null}L.logs.push({d:T(),p:t.project,m:t.assignee,h:t.actual,k:t.skill||'',e:t.expected});const m=data.members.find(x=>x.name===t.assignee);if(m){m.done++;m.tasks=Math.max(m.tasks,m.done)}
    saveCurrentDate();put();toast(t.actual<t.expected?`Xong sớm ${fmtHours(t.expected-t.actual)} — giờ dư dùng cho việc tiếp theo`:'Đã ghi nhận hoàn thành')}
  else if(d.report){L.reported[d.report]=T();put();logA('edit','Báo công ty vượt giờ',d.report);toast('Đã gửi thông báo cho công ty')}
  else return;
  refresh();
});
$('#bn-period').onchange=rBonus;
document.addEventListener('change',e=>{const t=e.target,d=t.dataset;
  // Người không có quyền 'settings' không được sửa ngân sách / bậc thưởng / quản lý dự án
  if((d.mgr!==undefined||d.bud!==undefined||d.tier)&&!can('settings')){toast('Bạn không có quyền sửa mục này');refresh();return}
  if(d.mgr!==undefined){logA('setting','Đổi quản lý dự án',`${d.mgr}: ${L.managers[d.mgr]||'—'} → ${t.value||'—'}`);L.managers[d.mgr]=t.value}
  else if(d.bud!==undefined){logA('setting','Sửa ngân sách giờ',`${d.bud}: ${L.budgets[d.bud]||0}h → ${Number(t.value)||0}h`);L.budgets[d.bud]=Math.max(0,Number(t.value)||0)}
  else if(d.tier){const[i,f]=d.tier.split(':');logA('setting','Sửa bậc thưởng',`Bậc ${+i+1} ${f==='0'?'ngưỡng tiết kiệm':'% thưởng'}: ${L.tiers[i][f]} → ${Number(t.value)||0}`);L.tiers[i][f]=Math.max(0,Number(t.value)||0)}
  else return;put();refresh();toast('Đã lưu thay đổi')});
const rr=$('#reset-data'),ro=rr.onclick;rr.onclick=()=>{skipDiff=true;logA('delete','Đặt lại dữ liệu mẫu');L=seed();put();ro();refresh()};
const prev=render,titles={assign:'Phân công thông minh',bonus:'Thưởng & cảnh báo'};
render=v=>{prev(v);if(titles[v])$('#page-title').textContent=titles[v];if(v==='assign')rAssign();if(v==='bonus')rBonus();rAlerts()};
/* ---- Giờ làm thực tế: cộng dồn khi kết thúc ca, chạy trực tiếp khi đang làm ---- */
const hms=h=>{const t=Math.round(h*3600),H=Math.floor(t/3600),M=Math.floor(t%3600/60),S=t%60;return H?`${H}h${String(M).padStart(2,'0')}p`:`${M}p${String(S).padStart(2,'0')}s`};
const worked=m=>(m.worked||0)+(m.active&&m.startedAt?Math.max(0,(Date.now()-m.startedAt)/3600000):0);
const paintWorked=()=>{
  const cards=document.querySelectorAll('#team-metrics .metric');
  if(cards[1]){cards[1].querySelector('.metric-value').textContent=hms(data.members.reduce((s,m)=>s+worked(m),0));cards[1].querySelector('.metric-note').textContent=`Mục tiêu ${fmtHours(data.members.reduce((s,m)=>s+m.hours,0))}`}
  if(cards[3]){const p=data.members.filter(m=>m.paused).length;cards[3].querySelector('.metric-note').textContent=p?`${p} người đang tạm dừng`:'Cập nhật theo thời gian thực'}
  document.querySelectorAll('[data-live]').forEach(el=>{const m=data.members.find(x=>x.id===Number(el.dataset.live));if(m)el.textContent=hms(worked(m))});
};
const tmOld=toggleMember;
toggleMember=id=>{const m=data.members.find(x=>x.id===id);if(m&&m.active&&m.startedAt)m.worked=(m.worked||0)+(Date.now()-m.startedAt)/3600000; // kết thúc ca => lưu giờ đã làm
  tmOld(id);saveCurrentDate()};
const rtOld=renderTeam;
renderTeam=()=>{rtOld();document.querySelectorAll('.person-row').forEach(row=>{const b=row.querySelector('[data-member]'),sm=row.querySelector('.hours small');if(b&&sm)sm.innerHTML=`mục tiêu · đã làm <b data-live="${b.dataset.member}"></b>`});paintWorked()};
setInterval(()=>{if($('#view-team').classList.contains('active-view'))paintWorked()},1000);
/* ---- Đồng hồ giờ hệ thống ở góc phải, hiện ở mọi trang ---- */
{const rb=$('#reset-data'),wrap=document.createElement('div'),clk=document.createElement('div');
 wrap.style.cssText='display:flex;gap:10px;align-items:center';clk.className='date-control';clk.innerHTML='Giờ hệ thống: <strong id="global-clock">--:--:--</strong>';
 rb.replaceWith(wrap);wrap.append(clk,rb);
 const tick=()=>{$('#global-clock').textContent=formatClock(Date.now())};tick();setInterval(tick,1000)}
/* ---- Đăng nhập / đăng xuất / phân quyền ---- */
const SES_K='buildflow-session',SES=JSON.parse(sessionStorage.getItem(SES_K)||localStorage.getItem(SES_K)||'null');
if(!SES){location.replace('login.html');return}
/* =====================================================================
   TÀI KHOẢN & PHÂN QUYỀN
   - Tài khoản lưu ở localStorage 'buildflow-users' (dùng chung với login/register).
   - Quyền của từng VAI TRÒ lưu ở 'buildflow-perms' (Admin chỉnh ở trang Quản trị).
   ===================================================================== */
const UK_='buildflow-users',PERM_K='buildflow-perms';

// Băm mật khẩu (DEMO) — PHẢI GIỐNG HỆT hàm hash trong login.html và register.html
const hash=s=>{let h1=0xdeadbeef,h2=0x41c6ce57;s='aps:'+s;for(let i=0,c;i<s.length;i++){c=s.charCodeAt(i);h1=Math.imul(h1^c,2654435761);h2=Math.imul(h2^c,1597334677)}h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);return(4294967296*(2097151&h2)+(h1>>>0)).toString(36)};
const readUsers=()=>{try{return JSON.parse(localStorage.getItem(UK_)||'[]')}catch{return[]}};
const writeUsers=a=>localStorage.setItem(UK_,JSON.stringify(a));

const ROLES=['admin','boss','manager','employee'];
const ROLE={admin:'Admin',boss:'Sếp',manager:'Quản lý',employee:'Nhân viên'};

// Danh sách quyền: [khóa, tên hiển thị, nhóm]. Nhóm 'view' = quyền vào một trang (khóa trùng tên view).
const PERM_DEFS=[
  ['team','Xem trang Nhân sự','view'],['employees','Quản lý nhân viên','view'],['tasks','Tiến độ công việc','view'],
  ['reports','Tổng quan dự án','view'],['assign','Phân công thông minh','view'],['bonus','Thưởng & cảnh báo','view'],
  ['audit','Nhật ký hoạt động','view'],['admin','Quản trị tài khoản','view'],
  ['seeAll','Thấy toàn bộ nhân sự và cảnh báo (tắt = chỉ thấy dòng của mình)','act'],
  ['switch','Chuyển việc cho người khác (bấm vào công việc)','act'],
  ['edit','Thêm/xóa nhân viên, công việc và đặt lại dữ liệu','act'],
  ['settings','Sửa ngân sách giờ, bậc thưởng, quản lý dự án','act']];
const ALLK=PERM_DEFS.map(d=>d[0]);
const mkPerm=keys=>Object.fromEntries(ALLK.map(k=>[k,keys.includes(k)]));
// Quyền mặc định của từng vai trò (Admin chỉnh được, trừ chính Admin luôn đủ quyền)
const DEFAULT_PERMS={
  admin:mkPerm(ALLK),
  boss:mkPerm(ALLK.filter(k=>k!=='admin')),
  manager:mkPerm(ALLK.filter(k=>!['audit','admin'].includes(k))),
  employee:mkPerm(['team','tasks'])};
// Đọc quyền đã lưu, phần nào chưa lưu thì lấy mặc định
const loadPerms=()=>{let s={};try{s=JSON.parse(localStorage.getItem(PERM_K)||'{}')}catch{}
  return Object.fromEntries(ROLES.map(r=>[r,{...DEFAULT_PERMS[r],...(s[r]||{})}]))};

// Tài khoản của phiên hiện tại: nếu đã bị xóa/khóa/chưa duyệt thì đưa về trang đăng nhập
const me=readUsers().find(x=>x.u===SES.u);
if(!me||(me.status||'active')!=='active'){sessionStorage.removeItem(SES_K);localStorage.removeItem(SES_K);location.replace('login.html');return}
// Luôn lấy vai trò/tên MỚI NHẤT từ danh sách tài khoản (Admin có thể vừa đổi)
SES.role=me.role;SES.name=me.name;
SES.member=me.member||me.name;   // tên nhân sự được liên kết → dùng để lọc "dòng của tôi" và đề xuất giao việc

const PERMS=loadPerms(),perm=PERMS[SES.role]||PERMS.employee,permSig=JSON.stringify(perm);
const can=k=>SES.role==='admin'||!!perm[k];   // Admin luôn đủ quyền để không tự khóa mình
const allowed=v=>v==='me'?!['admin','boss'].includes(SES.role):can(v);   // "Trang của tôi" ẩn với Admin/Sếp (họ đã xem được mọi nơi khác), vẫn hiện với Quản lý và Nhân viên
const isMgr=can('seeAll'),canSwitch=can('switch'),canAudit=can('audit'),canAdmin=can('admin');

// Gọi mỗi 15 giây: nếu bị khóa/xóa → đăng xuất; nếu vai trò hoặc quyền bị đổi → tải lại để áp dụng ngay
function enforceSession(){
  const u=readUsers().find(x=>x.u===SES.u);
  if(!u||(u.status||'active')!=='active'){sessionStorage.removeItem(SES_K);localStorage.removeItem(SES_K);location.replace('login.html');return}
  if(u.role!==SES.role||JSON.stringify(loadPerms()[u.role])!==permSig)location.reload();
} // nhân viên chỉ vào Nhân sự và Tiến độ
document.body.classList.add(isMgr?'role-manager':'role-employee');
if(!isMgr)document.body.classList.add('no-seeall');   // ẩn banner cảnh báo
if(!can('edit'))document.body.classList.add('no-edit'); // ẩn form thêm việc/nhân viên, nút xóa, nút đặt lại
document.querySelectorAll('.nav-item').forEach(b=>{if(!allowed(b.dataset.view))b.style.display='none'});
{const wrap=$('#reset-data').parentElement,chip=document.createElement('div'),out=document.createElement('button');
 chip.className='user-chip';chip.innerHTML=`<span>👤 <b>${esc(SES.name)}</b> · ${ROLE[SES.role]||''}</span>`;
 out.id='logout';out.className='outline-btn';out.textContent='Đăng xuất';
 out.onclick=()=>{if(!confirm('Đăng xuất khỏi hệ thống?'))return;logA('login','Đăng xuất');unpresence();sessionStorage.removeItem(SES_K);localStorage.removeItem(SES_K);location.replace('login.html')};
 // Nút đổi mật khẩu của chính mình
 const pw=document.createElement('button');pw.id='chpw';pw.className='outline-btn';pw.textContent='Đổi mật khẩu';pw.onclick=()=>changeOwnPassword();
 wrap.prepend(chip);wrap.append(pw,out)}
$('#team-list').insertAdjacentHTML('beforebegin','<div id="my-offers"></div>');
const rOffers=()=>{const el=$('#my-offers');if(!el||isMgr)return;const mine=L.offers.map((o,i)=>({o,i})).filter(x=>x.o.member===SES.member);
  el.innerHTML=mine.length?`<div class="section-heading"><div><h2>Đề xuất dành cho bạn</h2><p>Công việc phù hợp với quỹ giờ trống của bạn — bạn có muốn nhận không?</p></div></div>`+mine.map(({o,i})=>`<div class="cap-row"><div><strong>${esc(o.task.name)}</strong><small>${esc(o.task.project)} · ${fmtHours(o.task.expected)}</small></div><span></span><span><button class="action-btn" data-accept="${i}">Nhận</button> <button class="outline-btn" data-reject="${i}">Từ chối</button></span></div>`).join('')+'<div style="height:22px"></div>':''};
const rtAuth=renderTeam;
renderTeam=()=>{rtAuth();if(!isMgr)document.querySelectorAll('.person-row').forEach(row=>{const m=data.members.find(x=>x.id===Number(row.querySelector('[data-member]').dataset.member));if(!m||m.name!==SES.member)row.remove()});rOffers()};
const rAuth=render;render=v=>{if(!allowed(v))v='team';rAuth(v);curView=v;if(['me','audit','admin'].includes(v))$('#page-title').textContent=TITLES[v];
  if(v!==lastLogged){lastLogged=v;logA('view','Xem trang '+TITLES[v]);beat()}if(v==='audit')rAudit();if(v==='admin')rAdmin();if(v==='me')rMe()};
/* ---- Ca làm 3 trạng thái (chạy / tạm dừng / kết thúc) + chuyển việc bằng 1 cú click ---- */
const REASONS={'1':'Nghỉ trưa','2':'Trục trặc công việc'};
const refEmp=()=>{if($('#view-employees').classList.contains('active-view'))renderEmployees()};
const curTask=m=>data.tasks.find(t=>t.id===m.currentTask&&t.assignee===m.name)||null;
const pickTask=m=>data.tasks.find(t=>t.assignee===m.name&&t.status==='doing')||data.tasks.find(t=>t.assignee===m.name&&t.status!=='done')||null;
const ensureCur=m=>{if(m.active&&!curTask(m)){const t=pickTask(m);m.currentTask=t?t.id:null}};
// chốt giờ đã chạy từ lần mốc gần nhất: cộng vào giờ làm của người và của việc đang làm
const commit=m=>{if(!m.active||!m.startedAt)return;if(!m.shiftStart)m.shiftStart=m.startedAt;const e=Math.max(0,(Date.now()-m.startedAt)/3600000),t=curTask(m);m.worked=(m.worked||0)+e;if(t)t.actual=(t.actual||0)+e;m.startedAt=Date.now()};
const closeBreak=m=>{const b=(m.breaks||[]).find(x=>!x.to);if(b)b.to=Date.now();m.paused=false;m.pauseReason=''};
const persist=()=>{saveCurrentDate();renderTeam();refEmp()};
function shiftAct(id,act){
  const m=data.members.find(x=>x.id===id);if(!m)return;
  if(act==='start'){if(m.active)return;const was=m.paused;closeBreak(m);if(!was)m.shiftStart=Date.now();m.active=true;m.startedAt=Date.now();ensureCur(m);const t=curTask(m);if(t&&t.status==='todo')t.status='doing';logA('shift',was?'Tiếp tục ca làm':'Bắt đầu ca làm',m.name);toast(`${m.name} ${was?'tiếp tục':'bắt đầu'} làm việc`)}
  else if(act==='pause'){if(!m.active)return;let r=prompt('Lý do tạm dừng?\n1 = Nghỉ trưa\n2 = Trục trặc công việc\n(hoặc gõ lý do khác)','1');if(r===null)return;r=REASONS[r.trim()]||r.trim()||'Tạm dừng';
    ensureCur(m);commit(m);m.active=false;m.paused=true;m.pauseReason=r;m.pausedAt=Date.now();(m.breaks=m.breaks||[]).push({from:Date.now(),r,task:m.currentTask});logA('shift','Tạm dừng ca',`${m.name} — ${r}`);toast(`${m.name} tạm dừng: ${r}`)}
  else if(act==='end'){if(!m.active&&!m.paused)return;ensureCur(m);commit(m);closeBreak(m);m.active=false;m.currentTask=null;logA('shift','Kết thúc ca',m.name);toast(`Đã kết thúc ca làm của ${m.name}`)}
  persist();
}
function switchTask(mid,tid){
  if(!canSwitch)return;const m=data.members.find(x=>x.id===mid),t=data.tasks.find(x=>x.id===tid);if(!m||!t)return;
  if(t.status==='done')return toast('Việc này đã hoàn thành');
  ensureCur(m);if(m.active&&m.currentTask===t.id)return toast(`${m.name} đang làm việc này rồi`);
  const prev=curTask(m);
  if(m.active)commit(m);else{const wasP=m.paused;closeBreak(m);if(!wasP)m.shiftStart=Date.now();m.active=true;m.startedAt=Date.now()}
  m.currentTask=t.id;if(t.status==='todo')t.status='doing';
  logA('edit','Chuyển việc',`${m.name}: ${prev?'“'+prev.name+'” → ':''}“${t.name}”`);toast(prev?`Đã chuyển ${m.name} sang “${t.name}”, tạm dừng “${prev.name}”`:`${m.name} bắt đầu “${t.name}”`);persist();
}
const decorateShift=()=>document.querySelectorAll('.person-row').forEach(row=>{
  const btn=row.querySelector('button.action-btn[data-member]');if(!btn)return;
  const id=Number(btn.dataset.member),m=data.members.find(x=>x.id===id);if(!m)return;ensureCur(m);
  const ctl=document.createElement('div');ctl.className='shift-ctl';ctl.dataset.member=id;
  ctl.innerHTML=`<button class="shift-btn start" data-shift="start" ${m.active?'disabled':''}>▶ ${m.paused?'Tiếp tục':'Bắt đầu'}</button><button class="shift-btn pause" data-shift="pause" ${m.active?'':'disabled'}>⏸ Tạm dừng</button><button class="shift-btn end" data-shift="end" ${m.active||m.paused?'':'disabled'}>■ Kết thúc</button>${m.paused?`<small class="shift-note">⏸ ${esc(m.pauseReason||'Tạm dừng')} · từ ${formatClock(m.pausedAt||Date.now())}</small>`:''}`;
  btn.replaceWith(ctl);
  const ts=data.tasks.filter(t=>t.assignee===m.name);
  row.querySelectorAll('.person-task:not(.empty)').forEach((el,i)=>{const t=ts[i];if(!t)return;el.dataset.task=t.id;
    const cur=m.currentTask===t.id&&(m.active||m.paused);el.classList.toggle('current',cur&&m.active);el.classList.toggle('paused',cur&&m.paused);el.classList.toggle('finished',t.status==='done');
    if(canSwitch&&t.status!=='done'){el.classList.add('pickable');el.title=`Bấm để chuyển ${m.name} sang việc này`}
    const tag=cur?(m.active?'● Đang làm':'⏸ Đang tạm dừng'):t.status==='done'?'✓ Hoàn thành':'';if(tag)el.querySelector('small').textContent+=' · '+tag});
});
const rtShift=renderTeam;renderTeam=()=>{rtShift();decorateShift();paintWorked()};

/* ---- Trang "Tiến độ công việc": Nhân viên chỉ xem việc của CHÍNH MÌNH ----
   Hàm renderTasks() gốc nằm ngoài IIFE này nên không "nhìn thấy" SES/isMgr,
   vì vậy ta bọc lại bằng cách tạm lọc data.tasks trước khi gọi hàm gốc, rồi
   khôi phục lại ngay sau đó để không ảnh hưởng tới các trang khác. Quản lý,
   Admin, Sếp (có quyền "seeAll") vẫn thấy đầy đủ như cũ. */
const rTasksFull=renderTasks;
renderTasks=()=>{
  if(isMgr){rTasksFull();return}
  const full=data.tasks;
  data.tasks=full.filter(t=>t.assignee===SES.member);
  rTasksFull();
  data.tasks=full;
};
const reShift=renderEmployees;
renderEmployees=()=>{reShift();document.querySelectorAll('.employee-card').forEach((c,i)=>{const m=data.members[i],l=c.querySelector('.employee-live');if(!m||!l)return;
  const w=hms(worked(m));  // cùng công thức với trang Nhân sự: giờ cộng dồn cả ngày
  if(m.active)l.innerHTML=`<strong class="employee-started">▶ Đang làm · bắt đầu ${formatClock(m.shiftStart||m.startedAt)}</strong><span>Đã làm ${w}</span>`;
  else if(m.paused)l.innerHTML=`<strong style="color:var(--amber)">⏸ Tạm dừng · ${esc(m.pauseReason||'')}</strong><span>từ ${formatClock(m.pausedAt||Date.now())} · Đã làm ${w}</span>`;
  else l.innerHTML=worked(m)>0?`<strong class="offline">■ Đã kết thúc ca</strong><span>Tổng đã làm ${w}</span>`:`<strong class="offline">Chưa bắt đầu ca</strong><span>Nhấn bắt đầu ở trang Nhân sự hôm nay</span>`})};
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-shift]');
  if(b){if(!b.disabled)shiftAct(Number(b.closest('[data-member]').dataset.member),b.dataset.shift);return}
  const t=e.target.closest('.person-task.pickable');
  if(t)switchTask(Number(t.closest('.person-row').querySelector('[data-member]').dataset.member),Number(t.dataset.task));
});
/* ---- Nhật ký hoạt động: ai làm gì, ai đang online (chỉ Admin/Sếp xem) ---- */
const AK='buildflow-audit',PK='buildflow-presence',ONLINE_MS=45000;
const TITLES={me:'Trang của tôi',team:'Nhân sự',employees:'Quản lý nhân viên',tasks:'Tiến độ công việc',reports:'Tổng quan dự án',assign:'Phân công thông minh',bonus:'Thưởng & cảnh báo',audit:'Nhật ký hoạt động',admin:'Quản trị tài khoản'};
const TL={login:'Đăng nhập',view:'Xem',add:'Thêm',edit:'Sửa',delete:'Xóa',shift:'Ca làm',setting:'Cài đặt',security:'Bảo mật'};
let curView='team',lastLogged='',skipDiff=false;
const readLog=()=>{try{return JSON.parse(localStorage.getItem(AK)||'[]')}catch{return[]}};
const logA=(type,act,detail='')=>{const a=readLog();a.push({t:Date.now(),u:SES.u,n:SES.name,r:SES.role,type,act,detail});if(a.length>2000)a.splice(0,a.length-2000);try{localStorage.setItem(AK,JSON.stringify(a))}catch{}};
const readPres=()=>{try{return JSON.parse(localStorage.getItem(PK)||'{}')}catch{return{}}};
const beat=()=>{const p=readPres();p[SES.u]={n:SES.name,r:SES.role,t:Date.now(),v:curView};try{localStorage.setItem(PK,JSON.stringify(p))}catch{}};
const unpresence=()=>{const p=readPres();delete p[SES.u];try{localStorage.setItem(PK,JSON.stringify(p))}catch{}};
setInterval(()=>{enforceSession();beat()},15000);addEventListener('beforeunload',unpresence);
// Tự ghi thêm/sửa/xóa nhân viên & công việc bằng cách so sánh dữ liệu trước/sau mỗi thao tác
const snap=()=>({d:selectedDate,m:Object.fromEntries(data.members.map(m=>[m.id,[m.name,m.role,m.hours]])),t:Object.fromEntries(data.tasks.map(t=>[t.id,[t.name,t.project,t.assignee,t.expected,t.status]]))});
const diffLog=a=>{if(skipDiff){skipDiff=false;return}const b=snap();if(a.d!==b.d)return;const ds=` (ngày ${b.d})`;
  for(const id in b.m){if(!a.m[id])logA('add','Thêm nhân viên',b.m[id][0]);else if(JSON.stringify(a.m[id])!==JSON.stringify(b.m[id]))logA('edit','Sửa nhân viên',`${a.m[id].join(' / ')} → ${b.m[id].join(' / ')}`)}
  for(const id in a.m)if(!b.m[id])logA('delete','Xóa nhân viên',a.m[id][0]);
  for(const id in b.t){const n=b.t[id],o=a.t[id];
    if(!o)logA('add','Thêm công việc',`“${n[0]}” · ${n[1]} · giao ${n[2]} · ${n[3]}h${ds}`);
    else{if(o[2]!==n[2])logA('edit','Đổi người làm',`“${n[0]}”: ${o[2]} → ${n[2]}`);if(o[3]!==n[3])logA('edit','Sửa giờ dự kiến',`“${n[0]}”: ${o[3]}h → ${n[3]}h`);
      if(o[4]!==n[4]&&(n[4]==='done'||o[4]==='done'))logA('edit',n[4]==='done'?'Hoàn thành công việc':'Mở lại công việc',`“${n[0]}” · ${n[2]}`)}}
  for(const id in a.t)if(!b.t[id])logA('delete','Xóa công việc',`“${a.t[id][0]}” · ${a.t[id][1]}${ds}`)};
['click','submit','change'].forEach(ev=>document.addEventListener(ev,()=>{const a=snap();setTimeout(()=>diffLog(a),30)},true));
const fmtT=t=>new Date(t).toLocaleString('vi-VN',{hour12:false});
const filtered=()=>{const u=$('#au-user').value,ty=$('#au-type').value,rg=$('#au-range').value,q=$('#au-q').value.trim().toLowerCase(),start=rg==='today'?new Date().setHours(0,0,0,0):rg==='7d'?Date.now()-7*864e5:0;
  return readLog().filter(x=>x.t>=start&&(!u||x.u===u)&&(!ty||x.type===ty)&&(!q||(x.n+' '+x.act+' '+x.detail).toLowerCase().includes(q))).reverse()};
function rAudit(){
  const all=readLog(),t0=new Date().setHours(0,0,0,0),today=all.filter(x=>x.t>=t0),pres=readPres(),now=Date.now(),sel=$('#au-user'),v=sel.value;
  sel.innerHTML='<option value="">Tất cả người dùng</option>'+[...new Map(all.map(x=>[x.u,x.n])).entries()].map(([u,n])=>`<option value="${esc(u)}">${esc(n)}</option>`).join('');sel.value=v;
  const live=Object.values(pres).filter(p=>now-p.t<ONLINE_MS).length,chg=today.filter(x=>['add','edit','delete','setting'].includes(x.type)).length,sec=today.filter(x=>x.type==='security').length;
  $('#au-metrics').innerHTML=`<div class="metric"><div class="metric-label">ĐANG ONLINE</div><div class="metric-value">${live} người</div><div class="metric-note positive">● Cập nhật mỗi 15 giây</div></div><div class="metric"><div class="metric-label">THAO TÁC HÔM NAY</div><div class="metric-value">${today.filter(x=>x.type!=='view').length}</div><div class="metric-note">Không tính lượt xem trang</div></div><div class="metric"><div class="metric-label">THAY ĐỔI DỮ LIỆU</div><div class="metric-value">${chg}</div><div class="metric-note ${chg?'warning':''}">Thêm / sửa / xóa / cài đặt</div></div><div class="metric"><div class="metric-label">ĐĂNG NHẬP THẤT BẠI</div><div class="metric-value">${sec}</div><div class="metric-note ${sec?'warning':'positive'}">${sec?'Cần lưu ý':'Không có bất thường'}</div></div>`;
  $('#au-online').innerHTML=Object.entries(pres).sort((a,b)=>b[1].t-a[1].t).map(([u,p])=>{const on=now-p.t<ONLINE_MS;return `<div class="cap-row"><div><strong><span class="au-dot ${on?'on':''}"></span>${esc(p.n)}</strong><small>${ROLE[p.r]||''}</small></div><div>${on?'Đang ở: '+esc(TITLES[p.v]||''):'Ngoại tuyến'}</div><span class="au-time">${on?'vừa xong':'Lần cuối '+fmtT(p.t)}</span></div>`}).join('')||'<div class="employee-empty">Chưa có ai online.</div>';
  const rows=filtered();
  $('#au-list').innerHTML=(rows.slice(0,200).map(x=>`<div class="au-row"><span class="au-time">${fmtT(x.t)}</span><span><strong>${esc(x.n)}</strong><small>${ROLE[x.r]||''}</small></span><span class="au-chip ${x.type}">${TL[x.type]||x.type}</span><span><b>${esc(x.act)}</b>${x.detail?`<small>${esc(x.detail)}</small>`:''}</span></div>`).join('')||'<div class="employee-empty">Không có bản ghi phù hợp.</div>')+(rows.length>200?`<small style="color:var(--muted)">Hiển thị 200/${rows.length} bản ghi mới nhất — dùng Xuất CSV để lấy đủ.</small>`:'');
}
if(canAudit){
  $('#view-audit').innerHTML=`<div class="hero-row"><p class="intro">Ai đang dùng hệ thống, đã xem trang nào, thêm/sửa/xóa gì. Chỉ Admin và Sếp thấy trang này.</p><button class="outline-btn" id="au-export">⬇ Xuất CSV</button></div><div id="au-metrics" class="metric-grid"></div>
  <div class="section-heading"><div><h2>Đang hoạt động</h2><p>Người dùng đang mở hệ thống và trang họ đang xem.</p></div></div><div id="au-online"></div>
  <div class="section-heading" style="margin-top:26px"><div><h2>Lịch sử thao tác</h2><p>Mới nhất ở trên cùng.</p></div><div class="au-filters"><select class="select-control" id="au-user"></select><select class="select-control" id="au-type"><option value="">Mọi loại</option>${Object.entries(TL).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select><select class="select-control" id="au-range"><option value="today">Hôm nay</option><option value="7d">7 ngày</option><option value="all">Tất cả</option></select><input id="au-q" placeholder="Tìm kiếm…"></div></div><div id="au-list"></div>`;
  ['#au-user','#au-type','#au-range'].forEach(i=>$(i).onchange=rAudit);$('#au-q').oninput=rAudit;
  $('#au-export').onclick=()=>{const rows=[['Thời gian','Người dùng','Vai trò','Loại','Hành động','Chi tiết'],...filtered().map(x=>[fmtT(x.t),x.n,ROLE[x.r]||x.r,TL[x.type]||x.type,x.act,x.detail])];
    const csv='\ufeff'+rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n'),a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));a.download='nhat-ky-hoat-dong.csv';a.click();logA('view','Xuất nhật ký ra CSV')};
  setInterval(()=>{if($('#view-audit').classList.contains('active-view'))rAudit()},5000);
  addEventListener('storage',e=>{if((e.key===AK||e.key===PK)&&$('#view-audit').classList.contains('active-view'))rAudit()});
}
/* =====================================================================
   TRANG QUẢN TRỊ TÀI KHOẢN — chỉ hiện với ai có quyền 'admin'
   Gồm: duyệt tài khoản đăng ký • thêm / khóa / xóa / đặt lại mật khẩu •
        gán vai trò & liên kết nhân sự • ma trận phân quyền • kỹ năng & team
   Mọi thay đổi đều được ghi vào Nhật ký hoạt động (không ghi mật khẩu).
   ===================================================================== */
const ST_LABEL={active:'Đang hoạt động',pending:'Chờ duyệt',locked:'Đã khóa'};
const stOf=u=>u.status||'active';                                   // tài khoản cũ chưa có status = đang hoạt động
const activeAdmins=us=>us.filter(x=>x.role==='admin'&&stOf(x)==='active').length; // để luôn còn ít nhất 1 Admin
const roleOpts=sel=>ROLES.map(r=>`<option value="${r}" ${r===sel?'selected':''}>${ROLE[r]}</option>`).join('');
const memberOpts=sel=>['',...data.members.map(m=>m.name)].map(n=>`<option value="${esc(n)}" ${n===sel?'selected':''}>${esc(n||'— Không liên kết —')}</option>`).join('');

// Đổi mật khẩu của chính mình (dùng cho nút "Đổi mật khẩu" ở góc phải)
function changeOwnPassword(){
  const us=readUsers(),u=us.find(x=>x.u===SES.u);if(!u)return;
  const old=prompt('Nhập mật khẩu hiện tại:');if(old===null)return;
  if(hash(old)!==u.h){toast('Mật khẩu hiện tại không đúng');return}
  const nw=prompt('Nhập mật khẩu mới (tối thiểu 6 ký tự):');if(nw===null)return;
  if(nw.length<6){toast('Mật khẩu tối thiểu 6 ký tự');return}
  u.h=hash(nw);writeUsers(us);logA('security','Đổi mật khẩu','Tự đổi');toast('Đã đổi mật khẩu');
}

// HTML một dòng tài khoản. pending=true: dòng chờ duyệt (có nút Duyệt/Từ chối)
const userRow=(u,pending)=>{
  const self=u.u===SES.u,id=esc(u.u);
  return `<div class="ad-row" data-row="${id}">
    <div><strong>${esc(u.name)}${self?' (bạn)':''}</strong><small>@${id}${u.title?' · '+esc(u.title):''} · <span class="au-chip ${stOf(u)}">${ST_LABEL[stOf(u)]}</span></small></div>
    <select data-adm-role="${id}" ${self?'disabled title="Không tự đổi vai trò của mình"':''}>${roleOpts(u.role)}</select>
    <select data-adm-member="${id}">${memberOpts(u.member||'')}</select>
    <div class="ad-btns">${pending
      ?`<button class="action-btn" data-adm-act="approve" data-u="${id}">Duyệt</button><button class="outline-btn danger" data-adm-act="delete" data-u="${id}">Từ chối</button>`
      :`<button class="outline-btn" data-adm-act="reset" data-u="${id}">Đặt lại MK</button><button class="outline-btn" data-adm-act="${stOf(u)==='locked'?'unlock':'lock'}" data-u="${id}" ${self?'disabled':''}>${stOf(u)==='locked'?'Mở khóa':'Khóa'}</button><button class="outline-btn danger" data-adm-act="delete" data-u="${id}" ${self?'disabled':''}>Xóa</button>`}</div></div>`;
};

// Vẽ lại toàn bộ trang quản trị
function rAdmin(){
  const us=readUsers(),pend=us.filter(x=>stOf(x)==='pending'),P=loadPerms();
  // (1) Bốn ô tổng quan
  $('#ad-metrics').innerHTML=[['TỔNG TÀI KHOẢN',us.length,''],['CHỜ DUYỆT',pend.length,pend.length?'warning':''],['ĐANG HOẠT ĐỘNG',us.filter(x=>stOf(x)==='active').length,'positive'],['ĐÃ KHÓA',us.filter(x=>stOf(x)==='locked').length,'']]
    .map(([l,v,c])=>`<div class="metric"><div class="metric-label">${l}</div><div class="metric-value">${v}</div><div class="metric-note ${c}">&nbsp;</div></div>`).join('');
  // (2) Khung tài khoản chờ duyệt (chỉ hiện khi có)
  $('#ad-pending').innerHTML=pend.length?`<div class="panel ad-pending" style="margin-bottom:24px"><div class="panel-title"><div><h2>Chờ duyệt (${pend.length})</h2><p>Chọn vai trò và nhân sự tương ứng rồi bấm Duyệt.</p></div></div>${pend.map(u=>userRow(u,true)).join('')}</div>`:'';
  // (3) Form thêm tài khoản: cập nhật danh sách vai trò / nhân sự (giữ nguyên lựa chọn đang chọn)
  const fr=$('#ad-role'),fm=$('#ad-member'),vr=fr.value||'employee',vm=fm.value;
  fr.innerHTML=roleOpts(vr);fm.innerHTML=memberOpts(vm);
  // (4) Danh sách tài khoản đã duyệt
  $('#ad-users').innerHTML=us.filter(x=>stOf(x)!=='pending').map(u=>userRow(u,false)).join('')||'<div class="employee-empty">Chưa có tài khoản.</div>';
  // (5) Ma trận phân quyền: mỗi hàng 1 quyền, mỗi cột 1 vai trò. Cột Admin bị khóa (luôn đủ quyền)
  const cell=(r,k)=>`<span class="c"><input type="checkbox" data-adm-perm="${r}:${k}" ${(r==='admin'||P[r][k])?'checked':''} ${r==='admin'?'disabled':''}></span>`;
  $('#ad-perms').innerHTML=`<div class="ad-perm head"><span>Quyền</span>${ROLES.map(r=>`<span class="c">${ROLE[r]}</span>`).join('')}</div>`
    +[['view','TRANG ĐƯỢC PHÉP TRUY CẬP'],['act','THAO TÁC ĐƯỢC PHÉP']].map(([g,t])=>`<div class="ad-perm group"><span>${t}</span></div>`+PERM_DEFS.filter(d=>d[2]===g).map(([k,label])=>`<div class="ad-perm"><span>${label}</span>${ROLES.map(r=>cell(r,k)).join('')}</div>`).join('')).join('');
  // (6) Hồ sơ nhân sự: kỹ năng & team/dự án của từng người (dữ liệu này dùng để chấm điểm gợi ý phân công)
  $('#ad-skills').innerHTML=data.members.map(m=>`<div class="ad-skill"><div><strong>${esc(m.name)}</strong><small>${esc(m.role||'')}</small></div><div>
      <div class="ad-tags"><b>Kỹ năng</b>${SKILLS.map(s=>`<label><input type="checkbox" data-adm-skill="${esc(m.name)}|${s}" ${(L.skills[m.name]||[]).includes(s)?'checked':''}>${s}</label>`).join('')}</div>
      <div class="ad-tags"><b>Team / Dự án</b>${projs().map(p=>`<label><input type="checkbox" data-adm-team="${esc(m.name)}|${esc(p)}" ${(L.teams[m.name]||[]).includes(p)?'checked':''}>${esc(p)}</label>`).join('')}</div></div></div>`).join('');
}

// Xử lý các nút trong dòng tài khoản: Duyệt / Từ chối-Xóa / Khóa / Mở khóa / Đặt lại mật khẩu
function adminAct(b){
  const act=b.dataset.admAct,uname=b.dataset.u,us=readUsers(),u=us.find(x=>x.u===uname);if(!u)return;
  const self=uname===SES.u;
  if(act==='approve'){
    // Lấy vai trò + nhân sự đang chọn ngay trên dòng chờ duyệt
    const row=b.closest('[data-row]');
    u.role=row.querySelector('[data-adm-role]').value;u.member=row.querySelector('[data-adm-member]').value;u.status='active';
    logA('setting','Duyệt tài khoản',`@${u.u} → ${ROLE[u.role]}${u.member?' · '+u.member:''}`);
  }else if(act==='delete'){
    if(self){toast('Không thể xóa chính mình');return}
    if(u.role==='admin'&&stOf(u)==='active'&&activeAdmins(us)<=1){toast('Phải còn ít nhất 1 Admin');return}
    if(!confirm(`Xóa tài khoản @${u.u}?`))return;
    us.splice(us.indexOf(u),1);logA('delete',stOf(u)==='pending'?'Từ chối đăng ký':'Xóa tài khoản',`@${u.u} (${u.name})`);
  }else if(act==='lock'||act==='unlock'){
    if(self){toast('Không thể khóa chính mình');return}
    if(act==='lock'&&u.role==='admin'&&activeAdmins(us)<=1){toast('Phải còn ít nhất 1 Admin');return}
    u.status=act==='lock'?'locked':'active';
    logA('security',act==='lock'?'Khóa tài khoản':'Mở khóa tài khoản',`@${u.u}`);
  }else if(act==='reset'){
    const p=prompt(`Mật khẩu mới cho @${u.u} (tối thiểu 6 ký tự):`);if(p===null)return;
    if(p.length<6){toast('Mật khẩu tối thiểu 6 ký tự');return}
    u.h=hash(p);logA('security','Đặt lại mật khẩu',`@${u.u}`);   // KHÔNG ghi mật khẩu vào nhật ký
  }
  writeUsers(us);toast('Đã lưu');rAdmin();
}

if(canAdmin){
  // Khung trang quản trị (tạo một lần; phần bên trong do rAdmin vẽ lại)
  $('#view-admin').innerHTML=`<div class="hero-row"><p class="intro">Duyệt tài khoản đăng ký, cấp vai trò, phân quyền và khai báo kỹ năng / team cho nhân sự. Chỉ Admin thấy trang này.</p><a class="outline-btn" href="register.html" target="_blank" style="text-decoration:none">Mở trang đăng ký ↗</a></div>
  <div id="ad-metrics" class="metric-grid"></div><div id="ad-pending"></div>
  <form id="ad-form" class="task-form"><div class="form-heading"><div><h2>Thêm tài khoản</h2><p>Tài khoản tạo tại đây dùng được ngay, không cần duyệt.</p></div><button class="action-btn" type="submit">＋ Tạo tài khoản</button></div>
    <div class="form-grid"><label>Họ và tên<input id="ad-name" required></label><label>Tên đăng nhập<input id="ad-user" required placeholder="chữ thường không dấu"></label><label>Mật khẩu<input id="ad-pass" type="password" required placeholder="Tối thiểu 6 ký tự"></label><label>Vai trò<select id="ad-role"></select></label><label>Liên kết nhân sự<select id="ad-member"></select></label></div></form>
  <div class="section-heading" style="margin-top:26px"><div><h2>Danh sách tài khoản</h2><p>Đổi vai trò ngay trên dòng. Vai trò/quyền mới có hiệu lực với người đó trong tối đa 15 giây.</p></div></div><div id="ad-users"></div>
  <div class="panel" style="margin-top:26px"><div class="panel-title"><div><h2>Phân quyền theo vai trò</h2><p>Tick để cho phép. Admin luôn đủ quyền và không chỉnh được.</p></div></div><div id="ad-perms"></div></div>
  <div class="panel" style="margin-top:16px"><div class="panel-title"><div><h2>Kỹ năng &amp; team của nhân sự</h2><p>Dùng để chấm điểm gợi ý phân công thông minh.</p></div></div><div id="ad-skills"></div></div>`;

  // Bấm nút trong trang
  $('#view-admin').addEventListener('click',e=>{const b=e.target.closest('[data-adm-act]');if(b&&!b.disabled)adminAct(b)});

  // Đổi ô chọn / tick trong trang
  $('#view-admin').addEventListener('change',e=>{
    const t=e.target,d=t.dataset,us=readUsers();
    if(d.admRole||d.admMember){
      const u=us.find(x=>x.u===(d.admRole||d.admMember));if(!u)return;
      if(stOf(u)==='pending')return;                       // dòng chờ duyệt: chỉ lưu khi bấm "Duyệt"
      if(d.admRole){
        // Không cho hạ vai trò Admin cuối cùng (sẽ không còn ai quản trị)
        if(u.role==='admin'&&t.value!=='admin'&&activeAdmins(us)<=1){toast('Phải còn ít nhất 1 Admin');return rAdmin()}
        logA('setting','Đổi vai trò',`@${u.u}: ${ROLE[u.role]} → ${ROLE[t.value]}`);u.role=t.value;
      }else{logA('setting','Đổi liên kết nhân sự',`@${u.u}: ${u.member||'—'} → ${t.value||'—'}`);u.member=t.value}
      writeUsers(us);
    }else if(d.admPerm){
      // Lưu quyền của một vai trò: buildflow-perms = { vaiTrò: { khóaQuyền: true/false } }
      const [role,key]=d.admPerm.split(':');if(role==='admin')return;
      const s=JSON.parse(localStorage.getItem(PERM_K)||'{}');(s[role]=s[role]||{})[key]=t.checked;localStorage.setItem(PERM_K,JSON.stringify(s));
      logA('setting','Sửa phân quyền',`${ROLE[role]} · ${PERM_DEFS.find(x=>x[0]===key)[1]}: ${t.checked?'BẬT':'TẮT'}`);
    }else if(d.admSkill||d.admTeam){
      // Bật/tắt một kỹ năng hoặc một dự án cho nhân sự; dữ liệu nằm trong sổ cái L (skills / teams)
      const [name,val]=(d.admSkill||d.admTeam).split('|'),bag=d.admSkill?L.skills:L.teams,arr=bag[name]||(bag[name]=[]),i=arr.indexOf(val);
      if(t.checked&&i<0)arr.push(val);if(!t.checked&&i>=0)arr.splice(i,1);put();
      logA('setting',d.admSkill?'Sửa kỹ năng':'Sửa team/dự án',`${name}: ${val} ${t.checked?'(thêm)':'(bỏ)'}`);
    }else return;
    toast('Đã lưu');rAdmin();
  });

  // Tạo tài khoản mới (đã duyệt sẵn)
  $('#ad-form').addEventListener('submit',e=>{
    e.preventDefault();
    const name=$('#ad-name').value.trim(),u=$('#ad-user').value.trim().toLowerCase(),pw=$('#ad-pass').value,us=readUsers();
    if(!/^[a-z0-9._]{3,20}$/.test(u)){toast('Tên đăng nhập 3-20 ký tự: a-z, 0-9, dấu chấm hoặc gạch dưới');return}
    if(us.some(x=>x.u===u)){toast('Tên đăng nhập đã tồn tại');return}
    if(name.length<2||pw.length<6){toast('Nhập họ tên và mật khẩu tối thiểu 6 ký tự');return}
    us.push({u,name,role:$('#ad-role').value,h:hash(pw),status:'active',member:$('#ad-member').value,created:Date.now()});
    writeUsers(us);logA('add','Tạo tài khoản',`@${u} (${name}) · ${ROLE[$('#ad-role').value]}`);
    e.target.reset();rAdmin();toast('Đã tạo tài khoản');
  });
}
/* =====================================================================
   TRANG "TRANG CỦA TÔI" — ai đăng nhập cũng xem được (không cần quyền)
   Đây là màn hình cá nhân: mỗi người chỉ thấy công việc, tiến độ và giờ
   công của CHÍNH MÌNH (dựa vào SES.member — tên nhân sự được liên kết
   với tài khoản, xem/đổi ở trang Quản trị tài khoản). Ngoài ra trang này
   còn cho biết công trình nào đang cần người và đang ở giai đoạn nào,
   để ai cũng nắm được bức tranh chung mà không cần vào các trang quản lý.
   ===================================================================== */

// Tìm đúng bản ghi nhân sự của người đang đăng nhập (theo SES.member)
const meRec=()=>data.members.find(x=>x.name===SES.member);

// Giai đoạn hiện tại của 1 dự án: là giai đoạn nhỏ nhất còn việc CHƯA XONG.
// Nếu mọi việc đã xong thì coi như dự án đã hoàn thành.
const projectPhase=p=>{
  const ts=data.tasks.filter(t=>t.project===p);
  if(!ts.length)return{phase:'—',name:'',done:false,empty:true};
  const notDone=ts.filter(t=>t.status!=='done');
  if(!notDone.length){const last=ts[ts.length-1];return{phase:last.phase,name:last.phaseName,done:true}}
  const nums=[...new Set(notDone.map(t=>t.phase))].sort((a,b)=>a.localeCompare(b,'vi',{numeric:true}));
  const cur=notDone.find(t=>t.phase===nums[0]);
  return{phase:nums[0],name:cur.phaseName,done:false};
};

// Nhân viên TỰ nhận 1 việc còn trống (khác với switchTask — đó là quản lý
// chuyển việc cho người khác). Chỉ nhận được khi: đã xong hết việc đang
// được giao trong ngày, việc đó chưa ai bắt đầu, và còn đủ quỹ "đăng ký
// thêm tối đa 2h/ngày".
function selfClaim(taskId){
  const me=meRec();if(!me)return;
  const t=data.tasks.find(x=>x.id===taskId);if(!t||t.status!=='todo')return;
  if(!allDone(me)){toast('Bạn còn việc chưa hoàn thành, xong hết mới đăng ký thêm được');return}
  const remain=OT_MAX-otOf(me);
  if(remain<=0){toast('Bạn đã đăng ký đủ tối đa 2h thêm hôm nay');return}
  if(t.expected>remain){toast(`Việc này ${fmtHours(t.expected)}, vượt quá ${fmtHours(remain)} còn được đăng ký`);return}

  // Gán việc cho mình, bắt đầu làm ngay và trừ vào quỹ giờ đăng ký thêm
  t.assignee=me.name;t.status='doing';
  const key=T()+'|'+me.name;L.ot[key]=(L.ot[key]||0)+t.expected;
  if(!me.active){me.active=true;me.paused=false;me.startedAt=Date.now();if(!me.shiftStart)me.shiftStart=Date.now()}
  me.currentTask=t.id;

  saveCurrentDate();put();
  logA('edit','Tự đăng ký nhận việc',`${me.name}: “${t.name}” · ${t.project} · ${fmtHours(t.expected)}`);
  toast(`Bạn đã nhận việc “${t.name}”`);
  refresh();
}

// Vẽ lại toàn bộ trang "Trang của tôi"
function rMe(){
  const box=$('#view-me'),me=meRec();

  // Tài khoản chưa được Admin liên kết với 1 nhân sự cụ thể (ví dụ tài
  // khoản admin/sếp dùng để quản trị, không đại diện một thợ nào) —
  // vẫn cho xem phần "công trình đang cần người / giai đoạn" ở dưới,
  // chỉ ẩn phần việc và giờ công cá nhân.
  const notLinked=!me;

  const myTasks=me?mine(me):[];
  const doneCnt=myTasks.filter(t=>t.status==='done').length;
  const nearDue=myTasks.filter(t=>t.status==='doing'&&t.expected>0&&t.actual>=t.expected*WARN).length;
  const eligible=me&&allDone(me);
  const remain=me?Math.max(0,OT_MAX-otOf(me)):0;

  // (1) Khối chào đầu trang
  const hero=`<div class="me-hero">
      <div><h2>Xin chào, ${esc(SES.name)}</h2><p>${notLinked?'Tài khoản của bạn chưa liên kết với hồ sơ nhân sự nào — liên hệ Admin để xem việc và giờ công cá nhân.':`${ROLE[SES.role]||''}${me.role?' · '+esc(me.role):''} · Hôm nay ${esc(T())}`}</p></div>
      ${nearDue?`<div class="me-warn">⚠ ${nearDue} việc sắp tới hạn</div>`:''}
    </div>`;

  // (2) Bốn ô số liệu cá nhân (ẩn nếu tài khoản chưa liên kết nhân sự)
  const metrics=notLinked?'':`<div class="metric-grid">
      <div class="metric"><div class="metric-label">GIỜ ĐÃ LÀM HÔM NAY</div><div class="metric-value">${hms(worked(me))}</div><div class="metric-note">Mục tiêu ${fmtHours(me.hours)}</div></div>
      <div class="metric"><div class="metric-label">VIỆC HÔM NAY</div><div class="metric-value">${doneCnt}/${myTasks.length}</div><div class="metric-note ${doneCnt===myTasks.length&&myTasks.length?'positive':''}">${myTasks.length?Math.round(doneCnt/myTasks.length*100)+'% hoàn thành':'Chưa được giao việc'}</div></div>
      <div class="metric"><div class="metric-label">QUỸ GIỜ CÒN DƯ</div><div class="metric-value">${free(me)>0?fmtHours(free(me)):'0h'}</div><div class="metric-note">${eligible?'Có thể đăng ký thêm':'Còn việc đang làm'}</div></div>
      <div class="metric"><div class="metric-label">SẮP TỚI HẠN</div><div class="metric-value">${nearDue}</div><div class="metric-note ${nearDue?'warning':'positive'}">${nearDue?'Cần đẩy nhanh':'Đang ổn định'}</div></div>
    </div>`;

  // (3) Danh sách việc của tôi hôm nay — kèm % hoàn thành và cảnh báo sắp trễ
  const taskList=notLinked?'':(myTasks.length?myTasks.map(t=>{
      const pct=t.status==='done'?100:Math.min(100,Math.round((t.actual||0)/t.expected*100));
      const badge=t.status==='done'?['ok','✓ Hoàn thành']:t.status==='late'?['late','⚠ Đã trễ tiến độ']:(t.actual>=t.expected*WARN?['warn','⚠ Sắp tới hạn']:t.status==='doing'?['ok','● Đang làm']:['','Chưa bắt đầu']);
      return `<div class="me-task">
          <div class="me-task-top"><div><strong>${esc(t.name)}</strong><small>${esc(t.project)} · ${esc(t.phaseName)}</small></div>${badge[0]?`<span class="me-badge ${badge[0]}">${badge[1]}</span>`:`<span class="me-badge">${badge[1]}</span>`}</div>
          <div class="progress-wrap"><div class="progress-bar"><b style="width:${pct}%"></b></div><div class="progress-text">${pct}% · ${t.actual?fmtHours(t.actual):'0h'}/${fmtHours(t.expected)}</div></div>
        </div>`;
    }).join(''):'<div class="me-empty">Hôm nay bạn chưa được giao việc nào.</div>');

  // (4) Đăng ký thêm việc — chỉ hiện khi đã xong hết việc được giao và còn quỹ giờ
  let claimHtml='';
  if(notLinked){claimHtml='';}
  else if(!eligible){claimHtml='<div class="me-empty">Bạn còn việc chưa hoàn thành — xong hết việc được giao hôm nay mới đăng ký thêm được.</div>';}
  else if(remain<=0){claimHtml='<div class="me-empty">Bạn đã đăng ký đủ tối đa 2h thêm hôm nay.</div>';}
  else{
    const mySkills=L.skills[me.name]||[];
    const open=data.tasks.filter(t=>t.status==='todo'&&t.assignee!==me.name&&t.expected<=remain)
      .sort((a,b)=>mySkills.includes(b.skill)-mySkills.includes(a.skill));
    claimHtml=open.length?open.map(t=>{
        const match=mySkills.includes(t.skill);
        return `<div class="me-claim ${match?'match':''}"><div><strong>${esc(t.name)}</strong><small>${esc(t.project)} · ${fmtHours(t.expected)}${t.skill?' · '+esc(t.skill):''}${match?' · Đúng kỹ năng của bạn':''}</small></div><button class="action-btn" data-claim="${t.id}">Nhận việc</button></div>`;
      }).join(''):`<div class="me-empty">Hiện chưa có việc nào vừa với ${fmtHours(remain)} quỹ giờ còn lại của bạn.</div>`;
  }

  // (5) Tiến độ các dự án tôi tham gia + giờ công tôi đã làm theo dự án
  const myProjects=me?[...new Set([...(L.teams[me.name]||[]),...myTasks.map(t=>t.project)])]:[];
  const myLogs=me?L.logs.filter(x=>x.m===me.name):[];
  const progressHtml=myProjects.length?myProjects.map(p=>{
      const s=pstat(p),hrs=myLogs.filter(x=>x.p===p).reduce((a,x)=>a+x.h,0);
      const warn=s.budget&&!s.done&&s.pct>=WARN;
      return `<div class="me-project">
          <div class="me-project-top"><strong>${esc(p)}</strong><small>${s.done?'✓ Đã hoàn thành':warn?(s.pct>1?'⚠ Đã vượt ngân sách giờ':'⚠ Sắp hết ngân sách giờ'):'Đang triển khai'}</small></div>
          <div class="progress-wrap"><div class="progress-bar"><b style="width:${Math.min(100,Math.round(s.pct*100))}%;background:${s.pct>1?'var(--red)':warn?'var(--amber)':'var(--green)'}"></b></div><div class="progress-text">${s.budget?Math.round(s.pct*100)+'%':'—'}</div></div>
          <div class="report-detail"><span>Bạn đã làm ${fmtHours(hrs)} ở dự án này</span><span>${s.budget?fmtHours(s.used)+' / '+fmtHours(s.budget)+' tổng':''}</span></div>
        </div>`;
    }).join(''):(notLinked?'':'<div class="me-empty">Bạn chưa tham gia dự án nào.</div>');

  // (6) Công trình đang cần người + (7) tất cả công trình đang ở giai đoạn nào
  const allP=projs();
  const needHtml=allP.map(p=>({p,opens:data.tasks.filter(t=>t.project===p&&t.status==='todo').length})).filter(x=>x.opens)
    .map(x=>{const ph=projectPhase(x.p);return `<div class="cap-row"><div><strong>${esc(x.p)}</strong><small>Giai đoạn ${esc(ph.phase)} · ${esc(ph.name)}</small></div><div><strong>${x.opens} việc</strong><small>đang chờ người nhận</small></div><span></span></div>`}).join('')
    ||'<div class="me-empty">Hiện không có công trình nào đang trống việc.</div>';
  const stageHtml=allP.map(p=>{
      const ph=projectPhase(p),s=pstat(p);
      return `<div class="cap-row"><div><strong>${esc(p)}</strong><small>${ph.done?'Đã hoàn thành tất cả giai đoạn':`Đang ở giai đoạn ${esc(ph.phase)} · ${esc(ph.name)}`}</small></div><div><strong>${ph.done?'100%':(s.budget?Math.round(s.pct*100)+'%':'—')}</strong><small>${ph.done?'hoàn thành':'ngân sách giờ'}</small></div><span class="au-chip ${ph.done?'active':'pending'}">${ph.done?'Hoàn thành':'Đang thi công'}</span></div>`;
    }).join('')||'<div class="me-empty">Chưa có công trình nào.</div>';

  // (8) Ghép toàn bộ nội dung vào khung trang (khung chỉ tạo 1 lần, các lần sau chỉ đổ lại nội dung)
  if(!box.dataset.built){
    box.dataset.built='1';
    box.innerHTML=`<div id="me-hero"></div><div id="me-metrics"></div>
      <div class="section-heading" style="margin-top:26px"><div><h2>Công việc của tôi hôm nay</h2><p>Tiến độ và cảnh báo sắp tới hạn cho từng việc.</p></div></div><div id="me-tasks"></div>
      <div class="section-heading" style="margin-top:26px"><div><h2>Đăng ký thêm việc</h2><p>Chỉ nhận được khi đã xong hết việc được giao, tối đa 2h/ngày.</p></div></div><div id="me-claim"></div>
      <div class="section-heading" style="margin-top:26px"><div><h2>Tiến độ &amp; giờ công của tôi theo dự án</h2><p>Ở các công trình bạn đang tham gia.</p></div></div><div id="me-progress"></div>
      <div class="section-heading" style="margin-top:26px"><div><h2>Công trình đang cần người</h2><p>Những nơi còn việc chưa ai nhận.</p></div></div><div id="me-need"></div>
      <div class="section-heading" style="margin-top:26px"><div><h2>Tất cả công trình — giai đoạn hiện tại</h2><p>Đang ở giai đoạn nào, đã hoàn thành hay chưa.</p></div></div><div id="me-stage"></div>`;
    // Bấm nút "Nhận việc" trong khu vực đăng ký thêm
    box.addEventListener('click',e=>{const b=e.target.closest('[data-claim]');if(b)selfClaim(Number(b.dataset.claim))});
  }
  $('#me-hero').innerHTML=hero;$('#me-metrics').innerHTML=metrics;$('#me-tasks').innerHTML=taskList;
  $('#me-claim').innerHTML=claimHtml;$('#me-progress').innerHTML=progressHtml;$('#me-need').innerHTML=needHtml;$('#me-stage').innerHTML=stageHtml;
}

put();render(currentView);
})();
});