// FreightIQ Marine :: Admin user management logic
let ROLES = [];
async function loadUsers() {
  try {
    const data = await FIQ.get('users.php');
    ROLES = data.roles;
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = data.users.map(u => {
      const locked = u.locked_until && new Date(u.locked_until) > new Date();
      return `
      <tr>
        <td>${u.full_name}</td><td>${u.email}</td><td>${u.organisation}</td>
        <td>
          <select onchange="changeRole(${u.id}, this.value)">
            ${ROLES.map(r => `<option value="${r.id}" ${r.id===u.role_id?'selected':''}>${r.display_name}</option>`).join('')}
          </select>
        </td>
        <td>${u.is_active == 1 ? `<span class="status-badge status-active">${fiqEnum('Active')}</span>` : '<span class="status-badge status-cancelled">Deactivated</span>'}
            ${locked ? '<div class="subtle" style="color:#ff6b6b;">🔒 Locked</div>' : ''}</td>
        <td>${u.failed_attempts}</td>
        <td>${u.last_login ? new Date(u.last_login).toLocaleString(window.fiqLocale ? fiqLocale() : undefined) : 'Never'}</td>
        <td>
          ${u.is_active == 1 ? `<button class="btn-mini" onclick="userAction(${u.id},'deactivate')">Deactivate</button>` : `<button class="btn-mini" onclick="userAction(${u.id},'activate')">Activate</button>`}
          ${locked ? `<button class="btn-mini" onclick="userAction(${u.id},'unlock')">Unlock</button>` : ''}
        </td>
      </tr>`;
    }).join('');
  } catch (e) {
    console.error(e);
    if (e.status === 401) window.location.href = '../login.php';
    if (e.status === 403) document.getElementById('usersTableBody').innerHTML = '<tr><td colspan="8" class="empty">Access denied.</td></tr>';
  }
}
async function changeRole(id, roleId) {
  try { await FIQ.post('users.php', { action: 'change_role', id, role_id: roleId }); loadUsers(); }
  catch (e) { alert(e.data?.error || 'Could not change role.'); loadUsers(); }
}
async function userAction(id, action) {
  try { await FIQ.post('users.php', { action, id }); loadUsers(); }
  catch (e) { alert(e.data?.error || 'Action failed.'); }
}
document.addEventListener('fiq-refresh-money', loadUsers);
loadUsers();
