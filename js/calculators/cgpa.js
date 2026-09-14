/**
 * StudentKit India - CGPA & SGPA Calculator
 */

export function initCgpaCalculator() {
  const tabs = document.querySelectorAll('#cgpa-view .tab-btn');
  const sections = {
    'cgpa-converter': document.getElementById('cgpa-converter-section'),
    'sgpa-calculator': document.getElementById('sgpa-calculator-section'),
  };

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

  // 1. CGPA to Percentage Converter
  const cgpaInput = document.getElementById('cgpa-value-input');
  const formulaSelect = document.getElementById('cgpa-formula-select');
  const cgpaResultVal = document.getElementById('cgpa-pct-result-val');
  const cgpaFormulaExplanation = document.getElementById('cgpa-formula-explanation');
  const cgpaDivision = document.getElementById('cgpa-division');

  function calculateCgpaToPct() {
    const cgpa = parseFloat(cgpaInput?.value) || 0;
    const formula = formulaSelect?.value || 'cbse';

    let pct = 0;
    let explanation = '';

    if (cgpa > 10) {
      if (cgpaResultVal) cgpaResultVal.innerHTML = `Max 10.0`;
      return;
    }

    switch (formula) {
      case 'cbse':
        // CBSE Standard: CGPA * 9.5
        pct = cgpa * 9.5;
        explanation = `Percentage = ${cgpa} × 9.5 = ${pct.toFixed(2)}% (Official CBSE Standard)`;
        break;
      case 'aicte':
        // AICTE: (CGPA - 0.75) * 10
        pct = Math.max(0, (cgpa - 0.75) * 10);
        explanation = `Percentage = (${cgpa} - 0.75) × 10 = ${pct.toFixed(2)}% (AICTE/Engineering)`;
        break;
      case 'standard10':
        // 10x Scale: CGPA * 10
        pct = cgpa * 10;
        explanation = `Percentage = ${cgpa} × 10 = ${pct.toFixed(2)}% (10-Point Scale)`;
        break;
      case 'mumbai':
        // Mumbai University 10-point scale: 7.1 + 0.7*(CGPA-7.1) approx or 7.25*CGPA + 11 (<=7.34) or 7.1*CGPA + 12
        if (cgpa >= 7.0) {
          pct = 7.1 * cgpa + 12;
        } else {
          pct = 7.25 * cgpa + 11;
        }
        pct = Math.min(100, Math.max(0, pct));
        explanation = `Percentage calculated using Mumbai University formula = ${pct.toFixed(2)}%`;
        break;
      case 'vtu':
        // VTU: (CGPA - 0.75) * 10
        pct = Math.max(0, (cgpa - 0.75) * 10);
        explanation = `Percentage = (${cgpa} - 0.75) × 10 = ${pct.toFixed(2)}% (VTU Formula)`;
        break;
      default:
        pct = cgpa * 9.5;
        explanation = `Percentage = ${cgpa} × 9.5 = ${pct.toFixed(2)}%`;
    }

    if (cgpaResultVal) {
      cgpaResultVal.innerHTML = `${pct.toFixed(2)}<span>%</span>`;
    }
    if (cgpaFormulaExplanation) {
      cgpaFormulaExplanation.textContent = explanation;
    }

    // Performance / Division
    let division = '-';
    let color = 'var(--text-secondary)';
    if (pct >= 75) {
      division = 'First Class with Distinction 🏆';
      color = 'var(--success)';
    } else if (pct >= 60) {
      division = 'First Class';
      color = 'var(--primary-light)';
    } else if (pct >= 50) {
      division = 'Second Class';
      color = 'var(--warning)';
    } else if (pct >= 40) {
      division = 'Pass Class';
      color = 'var(--text-secondary)';
    } else if (cgpa > 0) {
      division = 'Fail / Backlog';
      color = 'var(--danger)';
    }

    if (cgpaDivision) {
      cgpaDivision.textContent = division;
      cgpaDivision.style.color = color;
    }
  }

  cgpaInput?.addEventListener('input', calculateCgpaToPct);
  formulaSelect?.addEventListener('change', calculateCgpaToPct);

  // Preset chips for formulas
  document.querySelectorAll('#cgpa-converter-section .preset-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const formula = chip.dataset.formula;
      if (formulaSelect) {
        formulaSelect.value = formula;
        calculateCgpaToPct();
      }
    });
  });

  // 2. SGPA / Semester Calculator
  const subjectsTbody = document.getElementById('sgpa-subjects-body');
  const addSubjectBtn = document.getElementById('sgpa-add-subject-btn');
  const sgpaResultVal = document.getElementById('sgpa-result-val');
  const sgpaTotalCredits = document.getElementById('sgpa-total-credits');
  const sgpaTotalPoints = document.getElementById('sgpa-total-points');
  const sgpaEquivalentPct = document.getElementById('sgpa-equiv-pct');

  const gradeMap = {
    '10': 10, // O / Outstanding
    '9': 9,   // A+ / Excellent
    '8': 8,   // A / Very Good
    '7': 7,   // B+ / Good
    '6': 6,   // B / Above Average
    '5': 5,   // C / Average
    '4': 4,   // P / Pass
    '0': 0    // F / Fail
  };

  let subjectCounter = 0;

  function createSubjectRow(name = '', credits = 4, grade = '10') {
    subjectCounter++;
    const tr = document.createElement('tr');
    tr.dataset.id = subjectCounter;
    tr.innerHTML = `
      <td>
        <input type="text" class="sgpa-sub-name" placeholder="Subject ${subjectCounter}" value="${name || 'Subject ' + subjectCounter}">
      </td>
      <td>
        <input type="number" class="sgpa-sub-credits" value="${credits}" min="1" max="20" step="0.5">
      </td>
      <td>
        <select class="sgpa-sub-grade">
          <option value="10" ${grade === '10' ? 'selected' : ''}>O (10 - Outstanding)</option>
          <option value="9" ${grade === '9' ? 'selected' : ''}>A+ (9 - Excellent)</option>
          <option value="8" ${grade === '8' ? 'selected' : ''}>A (8 - Very Good)</option>
          <option value="7" ${grade === '7' ? 'selected' : ''}>B+ (7 - Good)</option>
          <option value="6" ${grade === '6' ? 'selected' : ''}>B (6 - Above Average)</option>
          <option value="5" ${grade === '5' ? 'selected' : ''}>C (5 - Average)</option>
          <option value="4" ${grade === '4' ? 'selected' : ''}>P (4 - Pass)</option>
          <option value="0" ${grade === '0' ? 'selected' : ''}>F (0 - Fail/Absent)</option>
        </select>
      </td>
      <td style="text-align: center;">
        <button type="button" class="remove-row-btn" title="Remove Subject">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </td>
    `;

    // Add listeners
    tr.querySelector('.sgpa-sub-credits').addEventListener('input', calculateSgpa);
    tr.querySelector('.sgpa-sub-grade').addEventListener('change', calculateSgpa);
    tr.querySelector('.remove-row-btn').addEventListener('click', () => {
      if (subjectsTbody.children.length > 1) {
        tr.remove();
        calculateSgpa();
      }
    });

    return tr;
  }

  function calculateSgpa() {
    if (!subjectsTbody) return;
    const rows = subjectsTbody.querySelectorAll('tr');
    let totalCredits = 0;
    let totalPoints = 0;

    rows.forEach(row => {
      const credit = parseFloat(row.querySelector('.sgpa-sub-credits')?.value) || 0;
      const grade = parseFloat(row.querySelector('.sgpa-sub-grade')?.value) || 0;

      totalCredits += credit;
      totalPoints += credit * grade;
    });

    const sgpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    const equivPct = sgpa * 9.5;

    if (sgpaResultVal) sgpaResultVal.innerHTML = `${sgpa.toFixed(2)}<span>/ 10</span>`;
    if (sgpaTotalCredits) sgpaTotalCredits.textContent = totalCredits.toFixed(1);
    if (sgpaTotalPoints) sgpaTotalPoints.textContent = totalPoints.toFixed(1);
    if (sgpaEquivalentPct) sgpaEquivalentPct.textContent = `${equivPct.toFixed(2)}%`;
  }

  addSubjectBtn?.addEventListener('click', () => {
    subjectsTbody?.appendChild(createSubjectRow());
    calculateSgpa();
  });

  // Seed with 5 default subjects
  if (subjectsTbody && subjectsTbody.children.length === 0) {
    const defaults = [
      { name: 'Engineering Mathematics', credits: 4, grade: '9' },
      { name: 'Data Structures & Algorithms', credits: 4, grade: '10' },
      { name: 'Computer Networks', credits: 3, grade: '8' },
      { name: 'Operating Systems', credits: 3, grade: '9' },
      { name: 'Software Lab', credits: 2, grade: '10' },
    ];
    defaults.forEach(d => {
      subjectsTbody.appendChild(createSubjectRow(d.name, d.credits, d.grade));
    });
  }

  calculateCgpaToPct();
  calculateSgpa();
}
