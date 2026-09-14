/**
 * StudentKit India - Grade Calculator & Final Exam Forecaster
 */

export function initGradeCalculator() {
  const tabs = document.querySelectorAll('#grade-view .tab-btn');
  const sections = {
    'grade-scale': document.getElementById('grade-scale-section'),
    'final-target': document.getElementById('grade-target-section'),
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

  // 1. Marks to Letter Grade
  const scoreInput = document.getElementById('grade-score-input');
  const scaleSelect = document.getElementById('grade-scale-select');
  const gradeResultVal = document.getElementById('grade-letter-result');
  const gradePointsVal = document.getElementById('grade-points-result');
  const gradeRemarksVal = document.getElementById('grade-remarks-result');
  const gradeStatusPill = document.getElementById('grade-status-pill');

  function calculateGrade() {
    const score = parseFloat(scoreInput?.value) || 0;
    const scale = scaleSelect?.value || 'cbse';

    let letter = 'F';
    let points = '0.0';
    let remarks = 'Needs Improvement / Essential Repeat';
    let isPass = false;

    if (scale === 'cbse') {
      // CBSE 9-Point Grading
      if (score >= 91) {
        letter = 'A1';
        points = '10.0';
        remarks = 'Top 1/8th of passed candidates (Exceptional)';
        isPass = true;
      } else if (score >= 81) {
        letter = 'A2';
        points = '9.0';
        remarks = 'Next 1/8th of passed candidates (Excellent)';
        isPass = true;
      } else if (score >= 71) {
        letter = 'B1';
        points = '8.0';
        remarks = 'Very Good (Consistent Performance)';
        isPass = true;
      } else if (score >= 61) {
        letter = 'B2';
        points = '7.0';
        remarks = 'Good (Above Average)';
        isPass = true;
      } else if (score >= 51) {
        letter = 'C1';
        points = '6.0';
        remarks = 'Fair (Average Competency)';
        isPass = true;
      } else if (score >= 41) {
        letter = 'C2';
        points = '5.0';
        remarks = 'Average';
        isPass = true;
      } else if (score >= 33) {
        letter = 'D';
        points = '4.0';
        remarks = 'Pass Grade (Minimum Passing)';
        isPass = true;
      } else if (score >= 21) {
        letter = 'E1';
        points = '0.0';
        remarks = 'Compartmental / Improvement Needed';
        isPass = false;
      } else {
        letter = 'E2';
        points = '0.0';
        remarks = 'Fail / Unsatisfactory';
        isPass = false;
      }
    } else {
      // UGC / University 10-Point Grading (O, A+, A, B+, B, C, P, F)
      if (score >= 90) {
        letter = 'O';
        points = '10.0';
        remarks = 'Outstanding';
        isPass = true;
      } else if (score >= 80) {
        letter = 'A+';
        points = '9.0';
        remarks = 'Excellent';
        isPass = true;
      } else if (score >= 70) {
        letter = 'A';
        points = '8.0';
        remarks = 'Very Good';
        isPass = true;
      } else if (score >= 60) {
        letter = 'B+';
        points = '7.0';
        remarks = 'Good';
        isPass = true;
      } else if (score >= 50) {
        letter = 'B';
        points = '6.0';
        remarks = 'Above Average';
        isPass = true;
      } else if (score >= 45) {
        letter = 'C';
        points = '5.0';
        remarks = 'Average';
        isPass = true;
      } else if (score >= 40) {
        letter = 'P';
        points = '4.0';
        remarks = 'Pass';
        isPass = true;
      } else {
        letter = 'F';
        points = '0.0';
        remarks = 'Fail';
        isPass = false;
      }
    }

    if (gradeResultVal) gradeResultVal.innerHTML = `${letter}`;
    if (gradePointsVal) gradePointsVal.textContent = `${points} Grade Point`;
    if (gradeRemarksVal) gradeRemarksVal.textContent = remarks;

    if (gradeStatusPill) {
      gradeStatusPill.textContent = isPass ? 'Passed ✅' : 'Fail / Compartment ❌';
      gradeStatusPill.className = `status-pill ${isPass ? 'safe' : 'danger'}`;
    }
  }

  scoreInput?.addEventListener('input', calculateGrade);
  scaleSelect?.addEventListener('change', calculateGrade);

  // 2. Final Exam Target Score Calculator
  const currentGradeInput = document.getElementById('target-current-pct');
  const targetGradeInput = document.getElementById('target-desired-pct');
  const finalWeightInput = document.getElementById('target-final-weight');

  const requiredScoreVal = document.getElementById('target-required-score');
  const targetAdvice = document.getElementById('target-advice');

  function calculateTargetExamScore() {
    const currentPct = parseFloat(currentGradeInput?.value) || 0;
    const targetPct = parseFloat(targetGradeInput?.value) || 75;
    const finalWeight = parseFloat(finalWeightInput?.value) || 50;

    const currentWeight = 100 - finalWeight;
    // targetPct = (currentPct * currentWeight / 100) + (finalScore * finalWeight / 100)
    // finalScore = (targetPct - (currentPct * currentWeight / 100)) / (finalWeight / 100)
    const requiredScore = (targetPct - (currentPct * currentWeight / 100)) / (finalWeight / 100);

    if (requiredScoreVal) {
      requiredScoreVal.innerHTML = `${requiredScore.toFixed(1)}<span>%</span>`;
    }

    if (targetAdvice) {
      if (requiredScore <= 0) {
        targetAdvice.textContent = '🎉 You have already secured your desired grade! Even with a 0% in final exam, you pass with your target.';
        targetAdvice.style.color = 'var(--success)';
      } else if (requiredScore <= 100) {
        targetAdvice.textContent = `🎯 You need to score at least ${requiredScore.toFixed(1)}% in your final exam to lock in an overall ${targetPct}%. Totally achievable with good prep!`;
        targetAdvice.style.color = 'var(--text-secondary)';
      } else {
        targetAdvice.textContent = `⚠️ You would need ${requiredScore.toFixed(1)}% in the final exam, which exceeds 100%. Unless extra bonus credit is offered, you cannot mathematically reach this target.`;
        targetAdvice.style.color = 'var(--danger)';
      }
    }
  }

  currentGradeInput?.addEventListener('input', calculateTargetExamScore);
  targetGradeInput?.addEventListener('input', calculateTargetExamScore);
  finalWeightInput?.addEventListener('input', calculateTargetExamScore);

  calculateGrade();
  calculateTargetExamScore();
}
