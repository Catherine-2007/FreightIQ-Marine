// FreightIQ Marine :: Multi-currency support
// All monetary values are stored/computed in USD in the database and
// backend engines (freight markets are USD-denominated internationally).
// This module converts for DISPLAY only, using static indicative reference
// rates — not a live FX feed. Clearly labelled as such in the UI.

const FIQ_CURRENCIES = [
  { code: 'USD', symbol: '$',  name: 'US Dollar',        rate: 1.0    },
  { code: 'INR', symbol: '₹',  name: 'Indian Rupee',     rate: 83.30  },
  { code: 'EUR', symbol: '€',  name: 'Euro',             rate: 0.92   },
  { code: 'GBP', symbol: '£',  name: 'British Pound',    rate: 0.79   },
  { code: 'JPY', symbol: '¥',  name: 'Japanese Yen',     rate: 149.50 },
  { code: 'CNY', symbol: '¥',  name: 'Chinese Yuan',     rate: 7.24   },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham',      rate: 3.67   },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rate: 1.34   },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar',rate: 1.52   },
  { code: 'ZAR', symbol: 'R',  name: 'South African Rand', rate: 18.60 },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real',   rate: 5.05   },
];

function fiqCurrentCurrency() {
  const code = localStorage.getItem('fiq_currency') || 'USD';
  return FIQ_CURRENCIES.find(c => c.code === code) || FIQ_CURRENCIES[0];
}

/** Convert a USD amount to the selected display currency and format it. */
function fiqMoney(usdAmount, decimals) {
  if (usdAmount === null || usdAmount === undefined || isNaN(usdAmount)) return '—';
  const cur = fiqCurrentCurrency();
  const converted = Number(usdAmount) * cur.rate;
  const d = decimals !== undefined ? decimals : (cur.code === 'JPY' ? 0 : 2);
  const formatted = converted.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
  return `${cur.symbol}${formatted}`;
}

/** Same as fiqMoney but with no decimal places — handy for large totals. */
function fiqMoneyWhole(usdAmount) {
  return fiqMoney(usdAmount, 0);
}

function fiqSetCurrency(code) {
  localStorage.setItem('fiq_currency', code);
  window.dispatchEvent(new CustomEvent('fiq-currency-changed'));
}

function fiqBuildCurrencySwitcher(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const current = fiqCurrentCurrency().code;
  el.innerHTML = `<select id="currencySwitcher">${FIQ_CURRENCIES.map(c => `<option value="${c.code}" ${c.code===current?'selected':''}>${c.code} ${c.symbol}</option>`).join('')}</select>`;
  document.getElementById('currencySwitcher').addEventListener('change', (e) => fiqSetCurrency(e.target.value));
}
