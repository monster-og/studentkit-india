/**
 * StudentKit India - Age Calculator & Indian Exam Eligibility
 */

export function initAgeCalculator() {
  const dobInput = document.getElementById('age-dob-input');
  const asOfInput = document.getElementById('age-as-of-input');

  const ageYearsVal = document.getElementById('age-years-val');
  const ageMonthsVal = document.getElementById('age-months-val');
  const ageDaysVal = document.getElementById('age-days-val');
  const ageTotalDays = document.getElementById('age-total-days');
  const ageTotalWeeks = document.getElementById('age-total-weeks');
  const ageNextBday = document.getElementById('age-next-bday');

  const examListContainer = document.getElementById('exam-eligibility-container');

  // Set default as-of date to today
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  if (asOfInput && !asOfInput.value) {
    asOfInput.value = todayStr;
  }
  // Set default DOB to ~19 years ago
  if (dobInput && !dobInput.value) {
    const defaultDob = new Date(today.getFullYear() - 19, today.getMonth(), today.getDate());
    dobInput.value = defaultDob.toISOString().split('T')[0];
  }

  function calculateAge() {
    if (!dobInput?.value || !asOfInput?.value) return;

    const dob = new Date(dobInput.value);
    const asOf = new Date(asOfInput.value);

    if (dob > asOf) {
      if (ageYearsVal) ageYearsVal.innerHTML = `0 <span>yrs</span>`;
      if (ageMonthsVal) ageMonthsVal.innerHTML = `0 <span>mos</span>`;
      if (ageDaysVal) ageDaysVal.innerHTML = `0 <span>days</span>`;
      return;
    }

    let years = asOf.getFullYear() - dob.getFullYear();
    let months = asOf.getMonth() - dob.getMonth();
    let days = asOf.getDate() - dob.getDate();

    if (days < 0) {
      months -= 1;
      // Get days in previous month
      const prevMonth = new Date(asOf.getFullYear(), asOf.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    // Exact decimal age in years
    const ageInYears = years + months / 12 + days / 365.25;

    // Total milliseconds lived
    const diffTime = Math.abs(asOf - dob);
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);

    // Next Birthday calculation
    const nextBdayYear = asOf.getFullYear() + (asOf.getMonth() > dob.getMonth() || (asOf.getMonth() === dob.getMonth() && asOf.getDate() > dob.getDate()) ? 1 : 0);
    const nextBdayDate = new Date(nextBdayYear, dob.getMonth(), dob.getDate());
    const daysToNextBday = Math.ceil((nextBdayDate - asOf) / (1000 * 60 * 60 * 24));
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const nextBdayDayName = dayNames[nextBdayDate.getDay()];

    if (ageYearsVal) ageYearsVal.innerHTML = `${years} <span>Years</span>`;
    if (ageMonthsVal) ageMonthsVal.innerHTML = `${months} <span>Months</span>`;
    if (ageDaysVal) ageDaysVal.innerHTML = `${days} <span>Days</span>`;

    if (ageTotalDays) ageTotalDays.textContent = `${totalDays.toLocaleString('en-IN')} Days`;
    if (ageTotalWeeks) ageTotalWeeks.textContent = `${totalWeeks.toLocaleString('en-IN')} Weeks`;
    if (ageNextBday) {
      ageNextBday.textContent = daysToNextBday === 0
        ? `Today is your Birthday! 🎂 Happy Birthday!`
        : `${daysToNextBday} days remaining (${nextBdayDayName})`;
    }

    // Evaluate Indian Exams
    renderExamEligibility(ageInYears, years, months);
  }

  function renderExamEligibility(ageInYears, years, months) {
    if (!examListContainer) return;

    const exams = [
      {
        name: 'UPSC Civil Services (IAS / IPS)',
        criteria: 'Age: 21 to 32 years (General/EWS)',
        minAge: 21.0,
        maxAge: 32.0,
        note: 'Age relaxation applicable for OBC (+3 yrs), SC/ST (+5 yrs)'
      },
      {
        name: 'SSC CGL (Staff Selection Commission)',
        criteria: 'Age: 18 to 30 / 32 years (depending on post)',
        minAge: 18.0,
        maxAge: 30.0,
        note: 'Requires Bachelor\'s Degree from recognized university'
      },
      {
        name: 'NEET UG (Medical Entrance)',
        criteria: 'Minimum 17 years by Dec 31 of admission year. No upper age limit.',
        minAge: 17.0,
        maxAge: 100.0,
        note: '10+2 with Physics, Chemistry, Biology/Biotech'
      },
      {
        name: 'NDA & NA (Defence Academy)',
        criteria: 'Age: 16.5 to 19.5 years strictly (Unmarried candidates)',
        minAge: 16.5,
        maxAge: 19.5,
        note: 'For 12th appearing / passed students'
      },
      {
        name: 'CDS (Combined Defence Services)',
        criteria: 'Age: 19 to 24/25 years',
        minAge: 19.0,
        maxAge: 24.0,
        note: 'Graduates for IMA, INA, AFA, OTA'
      },
      {
        name: 'IBPS / SBI PO (Bank Officer)',
        criteria: 'Age: 20 to 30 years',
        minAge: 20.0,
        maxAge: 30.0,
        note: 'For banking aspirants after graduation'
      },
      {
        name: 'AFCAT (Air Force Common Admission Test)',
        criteria: 'Age: 20 to 24 years (Flying) / 26 years (Ground Duty)',
        minAge: 20.0,
        maxAge: 24.0,
        note: 'Requires 60% in graduation + 12th Maths & Physics'
      },
      {
        name: 'JEE Main (Engineering)',
        criteria: 'No strict age barrier (12th passed in recent 3 years)',
        minAge: 16.0,
        maxAge: 25.0,
        note: 'Physics, Chemistry, Maths in Class 12'
      }
    ];

    examListContainer.innerHTML = exams.map(exam => {
      const isEligible = ageInYears >= exam.minAge && ageInYears <= exam.maxAge;
      let statusBadge = '';

      if (isEligible) {
        statusBadge = `<span class="exam-status eligible">Eligible ✅</span>`;
      } else if (ageInYears < exam.minAge) {
        const diff = (exam.minAge - ageInYears).toFixed(1);
        statusBadge = `<span class="exam-status ineligible">Underage (${diff} yrs left)</span>`;
      } else {
        const diff = (ageInYears - exam.maxAge).toFixed(1);
        statusBadge = `<span class="exam-status ineligible">Overage (+${diff} yrs)</span>`;
      }

      return `
        <div class="exam-item">
          <div class="exam-info">
            <div class="exam-name">${exam.name}</div>
            <div class="exam-criteria">${exam.criteria}</div>
          </div>
          <div>${statusBadge}</div>
        </div>
      `;
    }).join('');
  }

  dobInput?.addEventListener('input', calculateAge);
  asOfInput?.addEventListener('input', calculateAge);

  calculateAge();
}
