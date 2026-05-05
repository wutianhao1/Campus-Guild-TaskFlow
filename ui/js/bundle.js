const API_BASE=window.API_BASE||"/api",state={currentPage:"login",user:null,token:null,tasks:[],filterStatus:"all",searchQuery:"",category:"",showUserMenu:!1,profileTab:"published",page:0,totalPages:0,loading:!1},api={async request(a,e={}){const t=`${API_BASE}${a}`,s={"Content-Type":"application/json",...e.headers};state.token&&(s.Authorization=`Bearer ${state.token}`);const l=await fetch(t,{...e,headers:s}),i=await l.json();if(!l.ok)throw new Error(i.message||"\u8BF7\u6C42\u5931\u8D25");return i.data},post(a,e){return this.request(a,{method:"POST",body:JSON.stringify(e)})},get(a){return this.request(a)}},apiAuth={login(a,e){return api.post("/auth/login",{username:a,password:e})},register(a,e,t){return api.post("/auth/register",{username:a,password:e,nickname:t})}},apiTasks={browse(a=0,e=10,t="",s=""){const l=new URLSearchParams({page:a,pageSize:e});return t&&l.append("keyword",t),s&&l.append("category",s),api.get(`/tasks?${l}`)},publish(a,e,t,s){return api.post("/tasks",{title:a,description:e,category:t,reward:s})},accept(a){return api.post(`/tasks/${a}/accept`,{})},complete(a){return api.post(`/tasks/${a}/complete`,{})},cancel(a){return api.post(`/tasks/${a}/cancel`,{})},getDetail(a){return api.get(`/tasks/${a}`)},incrementViews(a){return api.post(`/tasks/${a}/views`,{})},myPublished(a=0,e=10){return api.get(`/tasks/my/published?page=${a}&pageSize=${e}`)},myAccepted(a=0,e=10){return api.get(`/tasks/my/accepted?page=${a}&pageSize=${e}`)}},levelNames=["\u65B0\u624B","\u89C1\u4E60","\u5192\u9669\u8005","\u7CBE\u82F1","\u52C7\u58EB","\u9A91\u58EB","\u9886\u4E3B","\u4F20\u5947"],statusConfig={\u5F85\u63A5\u53D6:{label:"\u5F85\u63A5\u53D6",className:"badge-pending"},\u8FDB\u884C\u4E2D:{label:"\u8FDB\u884C\u4E2D",className:"badge-progress"},\u5DF2\u5B8C\u6210:{label:"\u5DF2\u5B8C\u6210",className:"badge-completed"},\u5DF2\u53D6\u6D88:{label:"\u5DF2\u53D6\u6D88",className:"badge-cancelled"}};async function init(){const a=localStorage.getItem("user"),e=localStorage.getItem("token");a&&e&&(state.user=JSON.parse(a),state.token=e,state.currentPage="dashboard",await loadTasks()),render(),bindEvents()}function bindEvents(){document.querySelectorAll("[data-action]").forEach(e=>{const t=e.dataset.action;e.addEventListener("click",function(){t==="openTaskDetail"?openTaskDetail(e.dataset.id):t==="handleAcceptTask"?handleAcceptTask(parseInt(e.dataset.id)):t==="handleCompleteTask"?handleCompleteTask(parseInt(e.dataset.id)):t==="handleCancelTask"?handleCancelTask(parseInt(e.dataset.id)):t==="navigate"?navigate(e.dataset.page):t==="handleLogout"?handleLogout():t==="toggleUserMenu"?toggleUserMenu():t==="selectCategory"?selectCategory(e,e.dataset.category):t==="setReward"?setReward(parseInt(e.dataset.value)):t==="setProfileTab"?(state.profileTab=e.dataset.tab,render()):t==="setCategory"&&(state.category=e.dataset.key,state.page=0,loadTasks())})});const a=document.getElementById("search-input");a&&a.addEventListener("input",function(){state.searchQuery=this.value,loadTasks()})}function navigate(a,e={}){state.currentPage=a,state.showUserMenu=!1,state.pageParams=e,render()}function saveUser(a,e){state.user=a,state.token=e,localStorage.setItem("user",JSON.stringify(a)),localStorage.setItem("token",e)}function clearSession(){state.user=null,state.token=null,state.tasks=[],localStorage.removeItem("user"),localStorage.removeItem("token")}async function handleLogout(a){a&&(a.preventDefault(),a.stopPropagation());try{await api.post("/auth/logout",{})}catch{}clearSession(),navigate("login")}async function loadTasks(){state.loading=!0,render();try{const a=await apiTasks.browse(state.page,10,state.searchQuery,state.category);state.tasks=a.items,state.totalPages=a.totalPages}catch(a){showError(a.message)}finally{state.loading=!1,render()}}function showError(a,e="error-message"){const t=document.getElementById(e);t&&(t.textContent=a,t.style.display="block",setTimeout(()=>t.style.display="none",3e3))}function svgIcon(a,e="w-5 h-5"){return`<svg class="${e}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="${a}"/></svg>`}function formatTimeAgo(a){if(!a)return"\u521A\u521A";const e=new Date(a),s=Math.floor((new Date-e)/1e3);return s<60?"\u521A\u521A":s<3600?`${Math.floor(s/60)}\u5206\u949F\u524D`:s<86400?`${Math.floor(s/3600)}\u5C0F\u65F6\u524D`:`${Math.floor(s/86400)}\u5929\u524D`}function renderNavbar(){if(!state.user)return"";const a=[{page:"dashboard",label:"\u4EFB\u52A1\u5927\u5385",icon:"M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"},{page:"publish",label:"\u53D1\u5E03\u60AC\u8D4F",icon:"M12 4v16m8-8H4"},{page:"profile",label:"\u4E2A\u4EBA\u4E2D\u5FC3",icon:"M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"}],e=state.user.username?.charAt(0).toUpperCase()||"U";return`
    <nav class="navbar">
      <div class="container">
        <div class="navbar-inner">
          <a href="#" class="navbar-logo" data-action="navigate" data-page="dashboard">
            <div class="navbar-logo-icon gradient-campus">${svgIcon("M13 10V3L4 14h7v7l9-11h-7z","w-5 h-5 text-white")}</div>
            <span class="navbar-logo-text">TaskFlow</span>
          </a>
          <div class="navbar-nav">
            ${a.map(t=>`
              <a href="#" class="navbar-nav-item ${state.currentPage===t.page?"active":""}" data-action="navigate" data-page="${t.page}">
                ${svgIcon(t.icon)} ${t.label}
              </a>
            `).join("")}
          </div>
          <div class="navbar-actions">
            <div class="navbar-points">
              ${svgIcon("M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z","navbar-points-icon")}
              <span class="navbar-points-value">${state.user.points||0}</span>
            </div>
            <div class="navbar-user">
              <button class="navbar-user-btn" data-action="toggleUserMenu">
                <div class="navbar-user-avatar gradient-campus">${e}</div>
                <span class="navbar-user-name">${state.user.username}</span>
              </button>
              ${state.showUserMenu?`
                <div class="navbar-user-menu">
                  <div class="navbar-user-menu-header">
                    <div class="navbar-user-menu-name">${state.user.username}</div>
                    <div class="navbar-user-menu-level">Lv.${state.user.guildLevel||1} \xB7 ${state.user.points||0} \u79EF\u5206</div>
                  </div>
                  <button class="navbar-user-menu-item" data-action="navigate" data-page="profile">\u4E2A\u4EBA\u4E2D\u5FC3</button>
                  <button class="navbar-user-menu-item logout" data-action="handleLogout">\u9000\u51FA\u767B\u5F55</button>
                </div>
              `:""}
            </div>
          </div>
        </div>
      </div>
      <div class="navbar-mobile">
        <div class="container">
          <div class="navbar-mobile-nav">
            ${a.map(t=>`
              <a href="#" class="navbar-mobile-item ${state.currentPage===t.page?"active":""}" data-action="navigate" data-page="${t.page}">
                ${svgIcon(t.icon,"w-5 h-5")}
                <span>${t.label}</span>
              </a>
            `).join("")}
          </div>
        </div>
      </div>
    </nav>
  `}function renderTaskCard(a){const e=statusConfig[a.status]||statusConfig.\u5F85\u63A5\u53D6,t=a.publisherNickname?.charAt(0).toUpperCase()||"U";return`
    <div class="task-card card animate-slide-up">
      <div class="task-card-header">
        <h3 class="task-card-title">${a.title}</h3>
        <span class="badge ${e.className}">${e.label}</span>
      </div>
      <p class="task-card-desc">${a.description||""}</p>
      <div class="task-card-footer">
        <div class="task-card-publisher">
          <div class="task-card-avatar gradient-campus">${t}</div>
          <span class="task-card-publisher-name">${a.publisherNickname}</span>
        </div>
        <div class="task-card-reward">
          ${svgIcon("M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z","w-4 h-4")}
          <span class="task-card-reward-value">${a.reward} \u79EF\u5206</span>
        </div>
      </div>
      <div class="task-card-meta">
        <span class="task-card-meta-item">${svgIcon("M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z","w-3.5 h-3.5")} ${formatTimeAgo(a.createdAt)}</span>
        <span class="task-card-meta-item">${svgIcon("M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z","w-3.5 h-3.5")} ${a.views||0}</span>
      </div>
      <button class="task-card-btn" data-action="openTaskDetail" data-id="${a.id}">\u67E5\u770B\u8BE6\u60C5</button>
    </div>
  `}function renderLoginPage(){return`
    <div class="login-page gradient-subtle">
      <div class="login-container">
        <div class="login-header animate-fade-in">
          <div class="login-header-icon gradient-campus">${svgIcon("M13 10V3L4 14h7v7l9-11h-7z","w-8 h-8")}</div>
          <h1>\u6B22\u8FCE\u56DE\u6765</h1>
          <p>\u767B\u5F55\u4F60\u7684 Campus Guild \u8D26\u53F7</p>
        </div>
        <div class="login-card card animate-slide-up">
          <form class="login-form" id="login-form" onsubmit="handleLogin(event)">
            <div>
              <label class="login-form-label">\u7528\u6237\u540D</label>
              <input type="text" id="login-username" class="input-field" placeholder="\u8BF7\u8F93\u5165\u7528\u6237\u540D" required>
            </div>
            <div>
              <label class="login-form-label">\u5BC6\u7801</label>
              <input type="password" id="login-password" class="input-field" placeholder="\u8BF7\u8F93\u5165\u5BC6\u7801" required>
            </div>
            <div id="login-error" class="error-message" style="display:none;"></div>
            <button type="submit" class="btn-primary" id="login-btn">\u767B\u5F55</button>
          </form>
          <div class="login-footer">
            <p class="login-footer-text">\u8FD8\u6CA1\u6709\u8D26\u53F7\uFF1F <a href="#" class="login-footer-link" data-action="navigate" data-page="register">\u7ACB\u5373\u6CE8\u518C</a></p>
          </div>
        </div>
        <div class="login-copyright">Campus Guild TaskFlow \xA9 2026</div>
      </div>
    </div>
  `}function renderRegisterPage(){return`
    <div class="login-page gradient-subtle">
      <div class="login-container">
        <div class="login-header animate-fade-in">
          <div class="login-header-icon gradient-campus">${svgIcon("M13 10V3L4 14h7v7l9-11h-7z","w-8 h-8")}</div>
          <h1>\u52A0\u5165\u516C\u4F1A</h1>
          <p>\u6CE8\u518C\u4F60\u7684 Campus Guild \u8D26\u53F7</p>
        </div>
        <div class="login-card card animate-slide-up">
          <div id="register-error" class="error-message" style="display:none;"></div>
          <form class="login-form" id="register-form" onsubmit="handleRegister(event)">
            <div>
              <label class="login-form-label">\u7528\u6237\u540D</label>
              <input type="text" id="reg-username" class="input-field" placeholder="\u8BF7\u8F93\u5165\u7528\u6237\u540D" required>
            </div>
            <div>
              <label class="login-form-label">\u6635\u79F0</label>
              <input type="text" id="reg-nickname" class="input-field" placeholder="\u8BF7\u8F93\u5165\u6635\u79F0" required>
            </div>
            <div>
              <label class="login-form-label">\u5BC6\u7801</label>
              <input type="password" id="reg-password" class="input-field" placeholder="\u8BF7\u8F93\u5165\u5BC6\u7801\uFF08\u81F3\u5C116\u4F4D\uFF09" required>
            </div>
            <div>
              <label class="login-form-label">\u786E\u8BA4\u5BC6\u7801</label>
              <input type="password" id="reg-confirm" class="input-field" placeholder="\u8BF7\u518D\u6B21\u8F93\u5165\u5BC6\u7801" required>
            </div>
            <button type="submit" class="btn-primary">\u6CE8\u518C</button>
          </form>
          <div class="login-footer">
            <p class="login-footer-text">\u5DF2\u6709\u8D26\u53F7\uFF1F <a href="#" class="login-footer-link" data-action="navigate" data-page="login">\u7ACB\u5373\u767B\u5F55</a></p>
          </div>
        </div>
        <div class="login-copyright">Campus Guild TaskFlow \xA9 2026</div>
      </div>
    </div>
  `}async function renderDashboardPage(){const a=[{key:"",label:"\u5168\u90E8"},{key:"delivery",label:"\u4EE3\u62FF\u4EE3\u9001"},{key:"tech",label:"\u6280\u672F\u6C42\u52A9"},{key:"study",label:"\u5B66\u4E60\u8F85\u5BFC"},{key:"secondhand",label:"\u4E8C\u624B\u4EA4\u6613"},{key:"other",label:"\u5176\u4ED6"}];return`
    <div class="page">
      ${renderNavbar()}
      <div class="container page-content">
        <div class="dashboard-header animate-fade-in">
          <h1>\u4EFB\u52A1\u5927\u5385</h1>
          <p>\u6D4F\u89C8\u5E76\u63A5\u53D6\u611F\u5174\u8DA3\u7684\u6821\u56ED\u4EFB\u52A1</p>
        </div>
        <div class="filter-bar card animate-slide-up" style="animation-delay:0.2s">
          <div class="filter-bar-inner">
            <div class="search-wrapper">
              ${svgIcon("M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z","w-5 h-5")}
              <input type="text" class="input-field search-input" placeholder="\u641C\u7D22\u4EFB\u52A1..." value="${state.searchQuery}" oninput="state.searchQuery=this.value;loadTasks();">
            </div>
            <div class="filter-buttons">
              ${a.map(e=>`
                <button class="filter-btn ${state.category===e.key?"active":""}" data-action="setCategory" data-key="${e.key}">${e.label}</button>
              `).join("")}
            </div>
          </div>
        </div>
        ${state.loading?`
          <div class="card empty-state">
            <p>\u52A0\u8F7D\u4E2D...</p>
          </div>
        `:state.tasks.length>0?`
          <div class="tasks-grid">
            ${state.tasks.map((e,t)=>renderTaskCard(e)).join("")}
          </div>
        `:`
          <div class="card empty-state">
            ${svgIcon("M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z","w-16 h-16")}
            <p>\u6682\u65E0\u5339\u914D\u7684\u4EFB\u52A1</p>
          </div>
        `}
      </div>
    </div>
  `}async function viewTaskDetail(a){try{const e=await apiTasks.getDetail(a);state.currentTask=e,state.currentPage="taskDetail",render()}catch(e){console.error("viewTaskDetail error:",e)}}async function renderTaskDetailPage(){const a=state.currentTask;if(!a)return renderDashboardPage();const e=statusConfig[a.status],t=a.publisherNickname?.charAt(0).toUpperCase()||"U";let s="";return a.status==="\u5F85\u63A5\u53D6"?a.publisherId===state.user.id?s=`<div class="detail-progress">\u8FD9\u662F\u4F60\u53D1\u5E03\u7684\u4EFB\u52A1\uFF0C\u7B49\u5F85\u4ED6\u4EBA\u63A5\u53D6</div>
                    <button class="btn-secondary" data-action="handleCancelTask" data-id="${a.id}">\u53D6\u6D88\u4EFB\u52A1</button>`:s=`<button class="btn-success" data-action="handleAcceptTask" data-id="${a.id}">\u63A5\u53D6\u4EFB\u52A1</button>`:a.status==="\u8FDB\u884C\u4E2D"?a.publisherId===state.user.id?s=`<button class="btn-primary" data-action="handleCompleteTask" data-id="${a.id}">\u786E\u8BA4\u5B8C\u6210</button>
                    <button class="btn-secondary" data-action="handleCancelTask" data-id="${a.id}">\u53D6\u6D88\u4EFB\u52A1</button>`:a.accepterId===state.user.id?s='<div class="detail-progress">\u4F60\u5DF2\u63A5\u53D6\u6B64\u4EFB\u52A1\uFF0C\u8BF7\u5C3D\u5FEB\u5B8C\u6210</div>':s='<div class="detail-progress">\u4EFB\u52A1\u8FDB\u884C\u4E2D...</div>':s=`<div class="detail-completed">${e?.label||a.status}</div>`,`
    <div class="page">
      ${renderNavbar()}
      <div class="container page-content">
        <button class="back-btn" data-action="navigate" data-page="dashboard">${svgIcon("M15 19l-7-7 7-7")} \u8FD4\u56DE</button>
        <div id="detail-message" class="error-message" style="display:none;"></div>
        <div class="detail-card card animate-scale-in">
          <div class="detail-header">
            <div>
              <h1 class="detail-title">${a.title}</h1>
              <div class="detail-badges">
                <span class="badge ${e.className}">${e.label}</span>
                <span class="task-card-meta-item">${svgIcon("M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z","w-4 h-4")} ${formatTimeAgo(a.createdAt)}</span>
                <span class="task-card-meta-item">${svgIcon("M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z","w-4 h-4")} ${a.views||0} \u6B21\u6D4F\u89C8</span>
              </div>
            </div>
            <div class="detail-reward">
              ${svgIcon("M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z")}
              <span class="detail-reward-value">${a.reward}</span>
              <span class="detail-reward-label">\u79EF\u5206</span>
            </div>
          </div>
          <div class="detail-section">
            <h2 class="detail-section-title">\u4EFB\u52A1\u63CF\u8FF0</h2>
            <p class="detail-desc">${a.description||"\u65E0\u63CF\u8FF0"}</p>
          </div>
          <div class="detail-section">
            <h2 class="detail-section-title">\u53D1\u5E03\u8005\u4FE1\u606F</h2>
            <div class="detail-publisher">
              <div class="detail-publisher-avatar gradient-campus">${t}</div>
              <div>
                <div class="detail-publisher-name">${a.publisherNickname}</div>
                <div class="detail-publisher-level">Lv.${a.publisherGuildLevel||1} \xB7 \u516C\u4F1A\u6210\u5458</div>
              </div>
            </div>
          </div>
          <div class="detail-section">
            <div class="detail-actions">
              ${s}
            </div>
          </div>
        </div>
      </div>
    </div>
  `}function renderPublishPage(){const a=[{value:"delivery",label:"\u4EE3\u62FF\u4EE3\u9001",icon:"M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"},{value:"tech",label:"\u6280\u672F\u6C42\u52A9",icon:"M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"},{value:"study",label:"\u5B66\u4E60\u8F85\u5BFC",icon:"M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"},{value:"secondhand",label:"\u4E8C\u624B\u4EA4\u6613",icon:"M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"},{value:"other",label:"\u5176\u4ED6",icon:"M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"}];return`
    <div class="page">
      ${renderNavbar()}
      <div class="container page-content">
        <div class="publish-header animate-fade-in">
          <h1>\u53D1\u5E03\u60AC\u8D4F</h1>
          <p>\u586B\u5199\u4EFB\u52A1\u4FE1\u606F\uFF0C\u7B49\u5F85\u5192\u9669\u8005\u63A5\u53D6</p>
        </div>
        <div class="publish-card card animate-slide-up">
          <div id="publish-error" class="error-message" style="display:none;"></div>
          <form class="publish-form" onsubmit="handlePublish(event)">
            <div>
              <label class="publish-label">\u4EFB\u52A1\u6807\u9898</label>
              <input type="text" id="pub-title" class="input-field" placeholder="\u7B80\u8981\u63CF\u8FF0\u4F60\u7684\u4EFB\u52A1" required>
            </div>
            <div>
              <label class="publish-label">\u4EFB\u52A1\u5206\u7C7B</label>
              <div class="publish-categories">
                ${a.map(e=>`
                  <button type="button" class="publish-category-btn" data-action="selectCategory" data-category="${e.value}">
                    ${svgIcon(e.icon)} <span>${e.label}</span>
                  </button>
                `).join("")}
              </div>
            </div>
            <div>
              <label class="publish-label">\u8BE6\u7EC6\u63CF\u8FF0</label>
              <textarea id="pub-desc" class="input-field publish-textarea" placeholder="\u8BE6\u7EC6\u63CF\u8FF0\u4EFB\u52A1\u5185\u5BB9\u3001\u8981\u6C42\u3001\u65F6\u95F4\u5730\u70B9\u7B49\u4FE1\u606F"></textarea>
            </div>
            <div>
              <label class="publish-label">\u60AC\u8D4F\u79EF\u5206</label>
              <div class="publish-reward-row">
                <input type="number" id="pub-reward" class="input-field publish-reward-input" placeholder="10" min="1" required>
                <span class="publish-reward-label">\u79EF\u5206</span>
                <div class="publish-reward-presets">
                  <button type="button" class="publish-reward-preset" data-action="setReward" data-value="10">10</button>
                  <button type="button" class="publish-reward-preset" data-action="setReward" data-value="20">20</button>
                  <button type="button" class="publish-reward-preset" data-action="setReward" data-value="50">50</button>
                </div>
              </div>
            </div>
            <div class="publish-actions">
              <button type="button" class="btn-secondary" data-action="navigate" data-page="dashboard">\u53D6\u6D88</button>
              <button type="submit" class="btn-primary">\u53D1\u5E03\u4EFB\u52A1</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `}async function renderProfilePage(){const a=state.user,e=a?.guildLevel||1,t=levelNames[Math.min(e-1,levelNames.length-1)],s=a?.username?.charAt(0).toUpperCase()||"U",l=state.profileTab||"published";let i=[];try{i=(l==="published"?await apiTasks.myPublished():await apiTasks.myAccepted()).items||[]}catch(n){console.error(n)}return`
    <div class="page">
      ${renderNavbar()}
      <div class="container page-content">
        <div class="profile-card card animate-fade-in">
          <div class="profile-banner gradient-campus">
            <div class="profile-banner-decor">
              <div class="profile-banner-circle profile-banner-circle-1"></div>
              <div class="profile-banner-circle profile-banner-circle-2"></div>
              <div class="profile-banner-circle profile-banner-circle-3"></div>
            </div>
          </div>
          <div class="profile-body">
            <div class="profile-info">
              <div class="profile-avatar-wrapper">
                <div class="profile-avatar gradient-campus">${s}</div>
              </div>
              <div class="profile-details">
                <div class="profile-name-row">
                  <h1 class="profile-name">${a?.username||"\u7528\u6237"}</h1>
                  <span class="profile-level-badge">Lv.${e} \xB7 ${t}</span>
                </div>
                <p class="profile-joined">\u79EF\u5206: ${a?.points||0} | \u7ECF\u9A8C: ${a?.experience||0}</p>
              </div>
            </div>
            <div class="profile-exp">
              <div class="profile-exp-header">
                <span class="profile-exp-label">\u7ECF\u9A8C\u503C</span>
                <span class="profile-exp-value">${(e-1)*100+50} / ${e*100}</span>
              </div>
              <div class="profile-exp-bar">
                <div class="profile-exp-fill gradient-campus" style="width:50%"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="profile-tabs-card card animate-slide-up" style="animation-delay:0.4s">
          <div class="profile-tabs">
            <button class="profile-tab ${l==="published"?"active":""}" data-action="setProfileTab" data-tab="published">\u6211\u53D1\u5E03\u7684</button>
            <button class="profile-tab ${l==="accepted"?"active":""}" data-action="setProfileTab" data-tab="accepted">\u6211\u63A5\u53D6\u7684</button>
          </div>
          <div class="profile-tab-content">
            ${i.length>0?`
              <div class="tasks-grid">
                ${i.map(n=>renderTaskCard(n)).join("")}
              </div>
            `:`
              <div class="profile-empty">\u6682\u65E0\u4EFB\u52A1\u8BB0\u5F55</div>
            `}
          </div>
        </div>
      </div>
    </div>
  `}async function render(){const a=document.getElementById("app");let e="";switch(state.currentPage){case"login":e=renderLoginPage();break;case"register":e=renderRegisterPage();break;case"dashboard":e=await renderDashboardPage();break;case"taskDetail":e=await renderTaskDetailPage();break;case"publish":e=renderPublishPage();break;case"profile":e=await renderProfilePage();break;default:e=renderLoginPage()}a.innerHTML=e,window.scrollTo(0,0),bindEvents()}async function handleLogin(a){a&&a.preventDefault();const e=document.getElementById("login-username"),t=document.getElementById("login-password"),s=document.getElementById("login-error");if(!e||!t)return;const l=e.value,i=t.value;try{const n=await apiAuth.login(l,i);saveUser(n.user,n.token),navigate("dashboard"),await loadTasks()}catch(n){console.error("Login error:",n),s.textContent=n.message,s.style.display="block",setTimeout(function(){s.style.display="none"},3e3)}}async function handleRegister(a){a.preventDefault();const e=document.getElementById("reg-username").value,t=document.getElementById("reg-nickname").value,s=document.getElementById("reg-password").value,l=document.getElementById("reg-confirm").value,i=document.getElementById("register-error");if(s!==l){i.textContent="\u4E24\u6B21\u8F93\u5165\u7684\u5BC6\u7801\u4E0D\u4E00\u81F4",i.style.display="block";return}if(s.length<6){i.textContent="\u5BC6\u7801\u957F\u5EA6\u81F3\u5C11\u4E3A6\u4F4D",i.style.display="block";return}try{await apiAuth.register(e,s,t),navigate("login"),showError("\u6CE8\u518C\u6210\u529F\uFF0C\u8BF7\u767B\u5F55","login-error")}catch(n){i.textContent=n.message,i.style.display="block"}}async function handleAcceptTask(a){try{await apiTasks.accept(a),state.currentTask=await apiTasks.getDetail(a),render(),showError("\u63A5\u53D6\u6210\u529F\uFF01","detail-message")}catch(e){render(),showError(e.message||"\u63A5\u53D6\u5931\u8D25","detail-message")}}async function handleCompleteTask(a){try{await apiTasks.complete(a),state.currentTask=await apiTasks.getDetail(a);const e=await api.get("/auth/me");saveUser(e,state.token),render(),showError("\u4EFB\u52A1\u5DF2\u5B8C\u6210\uFF0C\u79EF\u5206\u5DF2\u7ED3\u7B97\uFF01","detail-message")}catch(e){render(),showError(e.message||"\u64CD\u4F5C\u5931\u8D25","detail-message")}}async function handleCancelTask(a){try{await apiTasks.cancel(a);const e=await api.get("/auth/me");saveUser(e,state.token),navigate("dashboard"),await loadTasks()}catch(e){render(),showError(e.message||"\u53D6\u6D88\u5931\u8D25","detail-message")}}function selectCategory(a,e){document.querySelectorAll(".publish-category-btn").forEach(t=>t.classList.remove("active")),a.classList.add("active"),state.selectedCategory=e}function setReward(a){document.getElementById("pub-reward").value=a,document.querySelectorAll(".publish-reward-preset").forEach(e=>{e.classList.toggle("active",e.textContent==a)})}async function handlePublish(a){a.preventDefault();const e=document.getElementById("pub-title").value,t=document.getElementById("pub-desc").value,s=parseInt(document.getElementById("pub-reward").value),l=state.selectedCategory||"other",i=document.getElementById("publish-error");try{await apiTasks.publish(e,t,l,s),navigate("dashboard"),await loadTasks()}catch(n){i.textContent=n.message,i.style.display="block"}}function toggleUserMenu(){state.showUserMenu=!state.showUserMenu,render()}function openTaskDetail(a){viewTaskDetail(a)}function doLogin(){handleLogin({preventDefault:function(){}}).catch(function(a){console.error("Login error:",a)})}document.addEventListener("DOMContentLoaded",function(){init()});
