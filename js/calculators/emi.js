/**
 * StudentKit India - Student & Education EMI Calculator
 */

export function initEmiCalculator() {
  const amountSlider = document.getElementById('emi-amount-slider');
  const amountInput = document.getElementById('emi-amount-input');
  const rateSlider = document.getElementById('emi-rate-slider');
  const rateInput = document.getElementById('emi-rate-input');
  const tenureSlider = document.getElementById('emi-tenure-slider');
  const tenureInput = document.getElementById('emi-tenure-input');
  const tenureUnitSelect = document.getElementById('emi-tenure-unit');

  const monthlyEmiVal = document.getElementById('emi-monthly-val');
  const totalInterestVal = document.getElementById('emi-total-interest');
  const totalPayableVal = document.getElementById('emi-total-payable');
  const principalShareVal = document.getElementById('emi-principal-share');
  const interestShareVal = document.getElementById('emi-interest-share');

  const donutPrincipalCircle = document.getElementById('emi-donut-principal');
  const donutInterestCircle = document.getElementById('emi-donut-interest');

  const DONUT_CIRCUMFERENCE = 377; // 2 * PI * 60 = 376.99

  function formatRupees(num) {
    return '₹' + Math.round(num).toLocaleString('en-IN');
  }

  function calculateEmi() {
    const P = parseFloat(amountInput?.value) || 0;
    const annualRate = parseFloat(rateInput?.value) || 0;
    let tenure = parseFloat(tenureInput?.value) || 1;
    const isYears = tenureUnitSelect?.value === 'years';

    const N = isYears ? tenure * 12 : tenure; // Total months
    const R = annualRate / 12 / 100; // Monthly interest rate

    let emi = 0;
    let totalPayable = 0;
    let totalInterest = 0;

    if (P <= 0 || N <= 0) {
      if (monthlyEmiVal) monthlyEmiVal.innerHTML = `₹0 <span>/ month</span>`;
      if (totalInterestVal) totalInterestVal.textContent = '₹0';
      if (totalPayableVal) totalPayableVal.textContent = '₹0';
      return;
    }

    if (R === 0) {
      // 0% Interest (No-Cost EMI)
      emi = P / N;
      totalPayable = P;
      totalInterest = 0;
    } else {
      // Standard EMI formula: [P x R x (1+R)^N]/[(1+R)^N-1]
      const factor = Math.pow(1 + R, N);
      emi = (P * R * factor) / (factor - 1);
      totalPayable = emi * N;
      totalInterest = totalPayable - P;
    }

    if (monthlyEmiVal) monthlyEmiVal.innerHTML = `${formatRupees(emi)} <span>/ mo</span>`;
    if (totalInterestVal) totalInterestVal.textContent = formatRupees(totalInterest);
    if (totalPayableVal) totalPayableVal.textContent = formatRupees(totalPayable);

    // Percentage shares
    const principalPct = totalPayable > 0 ? (P / totalPayable) * 100 : 100;
    const interestPct = 100 - principalPct;

    if (principalShareVal) principalShareVal.textContent = `${principalPct.toFixed(1)}% (${formatRupees(P)})`;
    if (interestShareVal) interestShareVal.textContent = `${interestPct.toFixed(1)}% (${formatRupees(totalInterest)})`;

    // Update Donut Chart
    if (donutPrincipalCircle && donutInterestCircle) {
      const principalLength = (principalPct / 100) * DONUT_CIRCUMFERENCE;
      const interestLength = (interestPct / 100) * DONUT_CIRCUMFERENCE;

      donutPrincipalCircle.style.strokeDasharray = `${principalLength} ${DONUT_CIRCUMFERENCE}`;
      donutPrincipalCircle.style.strokeDashoffset = '0';

      donutInterestCircle.style.strokeDasharray = `${interestLength} ${DONUT_CIRCUMFERENCE}`;
      donutInterestCircle.style.strokeDashoffset = `-${principalLength}`;
    }
  }

  // Sync amount
  amountSlider?.addEventListener('input', (e) => {
    if (amountInput) amountInput.value = e.target.value;
    calculateEmi();
  });
  amountInput?.addEventListener('input', (e) => {
    if (amountSlider) amountSlider.value = e.target.value;
    calculateEmi();
  });

  // Sync rate
  rateSlider?.addEventListener('input', (e) => {
    if (rateInput) rateInput.value = e.target.value;
    calculateEmi();
  });
  rateInput?.addEventListener('input', (e) => {
    if (rateSlider) rateSlider.value = e.target.value;
    calculateEmi();
  });

  // Sync tenure
  tenureSlider?.addEventListener('input', (e) => {
    if (tenureInput) tenureInput.value = e.target.value;
    calculateEmi();
  });
  tenureInput?.addEventListener('input', (e) => {
    if (tenureSlider) tenureSlider.value = e.target.value;
    calculateEmi();
  });
  tenureUnitSelect?.addEventListener('change', () => {
    if (tenureUnitSelect.value === 'years') {
      if (tenureSlider) {
        tenureSlider.min = '1';
        tenureSlider.max = '15';
        tenureSlider.value = Math.max(1, Math.round((parseFloat(tenureInput.value) || 12) / 12));
        tenureInput.value = tenureSlider.value;
      }
    } else {
      if (tenureSlider) {
        tenureSlider.min = '3';
        tenureSlider.max = '120';
        tenureSlider.value = (parseFloat(tenureInput.value) || 3) * 12;
        tenureInput.value = tenureSlider.value;
      }
    }
    calculateEmi();
  });

  // Presets
  document.querySelectorAll('#emi-view .preset-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const p = chip.dataset.amount;
      const r = chip.dataset.rate;
      const t = chip.dataset.tenure;
      const u = chip.dataset.unit;

      if (p && amountInput && amountSlider) {
        amountInput.value = p;
        amountSlider.value = p;
      }
      if (r && rateInput && rateSlider) {
        rateInput.value = r;
        rateSlider.value = r;
      }
      if (u && tenureUnitSelect) {
        tenureUnitSelect.value = u;
      }
      if (t && tenureInput && tenureSlider) {
        tenureInput.value = t;
        tenureSlider.value = t;
      }
      calculateEmi();
    });
  });

  calculateEmi();
}
