// Side link to the variants gallery (design candidates). Only shown when the page is served by the local gallery server (port 8753).
(() => {
  if (location.port !== '8753') return;
  const a = document.createElement('a');
  a.href = 'variants/index.html'; a.textContent = '후보 갤러리 →'; a.setAttribute('aria-label', 'Open the design variants gallery');
  Object.assign(a.style, { position: 'fixed', left: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 9999, padding: '6px 12px', borderRadius: '999px',
    background: 'rgba(20,25,21,.9)', border: '1px solid #2c3a2e', color: '#cfd8cd', font: '600 14px/1.2 system-ui, sans-serif', textDecoration: 'none' });
  document.body.append(a);
})();
