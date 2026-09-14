/**
 * StudentKit India - Science & Engineering Unit Converter
 */

export function initUnitConverter() {
  const categoryTabs = document.querySelectorAll('#unit-category-tabs .tab-btn');
  const fromValueInput = document.getElementById('unit-from-value');
  const toValueInput = document.getElementById('unit-to-value');
  const fromUnitSelect = document.getElementById('unit-from-select');
  const toUnitSelect = document.getElementById('unit-to-select');
  const swapBtn = document.getElementById('unit-swap-btn');
  const formulaExplanation = document.getElementById('unit-formula-explanation');

  let activeCategory = 'length';

  // Unit definitions and conversion factors to standard SI base
  const unitData = {
    length: {
      name: 'Length',
      base: 'meter',
      units: {
        meter: { name: 'Meter (m)', toBase: x => x, fromBase: x => x },
        kilometer: { name: 'Kilometer (km)', toBase: x => x * 1000, fromBase: x => x / 1000 },
        centimeter: { name: 'Centimeter (cm)', toBase: x => x * 0.01, fromBase: x => x / 0.01 },
        millimeter: { name: 'Millimeter (mm)', toBase: x => x * 0.001, fromBase: x => x / 0.001 },
        inch: { name: 'Inch (in)', toBase: x => x * 0.0254, fromBase: x => x / 0.0254 },
        foot: { name: 'Foot (ft)', toBase: x => x * 0.3048, fromBase: x => x / 0.3048 },
        yard: { name: 'Yard (yd)', toBase: x => x * 0.9144, fromBase: x => x / 0.9144 },
        mile: { name: 'Mile (mi)', toBase: x => x * 1609.344, fromBase: x => x / 1609.344 },
      },
      defaultFrom: 'meter',
      defaultTo: 'centimeter',
      defaultValue: 1
    },
    mass: {
      name: 'Mass & Weight',
      base: 'kilogram',
      units: {
        kilogram: { name: 'Kilogram (kg)', toBase: x => x, fromBase: x => x },
        gram: { name: 'Gram (g)', toBase: x => x * 0.001, fromBase: x => x / 0.001 },
        milligram: { name: 'Milligram (mg)', toBase: x => x * 1e-6, fromBase: x => x / 1e-6 },
        pound: { name: 'Pound (lb)', toBase: x => x * 0.45359237, fromBase: x => x / 0.45359237 },
        ounce: { name: 'Ounce (oz)', toBase: x => x * 0.02834952, fromBase: x => x / 0.02834952 },
        quintal: { name: 'Quintal (q - 100kg)', toBase: x => x * 100, fromBase: x => x / 100 },
        ton: { name: 'Metric Ton (t)', toBase: x => x * 1000, fromBase: x => x / 1000 },
      },
      defaultFrom: 'kilogram',
      defaultTo: 'gram',
      defaultValue: 1
    },
    temperature: {
      name: 'Temperature',
      base: 'celsius',
      units: {
        celsius: {
          name: 'Celsius (°C)',
          toBase: x => x,
          fromBase: x => x
        },
        fahrenheit: {
          name: 'Fahrenheit (°F)',
          toBase: x => (x - 32) * (5 / 9),
          fromBase: x => (x * 9 / 5) + 32
        },
        kelvin: {
          name: 'Kelvin (K)',
          toBase: x => x - 273.15,
          fromBase: x => x + 273.15
        }
      },
      defaultFrom: 'celsius',
      defaultTo: 'fahrenheit',
      defaultValue: 100
    },
    digital: {
      name: 'Digital Data Storage',
      base: 'byte',
      units: {
        byte: { name: 'Byte (B)', toBase: x => x, fromBase: x => x },
        kilobyte: { name: 'Kilobyte (KB - 1024 B)', toBase: x => x * 1024, fromBase: x => x / 1024 },
        megabyte: { name: 'Megabyte (MB - 1024 KB)', toBase: x => x * Math.pow(1024, 2), fromBase: x => x / Math.pow(1024, 2) },
        gigabyte: { name: 'Gigabyte (GB - 1024 MB)', toBase: x => x * Math.pow(1024, 3), fromBase: x => x / Math.pow(1024, 3) },
        terabyte: { name: 'Terabyte (TB - 1024 GB)', toBase: x => x * Math.pow(1024, 4), fromBase: x => x / Math.pow(1024, 4) },
      },
      defaultFrom: 'gigabyte',
      defaultTo: 'megabyte',
      defaultValue: 1
    },
    speed: {
      name: 'Speed',
      base: 'mps',
      units: {
        mps: { name: 'Meters / second (m/s)', toBase: x => x, fromBase: x => x },
        kmh: { name: 'Kilometers / hour (km/h)', toBase: x => x / 3.6, fromBase: x => x * 3.6 },
        mph: { name: 'Miles / hour (mph)', toBase: x => x * 0.44704, fromBase: x => x / 0.44704 },
        knot: { name: 'Knots (kn)', toBase: x => x * 0.514444, fromBase: x => x / 0.514444 },
      },
      defaultFrom: 'kmh',
      defaultTo: 'mps',
      defaultValue: 60
    },
    area: {
      name: 'Area',
      base: 'sqm',
      units: {
        sqm: { name: 'Square Meter (m²)', toBase: x => x, fromBase: x => x },
        sqft: { name: 'Square Foot (ft²)', toBase: x => x * 0.092903, fromBase: x => x / 0.092903 },
        acre: { name: 'Acre (ac)', toBase: x => x * 4046.856, fromBase: x => x / 4046.856 },
        hectare: { name: 'Hectare (ha)', toBase: x => x * 10000, fromBase: x => x / 10000 },
        sqkm: { name: 'Square Kilometer (km²)', toBase: x => x * 1e6, fromBase: x => x / 1e6 },
        bigha: { name: 'Bigha (standard ~2500 m²)', toBase: x => x * 2529.285, fromBase: x => x / 2529.285 },
      },
      defaultFrom: 'sqm',
      defaultTo: 'sqft',
      defaultValue: 100
    }
  };

  function populateUnitSelects(category) {
    const data = unitData[category];
    if (!data || !fromUnitSelect || !toUnitSelect) return;

    fromUnitSelect.innerHTML = '';
    toUnitSelect.innerHTML = '';

    Object.keys(data.units).forEach(key => {
      const u = data.units[key];
      const optFrom = new Option(u.name, key);
      const optTo = new Option(u.name, key);

      if (key === data.defaultFrom) optFrom.selected = true;
      if (key === data.defaultTo) optTo.selected = true;

      fromUnitSelect.appendChild(optFrom);
      toUnitSelect.appendChild(optTo);
    });

    if (fromValueInput) fromValueInput.value = data.defaultValue;
    performConversion(true);
  }

  function performConversion(isFromChanged = true) {
    const data = unitData[activeCategory];
    if (!data) return;

    const fromKey = fromUnitSelect?.value;
    const toKey = toUnitSelect?.value;

    const fromDef = data.units[fromKey];
    const toDef = data.units[toKey];

    if (!fromDef || !toDef) return;

    if (isFromChanged) {
      const fromVal = parseFloat(fromValueInput?.value);
      if (isNaN(fromVal)) {
        if (toValueInput) toValueInput.value = '';
        return;
      }
      const baseVal = fromDef.toBase(fromVal);
      const toVal = toDef.fromBase(baseVal);
      if (toValueInput) {
        toValueInput.value = Number(toVal.toFixed(6)).toString();
      }
      updateFormulaExplanation(fromVal, fromDef.name, toVal, toDef.name);
    } else {
      const toVal = parseFloat(toValueInput?.value);
      if (isNaN(toVal)) {
        if (fromValueInput) fromValueInput.value = '';
        return;
      }
      const baseVal = toDef.toBase(toVal);
      const fromVal = fromDef.fromBase(baseVal);
      if (fromValueInput) {
        fromValueInput.value = Number(fromVal.toFixed(6)).toString();
      }
      updateFormulaExplanation(fromVal, fromDef.name, toVal, toDef.name);
    }
  }

  function updateFormulaExplanation(fromVal, fromName, toVal, toName) {
    if (!formulaExplanation) return;
    formulaExplanation.textContent = `${fromVal} ${fromName} = ${Number(toVal.toFixed(6)).toString()} ${toName}`;
  }

  categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      categoryTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeCategory = tab.dataset.category;
      populateUnitSelects(activeCategory);
    });
  });

  fromValueInput?.addEventListener('input', () => performConversion(true));
  toValueInput?.addEventListener('input', () => performConversion(false));
  fromUnitSelect?.addEventListener('change', () => performConversion(true));
  toUnitSelect?.addEventListener('change', () => performConversion(true));

  swapBtn?.addEventListener('click', () => {
    const temp = fromUnitSelect.value;
    fromUnitSelect.value = toUnitSelect.value;
    toUnitSelect.value = temp;
    performConversion(true);
  });

  // Initial population
  populateUnitSelects('length');
}
