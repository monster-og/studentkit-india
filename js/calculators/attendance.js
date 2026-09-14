/**
 * StudentKit India - Attendance Calculator (75% Attendance Rule)
 */

export function initAttendanceCalculator() {
  const totalHeldInput = document.getElementById('att-total-held');
  const attendedInput = document.getElementById('att-attended');
  const targetSlider = document.getElementById('att-target-slider');
  const targetValDisplay = document.getElementById('att-target-val-display');

  const gaugeProgress = document.getElementById('att-gauge-progress');
  const gaugePctText = document.getElementById('att-gauge-pct-text');
  const statusPill = document.getElementById('att-status-pill');
  const actionCard = document.getElementById('att-action-card');
  const actionIcon = document.getElementById('att-action-icon');
  const actionTitle = document.getElementById('att-action-title');
  const actionDesc = document.getElementById('att-action-desc');

  const metaHeld = document.getElementById('att-meta-held');
  const metaAttended = document.getElementById('att-meta-attended');
  const metaMissed = document.getElementById('att-meta-missed');
  const metaTarget = document.getElementById('att-meta-target');

  // Circumference of gauge circle: 2 * PI * 65 = 408.4
  const GAUGE_CIRCUMFERENCE = 408.4;

  function calculateAttendance() {
    const totalHeld = parseInt(totalHeldInput?.value, 10) || 0;
    const attended = parseInt(attendedInput?.value, 10) || 0;
    const target = parseFloat(targetSlider?.value) || 75;

    if (targetValDisplay) targetValDisplay.textContent = `${target}%`;

    // Safety checks
    if (attended > totalHeld) {
      if (attendedInput) attendedInput.value = totalHeld;
      return calculateAttendance();
    }

    const missed = Math.max(0, totalHeld - attended);
    const currentPct = totalHeld > 0 ? (attended / totalHeld) * 100 : 0;

    // Update meta
    if (metaHeld) metaHeld.textContent = totalHeld;
    if (metaAttended) metaAttended.textContent = attended;
    if (metaMissed) metaMissed.textContent = missed;
    if (metaTarget) metaTarget.textContent = `${target}%`;

    // Update Gauge
    if (gaugePctText) gaugePctText.textContent = `${currentPct.toFixed(1)}%`;
    if (gaugeProgress) {
      const offset = GAUGE_CIRCUMFERENCE - (Math.min(100, currentPct) / 100) * GAUGE_CIRCUMFERENCE;
      gaugeProgress.style.strokeDashoffset = offset;

      if (currentPct >= target) {
        gaugeProgress.style.stroke = 'var(--success)';
      } else if (currentPct >= target - 10) {
        gaugeProgress.style.stroke = 'var(--warning)';
      } else {
        gaugeProgress.style.stroke = 'var(--danger)';
      }
    }

    // Logic for Bunk vs Catch-up
    if (totalHeld === 0) {
      if (statusPill) {
        statusPill.textContent = 'No classes yet';
        statusPill.className = 'status-pill';
      }
      if (actionCard) actionCard.style.display = 'none';
      return;
    }

    if (actionCard) actionCard.style.display = 'flex';

    if (currentPct >= target) {
      // Safe zone! Calculate max classes can be bunked
      // (attended) / (totalHeld + X) >= target / 100
      // 100 * attended >= target * totalHeld + target * X
      // target * X <= 100 * attended - target * totalHeld
      // X = floor((100 * attended - target * totalHeld) / target)
      const bunksAvailable = Math.floor((100 * attended - target * totalHeld) / target);

      if (statusPill) {
        statusPill.textContent = 'Safe Zone (Above Target) 🛡️';
        statusPill.className = 'status-pill safe';
      }

      if (actionCard) {
        actionCard.className = 'attendance-action-card safe';
        if (actionIcon) actionIcon.textContent = '🎉';
        if (actionTitle) {
          actionTitle.textContent = bunksAvailable > 0
            ? `You can safely bunk ${bunksAvailable} class${bunksAvailable > 1 ? 'es' : ''}!`
            : `You are right on the edge of ${target}%!`;
        }
        if (actionDesc) {
          actionDesc.textContent = bunksAvailable > 0
            ? `Even if you skip the next ${bunksAvailable} lecture${bunksAvailable > 1 ? 's' : ''}, your attendance will remain at or above ${target}%. Enjoy your chill time responsibly!`
            : `Don't miss the next class, otherwise your attendance will dip below the mandatory ${target}% cutoff.`;
        }
      }
    } else {
      // Danger zone! Calculate consecutive classes needed
      // (attended + Y) / (totalHeld + Y) >= target / 100
      // 100 * attended + 100 * Y >= target * totalHeld + target * Y
      // Y * (100 - target) >= target * totalHeld - 100 * attended
      // Y = ceil((target * totalHeld - 100 * attended) / (100 - target))
      const classesNeeded = Math.ceil((target * totalHeld - 100 * attended) / (100 - target));

      if (statusPill) {
        statusPill.textContent = 'Attendance Shortage Warning ⚠️';
        statusPill.className = 'status-pill danger';
      }

      if (actionCard) {
        actionCard.className = 'attendance-action-card danger';
        if (actionIcon) actionIcon.textContent = '🚨';
        if (actionTitle) {
          actionTitle.textContent = `Must attend next ${classesNeeded} consecutive class${classesNeeded > 1 ? 'es' : ''}!`;
        }
        if (actionDesc) {
          actionDesc.textContent = `Your attendance is currently ${currentPct.toFixed(1)}%, which is below the ${target}% threshold. You cannot afford to miss any lectures until you attend ${classesNeeded} more class${classesNeeded > 1 ? 'es' : ''} in a row.`;
        }
      }
    }
  }

  totalHeldInput?.addEventListener('input', calculateAttendance);
  attendedInput?.addEventListener('input', calculateAttendance);
  targetSlider?.addEventListener('input', calculateAttendance);

  // Target preset chips
  document.querySelectorAll('#attendance-view .preset-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#attendance-view .preset-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const target = chip.dataset.target;
      if (targetSlider) {
        targetSlider.value = target;
        calculateAttendance();
      }
    });
  });

  // Default calculation
  calculateAttendance();
}
