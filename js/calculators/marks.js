/**
 * StudentKit India - Marks & Marksheet Calculator
 */

export function initMarksCalculator() {
  const tbody = document.getElementById('marks-subjects-body');
  const addBtn = document.getElementById('marks-add-subject-btn');
  const printBtn = document.getElementById('marks-print-btn');
  const bestOfFiveCheckbox = document.getElementById('marks-best-of-5');

  const totalScoreVal = document.getElementById('marks-total-score');
  const totalMaxVal = document.getElementById('marks-total-max');
  const pctResultVal = document.getElementById('marks-pct-result-val');
  const divisionVal = document.getElementById('marks-division-val');
  const highestSubVal = document.getElementById('marks-highest-sub');
  const lowestSubVal = document.getElementById('marks-lowest-sub');
  const avgSubVal = document.getElementById('marks-avg-sub');

  let subjectIndex = 0;

  function createMarksRow(name = '', obtained = 85, max = 100) {
    subjectIndex++;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <input type="text" class="mark-sub-name" placeholder="Subject Name" value="${name || 'Subject ' + subjectIndex}">
      </td>
      <td>
        <input type="number" class="mark-sub-obt" value="${obtained}" min="0" max="1000" step="0.5">
      </td>
      <td>
        <input type="number" class="mark-sub-max" value="${max}" min="1" max="1000" step="1">
      </td>
      <td class="mark-sub-pct" style="font-weight: 600; font-family: var(--font-mono); text-align: center;">
        ${((obtained / max) * 100).toFixed(1)}%
      </td>
      <td style="text-align: center;">
        <button type="button" class="remove-row-btn" title="Delete Subject">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </td>
    `;

    const obtInput = tr.querySelector('.mark-sub-obt');
    const maxInput = tr.querySelector('.mark-sub-max');
    const pctCell = tr.querySelector('.mark-sub-pct');

    function updateRowPct() {
      const o = parseFloat(obtInput.value) || 0;
      const m = parseFloat(maxInput.value) || 1;
      pctCell.textContent = `${((o / m) * 100).toFixed(1)}%`;
      calculateTotalMarks();
    }

    obtInput.addEventListener('input', updateRowPct);
    maxInput.addEventListener('input', updateRowPct);

    tr.querySelector('.remove-row-btn').addEventListener('click', () => {
      if (tbody.children.length > 1) {
        tr.remove();
        calculateTotalMarks();
      }
    });

    return tr;
  }

  function calculateTotalMarks() {
    if (!tbody) return;
    const rows = Array.from(tbody.querySelectorAll('tr'));
    if (rows.length === 0) return;

    const subjectsData = rows.map(r => {
      const name = r.querySelector('.mark-sub-name')?.value || 'Subject';
      const obt = parseFloat(r.querySelector('.mark-sub-obt')?.value) || 0;
      const max = parseFloat(r.querySelector('.mark-sub-max')?.value) || 100;
      const pct = (obt / max) * 100;
      return { name, obt, max, pct };
    });

    let selectedSubjects = subjectsData;
    const isBestOf5 = bestOfFiveCheckbox?.checked && subjectsData.length > 5;

    if (isBestOf5) {
      // Sort descending by percentage and take top 5
      selectedSubjects = [...subjectsData].sort((a, b) => b.pct - a.pct).slice(0, 5);
    }

    const totalObtained = selectedSubjects.reduce((sum, s) => sum + s.obt, 0);
    const totalMax = selectedSubjects.reduce((sum, s) => sum + s.max, 0);
    const overallPct = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
    const avgScore = selectedSubjects.length > 0 ? totalObtained / selectedSubjects.length : 0;

    // Highest and lowest
    const sorted = [...subjectsData].sort((a, b) => b.pct - a.pct);
    const highest = sorted[0];
    const lowest = sorted[sorted.length - 1];

    if (totalScoreVal) totalScoreVal.textContent = totalObtained.toFixed(1);
    if (totalMaxVal) totalMaxVal.textContent = totalMax;
    if (pctResultVal) pctResultVal.innerHTML = `${overallPct.toFixed(2)}<span>%</span>`;

    // Division
    let division = 'Fail / Essential Repeat';
    let divColor = 'var(--danger)';
    if (overallPct >= 75) {
      division = 'Distinction (1st Div) ⭐';
      divColor = 'var(--success)';
    } else if (overallPct >= 60) {
      division = 'First Division';
      divColor = 'var(--primary-light)';
    } else if (overallPct >= 50) {
      division = 'Second Division';
      divColor = 'var(--warning)';
    } else if (overallPct >= 33) {
      division = 'Third Division (Pass)';
      divColor = 'var(--text-secondary)';
    }

    if (divisionVal) {
      divisionVal.textContent = division;
      divisionVal.style.color = divColor;
    }

    if (highestSubVal) highestSubVal.textContent = `${highest.name} (${highest.obt}/${highest.max})`;
    if (lowestSubVal) lowestSubVal.textContent = `${lowest.name} (${lowest.obt}/${lowest.max})`;
    if (avgSubVal) avgSubVal.textContent = `${avgScore.toFixed(1)} marks`;
  }

  addBtn?.addEventListener('click', () => {
    tbody?.appendChild(createMarksRow());
    calculateTotalMarks();
  });

  bestOfFiveCheckbox?.addEventListener('change', calculateTotalMarks);

  // Marksheet Preset Templates
  document.querySelectorAll('#marks-view .preset-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const template = chip.dataset.template;
      tbody.innerHTML = '';
      subjectIndex = 0;

      if (template === 'cbse10') {
        const subjects = [
          { name: 'English (Lang & Lit)', obt: 91, max: 100 },
          { name: 'Hindi / Regional Lang', obt: 88, max: 100 },
          { name: 'Mathematics (Standard)', obt: 94, max: 100 },
          { name: 'Science', obt: 92, max: 100 },
          { name: 'Social Science', obt: 89, max: 100 },
        ];
        subjects.forEach(s => tbody.appendChild(createMarksRow(s.name, s.obt, s.max)));
      } else if (template === 'cbse12pcm') {
        const subjects = [
          { name: 'English Core', obt: 88, max: 100 },
          { name: 'Physics (Th 70 + Pr 30)', obt: 85, max: 100 },
          { name: 'Chemistry (Th 70 + Pr 30)', obt: 90, max: 100 },
          { name: 'Mathematics', obt: 92, max: 100 },
          { name: 'Computer Science / IP', obt: 96, max: 100 },
        ];
        subjects.forEach(s => tbody.appendChild(createMarksRow(s.name, s.obt, s.max)));
      } else if (template === 'cbse12pcb') {
        const subjects = [
          { name: 'English Core', obt: 90, max: 100 },
          { name: 'Physics (Th + Pr)', obt: 84, max: 100 },
          { name: 'Chemistry (Th + Pr)', obt: 89, max: 100 },
          { name: 'Biology (Th + Pr)', obt: 95, max: 100 },
          { name: 'Physical Education', obt: 92, max: 100 },
        ];
        subjects.forEach(s => tbody.appendChild(createMarksRow(s.name, s.obt, s.max)));
      }

      calculateTotalMarks();
    });
  });

  // Print Marksheet
  printBtn?.addEventListener('click', () => {
    window.print();
  });

  // Default seed (5 subjects)
  if (tbody && tbody.children.length === 0) {
    const defaults = [
      { name: 'English', obt: 89, max: 100 },
      { name: 'Mathematics', obt: 94, max: 100 },
      { name: 'Science / Physics', obt: 88, max: 100 },
      { name: 'Social Studies / Chemistry', obt: 91, max: 100 },
      { name: 'Computer / Optional', obt: 95, max: 100 },
    ];
    defaults.forEach(s => tbody.appendChild(createMarksRow(s.name, s.obt, s.max)));
  }

  calculateTotalMarks();
}
