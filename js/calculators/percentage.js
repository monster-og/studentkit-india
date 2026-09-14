/**
 * StudentKit India - Percentage Calculator
 */

export function initPercentageCalculator() {
  const tabs = document.querySelectorAll('#percentage-view .tab-btn');
  const sections = {
    'marks-to-pct': document.getElementById('pct-marks-section'),
    'basic-pct': document.getElementById('pct-basic-section'),
    'change-pct': document.getElementById('pct-change-section'),
  };

  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.target;
      Object.keys(sections).forEach(key => {
        if (sections[key]) {
          sections[key].style.display = key === target ? 'block' : 'none';
        }
      });
    });
  });

  // 1. Marks to Percentage calculation
  const marksObtained = document.getElementById('pct-marks-obtained');
  const marksTotal = document.getElementById('pct-marks-total');
  const marksResultVal = document.getElementById('pct-marks-result-val');
  const marksFraction = document.getElementById('pct-marks-fraction');
  const marksDivision = document.getElementById('pct-marks-division');
  const marksNeedFor75 = document.getElementById('pct-marks-need-75');

  function calculateMarksPct() {
    const obt = parseFloat(marksObtained?.value) || 0;
    const tot = parseFloat(marksTotal?.value) || 0;

    if (tot <= 0) {
      if (marksResultVal) marksResultVal.innerHTML = `0.00<span>%</span>`;
      if (marksFraction) marksFraction.textContent = '0 / 0';
      if (marksDivision) marksDivision.textContent = '-';
      return;
    }

    const pct = (obt / tot) * 100;
    const formattedPct = pct.toFixed(2);
    if (marksResultVal) marksResultVal.innerHTML = `${formattedPct}<span>%</span>`;
    if (marksFraction) marksFraction.textContent = `${obt} / ${tot}`;

    // Indian Board Division classification
    let division = 'Fail';
    let divColor = 'var(--danger)';
    if (pct >= 75) {
      division = 'Distinction (1st Div)';
      divColor = 'var(--success)';
    } else if (pct >= 60) {
      division = 'First Division';
      divColor = 'var(--primary-light)';
    } else if (pct >= 50) {
      division = 'Second Division';
      divColor = 'var(--warning)';
    } else if (pct >= 33) {
      division = 'Third Division (Pass)';
      divColor = 'var(--text-secondary)';
    }

    if (marksDivision) {
      marksDivision.textContent = division;
      marksDivision.style.color = divColor;
    }

    // Need for 75% distinction
    if (marksNeedFor75) {
      const requiredFor75 = Math.ceil(tot * 0.75);
      if (obt >= requiredFor75) {
        marksNeedFor75.textContent = `Achieved! (+${(obt - requiredFor75).toFixed(1)} marks above 75%)`;
        marksNeedFor75.style.color = 'var(--success)';
      } else {
        const diff = (requiredFor75 - obt).toFixed(1);
        marksNeedFor75.textContent = `${diff} marks needed to reach 75%`;
        marksNeedFor75.style.color = 'var(--warning)';
      }
    }
  }

  marksObtained?.addEventListener('input', calculateMarksPct);
  marksTotal?.addEventListener('input', calculateMarksPct);

  // Marks Presets (500, 600, 100, 80)
  document.querySelectorAll('#pct-marks-section .preset-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const total = chip.dataset.total;
      if (marksTotal) {
        marksTotal.value = total;
        calculateMarksPct();
      }
    });
  });

  // 2. Basic Percentage calculation: What is X% of Y?
  const basicX = document.getElementById('pct-basic-x');
  const basicY = document.getElementById('pct-basic-y');
  const basicResultVal = document.getElementById('pct-basic-result-val');
  const basicFormula = document.getElementById('pct-basic-formula');

  function calculateBasicPct() {
    const x = parseFloat(basicX?.value) || 0;
    const y = parseFloat(basicY?.value) || 0;
    const res = (x / 100) * y;
    if (basicResultVal) basicResultVal.innerHTML = `${res.toLocaleString('en-IN', { maximumFractionDigits: 4 })}`;
    if (basicFormula) basicFormula.textContent = `(${x} / 100) × ${y} = ${res}`;
  }

  basicX?.addEventListener('input', calculateBasicPct);
  basicY?.addEventListener('input', calculateBasicPct);

  // 3. Percentage Change: Old to New
  const changeOld = document.getElementById('pct-change-old');
  const changeNew = document.getElementById('pct-change-new');
  const changeResultVal = document.getElementById('pct-change-result-val');
  const changeDiff = document.getElementById('pct-change-diff');
  const changeType = document.getElementById('pct-change-type');

  function calculateChangePct() {
    const v1 = parseFloat(changeOld?.value) || 0;
    const v2 = parseFloat(changeNew?.value) || 0;

    if (v1 === 0) {
      if (changeResultVal) changeResultVal.innerHTML = `0.00<span>%</span>`;
      return;
    }

    const diff = v2 - v1;
    const pctChange = (diff / Math.abs(v1)) * 100;
    const isIncrease = diff >= 0;

    if (changeResultVal) {
      changeResultVal.innerHTML = `${Math.abs(pctChange).toFixed(2)}<span>%</span>`;
      changeResultVal.style.color = isIncrease ? 'var(--success)' : 'var(--danger)';
    }

    if (changeDiff) {
      changeDiff.textContent = `${diff >= 0 ? '+' : ''}${diff.toLocaleString('en-IN')}`;
    }

    if (changeType) {
      changeType.textContent = isIncrease ? 'Increase ↗' : 'Decrease ↘';
      changeType.className = `status-pill ${isIncrease ? 'safe' : 'danger'}`;
    }
  }

  changeOld?.addEventListener('input', calculateChangePct);
  changeNew?.addEventListener('input', calculateChangePct);

  // Initialize calculations with default values
  calculateMarksPct();
  calculateBasicPct();
  calculateChangePct();
}
