/**
 * Общие CSS-паттерны прототипа q4-vision — реплика стилей реальной Admin-панели «Экраны и звуки».
 * Подключается в `styles` каждого экрана: styles: [Q4_COMMON_STYLES, `...`].
 * Значения — по замерам стенда stand3 (web-campaigns-replica, resto-design-tokens).
 */
export const Q4_COMMON_STYLES = `
  /* === Шапка страницы === */
  .q4-page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
  }
  .q4-page-title {
    font-size: 24px;
    font-weight: 500;
    color: #333333;
    margin: 0;
  }
  .q4-page-subtitle { font-size: 12px; color: #616161; margin-top: 2px; }
  .q4-header-actions { display: flex; align-items: center; gap: 8px; }

  /* === Кнопки (36px, uppercase, radius 4) === */
  .q4-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 36px;
    padding: 0 16px;
    border-radius: 4px;
    border: 1px solid #E0E0E0;
    background: #FFFFFF;
    color: #212121;
    font-family: Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.2px;
    cursor: pointer;
    white-space: nowrap;
  }
  .q4-btn:hover:not(:disabled) { background: #FAFAFA; }
  .q4-btn-primary { background: #448AFF; border-color: #448AFF; color: #FFFFFF; }
  .q4-btn-primary:hover:not(:disabled) { background: #3969D5; }
  .q4-btn-outline { background: #FFFFFF; border: 1px solid #E0E0E0; color: #212121; }
  .q4-btn-outline:hover:not(:disabled) { background: #FAFAFA; }
  .q4-btn-white {
    background: #FFFFFF;
    border: 1px solid transparent;
    box-shadow: 0 2px 2px 0 rgba(224,224,224,1), 0 1px 1px 0 rgba(214,214,214,1);
  }
  .q4-btn:disabled, .q4-btn-disabled { background: #EBEBEB; color: #9E9E9E; border-color: #EBEBEB; cursor: default; }
  .q4-btn-sm { height: 32px; padding: 0 12px; font-size: 12px; }
  .q4-icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    background: transparent;
    color: #616161;
    cursor: pointer;
    flex-shrink: 0;
  }
  .q4-icon-btn:hover { background: #EBEBEB; }
  .q4-icon-btn-border { border: 1px solid #E0E0E0; border-radius: 4px; }
  .q4-icon-btn-danger { color: #FF5252; }
  .q4-icon-btn-danger:hover { background: #FFF2F2; }

  /* === Таблица стенда === */
  .q4-table-wrap {
    background: #FFFFFF;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,.06);
    overflow: auto;
  }
  .q4-table { width: 100%; border-collapse: collapse; font-size: 14px; }
  .q4-table th {
    text-align: left;
    background: #F0F5FF;
    color: #333333;
    font-weight: 400;
    padding: 14px 16px;
    height: 48px;
    white-space: nowrap;
  }
  .q4-table td {
    padding: 13px 16px;
    height: 63px;
    color: rgba(0,0,0,.87);
    border-bottom: 1px solid #E0E0E0;
    vertical-align: middle;
  }
  .q4-table tbody tr:hover td { background: #F5F5F5; cursor: pointer; }
  .q4-table .q4-actions { display: flex; gap: 4px; justify-content: flex-end; }
  .q4-cell-secondary { color: #616161; }

  /* === Поля Material-outlined === */
  .q4-mdc-field {
    position: relative;
    display: inline-flex;
    align-items: center;
    height: 56px;
    border: 1px solid rgba(0,0,0,.23);
    border-radius: 4px;
    background: #FFFFFF;
    padding: 8px 12px 0;
  }
  .q4-mdc-field:focus-within { border: 2px solid #448AFF; padding: 7px 11px 0; }
  .q4-mdc-label {
    position: absolute;
    top: 18px;
    left: 12px;
    font-size: 14px;
    color: #9E9E9E;
    pointer-events: none;
    transition: all 0.15s ease-out;
  }
  .q4-mdc-field:focus-within .q4-mdc-label,
  .q4-mdc-field.has-value .q4-mdc-label {
    top: 6px;
    font-size: 11px;
    color: #448AFF;
  }
  .q4-mdc-input {
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
    font-family: Roboto, sans-serif;
    font-size: 14px;
    color: #212121;
  }

  /* === Overlay / диалоги / end-panels === */
  .q4-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,.32);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: q4-fade-in 0.15s ease-out;
  }
  .q4-dialog {
    background: #FFFFFF;
    border-radius: 4px;
    box-shadow: 0 11px 15px -7px rgba(0,0,0,.2), 0 24px 38px 3px rgba(0,0,0,.14), 0 9px 46px 8px rgba(0,0,0,.12);
    width: 440px;
    max-width: calc(100vw - 32px);
  }
  .q4-dialog-sm { width: 280px; }
  .q4-dialog-title { font-size: 20px; font-weight: 500; color: #212121; padding: 24px 24px 0; }
  .q4-dialog-text { font-size: 16px; color: #616161; padding: 16px 24px 4px; line-height: 1.5; }
  .q4-dialog-actions { display: flex; justify-content: flex-end; gap: 8px; padding: 16px 24px 24px; }
  .q4-dialog-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    border-bottom: 1px solid #E0E0E0;
  }
  .q4-dialog-head-title { font-size: 16px; font-weight: 400; color: #212121; }
  .q4-dialog-body { padding: 14px 20px; }
  .q4-dialog-foot {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 20px;
    border-top: 1px solid #E0E0E0;
  }

  /* === Тост === */
  .q4-toast {
    position: fixed;
    left: 50%;
    bottom: 24px;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 8px;
    background: #424242;
    color: #FFFFFF;
    font-size: 13px;
    border-radius: 4px;
    padding: 10px 16px;
    box-shadow: 0 6px 24px 4px rgba(33,33,33,.12), 0 8px 8px 0 rgba(33,33,33,.12);
    z-index: 3000;
    animation: q4-toast-in 0.25s ease-out;
  }

  /* === Бейджи статусов (стенд) === */
  .q4-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    font-weight: 500;
    border-radius: 999px;
    padding: 4px 10px;
    white-space: nowrap;
  }
  .q4-badge-active { color: #2E7D32; background: #E8F5E9; }
  .q4-badge-scheduled { color: #1565C0; background: #E3F2FD; }
  .q4-badge-expired { color: #757575; background: #F5F5F5; }
  .q4-badge-ready { color: #448AFF; background: rgba(2,155,229,0.12); }
  .q4-badge-waiting { color: #FFAB40; background: rgba(245,166,35,0.15); }
  .q4-badge-error { color: #FF5252; background: #FFF2F2; }
  .q4-badge-offline { color: #616161; background: #F5F5F5; }

  /* === Чипы === */
  .q4-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #333333;
    background: #F5F5F5;
    border: 1px solid #E0E0E0;
    border-radius: 999px;
    padding: 3px 10px;
  }
  .q4-chip-dot { width: 8px; height: 8px; border-radius: 999px; flex-shrink: 0; }
  .q4-chip-x {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border: none;
    background: transparent;
    border-radius: 999px;
    color: #757575;
    cursor: pointer;
    padding: 0;
  }
  .q4-chip-x:hover { background: rgba(0,0,0,.1); }

  /* === Крошки === */
  .q4-crumbs { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #9E9E9E; margin-bottom: 12px; }
  .q4-crumb { cursor: default; }
  .q4-crumb-link { color: #9E9E9E; cursor: pointer; }
  .q4-crumb-link:hover { color: #448AFF; }
  .q4-crumb-sep { color: #BDBDBD; }

  /* === Прогресс готовности === */
  .q4-progress { height: 8px; border-radius: 4px; background: #E0E0E0; overflow: hidden; }
  .q4-progress-fill { height: 100%; background: #448AFF; border-radius: 4px; transition: width 0.4s ease-out; }

  /* === Инфо-плашка (аннотация демо) === */
  .q4-note {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 12px;
    color: #616161;
    background: #F5F9FF;
    border-radius: 4px;
    padding: 10px 12px;
    margin-top: 14px;
    line-height: 1.5;
  }

  @keyframes q4-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes q4-toast-in {
    from { opacity: 0; transform: translate(-50%, 8px); }
    to { opacity: 1; transform: translate(-50%, 0); }
  }
`;
